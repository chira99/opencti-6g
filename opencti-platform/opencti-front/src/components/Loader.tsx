import React, { FunctionComponent, useEffect, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Text } from '@filigran/design-system';
import { interval } from 'rxjs';
import { TEN_SECONDS } from '../utils/Time';
import { PLATFORM_MARK } from '../utils/platformBranding';
import './Loader.css';

const interval$ = interval(TEN_SECONDS);

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
    minWidth: '100%',
    height: '100%',
    minHeight: 'calc(100vh - 180px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerInElement: {
    width: '100%',
    height: '100%',
    display: 'table',
  },
  loader: {
    width: '5rem',
    zIndex: 20,
  },
  loaderInElement: {
    width: '5rem',
    margin: 0,
    padding: 0,
    display: 'table-cell',
    verticalAlign: 'middle',
    textAlign: 'center',
  },
}));

export enum LoaderVariant {
  container = 'container',
  inElement = 'inElement',
  inline = 'inline',
}

interface LoaderProps {
  variant?: LoaderVariant;
  withRightPadding?: boolean;
  withTopMargin?: boolean;
  rotatingTexts?: Array<string>;
}

const Loader: FunctionComponent<LoaderProps> = ({
  variant = LoaderVariant.container,
  withRightPadding = false,
  withTopMargin = false,
  rotatingTexts,
}) => {
  const classes = useStyles();
  const [currentText, setCurrentText] = useState(0);
  const textCount = rotatingTexts?.length ?? 0;

  useEffect(() => {
    if (textCount < 2) return undefined;
    const subscription = interval$.subscribe(() => {
      setCurrentText((index) => (index + 1) % textCount);
    });
    return () => subscription.unsubscribe();
  }, [textCount]);

  const markSize = variant === LoaderVariant.inline ? 24 : variant === LoaderVariant.inElement ? 40 : 80;
  const content = (
    <>
      <img
        src={PLATFORM_MARK}
        alt=""
        aria-hidden="true"
        width={markSize}
        height={markSize}
        className="cti-loader__mark"
        draggable={false}
      />
      {textCount > 0 && (
        <Text as="span" variant="content-compact" style={{ display: 'block' }}>
          {rotatingTexts?.[currentText % textCount]}...
        </Text>
      )}
    </>
  );

  if (variant === LoaderVariant.inline) {
    return (
      <div
        role="progressbar"
        aria-label="Loading..."
        style={{ display: 'inline-flex', width: '4rem', height: 35, alignItems: 'center', justifyContent: 'center' }}
      >
        {content}
      </div>
    );
  }
  return (
    <div
      className={variant === LoaderVariant.inElement ? classes.containerInElement : classes.container}
      style={
        variant === LoaderVariant.inElement
          ? {
              paddingRight: withRightPadding ? 200 : 0,
              marginTop: withTopMargin ? 200 : 0,
            }
          : {}
      }
    >
      <div
        role="progressbar"
        aria-label="Loading..."
        className={
          variant === LoaderVariant.inElement ? classes.loaderInElement : classes.loader
        }
        style={
          variant !== LoaderVariant.inElement
            ? { paddingRight: withRightPadding ? 100 : 0 }
            : {}
        }
      >
        {content}
      </div>
    </div>
  );
};

export default Loader;
