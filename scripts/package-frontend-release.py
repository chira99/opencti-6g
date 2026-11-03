"""Seal an existing production dist into a new, minimal Docker build context."""
import argparse
import hashlib
import json
import re
import shutil
import stat
from datetime import datetime, timezone
from pathlib import Path

def collect_dist_files(root):
    """Collect regular assets without following links or Windows reparse points."""
    files = []
    pending = [root]
    while pending:
        path = pending.pop()
        info = path.lstat()
        is_reparse_point = getattr(info, 'st_file_attributes', 0) & getattr(stat, 'FILE_ATTRIBUTE_REPARSE_POINT', 0x400)
        if stat.S_ISLNK(info.st_mode) or is_reparse_point:
            raise ValueError(f'Production dist must not contain links or reparse points: {path}')
        if stat.S_ISDIR(info.st_mode):
            pending.extend(path.iterdir())
        elif stat.S_ISREG(info.st_mode):
            files.append(path)
        else:
            raise ValueError(f'Production dist contains an unsupported file type: {path}')
    return sorted(files)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--release', required=True)
parser.add_argument('--output', required=True, type=Path)
parser.add_argument('--image', required=True)
parser.add_argument('--base-image', required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parent.parent
front = repo / 'opencti-platform/opencti-front'
dist = front / 'dist'
assert json.loads((front / 'package.json').read_text(encoding='utf-8'))['version'] == '7.261016.0'
assert '@sha256:' in args.base_image, 'Pin the inspected base image digest'
files = collect_dist_files(dist)
html = (dist / 'index.html').read_text(encoding='utf-8')
assert all(x in html for x in ['%BASE_PATH%', '%APP_TITLE%', '%APP_FAVICON%', '%APP_SCRIPT_SNIPPET%'])
references = re.findall(r'(?:src|href)="(\./assets/[^"#?]+)"', html)
assert any(x.endswith('.js') for x in references)
assert not re.search(r'(?:src|href)="/assets/', html)
assert all((dist / x[2:]).is_file() for x in references)
assert (dist / 'assets/static/6g-cti.svg').is_file()
assert (dist / 'assets/monaco-editor').is_dir()
assert files, 'Production dist must contain files'
asset_hashes = {p.relative_to(dist).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
source_files = []
for name in ['src', 'lang', 'public', 'packages', 'patch']:
    source_files.extend(p for p in (front / name).rglob('*') if p.is_file() and not {'node_modules', '__generated__', 'dist', '.git', 'coverage'}.intersection(p.relative_to(front).parts))
source_files.extend(front / p for p in ['package.json', 'yarn.lock', 'vite.config.ts', 'index.html', 'relay.config.json'] if (front / p).is_file())
source_hashes = {p.relative_to(front).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(source_files))}
fingerprint = hashlib.sha256(json.dumps(source_hashes, sort_keys=True).encode()).hexdigest()
output = args.output.resolve()
dist_root = dist.resolve()
if output == dist_root or dist_root in output.parents:
    raise ValueError('Release output must be outside production dist')
output.mkdir(parents=True, exist_ok=False)
shutil.copytree(dist, output / 'dist', symlinks=True)
shutil.copyfile(repo / 'scripts/Dockerfile.frontend', output / 'Dockerfile')
record = {
    'release': args.release, 'createdAt': datetime.now(timezone.utc).isoformat(),
    'platformVersion': '7.261016.0', 'image': args.image, 'baseImage': args.base_image,
    'sourceState': 'Frontend source snapshot at packaging time; Git commit and publication state are not inferred',
    'sourceFingerprint': fingerprint, 'sourceFiles': source_hashes,
    'entryReferences': references, 'assetCount': len(asset_hashes),
    'assetBytes': sum(p.stat().st_size for p in files), 'assets': asset_hashes,
    'scope': 'Frontend-only derivative; upstream backend, entrypoint, worker/connector versions and data stores unchanged',
}
(output / 'release-manifest.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
(output / '.dockerignore').write_text('*\n!Dockerfile\n!dist/\n!dist/**\n!release-manifest.json\n', encoding='utf-8')
print(json.dumps({'output': str(output), 'assets': len(asset_hashes), 'MiB': round(record['assetBytes'] / 1024**2, 1), 'sourceFingerprint': fingerprint}))
