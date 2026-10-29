export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  enableClosingConfirmation?: () => void;
  isExpanded?: boolean;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  themeParams?: Record<string, string>;
  viewportHeight?: number;
  viewportStableHeight?: number;
  safeAreaInset?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  contentSafeAreaInset?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

function setCssVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function applySafeArea(webApp: TelegramWebApp) {
  const inset = webApp.safeAreaInset;
  const content = webApp.contentSafeAreaInset;
  if (inset) {
    if (inset.top != null) setCssVar('--tg-safe-area-inset-top', `${inset.top}px`);
    if (inset.bottom != null) setCssVar('--tg-safe-area-inset-bottom', `${inset.bottom}px`);
    if (inset.left != null) setCssVar('--tg-safe-area-inset-left', `${inset.left}px`);
    if (inset.right != null) setCssVar('--tg-safe-area-inset-right', `${inset.right}px`);
  }
  if (content) {
    if (content.top != null) setCssVar('--tg-content-safe-area-inset-top', `${content.top}px`);
    if (content.bottom != null) {
      setCssVar('--tg-content-safe-area-inset-bottom', `${content.bottom}px`);
    }
  }
  if (webApp.viewportStableHeight) {
    setCssVar('--tg-viewport-stable-height', `${webApp.viewportStableHeight}px`);
  }
}

/** Инициализация Telegram Mini App. Вне Telegram ничего не делает. */
export function initTelegramWebApp(): TelegramWebApp | null {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return null;

  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor?.('#FFFFFF');
  webApp.setBackgroundColor?.('#F2F2F4');
  webApp.disableVerticalSwipes?.();
  applySafeArea(webApp);

  document.documentElement.dataset.telegram = '1';
  if (webApp.platform) {
    document.documentElement.dataset.tgPlatform = webApp.platform;
  }

  return webApp;
}
