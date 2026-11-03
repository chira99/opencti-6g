import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import testRender, { createMockUserContext } from '../../../../utils/tests/test-render';
import { BYPASS } from '../../../../utils/hooks/useGranted';
import type { IngestionConnector } from './types';
import IngestionCatalogConnectorHeader from './IngestionCatalogConnectorHeader';
import IngestionCatalogCard from './IngestionCatalogCard';

const buildConnector = (overrides: Partial<IngestionConnector> = {}): IngestionConnector => ({
  title: 'CrowdStrike Falcon Intel',
  slug: 'crowdstrike-falcon-intel',
  description: 'Connector overview',
  short_description: 'Short description',
  logo: 'https://example.test/logo.png',
  use_cases: ['Enrichment'],
  solution_categories: null,
  license_type: null,
  verified: true,
  last_verified_date: '2026-09-18',
  playbook_supported: false,
  max_confidence_level: 100,
  support_version: '7.260700.0',
  subscription_link: 'https://example.test/vendor',
  source_code: 'https://example.test/source',
  manager_supported: true,
  container_version: '7.260700.0',
  compatibility: {
    is_compatible: true,
    latest_compatible_version: '7.260700.0',
    minimum_platform_version: null,
    maximum_platform_version: null,
  },
  container_image: 'example/test:7.260700.0',
  container_type: 'EXTERNAL_IMPORT',
  config_schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'test-schema',
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false,
  },
  ...overrides,
});

const buildUserContext = () => ({
  ...createMockUserContext({
    me: {
      name: 'admin',
      user_email: 'admin@opencti.io',
      capabilities: [{ name: BYPASS }],
      capabilitiesInDraft: [],
    },
  }),
});

const catalogViews: {
  name: string;
  render: (connector: IngestionConnector, isEnterpriseEdition: boolean, onClickDeploy: () => void) => React.ReactElement;
}[] = [
  {
    name: 'IngestionCatalogConnectorHeader',
    render: (connector, isEnterpriseEdition, onClickDeploy) => (
      <IngestionCatalogConnectorHeader connector={connector} isEnterpriseEdition={isEnterpriseEdition} onClickDeploy={onClickDeploy} />
    ),
  },
  {
    name: 'IngestionCatalogCard',
    render: (connector, isEnterpriseEdition, onClickDeploy) => (
      <IngestionCatalogCard node={connector} isEnterpriseEdition={isEnterpriseEdition} onClickDeploy={onClickDeploy} />
    ),
  },
];

describe.each(catalogViews)('$name', ({ render: renderView }) => {
  it('disables Deploy when no compatible version exists', () => {
    const connector = buildConnector({
      compatibility: {
        is_compatible: false,
        latest_compatible_version: null,
        minimum_platform_version: '7.260828.0',
        maximum_platform_version: null,
      },
    });

    testRender(
      renderView(connector, true, () => {}),
      { userContext: buildUserContext() },
    );

    expect(screen.getByRole('button', { name: 'Deploy' })).toBeDisabled();
  });

  it('hides deployment controls in Community Edition even when no compatible version exists', () => {
    const connector = buildConnector({
      compatibility: {
        is_compatible: false,
        latest_compatible_version: null,
        minimum_platform_version: '7.260828.0',
        maximum_platform_version: null,
      },
    });

    testRender(
      renderView(connector, false, () => {}),
      { userContext: buildUserContext() },
    );

    expect(screen.queryByRole('button', { name: 'Deploy' })).not.toBeInTheDocument();
    expect(screen.getByText(connector.title)).toBeInTheDocument();
  });

  it('explains on hover why Deploy is disabled, and lets keyboard users reach the reason', async () => {
    const connector = buildConnector({
      compatibility: {
        is_compatible: false,
        latest_compatible_version: null,
        minimum_platform_version: null,
        maximum_platform_version: '7.260900.0',
      },
    });

    const { user } = testRender(
      renderView(connector, true, () => {}),
      { userContext: buildUserContext() },
    );

    const wrapper = screen.getByRole('button', { name: 'Deploy' }).parentElement as HTMLElement;
    expect(wrapper).toHaveAttribute('tabindex', '0');
    await user.hover(wrapper);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/^This connector is not compatible with your current platform version. It supports platform versions up to/);
  });

  it('keeps licensed deployment working when a compatible version exists', async () => {
    const connector = buildConnector({
      compatibility: {
        is_compatible: true,
        latest_compatible_version: '7.260828.0',
        minimum_platform_version: null,
        maximum_platform_version: null,
      },
    });

    const onClickDeploy = vi.fn();
    const { user } = testRender(
      renderView(connector, true, onClickDeploy),
      { userContext: buildUserContext() },
    );

    const deployButton = screen.getByRole('button', { name: 'Deploy' });
    expect(deployButton).toBeEnabled();
    await user.click(deployButton);
    expect(onClickDeploy).toHaveBeenCalledOnce();
  });

  it('hides deployment controls in Community Edition for compatible managed connectors', () => {
    const connector = buildConnector({
      compatibility: {
        is_compatible: true,
        latest_compatible_version: '7.260828.0',
        minimum_platform_version: null,
        maximum_platform_version: null,
      },
    });

    testRender(
      renderView(connector, false, () => {}),
      { userContext: buildUserContext() },
    );

    expect(screen.queryByRole('button', { name: 'Deploy' })).not.toBeInTheDocument();
    expect(screen.getByText(connector.title)).toBeInTheDocument();
  });

  it('renders neither Deploy nor the Enterprise Edition upsell in Community Edition for unmanaged connectors', () => {
    const connector = buildConnector({ manager_supported: false });

    testRender(
      renderView(connector, false, () => {}),
      { userContext: buildUserContext() },
    );

    expect(screen.queryByRole('button', { name: 'Deploy' })).not.toBeInTheDocument();
    expect(screen.getByText(connector.title)).toBeInTheDocument();
  });

  it('does not render Deploy for unmanaged connectors', () => {
    const connector = buildConnector({ manager_supported: false });

    testRender(
      renderView(connector, true, () => {}),
      { userContext: buildUserContext() },
    );

    expect(screen.queryByRole('button', { name: 'Deploy' })).not.toBeInTheDocument();
  });
});
