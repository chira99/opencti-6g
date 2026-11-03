import { act, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import testRender from '../../../../utils/tests/test-render';
import EETooltip from './EETooltip';

const state = vi.hoisted(() => ({ isEnterpriseEdition: false }));
vi.mock('../../../../utils/hooks/useEnterpriseEdition', () => ({ default: () => state.isEnterpriseEdition }));
vi.mock('../../../../utils/hooks/useGranted', () => ({
  default: () => false,
  SETTINGS_SETPARAMETERS: 'SETTINGS_SETPARAMETERS',
}));
vi.mock('../../../../utils/hooks/useAuth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../../utils/hooks/useAuth')>()),
  default: () => ({ settings: { id: 'settings-id' } }),
}));
vi.mock('../../../../utils/hooks/useAI', () => ({ default: () => ({ enabled: false, configured: false }) }));
vi.mock('../../cases/feedbacks/FeedbackCreation', () => ({ default: () => null }));
vi.mock('./EnterpriseEditionAgreement', () => ({ default: () => null }));

const EnabledLater = () => {
  const [enabled, setEnabled] = useState(false);
  return (
    <>
      <EETooltip title="Some EE feature">
        <span><button type="button" disabled={!enabled}>Do something</button></span>
      </EETooltip>
      <button type="button" onClick={() => setEnabled(true)}>Enable</button>
    </>
  );
};

describe('EETooltip', () => {
  beforeEach(() => {
    state.isEnterpriseEdition = false;
  });

  it.each([
    ['a control', <button key="direct" type="button">Do something</button>],
    ['a control nested in a wrapper', <span key="nested"><span><button type="button">Do something</button></span></span>],
    ['a disabled control', <button key="disabled" type="button" disabled>Do something</button>],
  ])('hides %s without adding an upgrade tab stop', async (_, child) => {
    const { user } = testRender(
      <>
        <EETooltip title="Some EE feature">{child}</EETooltip>
        <button type="button">Elsewhere</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
    expect(screen.queryByText('Do something')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Some EE feature' })).not.toBeInTheDocument();
  });

  it('keeps unavailable controls hidden when a parent enables them later', async () => {
    const { user } = testRender(<EnabledLater />);
    await user.click(screen.getByRole('button', { name: 'Enable' }));
    await act(() => Promise.resolve());
    expect(screen.queryByText('Do something')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Some EE feature' })).not.toBeInTheDocument();
  });

  it('does not expose an upgrade prompt when no title is provided', () => {
    testRender(
      <EETooltip>
        <button type="button">Do something</button>
      </EETooltip>,
    );
    expect(screen.queryByText('Do something')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enterprise Edition' })).not.toBeInTheDocument();
  });

  it('does not intercept unrelated Community actions or activate hidden controls', async () => {
    const childAction = vi.fn();
    const communityAction = vi.fn();
    const { user } = testRender(
      <>
        <EETooltip title="Some EE feature">
          <button type="button" onClick={childAction}>Do something</button>
        </EETooltip>
        <button type="button" onClick={communityAction}>Elsewhere</button>
      </>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(childAction).not.toHaveBeenCalled();
    expect(communityAction).toHaveBeenCalledOnce();
  });

  it('preserves a licensed control and its action', async () => {
    state.isEnterpriseEdition = true;
    const childAction = vi.fn();
    const { user } = testRender(
      <EETooltip title="Licensed feature">
        <button type="button" onClick={childAction}>Do something</button>
      </EETooltip>,
    );
    await user.click(screen.getByRole('button', { name: 'Licensed feature' }));
    expect(childAction).toHaveBeenCalledOnce();
  });

  it('keeps the licensed AI configuration dialog instead of running the unavailable action', async () => {
    state.isEnterpriseEdition = true;
    const childAction = vi.fn();
    const { user } = testRender(
      <EETooltip title="Some AI feature" forAi>
        <span><button type="button" onClick={childAction}>Ask AI</button></span>
      </EETooltip>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Some AI feature' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(childAction).not.toHaveBeenCalled();
    expect(await screen.findByText('Enable AI powered platform')).toBeInTheDocument();
  });
});
