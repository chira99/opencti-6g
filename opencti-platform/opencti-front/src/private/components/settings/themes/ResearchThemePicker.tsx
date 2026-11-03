import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Paper, Text } from '@filigran/design-system';
import { useFormatter } from '../../../../components/i18n';
import { RESEARCH_THEME_PRESETS, ResearchThemePreset } from '../../../../utils/researchThemes';
import useApiMutation from '../../../../utils/hooks/useApiMutation';
import { createThemeMutation } from './ThemeCreation';
import { ThemeCreationCreateMutation } from './__generated__/ThemeCreationCreateMutation.graphql';
import { ResearchThemeRecord, resolveResearchTheme } from './researchThemeMatch';

interface ResearchThemePickerProps {
  themes: ReadonlyArray<ResearchThemeRecord>;
  selectedThemeId?: string;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

const ResearchThemePicker = ({
  themes,
  selectedThemeId,
  onSelect,
  onRefresh,
}: ResearchThemePickerProps) => {
  const { t_i18n } = useFormatter();
  const [commit, inFlight] = useApiMutation<ThemeCreationCreateMutation>(createThemeMutation);
  const [pendingPreset, setPendingPreset] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const creationPending = useRef(false);
  const createdThemes = useRef(new Map<string, ResearchThemeRecord>());

  useEffect(() => {
    createdThemes.current.forEach((created, name) => {
      if (themes.some((theme) => theme.name === name || theme.id === created.id)) createdThemes.current.delete(name);
    });
  }, [themes]);

  const finishCreation = () => {
    creationPending.current = false;
    setPendingPreset(null);
  };

  const handleSelect = (preset: ResearchThemePreset) => {
    if (creationPending.current || inFlight) return;
    setError(null);
    const match = resolveResearchTheme(preset, themes, createdThemes.current.get(preset.name));
    if (match.status === 'match') {
      onSelect(match.themeId);
      return;
    }
    if (match.status === 'modified' || match.status === 'duplicate') return;

    creationPending.current = true;
    setPendingPreset(preset.id);
    try {
      commit({
        variables: { input: preset.theme },
        onCompleted: (response, errors) => {
          finishCreation();
          const themeId = response.themeAdd?.id;
          if (!themeId || errors?.length) {
            setError(t_i18n('The theme could not be saved. Please try again.'));
            return;
          }
          createdThemes.current.set(preset.name, { ...preset.theme, id: themeId });
          onRefresh();
          onSelect(themeId);
        },
        onError: () => {
          finishCreation();
          setError(t_i18n('The theme could not be saved. Please try again.'));
        },
      });
    } catch (_error) {
      finishCreation();
      setError(t_i18n('The theme could not be saved. Please try again.'));
    }
  };

  return (
    <Paper padding={24} data-testid="research-theme-picker">
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box>
          <Text as="h2" variant="title-sm" style={{ margin: 0 }}>
            {t_i18n('Platform themes')}
          </Text>
          <Text variant="content-compact" className="text-default-secondary">
            {t_i18n('The default applies to users following the platform theme. A personal theme selected in Profile takes priority.')}
          </Text>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
          {RESEARCH_THEME_PRESETS.map((preset) => {
            const match = resolveResearchTheme(preset, themes, createdThemes.current.get(preset.name));
            const selected = match.status === 'match' && selectedThemeId === match.themeId;
            const blocked = match.status === 'modified' || match.status === 'duplicate';
            const statusMessage = match.status === 'modified'
              ? t_i18n('This name is already used by a customized theme. Manage it in Themes below.')
              : match.status === 'duplicate'
                ? t_i18n('This preset name matches several saved themes. Resolve the duplicates in Themes below.')
                : null;
            const buttonLabel = match.status === 'modified'
              ? t_i18n('Customized theme')
              : match.status === 'duplicate'
                ? t_i18n('Duplicate theme name')
                : selected ? t_i18n('Current default') : t_i18n('Use as default');
            const palette = preset.theme;
            return (
              <Paper key={preset.id} padding={16} data-testid={`theme-choice-${preset.id}`}>
                <Box sx={{ display: 'grid', gridTemplateRows: 'auto auto 1fr auto', gap: 1.5, height: '100%', minWidth: 0 }}>
                  <Box
                    aria-hidden="true"
                    sx={{ display: 'grid', gridTemplateColumns: '28px 1fr', height: 112, overflow: 'hidden', borderRadius: 1 }}
                    style={{ background: palette.theme_background }}
                  >
                    <Box sx={{ display: 'grid', alignContent: 'start', gap: 1, p: 1 }} style={{ background: palette.theme_nav }}>
                      <Box sx={{ height: 10, borderRadius: 0.5 }} style={{ background: preset.navAccent }} />
                      {[0, 1, 2].map((line) => (
                        <Box key={line} sx={{ height: 3, borderRadius: 0.5 }} style={{ background: preset.navMuted }} />
                      ))}
                    </Box>
                    <Box sx={{ display: 'grid', alignContent: 'start', gap: 1, p: 1.5 }}>
                      <Box sx={{ height: 5, width: '60%', borderRadius: 0.5 }} style={{ background: palette.theme_text_color }} />
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Box sx={{ height: 25, borderRadius: 0.5 }} style={{ background: palette.theme_paper }} />
                        <Box sx={{ height: 25, borderRadius: 0.5 }} style={{ background: palette.theme_accent }} />
                      </Box>
                      <Box sx={{ height: 19, width: '45%', borderRadius: 0.5 }} style={{ background: palette.theme_primary }} />
                    </Box>
                  </Box>
                  <Text as="h3" variant="content-base-bold" style={{ margin: 0 }}>{preset.name}</Text>
                  <Text variant="content-compact" className="text-default-secondary">
                    {t_i18n(preset.description)}
                    {statusMessage && <Text as="span" role="status" variant="content-caption" style={{ display: 'block' }}>{statusMessage}</Text>}
                  </Text>
                  <Button
                    type="button"
                    priority={selected ? 'secondary' : 'primary'}
                    disabled={selected || blocked || inFlight || pendingPreset !== null}
                    loading={pendingPreset === preset.id}
                    onClick={() => handleSelect(preset)}
                    aria-label={`${preset.name}: ${buttonLabel}`}
                  >
                    {buttonLabel}
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
        {error && <Text role="alert" variant="content-compact">{error}</Text>}
      </Box>
    </Paper>
  );
};

export default ResearchThemePicker;
