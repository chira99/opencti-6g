# 6G CTI Docker frontend release

Release `7.261016.0-ui.20261103.1` is deployed at http://localhost:8080. The local image is `opencti-local/platform:7.261016.0-ui.20261103.1`, image digest `sha256:16bf4ed00c1d239237fa3fd045022d3f5ee9bd1494f0a3caf1743723cbc4ea2c`. It contains the production 6G CTI frontend on the exact previously running OpenCTI 7.261016.0 base (`opencti/platform@sha256:53221acc481844a9026bea52088783fbe982190984c957766389f2488b169a93`). The backend bundle hash matches the original. Workers/connectors retain their existing images; persistent data volumes are preserved.

This is a frontend-only release. Telecom fixtures and the STIX mapping boundary retain their labels; the evolving model has not been implemented by this deployment. This image was built from the local working tree before its source commit; the sealed release manifest records the exact source fingerprint. The image exists locally, not in a published registry.

## Current operation

The paths below describe the current Windows lab deployment; substitute your own checkout and deployment paths on another host. Compose project `xtm` is in `C:/Users/Chirantha/opencti/docker`. Its normal `docker-compose.override.yml` now sets only `services.opencti.image` to the custom tag. All previous override settings and custom connector definitions remain. The existing default Compose invocation therefore keeps the custom image:

```powershell
Set-Location C:\Users\Chirantha\opencti\docker
docker compose -p xtm -f docker-compose.yml -f docker-compose.override.yml up -d --no-deps --pull never --wait --wait-timeout 180 opencti
```

The source development preview remains at http://localhost:3000. It is optional for the deployed frontend; stopping Vite does not stop port 8080.

## Build the next frontend release

Use a new release/tag and output directory each time. Do not reuse a release directory or overwrite an image that is needed for rollback. From the source fork, using the installed frontend dependencies:

```powershell
Set-Location C:\Users\Chirantha\Documents\opencti-6g\opencti-platform\opencti-front
node node_modules/relay-compiler/cli.js relay.config.json
node --max-old-space-size=8192 node_modules/vite/bin/vite.js build
node node_modules/vitest/vitest.mjs run src/buildConfig.test.ts
```

Stop on a failed command. Keep the generated index placeholders: the backend substitutes title, favicon, script and base path at runtime. Build output uses relative asset paths. The Docker package must contain the entire dist, including static assets, lazy chunks and Monaco workers. Do not copy node_modules, environment files or credentials into the build context.

For example, replace `ui.NEXT` with the new release identifier:

```powershell
Set-Location C:\Users\Chirantha\Documents\opencti-6g
python scripts/package-frontend-release.py --release 7.261016.0-ui.NEXT --image opencti-local/platform:7.261016.0-ui.NEXT --base-image opencti/platform@sha256:53221acc481844a9026bea52088783fbe982190984c957766389f2488b169a93 --output C:\Users\Chirantha\opencti\docker\6g-ui-releases\7.261016.0-ui.NEXT
Set-Location C:\Users\Chirantha\opencti\docker\6g-ui-releases\7.261016.0-ui.NEXT
$release = Get-Content -Raw release-manifest.json | ConvertFrom-Json
docker build --pull=false --build-arg "BASE_IMAGE=$($release.baseImage)" --build-arg "UI_RELEASE=$($release.release)" --build-arg "SOURCE_FINGERPRINT=$($release.sourceFingerprint)" -t $release.image .
```

The packager uses Python 3 standard-library modules and refuses an existing output directory. Its manifest records exact asset hashes, source-file hashes and a source fingerprint. `scripts/Dockerfile.frontend` changes only public assets, release metadata and labels; it inherits the upstream entrypoint and backend. Use a full compatible platform build if backend/schema dependencies change; do not overlay a different release's frontend.

Before rollout, verify the image's asset hashes and unchanged backend bundle, preserve the previous image and override, and change only `services.opencti.image` in the existing default override to the new tag. Validate with `docker compose ... config -q`, then use the current-operation command above. Do not run `down -v`, renew volumes or recreate dependencies for this frontend-only update.

After rollout, inspect health and the other container IDs, sign in on port 8080, and verify themes, navigation, representative stored-data reads and old Enterprise-link redirects. Check HTTP content types and hashes as well as status: a missing asset can fall through to index HTML with status 200. A browser hard refresh can clear an old cached frontend after an update.

## Roll back this release

The previous image is retained locally. A guarded rollback script is saved at:

```powershell
C:\Users\Chirantha\opencti\docker\6g-ui-releases\7.261016.0-ui.20261103.1\rollback.ps1
```

It checks that the override has not changed since this deployment, restores the backed-up override and recreates only `opencti` with the original image. It refuses to overwrite later edits. If it refuses, preserve those edits and change only `services.opencti.image` to the original digest shown above, then validate and apply using the current-operation command. Rollback was prepared and reviewed; it was not executed after this successful deployment.

Release contexts and local configuration backups are under `6g-ui-releases/`, which is ignored by the deployment repository. Verification logs, screenshots, manifest copy and container/Compose comparisons are under the research project's `research-work/ui-development/deployment-20261103`. No credentials are recorded in the verification files. Deployment verification is a bounded smoke check, not a complete test of every role, mutation or realtime subscription.
