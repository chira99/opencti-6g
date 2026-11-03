import makeStyles from '@mui/styles/makeStyles';
import { useTheme } from '@mui/styles';
import PublicStreamLines from '@components/data/stream/PublicStreamLines';
import PublicTaxiiLines from '@components/data/taxii/PublicTaxiiLines';
import PublicFeedLines from '@components/data/feeds/PublicFeedLines';
import React from 'react';
import { loadQuery, usePreloadedQuery } from 'react-relay';
import type { Theme } from '../../components/Theme';
import { environment } from '../../relay/environment';
import { LoginRootPublicQuery } from '../__generated__/LoginRootPublicQuery.graphql';
import { rootPublicQuery } from '../LoginRoot';
import { getPlatformWordmark, PLATFORM_NAME } from '../../utils/platformBranding';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: '70%',
    marginTop: '8rem',
  },
  logo: {
    width: 200,
    margin: '0px 0px 50px 0px',
  },
});

const queryRef = loadQuery<LoginRootPublicQuery>(
  environment,
  rootPublicQuery,
  {},
);

const PublicDataSharing = () => {
  const theme = useTheme<Theme>();
  const classes = useStyles();

  const { publicSettings: settings } = usePreloadedQuery<LoginRootPublicQuery>(
    rootPublicQuery,
    queryRef,
  );

  const loginLogo = getPlatformWordmark(theme.palette.mode, settings.platform_theme?.theme_logo_login || settings.platform_theme?.theme_logo);

  return (
    <>
      <div className={classes.container}>
        <img
          src={loginLogo}
          alt={`${PLATFORM_NAME} logo`}
          className={classes.logo}
        />
        <PublicStreamLines />
        <PublicTaxiiLines />
        <PublicFeedLines />
      </div>
    </>
  );
};

export default PublicDataSharing;
