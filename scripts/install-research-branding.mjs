/** Save the research platform name using the existing API; logos are bundled frontend assets. */
import { writeFile } from 'node:fs/promises';

const token = process.env.OPENCTI_TOKEN;
if (!token) throw new Error('Set OPENCTI_TOKEN to a user token with parameter-setting permission.');
const baseUrl = (process.env.OPENCTI_URL || 'http://localhost:8080').replace(/\/$/, '');
const args = process.argv.slice(2);
const auditIndex = args.indexOf('--audit');
const auditPath = auditIndex >= 0 ? args[auditIndex + 1] : undefined;
if (auditIndex >= 0 && (!auditPath || auditPath.startsWith('--'))) throw new Error('--audit requires an output path.');
const title = '6G CTI';
const audit = { titleBefore: null, titleAfter: null, changed: false, status: 'started' };

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
  const initial = await query('query ResearchBrandingSetup { settings { id platform_title } about { version } }');
  if (initial.about.version !== '7.261016.0') throw new Error(`Expected OpenCTI 7.261016.0; found ${initial.about.version}.`);
  audit.titleBefore = initial.settings.platform_title;
  if (initial.settings.platform_title !== title) {
    await query('mutation SetResearchPlatformTitle($id: ID!, $input: [EditInput]!) { settingsEdit(id: $id) { fieldPatch(input: $input) { id platform_title } } }', {
      id: initial.settings.id,
      input: [{ key: 'platform_title', value: [title] }],
    });
    audit.changed = true;
  }
  const final = await query('query VerifyResearchBranding { settings { platform_title } }');
  audit.titleAfter = final.settings.platform_title;
  if (audit.titleAfter !== title) throw new Error('The requested platform title did not persist.');
  audit.status = 'verified';
  console.log(JSON.stringify(audit, null, 2));
} catch (error) {
  audit.status = 'failed';
  audit.error = error.message;
  throw error;
} finally {
  if (auditPath) await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
}
