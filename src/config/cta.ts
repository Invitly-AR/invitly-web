/**
 * Configuración central del CTA principal de la home.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DECISIÓN ACTIVA — "elegir diseño antes de registrarse"
 * ─────────────────────────────────────────────────────────────────────────────
 * El CTA principal lleva al catálogo. El registro aparece recién cuando la
 * persona elige personalizar un diseño.
 *
 * Para volver al modelo anterior:
 *   1. Poner CTA_MODE = "pay-first"
 *   2. Ajustar las claves `Hero.button.primary` y `FinalCta.button.primary`
 *      en messages/es/home.json y messages/en/home.json
 *
 * NO hardcodear destinos de CTA en los componentes.
 */

export type CtaMode = "pay-first" | "design-first";

/** Modelo comercial activo. Ver bloque de arriba antes de tocar. */
export const CTA_MODE: CtaMode = "design-first";

/**
 * Destino del CTA primario de la home.
 * - pay-first     → pricing, porque el precio es la primera objeción a resolver.
 * - design-first  → catálogo, para elegir antes de registrarse o pagar.
 */
export function getPrimaryCtaHref(locale: string): string {
  if (CTA_MODE === "design-first") {
    return `/${locale}/templates`;
  }
  return `/${locale}/pricing`;
}

export function isPrimaryCtaExternal(): boolean {
  return false;
}

export function getPricingHref(locale: string): string {
  return `/${locale}/pricing`;
}

/** Precio de entrada. Se muestra en el hero para calificar al visitante temprano. */
export const ENTRY_PRICE_ES = "$60.000";
export const ENTRY_PRICE_EN = "$60";
