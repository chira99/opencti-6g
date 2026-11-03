import type { ResearchThemePreset } from '../../../../utils/researchThemes';

export const RESEARCH_THEME_COLOR_FIELDS = [
  'theme_background',
  'theme_paper',
  'theme_nav',
  'theme_primary',
  'theme_secondary',
  'theme_accent',
  'theme_text_color',
] as const;

export type ResearchThemeRecord = Pick<ResearchThemePreset['theme'], typeof RESEARCH_THEME_COLOR_FIELDS[number] | 'name'> & {
  id: string;
};

export type ResearchThemeMatch
  = { status: 'missing' }
    | { status: 'match'; themeId: string }
    | { status: 'modified' }
    | { status: 'duplicate' };

// Names also determine light/dark mode, so an identically colored renamed row is not the same preset.
export const resolveResearchTheme = (
  preset: ResearchThemePreset,
  themes: ReadonlyArray<ResearchThemeRecord>,
  newlyCreatedTheme?: ResearchThemeRecord,
): ResearchThemeMatch => {
  const namedThemes = themes.filter((theme) => theme.name === preset.name);
  if (namedThemes.length > 1) return { status: 'duplicate' };

  // Bridge a creation to its list refresh, but never replace a row the server has already returned.
  const theme = namedThemes[0] ?? (
    newlyCreatedTheme?.name === preset.name && !themes.some((saved) => saved.id === newlyCreatedTheme.id)
      ? newlyCreatedTheme
      : undefined
  );
  if (!theme) return { status: 'missing' };

  const matchesPalette = RESEARCH_THEME_COLOR_FIELDS.every((field) => (
    typeof theme[field] === 'string'
    && theme[field].trim().toLowerCase() === preset.theme[field].trim().toLowerCase()
  ));
  return matchesPalette ? { status: 'match', themeId: theme.id } : { status: 'modified' };
};
