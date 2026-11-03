/** Install the reviewed palettes using OpenCTI's existing API; no backend migration. */
import { writeFile } from 'node:fs/promises';
import { RESEARCH_THEME_PRESETS, DEFAULT_RESEARCH_THEME } from '../opencti-platform/opencti-front/src/utils/researchThemes.ts';

const args = process.argv.slice(2);
const auditIndex = args.indexOf('--audit');
const auditPath = auditIndex >= 0 ? args[auditIndex + 1] : undefined;
if (auditIndex !== args.lastIndexOf('--audit')) throw new Error('Specify --audit only once.');
if (auditIndex >= 0 && (!auditPath || auditPath.startsWith('--'))) throw new Error('--audit requires an output path.');
const token = process.env.OPENCTI_TOKEN;
if (!token) throw new Error('Set OPENCTI_TOKEN to a user token with parameter-setting permission.');
const baseUrl = (process.env.OPENCTI_URL || 'http://localhost:8080').replace(/\/$/, '');
const fields = 'id name theme_background theme_paper theme_nav theme_primary theme_secondary theme_accent theme_text_color';
const audit = { created: [], reused: [], defaultBefore: null, defaultAfter: null, userThemeBefore: null, userThemeAfter: null, status: 'started' };

async function query(operation, variables = {}) {
  const response = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: operation, variables }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`OpenCTI HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join('; '));
  return result.data;
}

try {
  const initial = await query(`query ResearchThemeSetup { settings { id platform_theme { ${fields} } } me { id theme } about { version } }`);
  if (initial.about.version !== '7.261016.0') throw new Error(`Expected OpenCTI 7.261016.0; found ${initial.about.version}.`);
  audit.defaultBefore = initial.settings.platform_theme;
  audit.userThemeBefore = initial.me.theme;
  const existing = [];
  let cursor;
  do {
    const data = await query(`query ResearchThemeRows($cursor: ID) { themes(first: 100, after: $cursor) { edges { node { ${fields} } } pageInfo { hasNextPage endCursor } } }`, { cursor });
    existing.push(...data.themes.edges.map((edge) => edge.node));
    cursor = data.themes.pageInfo.hasNextPage ? data.themes.pageInfo.endCursor : undefined;
  } while (cursor);
  for (const preset of RESEARCH_THEME_PRESETS) {
    const matches = existing.filter((theme) => theme.name === preset.name);
    if (matches.length > 1) throw new Error(`Multiple themes named ${preset.name}; resolve the duplicate before installing.`);
    if (matches.length) {
      const theme = matches[0];
      for (const [key, value] of Object.entries(preset.theme)) {
        if (theme[key]?.toLowerCase() !== value.toLowerCase()) throw new Error(`Existing ${preset.name} differs at ${key}; preserving it instead of overwriting a customised theme.`);
      }
      audit.reused.push({ id: theme.id, name: theme.name });
    } else {
      const data = await query(`mutation InstallResearchTheme($input: ThemeAddInput!) { themeAdd(input: $input) { ${fields} } }`, { input: preset.theme });
      existing.push(data.themeAdd);
      audit.created.push({ id: data.themeAdd.id, name: data.themeAdd.name });
    }
  }
  const desired = existing.find((theme) => theme.name === DEFAULT_RESEARCH_THEME.name);
  if (args.includes('--set-default') && initial.settings.platform_theme?.id !== desired.id) {
    await query('mutation SetResearchThemeDefault($id: ID!, $input: [EditInput]!) { settingsEdit(id: $id) { fieldPatch(input: $input) { id platform_theme { id name } } } }', {
      id: initial.settings.id, input: [{ key: 'platform_theme', value: [desired.id] }],
    });
  }
  if (args.includes('--follow-default') && initial.me.theme && initial.me.theme !== 'default') {
    await query('mutation FollowResearchThemeDefault($input: [EditInput]!) { meEdit(input: $input) { id theme } }', { input: [{ key: 'theme', value: ['default'] }] });
  }
  const final = await query(`query VerifyResearchThemes { settings { platform_theme { ${fields} } } me { theme } }`);
  audit.defaultAfter = final.settings.platform_theme;
  audit.userThemeAfter = final.me.theme;
  if (args.includes('--set-default') && audit.defaultAfter.name !== DEFAULT_RESEARCH_THEME.name) throw new Error('The requested default did not persist.');
  for (const preset of RESEARCH_THEME_PRESETS) {
    const installed = existing.find((theme) => theme.name === preset.name);
    const verified = await query(`query VerifyResearchTheme($id: ID!) { theme(id: $id) { ${fields} } }`, { id: installed.id });
    const row = verified.theme;
    if (!row || row.id !== installed.id) throw new Error(`${preset.name} was not read back.`);
    for (const [key, value] of Object.entries(preset.theme)) {
      if (row[key]?.toLowerCase() !== value.toLowerCase()) throw new Error(`${preset.name} did not retain the expected ${key}.`);
    }
  }
  audit.status = 'verified';
  console.log(JSON.stringify({ status: audit.status, created: audit.created, reused: audit.reused, defaultTheme: audit.defaultAfter.name }, null, 2));
} catch (error) {
  audit.status = 'failed';
  audit.error = error.message;
  throw error;
} finally {
  if (auditPath) await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
}
