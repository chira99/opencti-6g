import React from 'react';
import { Box, Stack, useTheme } from '@mui/material';
import { useNavigate } from 'react-router';
import PasswordPolicies from '../common/form/PasswordPolicies';
import { useFormatter } from '../../../components/i18n';
import { MESSAGING$ } from '../../../relay/environment';
import ForcePasswordChangeForm from '../../../components/ForcePasswordChangeForm';
import { getPlatformWordmark, PLATFORM_NAME } from '../../../utils/platformBranding';
import PlatformAsideBranding from '../../../public/components/login/PlatformAsideBranding';

const ForcePasswordChange = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t_i18n } = useFormatter();

  const handleSuccess = () => {
    MESSAGING$.notifySuccess(t_i18n('The password has been updated'));
    navigate('/dashboard', { replace: true });
  };

  return (
    <Stack direction="row" height="100vh">
      <Stack
        flex={1}
        justifyContent="center"
        alignItems="center"
        gap={4}
        sx={{
          position: 'relative',
          minWidth: 500,
          overflow: 'hidden',
          background: theme.palette.designSystem?.background?.main ?? theme.palette.background.default,
          boxShadow: '8px 0px 9px 0px #0000002F',
          zIndex: 2,
        }}
      >
        <img
          src={getPlatformWordmark(theme.palette.mode)}
          alt={`${PLATFORM_NAME} logo`}
          width={216}
        />
        <Stack gap={1} sx={{ width: 500 }}>
          <Box
            sx={{
              background: theme.palette.background.paper,
              borderRadius: 1,
              padding: theme.spacing(3),
            }}
          >
            <ForcePasswordChangeForm
              onSuccess={handleSuccess}
              renderPolicies={(password) => (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <PasswordPolicies value={password} />
                </Box>
              )}
            />
          </Box>
        </Stack>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <PlatformAsideBranding showWatermark={false} />
        </Box>
      </Stack>
      <Box
        flex={1}
        sx={{
          display: { xs: 'none', md: 'block' },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(100deg, #050A14 0%, #0C1728 100%)'
            : 'linear-gradient(100deg, #EAEAED 0%, #FEFEFF 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <PlatformAsideBranding />
      </Box>
    </Stack>
  );
};

export default ForcePasswordChange;
