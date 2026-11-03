import { Navbar, NavbarItem, NavbarSeparator, NavbarSubmenu, NavbarSubmenuItem } from '@filigran/design-system';
import { useTheme } from '@mui/styles';
import React, { useState } from 'react';
import { graphql, usePreloadedQuery } from 'react-relay';
import { Link, useLocation } from 'react-router';
import { useFormatter } from '../../../components/i18n';
import { Theme } from '../../../components/Theme';
import { THEME_DARK_DEFAULT_BACKGROUND } from '../../../components/ThemeDark';
import useAuth from '../../../utils/hooks/useAuth';
import useTopBanner from '../../../utils/hooks/useTopBanner';
import useQueryLoading from '../../../utils/hooks/useQueryLoading';
import { NavBarQuery } from './__generated__/NavBarQuery.graphql';
import { useSettingsMessagesBannerHeight } from '../settings/settings_messages/SettingsMessagesBanner';
import MadeByNetsLab from './MadeByNetsLab';
import { OPEN_BAR_WIDTH, SMALL_BAR_WIDTH, readNavOpen, readSelectedMenu, writeNavOpen, writeSelectedMenu } from './navBarConstants';
import useNavMenu, { NavGroup, NavItem, NavSubItem } from './useNavMenu';
import './NavBar.css';

export const navBarQuery = graphql`
  query NavBarQuery {
    settings {
      platform_whitemark
    }
  }
`;

export const isRouteSelected = (pathname: string, link: string, exact?: boolean): boolean => {
  if (exact) return pathname === link;
  if (link === '/dashboard/data' && pathname.includes('/import/draft/')) return false;
  return pathname === link || pathname.startsWith(`${link}/`);
};

export interface NavBarViewProps {
  groups: NavGroup[];
  pathname: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  openSubmenus: string[];
  onSubmenuOpenChange: (id: string, open: boolean) => void;
  submenuShowIcons: boolean;
  customBackground?: string;
  navigationTheme?: Theme['researchNavigation'];
  accentColor?: string;
  topOffset: string;
  bottomOffset: string;
  flowOffset: string;
  header: React.ReactNode;
  footer: React.ReactNode;
  navLabel: string;
}

export const NavBarView: React.FC<NavBarViewProps> = ({
  groups,
  pathname,
  collapsed,
  onCollapsedChange,
  openSubmenus,
  onSubmenuOpenChange,
  submenuShowIcons,
  customBackground,
  navigationTheme,
  accentColor,
  topOffset,
  bottomOffset,
  flowOffset,
  header,
  footer,
  navLabel,
}) => {
  // FDS-WORKAROUND #11: sticky, definite-height rail geometry — remove when the <nav> takes the height it is given — see fds-migration/LIBRARY-FEEDBACK.md #11
  const navStyle: React.CSSProperties & Record<string, string | undefined> = {
    position: 'sticky',
    width: `${collapsed ? SMALL_BAR_WIDTH : OPEN_BAR_WIDTH}px`,
    top: topOffset,
    marginTop: flowOffset,
    alignSelf: 'flex-start',
    height: `calc(100dvh - ${topOffset} - ${bottomOffset})`,
  };
  if (customBackground) navStyle.background = customBackground;
  if (navigationTheme) {
    // Only the rail inherits these tokens. Portalled menus keep the page theme.
    navStyle['--text-default-primary'] = navigationTheme.foreground;
    navStyle['--text-default-secondary'] = navigationTheme.muted;
    navStyle['--bg-elevation-hover-layer-0'] = `color-mix(in srgb, ${navigationTheme.foreground} 8%, ${navigationTheme.background})`;
    navStyle['--bg-elevation-highlight-layer-0'] = `color-mix(in srgb, ${navigationTheme.foreground} 12%, ${navigationTheme.background})`;
    // Rebind consumed aliases: root aliases have already resolved to the page palette.
    navStyle['--bg-elevation-default'] = navigationTheme.background;
    navStyle['--bg-elevation-hover'] = 'var(--bg-elevation-hover-layer-0)';
    navStyle['--bg-elevation-highlight'] = 'var(--bg-elevation-highlight-layer-0)';
  }
  if (accentColor) {
    navStyle['--color-filigran-brand-primary'] = accentColor;
    // FDS-WORKAROUND #6: re-derive the brand tint tokens — remove when derived tokens follow a subtree override — see fds-migration/LIBRARY-FEEDBACK.md #6
    navStyle['--color-filigran-brand-primary-transparency-10'] = `color-mix(in srgb, ${accentColor} 10%, transparent)`;
    navStyle['--color-filigran-brand-primary-transparency-55'] = `color-mix(in srgb, ${accentColor} 55%, transparent)`;
  }

  const renderSubItem = (sub: NavSubItem) => (
    <NavbarSubmenuItem
      key={sub.link}
      to={sub.link}
      linkComponent={Link}
      icon={sub.icon}
      aria-current={isRouteSelected(pathname, sub.link, sub.exact) ? 'page' : undefined}
    >
      {sub.label}
    </NavbarSubmenuItem>
  );

  // FDS-WORKAROUND #7: row body re-implemented for asChild — remove when asChild composes the row body — see fds-migration/LIBRARY-FEEDBACK.md #7
  const renderRowBody = (icon: React.ReactNode, label: string) => (
    <>
      <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>
      <span className={collapsed ? 'sr-only' : 'flex-1 truncate text-left'}>{label}</span>
    </>
  );

  const renderItem = (item: NavItem) => {
    if (!item.subItems || item.subItems.length === 0) {
      return (
        <NavbarItem key={item.id} asChild tooltipLabel={item.label}>
          <Link
            to={item.link}
            aria-current={isRouteSelected(pathname, item.link, item.exact) ? 'page' : undefined}
          >
            {renderRowBody(item.icon, item.label)}
          </Link>
        </NavbarItem>
      );
    }
    return (
      <NavbarSubmenu
        key={item.id}
        label={item.label}
        icon={item.icon}
        // FDS-WORKAROUND #10: accordion state bound only when expanded — remove when the flyout gets its own prop — see fds-migration/LIBRARY-FEEDBACK.md #10
        open={collapsed ? undefined : openSubmenus.includes(item.id)}
        onOpenChange={collapsed ? undefined : (open) => onSubmenuOpenChange(item.id, open)}
        // `to` makes the parent row navigable ONLY while the rail is collapsed, which is
        // exactly what the previous `handleParentClick` did: expanded, a click toggled the
        // accordion; collapsed, it navigated to the parent route.
        to={item.link}
        linkComponent={Link}
      >
        {item.subItems.map(renderSubItem)}
      </NavbarSubmenu>
    );
  };

  return (
    <Navbar
      className="app-navbar"
      aria-label={navLabel}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      submenuShowIcons={submenuShowIcons}
      style={navStyle}
      header={header}
      footer={footer}
    >
      {groups.map((group, index) => (
        <React.Fragment key={group.id}>
          {index > 0 && <NavbarSeparator />}
          {group.items.map(renderItem)}
        </React.Fragment>
      ))}
    </Navbar>
  );
};

interface NavBarLogoProps {
  collapsed: boolean;
  logo?: string;
  logoCollapsed?: string;
}

export const NavBarLogo: React.FC<NavBarLogoProps> = ({ collapsed, logo, logoCollapsed }) => (
  <Link
    to="/dashboard"
    aria-label="logo"
    className="inline-flex h-9 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-focus"
  >
    <img
      src={collapsed ? logoCollapsed : logo}
      alt=""
      width={collapsed ? 28 : 126}
      height={28}
      style={{ objectFit: 'contain', objectPosition: 'left' }}
    />
  </Link>
);

interface NavBarComponentProps {
  queryRef: NonNullable<ReturnType<typeof useQueryLoading<NavBarQuery>>>;
}

const NavBarComponent: React.FC<NavBarComponentProps> = ({ queryRef }) => {
  const theme = useTheme<Theme>();
  const { t_i18n } = useFormatter();
  const location = useLocation();
  const {
    me: { submenu_auto_collapse: submenuAutoCollapse, submenu_show_icons: submenuShowIcons, draftContext },
    bannerSettings: { bannerHeightNumber },
  } = useAuth();
  const { height: topBannerHeight } = useTopBanner();
  const settingsMessagesBannerHeight = useSettingsMessagesBannerHeight();
  // Mirrors the app shell's own offsets (private/Index.tsx and nav/TopBar.tsx): the classification banners take the
  // banner height at the top and at the bottom, the notification banner `topBannerHeight` and the platform message
  // banner `settingsMessagesBannerHeight` at the top only. Without the platform message banner height the fixed
  // banner overlaps the top of the rail and hides the platform logo.
  const topOffset = `${topBannerHeight + bannerHeightNumber + settingsMessagesBannerHeight}px`;
  const bottomOffset = `${bannerHeightNumber}px`;
  // The parent shell (private/Index.tsx) reserves flow space for the classification and notification banners via its
  // own margins; only the platform message banner is left for the rail to reserve here.
  const flowOffset = `${settingsMessagesBannerHeight}px`;
  const data = usePreloadedQuery<NavBarQuery>(navBarQuery, queryRef);
  const groups = useNavMenu();

  const [navOpen, setNavOpen] = useState(readNavOpen());
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(readSelectedMenu());

  const handleCollapsedChange = (collapsed: boolean) => {
    setOpenSubmenus([]);
    writeSelectedMenu([]);
    setNavOpen(!collapsed);
    writeNavOpen(!collapsed);
  };

  const handleSubmenuOpenChange = (id: string, open: boolean) => {
    let updated: string[];
    if (!open) {
      updated = openSubmenus.filter((menu) => menu !== id);
    } else if (submenuAutoCollapse) {
      updated = [id];
    } else {
      updated = [...openSubmenus.filter((menu) => menu !== id), id];
    }
    setOpenSubmenus(updated);
    writeSelectedMenu(updated);
  };

  const isLightTheme = theme.palette.mode === 'light';

  const navigationTheme = theme.researchNavigation;
  const customBackground = (() => {
    if (navigationTheme) return navigationTheme.background;
    if (isLightTheme) return undefined;
    const start = theme.palette.background?.gradient?.start ?? theme.palette.background?.default;
    const end = theme.palette.background?.gradient?.end ?? theme.palette.background?.secondary;
    if (start === THEME_DARK_DEFAULT_BACKGROUND) return undefined;
    return `linear-gradient(100deg, ${start} 0%, ${end} 100%)`;
  })();

  // FDS-WORKAROUND #1: selected-row accent resolved product-side — remove when Navbar exposes an accent prop — see fds-migration/LIBRARY-FEEDBACK.md #1
  const accentColor = draftContext
    ? theme.palette.designSystem?.alert?.warning?.primary
    : navigationTheme?.accent ?? theme.palette.primary?.main;

  return (
    <NavBarView
      groups={groups}
      pathname={location.pathname}
      collapsed={!navOpen}
      onCollapsedChange={handleCollapsedChange}
      openSubmenus={openSubmenus}
      onSubmenuOpenChange={handleSubmenuOpenChange}
      submenuShowIcons={submenuShowIcons ?? false}
      customBackground={customBackground}
      navigationTheme={navigationTheme}
      accentColor={accentColor}
      topOffset={topOffset}
      bottomOffset={bottomOffset}
      flowOffset={flowOffset}
      navLabel={t_i18n('Main navigation')}
      header={(
        <NavBarLogo collapsed={!navOpen} logo={theme.logo} logoCollapsed={theme.logo_collapsed} />
      )}
      footer={!data?.settings?.platform_whitemark && (
        <MadeByNetsLab collapsed={!navOpen} />
      )}
    />
  );
};

const NavBar = () => {
  const queryRef = useQueryLoading<NavBarQuery>(navBarQuery, {});
  return queryRef ? (
    <React.Suspense>
      <NavBarComponent queryRef={queryRef} />
    </React.Suspense>
  ) : null;
};

export default NavBar;
