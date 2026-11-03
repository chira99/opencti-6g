import React, { FunctionComponent, useMemo } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ThemeOptions } from '@mui/material/styles/createTheme';
import themeDark from './ThemeDark';
import themeLight from './ThemeLight';
import { DEFAULT_RESEARCH_THEME, getResearchThemePreset } from '../utils/researchThemes';
import { getPlatformWordmark, PLATFORM_FAVICON, PLATFORM_MARK } from '../utils/platformBranding';
import { useDocumentFaviconModifier, useDocumentThemeModifier } from '../utils/hooks/useDocumentModifier';
import useFdsThemeScope from '../utils/hooks/useFdsThemeScope';
import { isLightThemeName } from '../utils/themeName';
import { AppThemeProvider_settings$data } from './__generated__/AppThemeProvider_settings.graphql';
import { useExportTheme } from '../utils/ExportThemeContext';

interface AppThemeProviderProps {
  children: React.ReactNode;
  settings: AppThemeProvider_settings$data;
  activeTheme?: { id: string } & AppThemeType | null;
}

interface AppThemeType {
  name: string;
  theme_background: string;
  theme_paper: string;
  theme_nav: string;
  theme_primary: string;
  theme_secondary: string;
  theme_accent: string;
  theme_logo?: string | null;
  theme_logo_collapsed?: string | null;
  theme_logo_login?: string | null;
  theme_text_color: string;
}

const themeBuilder = (
  theme: AppThemeType,
) => {
  const platformThemeLogo = theme?.theme_logo ?? null;
  const platformThemeLogoCollapsed = theme?.theme_logo_collapsed ?? null;
  const platformThemeBackground = theme?.theme_background ?? null;
  const platformThemePaper = theme?.theme_paper ?? null;
  const platformThemeNav = theme?.theme_nav ?? null;
  const platformThemePrimary = theme?.theme_primary ?? null;
  const platformThemeSecondary = theme?.theme_secondary ?? null;
  const platformThemeAccent = theme?.theme_accent ?? null;
  const platformThemeTextColor = theme?.theme_text_color ?? 'rgba(255, 255, 255, 0.7)';
  const builder = isLightThemeName(theme?.name) ? themeLight : themeDark;
  const options = builder(
    platformThemeLogo,
    platformThemeLogoCollapsed,
    platformThemeBackground,
    platformThemePaper,
    platformThemeNav,
    platformThemePrimary,
    platformThemeSecondary,
    platformThemeAccent,
    platformThemeTextColor,
  );
  const preset = getResearchThemePreset(theme.name);
  const railSurface = !isLightThemeName(theme.name) || preset?.name === 'Graphite Light' ? 'dark' : 'light';
  const brandedOptions = {
    ...options,
    logo: getPlatformWordmark(railSurface, platformThemeLogo),
    logo_collapsed: platformThemeLogoCollapsed || PLATFORM_MARK,
  };
  if (!preset) return brandedOptions;
  return {
    ...brandedOptions,
    researchNavigation: {
      background: platformThemeNav || preset.theme.theme_nav,
      foreground: preset.navForeground,
      muted: preset.navMuted,
      accent: preset.navAccent,
    },
    palette: {
      ...options.palette,
      leftBar: { ...options.palette.leftBar, text: preset.navForeground },
    },
  };
};

const defaultTheme: AppThemeType = DEFAULT_RESEARCH_THEME;

const AppThemeProvider: FunctionComponent<AppThemeProviderProps> = ({
  children,
  settings,
  activeTheme,
}) => {
  useDocumentFaviconModifier(settings?.platform_favicon || PLATFORM_FAVICON);

  const { exportTheme } = useExportTheme();
  const themeToUse = exportTheme ?? activeTheme ?? settings.platform_theme;

  const muiTheme = useMemo(() => {
    const appTheme: AppThemeType = {
      name: themeToUse?.name ?? defaultTheme.name,
      theme_accent: themeToUse?.theme_accent ?? defaultTheme.theme_accent,
      theme_background: themeToUse?.theme_background ?? defaultTheme.theme_background,
      theme_logo: themeToUse?.theme_logo ?? defaultTheme.theme_logo,
      theme_logo_collapsed: themeToUse?.theme_logo_collapsed ?? defaultTheme.theme_logo_collapsed,
      theme_logo_login: themeToUse?.theme_logo_login ?? defaultTheme.theme_logo_login,
      theme_nav: themeToUse?.theme_nav ?? defaultTheme.theme_nav,
      theme_paper: themeToUse?.theme_paper ?? defaultTheme.theme_paper,
      theme_primary: themeToUse?.theme_primary ?? defaultTheme.theme_primary,
      theme_secondary: themeToUse?.theme_secondary ?? defaultTheme.theme_secondary,
      theme_text_color: themeToUse?.theme_text_color ?? defaultTheme.theme_text_color,
    };
    return createTheme(themeBuilder(appTheme) as ThemeOptions);
  }, [themeToUse]);

  const resolvedName = themeToUse?.name ?? defaultTheme.name;
  const themeMode = useFdsThemeScope(resolvedName, {
    background: themeToUse?.theme_background ?? defaultTheme.theme_background,
    paper: themeToUse?.theme_paper ?? defaultTheme.theme_paper,
    nav: themeToUse?.theme_nav ?? defaultTheme.theme_nav,
    primary: themeToUse?.theme_primary ?? defaultTheme.theme_primary,
    secondary: themeToUse?.theme_secondary ?? defaultTheme.theme_secondary,
    accent: themeToUse?.theme_accent ?? defaultTheme.theme_accent,
    text: themeToUse?.theme_text_color ?? defaultTheme.theme_text_color,
  });
  useDocumentThemeModifier(themeMode);

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

export const ConnectedThemeProvider = createFragmentContainer(
  AppThemeProvider,
  {
    settings: graphql`
      fragment AppThemeProvider_settings on ThemeSettings {
        platform_title
        platform_favicon
        platform_theme {
          name
          theme_logo
          theme_logo_login
          theme_logo_collapsed
          theme_text_color
          id
          built_in
          theme_nav
          theme_primary
          theme_secondary
          theme_text_color
          theme_accent
          theme_background
          theme_paper
        }
      }
    `,
  },
);

export default AppThemeProvider;
