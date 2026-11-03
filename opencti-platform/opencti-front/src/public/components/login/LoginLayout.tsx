import { Box, Stack, SxProps } from '@mui/material';
import { useTheme } from '@mui/styles';
import { PropsWithChildren } from 'react';
import { Theme } from '../../../components/Theme';
import SystemBanners from '../SystemBanners';
import { LoginRootPublicQuery$data } from '../../__generated__/LoginRootPublicQuery.graphql';
import LoginLogo from './LoginLogo';
import PlatformAsideBranding from './PlatformAsideBranding';
import { hasCustomColor } from '../../../utils/theme';
import { getLoginAsideType } from '../../../private/components/settings/themes/theme-utils';

interface LoginLayoutProps extends PropsWithChildren {
  settings: LoginRootPublicQuery$data['publicSettings'];
}

const LoginLayout = ({ settings, children }: LoginLayoutProps) => {
  const theme = useTheme<Theme>();

  const isEnterpriseEdition = settings.platform_enterprise_edition_license_validated;
  const isWhitemarkEnable = settings.platform_whitemark && isEnterpriseEdition;

  const loginAsideType = getLoginAsideType({
    theme_login_aside_color: settings.platform_theme?.theme_login_aside_color,
    theme_login_aside_gradient_start: settings.platform_theme?.theme_login_aside_gradient_start,
    theme_login_aside_gradient_end: settings.platform_theme?.theme_login_aside_gradient_end,
    theme_login_aside_image: settings.platform_theme?.theme_login_aside_image,
  });

  const getAsideBackground = () => {
    if (loginAsideType === 'color') {
      return settings.platform_theme?.theme_login_aside_color;
    }

    if (loginAsideType === 'gradient') {
      return `linear-gradient(100deg, ${settings.platform_theme?.theme_login_aside_gradient_start} 0%, ${settings.platform_theme?.theme_login_aside_gradient_end} 100%)`;
    }

    if (loginAsideType === 'image') {
      return `url(${settings.platform_theme?.theme_login_aside_image})`;
    }
    // fallback to default
    return theme.palette.mode === 'dark'
      ? 'linear-gradient(100deg, #050A14 0%, #0C1728 100%)'
      : 'linear-gradient(100deg, #EAEAED 0%, #FEFEFF 100%)';
  };

  const hasCustomBackground = hasCustomColor(theme, 'theme_background');
  const backgroundContent = hasCustomBackground
    ? theme.palette.background.default
    : theme.palette.designSystem.background.main;

  const contentSx: SxProps = {
    position: 'relative',
    minWidth: 500,
    overflow: 'hidden',
    background: backgroundContent,
    boxShadow: '8px 0px 9px 0px #0000002F',
    zIndex: 2,
  };

  const asideSx: SxProps = {
    display: { xs: 'none', md: 'block' },
    background: getAsideBackground(),
    backgroundSize: loginAsideType === 'image' ? 'cover' : undefined,
    backgroundPosition: loginAsideType === 'image' ? 'center' : undefined,
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <>
      <SystemBanners settings={settings} />
      <Stack data-testid="login-page" direction="row" height="100%">
        <Stack
          flex={1}
          sx={contentSx}
          justifyContent="center"
          alignItems="center"
          gap={4}
        >
          <LoginLogo data={settings} />
          {children}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <PlatformAsideBranding showWatermark={false} showAttribution={!isWhitemarkEnable} />
          </Box>
        </Stack>
        <Box flex={1} sx={asideSx}>
          <PlatformAsideBranding
            showWatermark={loginAsideType === ''}
            showAttribution={!isWhitemarkEnable}
          />
        </Box>
      </Stack>
    </>
  );
};

export default LoginLayout;
