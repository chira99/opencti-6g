import React, { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { Box } from '@mui/material';
import { useTheme } from '@mui/styles';
import { Button, Paper, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@filigran/design-system';
import { ArrowForwardOutlined, HubOutlined, SchemaOutlined, SourceOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../components/i18n';
import type { Theme } from '../../../components/Theme';
import Security from '../../../utils/Security';
import { KNOWLEDGE } from '../../../utils/hooks/useGranted';
import useConnectedDocumentModifier from '../../../utils/hooks/useConnectedDocumentModifier';

type ContextItem = 'source' | 'resource' | 'activity';

// Presentation fixtures only. No provisional STIX type or model property is an API contract.
const contextItems: Record<ContextItem, { label: string; title: string; facts: [string, string][] }> = {
  source: {
    label: 'Source evidence',
    title: 'Demo source A',
    facts: [['Evidence kind', 'Constructed example'], ['Identifier scope', 'demo-source'], ['Stored record', 'Not imported']],
  },
  resource: {
    label: 'Recorded resource',
    title: 'Cell label 7',
    facts: [['Local identifier', '7'], ['Identifier scope', 'demo-source'], ['Global identity', 'Unknown'], ['DU association', 'Unknown']],
  },
  activity: {
    label: 'Reported activity',
    title: 'Connection attempts',
    facts: [['Activity', 'Repeated connection attempts'], ['Event time', 'Unknown'], ['Technique attribution', 'Not assessed']],
  },
};

const TelecomWorkspaceContent = () => {
  const { t_i18n } = useFormatter();
  const theme = useTheme<Theme>();
  const { setTitle } = useConnectedDocumentModifier();
  setTitle(t_i18n('Telecom Workspace'));
  const [selected, setSelected] = useState<ContextItem>('resource');
  const [activeTab, setActiveTab] = useState('investigation');
  const item = contextItems[selected];
  const muted = { color: theme.palette.text.secondary };
  const headingStyle = { margin: 0 };
  const panelStyle = { minWidth: 0, height: '100%' };

  const contextButton = (key: ContextItem, icon: React.ReactNode) => (
    <Box sx={{ display: 'grid', justifyItems: 'center', gap: 1.5, minWidth: 0 }}>
      <Box sx={{ color: selected === key ? 'primary.main' : 'text.secondary' }}>{icon}</Box>
      <Button
        priority={selected === key ? 'primary' : 'secondary'}
        aria-pressed={selected === key}
        onClick={() => setSelected(key)}
        style={{ maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere', height: 'auto', minHeight: 36 }}
      >
        {t_i18n(contextItems[key].title)}
      </Button>
      <Text variant="content-caption" style={muted}>{t_i18n(contextItems[key].label)}</Text>
    </Box>
  );

  const selectionDetails = (
    <Paper padding={24} style={panelStyle}>
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Box>
          <Text variant="content-caption" style={muted}>{t_i18n('Selected context')}</Text>
          <Text as="h2" variant="title-sm" style={headingStyle}>{t_i18n(item.title)}</Text>
        </Box>
        <Box component="dl" sx={{ m: 0, display: 'grid', gap: 2.5 }}>
          {item.facts.map(([label, value]) => (
            <Box key={label}>
              <Text as="dt" variant="content-caption" style={muted}>{t_i18n(label)}</Text>
              <Text as="dd" variant="content-base" style={{ margin: 0 }}>{t_i18n(value)}</Text>
            </Box>
          ))}
        </Box>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Text variant="content-compact" style={muted}>
            {t_i18n('A local label identifies a record within its source. It does not establish a global asset identity.')}
          </Text>
        </Box>
        {activeTab !== 'evidence' && (
          <Button priority="secondary" onClick={() => setActiveTab('evidence')}>
            {t_i18n('View supporting evidence')}
          </Button>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box data-testid="telecom-workspace" sx={{ display: 'grid', gap: 3, pb: 3, maxWidth: 1800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Text variant="content-caption" style={muted}>{t_i18n('6G CTI research platform')}</Text>
          <Text as="h1" variant="title-xl" style={headingStyle}>{t_i18n('Telecom Workspace')}</Text>
          <Text variant="content-base" style={muted}>{t_i18n('Bring network context, source evidence and threat intelligence into one investigation.')}</Text>
        </Box>
        <Button asChild priority="secondary"><Link to="/dashboard/events/incidents">{t_i18n('Browse stored incidents')}</Link></Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', borderBottom: 1, borderColor: 'divider', pb: 2 }}>
        <Text variant="content-compact-bold">{t_i18n('Layout preview')}</Text>
        <Text variant="content-compact" style={muted}>
          {t_i18n('Constructed example. These records are not imported platform data.')}
        </Text>
      </Box>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList aria-label={t_i18n('Telecom Workspace views')}>
          <TabsTrigger value="investigation">{t_i18n('Investigation')}</TabsTrigger>
          <TabsTrigger value="evidence">{t_i18n('Evidence')}</TabsTrigger>
          <TabsTrigger value="mapping">{t_i18n('STIX mapping')}</TabsTrigger>
        </TabsList>

        <TabsContent value="investigation">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '240px minmax(0, 1fr) 280px' }, gap: 3, mt: 3 }}>
            <Paper padding={24} style={panelStyle}>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Text as="h2" variant="title-sm" style={headingStyle}>{t_i18n('Investigation')}</Text>
                <Box sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2 }}>
                  <Text variant="content-base-bold">{t_i18n('Radio activity review')}</Text>
                  <Text variant="content-compact" style={muted}>{t_i18n('Illustrative investigation')}</Text>
                </Box>
                <Text variant="content-compact" style={muted}>
                  {t_i18n('Examine what was recorded, where identifiers apply and which associations remain unknown.')}
                </Text>
                <Box sx={{ display: 'grid', gap: 1, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                  <Text variant="content-caption" style={muted}>{t_i18n('Explore platform knowledge')}</Text>
                  <Button asChild priority="tertiary"><Link to="/dashboard/observations/infrastructures">{t_i18n('Infrastructure')}</Link></Button>
                  <Button asChild priority="tertiary"><Link to="/dashboard/techniques/attack_patterns">{t_i18n('Attack patterns')}</Link></Button>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ display: 'grid', gap: 3, minWidth: 0 }}>
              <Paper padding={24}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Text as="h2" variant="title-sm" style={headingStyle}>{t_i18n('Evidence context')}</Text>
                  <Text variant="content-caption" style={muted}>{t_i18n('Select an item to inspect it')}</Text>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)' }, alignItems: 'center', gap: 2, py: 6 }}>
                  {contextButton('source', <SourceOutlined />)}
                  <ArrowForwardOutlined aria-label={t_i18n('Example records')} sx={{ color: 'text.secondary', justifySelf: 'center', transform: { xs: 'rotate(90deg)', md: 'none' } }} />
                  {contextButton('resource', <HubOutlined />)}
                  <ArrowForwardOutlined aria-label={t_i18n('Example mentions')} sx={{ color: 'text.secondary', justifySelf: 'center', transform: { xs: 'rotate(90deg)', md: 'none' } }} />
                  {contextButton('activity', <SchemaOutlined />)}
                </Box>
                <Text variant="content-compact" style={muted}>
                  {t_i18n('The diagram illustrates evidence associations. It does not assert physical topology or a causal relationship.')}
                </Text>
              </Paper>
              <Paper padding={24}>
                <Text as="h2" variant="title-sm" style={headingStyle}>{t_i18n('Questions to resolve')}</Text>
                <Box component="ul" sx={{ pl: 2, mb: 0, display: 'grid', gap: 2 }}>
                  <li><Text variant="content-base">{t_i18n('Which resource is identified by this source?')}</Text></li>
                  <li><Text variant="content-base">{t_i18n('What evidence supports the reported activity?')}</Text></li>
                  <li><Text variant="content-base">{t_i18n('Which identities, times and associations remain unknown?')}</Text></li>
                </Box>
              </Paper>
            </Box>
            {selectionDetails}
          </Box>
        </TabsContent>

        <TabsContent value="evidence">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(280px, 1fr)' }, gap: 3, mt: 3 }}>
            <Paper padding={24}>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Text as="h2" variant="title-sm" style={headingStyle}>{t_i18n('Source evidence')}</Text>
                <Text variant="content-base">{t_i18n('Demo source A')}</Text>
                <Text variant="content-base" style={muted}>
                  {t_i18n('This constructed example records a local cell label and a description of connection attempts. It provides no verified global asset identity, DU association or event timestamp.')}
                </Text>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
                  <Text variant="content-compact-bold">{t_i18n('Evidence boundary')}</Text>
                  <Text variant="content-base" style={muted}>
                    {t_i18n('No source file, dataset row or testbed observation is represented by this preview. Stored investigations will need independently traceable evidence.')}
                  </Text>
                </Box>
                <Button priority="secondary" onClick={() => setActiveTab('investigation')}>{t_i18n('Back to investigation')}</Button>
              </Box>
            </Paper>
            {selectionDetails}
          </Box>
        </TabsContent>

        <TabsContent value="mapping">
          <Paper padding={32} style={{ marginTop: theme.spacing(3) }}>
            <Box sx={{ display: 'grid', gap: 3, justifyItems: 'start', maxWidth: 800 }}>
              <SchemaOutlined sx={{ color: 'text.secondary' }} />
              <Text as="h2" variant="title-sm" style={headingStyle}>{t_i18n('No stored mapping available')}</Text>
              <Text variant="content-base" style={muted}>
                {t_i18n('A verified mapping will connect source evidence to generated STIX objects, their stored identifiers and the platform export.')}
              </Text>
              <Box component="ol" sx={{ m: 0, pl: 2, display: 'grid', gap: 2 }}>
                <li><Text variant="content-base">{t_i18n('Source record and mapping version')}</Text></li>
                <li><Text variant="content-base">{t_i18n('Generated objects and relationships')}</Text></li>
                <li><Text variant="content-base">{t_i18n('Stored records and exported STIX')}</Text></li>
              </Box>
              <Text variant="content-compact" style={muted}>{t_i18n('The data model is under revision. This preview does not demonstrate model implementation.')}</Text>
              <Button priority="secondary" onClick={() => setActiveTab('evidence')}>{t_i18n('Review evidence')}</Button>
            </Box>
          </Paper>
        </TabsContent>
      </Tabs>
    </Box>
  );
};

const TelecomWorkspace = () => (
  <Security needs={[KNOWLEDGE]} placeholder={<Navigate to="/dashboard" replace={true} />}>
    <TelecomWorkspaceContent />
  </Security>
);

export default TelecomWorkspace;
