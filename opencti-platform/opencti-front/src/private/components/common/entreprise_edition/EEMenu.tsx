import EEChip from '@components/common/entreprise_edition/EEChip';
import React, { ReactElement } from 'react';
import { Stack } from '@mui/material';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';

type EEMenuProps = {
  children: ReactElement;
};

const EEMenu = ({ children }: EEMenuProps) => {
  const isEnterpriseEdition = useEnterpriseEdition();
  if (!isEnterpriseEdition) return null;
  return (
    <Stack direction="row">
      {children}
      <EEChip />
    </Stack>
  );
};

export default EEMenu;
