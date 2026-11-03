import { describe, expect, it } from 'vitest';
import { getCommunityEditionRedirect } from './communityEdition';

const enterpriseLinks = [
  ['/dashboard/pirs', '/dashboard'],
  ['/dashboard/pirs/pir-id/overview', '/dashboard'],
  ['/dashboard/PIRS/', '/dashboard'],
  ['/dashboard/data/processing/automation/playbook-id', '/dashboard/data/processing'],
  ['/dashboard/data/processing/json_mapper/mapper-id', '/dashboard/data/processing'],
  ['/dashboard/data/restriction/restricted', '/dashboard/data/restriction/drafts'],
  ['/dashboard/settings/file_indexing', '/dashboard/settings'],
  ['/dashboard/settings/activity/audit', '/dashboard/settings/activity/alerting'],
  ['/dashboard/settings/activity/configuration', '/dashboard/settings/activity/alerting'],
  ['/dashboard/audits/object-id', '/dashboard/settings/activity/alerting'],
  ['/dashboard/settings/accesses/dissemination_list', '/dashboard/settings/accesses'],
  ['/dashboard/settings/accesses/email_templates/template-id', '/dashboard/settings/accesses'],
  ['/dashboard/settings/customization/fintel_designs/design-id', '/dashboard/settings/customization/entity_types'],
  ['/dashboard/search/files', '/dashboard/search/knowledge'],
  ['/dashboard/search/files/network%20slice', '/dashboard/search/knowledge/network%20slice'],
  ['/dashboard/settings/accesses/users/user-id/analytics', '/dashboard/settings/accesses/users/user-id'],
  ['/dashboard/settings/accesses/users/user-id/history', '/dashboard/settings/accesses/users/user-id'],
  ['/dashboard/settings/customization/entity_types/Report/templates/template-id', '/dashboard/settings/customization/entity_types/Report'],
];

describe('Community navigation availability', () => {
  it.each(enterpriseLinks)('redirects the unavailable CE page %s', (path, fallback) => {
    expect(getCommunityEditionRedirect(path)).toBe(fallback);
    expect(getCommunityEditionRedirect(fallback)).toBeNull();
  });

  it.each(enterpriseLinks)('retains licensed access to %s', (path) => {
    expect(getCommunityEditionRedirect(path, true)).toBeNull();
  });

  it.each([
    '/dashboard/telecom',
    '/dashboard/integrations/deployed',
    '/dashboard/workspaces/dashboards_public',
    '/dashboard/settings/accesses/users',
    '/dashboard/settings/accesses/organizations',
    '/dashboard/settings/accesses/authentications',
    '/dashboard/settings/activity/alerting',
    '/dashboard/data/restriction/drafts',
    '/dashboard/data/processing/tasks',
    '/dashboard/data/processing/csv_mapper',
    '/dashboard/data/import',
    '/dashboard/search/knowledge/PIR',
    '/dashboard/pirs-extra',
    '/dashboard/settings/customization/entity_types/Report',
  ])('preserves the available page %s', (path) => {
    expect(getCommunityEditionRedirect(path)).toBeNull();
  });
});
