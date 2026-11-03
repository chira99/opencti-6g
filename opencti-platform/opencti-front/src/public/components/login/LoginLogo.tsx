import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { useTheme } from '@mui/styles';
import { LoginLogoFragment$key } from './__generated__/LoginLogoFragment.graphql';
import { getPlatformWordmark, PLATFORM_NAME } from '../../../utils/platformBranding';
import type { Theme } from '../../../components/Theme';

const fragment = graphql`
  fragment LoginLogoFragment on PublicSettings {
    platform_theme {
      theme_logo_login
    }
  }
`;

interface LoginLogoProps {
  data: LoginLogoFragment$key;
}

const LoginLogo = ({ data }: LoginLogoProps) => {
  const theme = useTheme<Theme>();
  const { platform_theme } = useFragment(fragment, data);
  const logo = getPlatformWordmark(theme.palette.mode, platform_theme?.theme_logo_login);

  return (
    <img
      src={logo}
      alt={`${PLATFORM_NAME} logo`}
      width={216}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default LoginLogo;
