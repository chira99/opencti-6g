import React from 'react';
import useTopBanner from '../../utils/hooks/useTopBanner';
import LicenseBanner from './LicenseBanner';
import StartTrialBanner from './xtm_hub/StartTrialBanner';
import SmtpRefreshTokenBanner from './settings/smtp_configuration/SmtpRefreshTokenBanner';

const TopBannersManager = () => {
  const { showLicenseBanner, showTrialBanner } = useTopBanner();

  return (
    <>
      {showLicenseBanner && <LicenseBanner />}
      {showTrialBanner && <StartTrialBanner />}
      <SmtpRefreshTokenBanner />
    </>
  );
};

export default TopBannersManager;
