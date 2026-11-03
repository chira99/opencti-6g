export interface ResearchThemePreset {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  description: string;
  navForeground: string;
  navMuted: string;
  navAccent: string;
  theme: {
    name: string;
    theme_background: string;
    theme_paper: string;
    theme_nav: string;
    theme_primary: string;
    theme_secondary: string;
    theme_accent: string;
    theme_text_color: string;
    theme_logo?: string;
    theme_logo_collapsed?: string;
    theme_logo_login?: string;
  };
}

const DAYLIGHT: ResearchThemePreset = {
  id: 'daylight',
  name: 'Daylight',
  mode: 'light',
  description: 'A crisp light canvas with a strong blue accent.',
  navForeground: '#1b2b40',
  navMuted: '#52657b',
  navAccent: '#215ab4',
  theme: {
    name: 'Daylight',
    theme_background: '#f3f6fb',
    theme_paper: '#ffffff',
    theme_nav: '#eaf0f8',
    theme_primary: '#215ab4',
    theme_secondary: '#215ab4',
    theme_accent: '#e2edfc',
    theme_text_color: '#1b2b40',
  },
};

const GRAPHITE_LIGHT: ResearchThemePreset = {
  id: 'graphite-light',
  name: 'Graphite Light',
  mode: 'light',
  description: 'Cool grey panels, indigo accents and a charcoal navigation rail.',
  navForeground: '#f0f1f8',
  navMuted: '#bbc1d0',
  navAccent: '#b2b8ff',
  theme: {
    name: 'Graphite Light',
    theme_background: '#f1f2f5',
    theme_paper: '#ffffff',
    theme_nav: '#242833',
    theme_primary: '#4e54b4',
    theme_secondary: '#4e54b4',
    theme_accent: '#e9eafd',
    theme_text_color: '#252b39',
  },
};

const GRAPHITE_DARK: ResearchThemePreset = {
  id: 'graphite-dark',
  name: 'Graphite Dark',
  mode: 'dark',
  description: 'Charcoal surfaces, soft indigo accents and the same Graphite layout.',
  navForeground: '#edf0f7',
  navMuted: '#aeb6c8',
  navAccent: '#b2b8ff',
  theme: {
    name: 'Graphite Dark',
    theme_background: '#17191f',
    theme_paper: '#21242c',
    theme_nav: '#111319',
    theme_primary: '#b2b8ff',
    theme_secondary: '#b2b8ff',
    theme_accent: '#303650',
    theme_text_color: '#edf0f7',
  },
};

export const RESEARCH_THEME_PRESETS: readonly ResearchThemePreset[] = [
  DAYLIGHT,
  GRAPHITE_LIGHT,
  GRAPHITE_DARK,
];

export const DEFAULT_RESEARCH_THEME = GRAPHITE_LIGHT.theme;

export const getResearchThemePreset = (name?: string | null): ResearchThemePreset | undefined => (
  RESEARCH_THEME_PRESETS.find((preset) => preset.name === name)
);
