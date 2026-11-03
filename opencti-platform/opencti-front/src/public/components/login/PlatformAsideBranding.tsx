import { Text } from '@filigran/design-system';
import { useTheme } from '@mui/material/styles';
import { Theme } from '../../../components/Theme';
import { useFormatter } from '../../../components/i18n';
import { PLATFORM_MARK } from '../../../utils/platformBranding';

interface PlatformAsideBrandingProps {
  showWatermark?: boolean;
  showAttribution?: boolean;
}

const PlatformAsideBranding = ({
  showWatermark = true,
  showAttribution = true,
}: PlatformAsideBrandingProps) => {
  const theme = useTheme<Theme>();
  const { t_i18n } = useFormatter();

  return (
    <>
      {showWatermark && (
        <img
          src={PLATFORM_MARK}
          alt=""
          aria-hidden="true"
          data-testid="platform-login-watermark"
          draggable={false}
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
            width: '100%',
            maxWidth: 720,
            height: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: theme.palette.mode === 'dark' ? 0.12 : 0.09,
          }}
        />
      )}
      {showAttribution && (
        <div
          data-testid="platform-attribution"
          style={{
            position: 'absolute',
            bottom: theme.spacing(3),
            left: theme.spacing(3),
            color: theme.palette.primary.main,
            zIndex: 2,
          }}
        >
          <Text as="span" variant="content-compact" style={{ color: 'inherit' }}>
            {t_i18n('Made by')}{' '}<strong>NetsLab</strong>
          </Text>
        </div>
      )}
    </>
  );
};

export default PlatformAsideBranding;
