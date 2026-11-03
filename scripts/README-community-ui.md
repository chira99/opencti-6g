# Community frontend availability

The 6G CTI fork is pinned to OpenCTI 7.261016.0. Its Community frontend omits Enterprise-only navigation and promotional controls, using the existing `useEnterpriseEdition()` license result. Backend license validation, permissions, services and stored configuration are unchanged. This is a UI availability change; it does not implement Enterprise features or remove all Enterprise source from the distribution.

`opencti-platform/opencti-front/src/utils/communityEdition.ts` is the shared policy for known Enterprise-only page URLs. `private/Index.tsx` redirects those URLs before their page components mount; `NavToolbarMenu` also uses the policy to omit unavailable links. Regular security wrappers still authorize the destination. Prefix boundaries preserve similarly named unrelated URLs, search redirects retain the encoded term, and licensed paths are unchanged.

Community users no longer see PIR, Playbooks, JSON Mapper, file indexing/search, Activity audit/configuration, dissemination lists, email templates, finished-intelligence designs/templates, user Analytics/History, Organizations admin, or Draft capabilities. JSON Mapper is conservatively hidden because it imports the Enterprise parser in this pinned release. Ordinary JSON feeds/imports remain. Processing chooses permitted Tasks/CSV Mapper pages; Activity opens Alerting.

Shared Enterprise tooltip/menu/field/button components omit their unavailable content in Community rather than unwrapping protected actions. Mixed pages retain their working Community portions: local authentication/password policy/2FA and global authentication settings, ordinary role/user editing, connector metadata/manual deployment information, imported files and normal exports, and basic workflow fields. The managed connector Deploy action, Enterprise SSO/provider queries, AI export option, generated finished-intelligence block, organization-sharing controls and advanced workflow sections are hidden. The Experience page retains its free Hub/support content. Parameters retains the research theme picker and Community managers while omitting Enterprise activation, AI/analytics/whitemark settings and unavailable manager entries. Hiding managers does not disable any running service.

Existing public dashboards, investigations, entities, native ingestion/import/export, CSV mappers, drafts, alerting and STIX Organization records are retained. Existing form values are not cleared when advanced controls are hidden. Shared modules are kept to avoid breaking their Community consumers. Source license notices are preserved.

## Verification

Run from `opencti-platform/opencti-front` using the installed Node runtime:

```powershell
node node_modules/typescript/bin/tsc -b
node node_modules/vitest/vitest.mjs run src/utils/communityEdition.test.ts src/private/components/nav/useNavMenu.test.tsx src/utils/hooks/useSettingsFallbackUrl.test.ts
node node_modules/vitest/vitest.mjs run src/private/components/common/entreprise_edition/EEChip.test.tsx src/private/components/common/entreprise_edition/EETooltip.test.tsx src/private/components/integrations/catalog/IngestionCatalogConnectorHeader.test.tsx
node node_modules/vitest/vitest.mjs run src/private/components/common/form/StixCoreObjectFileExportForm.test.tsx src/private/components/common/form/StixCoreObjectFileExportForm.utils.test.ts
```

Focused lint should cover the changed source files. From the repository root, run `node fds-migration/scripts/check-mui-regression.mjs --base refs/tags/7.261016.0` and `node fds-migration/scripts/check-fds-conformity.mjs`. The latter may report bridge freshness skipped if its dependency locator cannot find the nested frontend installation; record that limitation.

On the source frontend at http://localhost:3000, check that PIR and the unavailable toolbar entries are absent, old PIR/automation URLs redirect, and Tasks/CSV Mapper, Alerting, Knowledge search, local authentication and themes still render. Route tests cover CE and licensed paths; they are not an end-to-end test of every role, form or backend feature. Port 8080 now serves the matching custom platform image as recorded below. The Community cleanup itself changed source availability; its subsequent Docker rollout is recorded separately in the deployment guide.

## Deployed frontend

On 3 November 2026, release `7.261016.0-ui.20261103.1` was deployed at http://localhost:8080 using the existing Docker stack. See [Docker frontend release](README-docker-frontend.md) for the exact image, build procedure and rollback. Port 3000 remains the optional development preview.
