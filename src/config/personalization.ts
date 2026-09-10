const APP_URL = "https://app.bento.com.ar";

export function getPersonalizationHref(templateName: string, source = "template_catalog"): string {
  const params = new URLSearchParams({
    intent: "personalize",
    template: templateName,
    source,
    redirect: "/onboarding",
  });

  return `${APP_URL}/login?${params.toString()}`;
}
