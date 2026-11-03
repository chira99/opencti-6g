import { useState } from 'react';
import useAuth from './useAuth';
import { shouldDisplayLicenseBanner, shouldDisplayTrialBanner } from '../bannerUtils';
import { SMTP_REFRESH_TOKEN_BANNER_VISIBLE_BUS } from '../bannerConstants';
import useBus from './useBus';
import { TOP_BANNER_HEIGHT } from '../../components/TopBanner';

export interface TopBannerState {
  showLicenseBanner: boolean;
  showTrialBanner: boolean;
  showRegisterBanner: boolean;
  showSmtpRefreshTokenBanner: boolean;
  height: number;
}

const useTopBanner = (): TopBannerState => {
  const { settings } = useAuth();

  // SmtpRefreshTokenBanner resolves its own visibility from a dedicated query
  // (not the globally preloaded Settings), so it reports its visibility here
  // through a small pub/sub bus to keep the shared height in sync.
  const [showSmtpRefreshTokenBanner, setShowSmtpRefreshTokenBanner] = useState<boolean>(false);
  useBus(SMTP_REFRESH_TOKEN_BANNER_VISIBLE_BUS, (value: boolean) => setShowSmtpRefreshTokenBanner(value), []);

  const showLicenseBanner = shouldDisplayLicenseBanner(settings?.platform_enterprise_edition);
  const showTrialBanner = shouldDisplayTrialBanner(settings);

  const height = (showLicenseBanner || showTrialBanner || showSmtpRefreshTokenBanner) ? TOP_BANNER_HEIGHT : 0;

  return { showLicenseBanner, showTrialBanner, showRegisterBanner: false, showSmtpRefreshTokenBanner, height };
};

export default useTopBanner;
