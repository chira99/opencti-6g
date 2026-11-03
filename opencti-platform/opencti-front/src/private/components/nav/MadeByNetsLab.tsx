import React from 'react';
import { Text } from '@filigran/design-system';
import { useFormatter } from '../../../components/i18n';

const MadeByNetsLab: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const { t_i18n } = useFormatter();
  return (
    <div
      role="img"
      aria-label={`${t_i18n('Made by')} NetsLab`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 4,
        height: 36,
        paddingLeft: collapsed ? 0 : 16,
        paddingRight: collapsed ? 0 : 8,
      }}
    >
      {!collapsed && (
        <Text as="span" variant="content-caption" className="text-default-secondary shrink-0" aria-hidden="true">
          {t_i18n('Made by')}
        </Text>
      )}
      <Text as="span" variant="content-caption" className="text-default-secondary shrink-0 font-semibold" aria-hidden="true">
        {collapsed ? 'NL' : 'NetsLab'}
      </Text>
    </div>
  );
};

export default MadeByNetsLab;
