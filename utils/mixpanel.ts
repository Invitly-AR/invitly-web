import mixpanel from "mixpanel-browser";

type EventParams = Record<string, string | number | boolean>;

let initialized = false;

export function initializeMixpanel() {
  if (initialized || typeof window === "undefined") return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;

  mixpanel.init(token, {
    autocapture: false,
    track_pageview: false,
    persistence: "cookie",
    cross_subdomain_cookie: true,
    secure_cookie: process.env.NODE_ENV === "production",
  });
  initialized = true;

  mixpanel.register({
    platform: "web",
    app: "invitly-web",
  });
}

export function trackMixpanel(event: string, params?: EventParams) {
  if (!initialized) return;
  mixpanel.track(event, params);
}

export function trackMixpanelPageView(path: string) {
  if (!initialized) return;
  mixpanel.track("Page Viewed", { path });
}
