import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import testRender from '../../../../utils/tests/test-render';
import EEChip from './EEChip';

describe('EEChip', () => {
  it('does not render an Enterprise promotion', () => {
    testRender(<EEChip feature="PIR" />);
    expect(screen.queryByText('EE')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not insert an upgrade tab stop into Community navigation', async () => {
    const { user } = testRender(
      <>
        <EEChip />
        <button type="button">Continue</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus();
  });

  it('accepts existing display props and refs without adding a nested control', () => {
    const ref = React.createRef<HTMLElement>();
    testRender(
      <button type="button">
        Action
        <EEChip ref={ref} clickable={false} size="sm" feature="PIR" style={{ marginInlineStart: 0 }} />
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.queryByText('EE')).not.toBeInTheDocument();
    expect(ref.current).toBeNull();
  });
});
