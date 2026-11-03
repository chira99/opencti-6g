import logoLight from '../static/images/6g-cti/logo-light.svg';
import logoDark from '../static/images/6g-cti/logo-dark.svg';
import mark from '../static/images/6g-cti/mark.svg';
import favicon from '../static/images/6g-cti/favicon.svg';

export const PLATFORM_NAME = '6G CTI';
export const PLATFORM_MARK = mark;
export const PLATFORM_FAVICON = favicon;

// The surface determines wordmark contrast; Graphite Light has a dark rail.
export const getPlatformWordmark = (surface: 'light' | 'dark', customLogo?: string | null): string => (
  customLogo || (surface === 'dark' ? logoDark : logoLight)
);
