// UI availability only: backend permissions and Enterprise license checks remain authoritative.
const ENTERPRISE_PAGES: ReadonlyArray<readonly [string, string]> = [
  ['/dashboard/pirs', '/dashboard'],
  ['/dashboard/data/processing/automation', '/dashboard/data/processing'],
  ['/dashboard/data/processing/json_mapper', '/dashboard/data/processing'],
  ['/dashboard/data/restriction/restricted', '/dashboard/data/restriction/drafts'],
  ['/dashboard/settings/file_indexing', '/dashboard/settings'],
  ['/dashboard/settings/activity/audit', '/dashboard/settings/activity/alerting'],
  ['/dashboard/settings/activity/configuration', '/dashboard/settings/activity/alerting'],
  ['/dashboard/audits', '/dashboard/settings/activity/alerting'],
  ['/dashboard/settings/accesses/dissemination_list', '/dashboard/settings/accesses'],
  ['/dashboard/settings/accesses/email_templates', '/dashboard/settings/accesses'],
  ['/dashboard/settings/customization/fintel_designs', '/dashboard/settings/customization/entity_types'],
];

/** Return an available section for legacy EE-only links, or null to keep the requested route. */
export const getCommunityEditionRedirect = (pathname: string, isEnterpriseEdition = false): string | null => {
  if (isEnterpriseEdition) return null;
  const path = pathname.replace(/\/+$/, '');
  const lowerPath = path.toLowerCase();

  const filesSearch = path.match(/^\/dashboard\/search\/files(?:\/(.*))?$/i);
  if (filesSearch) return `/dashboard/search/knowledge${filesSearch[1] ? `/${filesSearch[1]}` : ''}`;

  const userAudit = path.match(/^(\/dashboard\/settings\/accesses\/users\/[^/]+)\/(?:analytics|history)(?:\/|$)/i);
  if (userAudit) return userAudit[1];

  const templates = path.match(/^(\/dashboard\/settings\/customization\/entity_types\/[^/]+)\/templates(?:\/|$)/i);
  if (templates) return templates[1];

  for (const [prefix, fallback] of ENTERPRISE_PAGES) {
    if (lowerPath === prefix || lowerPath.startsWith(`${prefix}/`)) return fallback;
  }
  return null;
};
