import { describe, expect, it } from 'vitest';
import { DEFAULT_RESEARCH_THEME, getResearchThemePreset, RESEARCH_THEME_PRESETS } from './researchThemes';

const luminance = (hex: string): number => {
  const [red, green, blue] = [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrast = (foreground: string, background: string): number => {
  const values = [luminance(foreground), luminance(background)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
};

describe('research theme presets', () => {
  // Expected colours come from the standalone Daylight and Graphite previews.
  it.each([
    {
      name: 'Daylight', mode: 'light',
      background: '#f3f6fb', paper: '#ffffff', nav: '#eaf0f8',
      primary: '#215ab4', accent: '#e2edfc', text: '#1b2b40',
      navForeground: '#1b2b40', navMuted: '#52657b', navAccent: '#215ab4',
    },
    {
      name: 'Graphite Light', mode: 'light',
      background: '#f1f2f5', paper: '#ffffff', nav: '#242833',
      primary: '#4e54b4', accent: '#e9eafd', text: '#252b39',
      navForeground: '#f0f1f8', navMuted: '#bbc1d0', navAccent: '#b2b8ff',
    },
    {
      name: 'Graphite Dark', mode: 'dark',
      background: '#17191f', paper: '#21242c', nav: '#111319',
      primary: '#b2b8ff', accent: '#303650', text: '#edf0f7',
      navForeground: '#edf0f7', navMuted: '#aeb6c8', navAccent: '#b2b8ff',
    },
  ])('preserves the selected $name palette and its intended mode', (expected) => {
    const preset = getResearchThemePreset(expected.name);
    expect(preset).toMatchObject({
      name: expected.name,
      mode: expected.mode,
      navForeground: expected.navForeground,
      navMuted: expected.navMuted,
      navAccent: expected.navAccent,
      theme: {
        name: expected.name,
        theme_background: expected.background,
        theme_paper: expected.paper,
        theme_nav: expected.nav,
        theme_primary: expected.primary,
        theme_secondary: expected.primary,
        theme_accent: expected.accent,
        theme_text_color: expected.text,
      },
    });
  });

  it('defaults to Graphite Light with light content and a charcoal rail', () => {
    expect(DEFAULT_RESEARCH_THEME).toMatchObject({
      name: 'Graphite Light',
      theme_background: '#f1f2f5',
      theme_nav: '#242833',
      theme_text_color: '#252b39',
    });
  });

  it('provides three distinct options with stable identifiers', () => {
    expect(RESEARCH_THEME_PRESETS.map(({ id }) => id)).toEqual([
      'daylight', 'graphite-light', 'graphite-dark',
    ]);
    expect(new Set(RESEARCH_THEME_PRESETS.map(({ name }) => name)).size).toBe(3);
  });

  it.each([null, undefined, '', 'Corporate', 'Light', 'graphite-light', 'graphite light', 'Graphite Light - custom', 'Graphite Light '])(
    'does not replace an unrelated or absent theme named %p',
    (name) => expect(getResearchThemePreset(name)).toBeUndefined(),
  );

  it.each(RESEARCH_THEME_PRESETS)('keeps native $name data separate from browser metadata and logo defaults', ({ theme }) => {
    expect(Object.keys(theme).sort()).toEqual([
      'name', 'theme_accent', 'theme_background', 'theme_nav', 'theme_paper',
      'theme_primary', 'theme_secondary', 'theme_text_color',
    ].sort());
    Object.entries(theme).filter(([key]) => key !== 'name').forEach(([, value]) => {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  it.each(RESEARCH_THEME_PRESETS)('keeps body and navigation text readable in $name', (preset) => {
    const { theme } = preset;
    expect(contrast(theme.theme_text_color, theme.theme_background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(theme.theme_text_color, theme.theme_paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(preset.navForeground, theme.theme_nav)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(preset.navMuted, theme.theme_nav)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(preset.navAccent, theme.theme_nav)).toBeGreaterThanOrEqual(4.5);
  });
});
