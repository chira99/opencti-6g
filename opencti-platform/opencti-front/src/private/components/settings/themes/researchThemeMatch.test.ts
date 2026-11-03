import { describe, expect, it } from 'vitest';
import { RESEARCH_THEME_PRESETS } from '../../../../utils/researchThemes';
import { RESEARCH_THEME_COLOR_FIELDS, ResearchThemeRecord, resolveResearchTheme } from './researchThemeMatch';

const preset = RESEARCH_THEME_PRESETS.find((theme) => theme.id === 'graphite-light')!;
const savedTheme: ResearchThemeRecord = { ...preset.theme, id: 'saved-graphite-light' };

describe('research theme preset matching', () => {
  it('reuses only a palette match and accepts color case and surrounding whitespace', () => {
    const saved = { ...savedTheme };
    RESEARCH_THEME_COLOR_FIELDS.forEach((field) => {
      saved[field] = ` ${saved[field].toUpperCase()} `;
    });
    expect(resolveResearchTheme(preset, [saved])).toEqual({ status: 'match', themeId: saved.id });
  });

  it.each(RESEARCH_THEME_COLOR_FIELDS)('blocks a custom theme with a changed %s', (field) => {
    const saved = { ...savedTheme, [field]: '#123456' };
    expect(resolveResearchTheme(preset, [saved])).toEqual({ status: 'modified' });
    expect(saved[field]).toBe('#123456');
  });

  it('treats an incomplete server palette as modified, without permitting creation', () => {
    const incomplete = { ...savedTheme, theme_nav: undefined } as unknown as ResearchThemeRecord;
    expect(resolveResearchTheme(preset, [incomplete])).toEqual({ status: 'modified' });
  });

  it('blocks duplicate names even when both palettes match', () => {
    const duplicate = { ...savedTheme, id: 'duplicate-graphite-light' };
    expect(resolveResearchTheme(preset, [savedTheme, duplicate])).toEqual({ status: 'duplicate' });
  });

  it('blocks duplicate names when only one palette matches', () => {
    const customized = { ...savedTheme, id: 'customized-graphite-light', theme_nav: '#123456' };
    expect(resolveResearchTheme(preset, [savedTheme, customized])).toEqual({ status: 'duplicate' });
  });

  it('does not reuse the same colors under a different mode-determining name', () => {
    const renamed = { ...savedTheme, name: 'My custom theme' };
    expect(resolveResearchTheme(preset, [renamed])).toEqual({ status: 'missing' });
  });

  it('permits creation when the named preset does not exist', () => {
    expect(resolveResearchTheme(preset, [])).toEqual({ status: 'missing' });
  });

  it('can retry selection after creation while the server list refresh is pending', () => {
    expect(resolveResearchTheme(preset, [], savedTheme)).toEqual({ status: 'match', themeId: savedTheme.id });
  });

  it('gives an observed customized row priority over its cached creation payload', () => {
    const customized = { ...savedTheme, theme_paper: '#123456' };
    expect(resolveResearchTheme(preset, [customized], savedTheme)).toEqual({ status: 'modified' });
  });

  it('gives observed duplicate names priority over a cached creation', () => {
    const duplicate = { ...savedTheme, id: 'duplicate-graphite-light' };
    expect(resolveResearchTheme(preset, [savedTheme, duplicate], savedTheme)).toEqual({ status: 'duplicate' });
  });

  it('does not reuse a cached ID that the server now reports under another name', () => {
    const renamed = { ...savedTheme, name: 'Renamed custom theme' };
    expect(resolveResearchTheme(preset, [renamed], savedTheme)).toEqual({ status: 'missing' });
  });

  it('does not trust a cached row whose colors do not match the preset', () => {
    const customized = { ...savedTheme, theme_paper: '#123456' };
    expect(resolveResearchTheme(preset, [], customized)).toEqual({ status: 'modified' });
  });
});
