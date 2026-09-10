import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/shared/Container";
import HeroPhonesWrapper from "@/components/features/home/HeroPhonesWrapper";
import HeroActions from "@/components/features/home/HeroActions";
import {
  getPrimaryCtaHref,
  getPricingHref,
  isPrimaryCtaExternal,
  CTA_MODE,
} from "@/src/config/cta";

const PHONE_FRONT_URL = "https://invitation-bucket-aws.s3.us-east-2.amazonaws.com/media/iMockup+-+iPhone+15+Pro+Max+costado.png";
const PHONE_LATERAL_URL = "https://invitation-bucket-aws.s3.us-east-2.amazonaws.com/media/iMockup+-+iPhone+15+Pro+Max+lateral.png";

/**
 * Bloque 1 — Hero.
 *
 * Cambios respecto de la versión anterior:
 *  · Se quitó el typewriter rotativo del H1. La promesa ahora es FIJA: un
 *    visitante que aterriza en el segundo 3 leía una promesa distinta al que
 *    aterrizaba en el segundo 6. Eso costaba comprensión.
 *  · El precio de entrada aparece arriba del pliegue. En un modelo pay-first
 *    el precio es la primera objeción: esconderlo solo mueve el rebote una
 *    página más adelante.
 *  · El destino del CTA sale de `src/config/cta.ts`, no está hardcodeado acá.
 */
export default async function Hero() {
  const [t, locale] = await Promise.all([getTranslations("Hero"), getLocale()]);

  const stats = [
    { value: "RSVP", label: t("stats.rsvp") },
    { value: t("stats.guestsValue"), label: t("stats.guests") },
    { value: "<1 h", label: t("stats.support") },
  ];

  return (
    <>
      <section
        id="inicio"
        className="relative z-1 min-h-screen flex items-center pt-16 grain overflow-hidden"
        role="main"
        aria-label={t("title") + " " + t("subtitle")}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 1100px 620px at 18% 28%, rgba(255,164,89,0.22) 0%, transparent 68%), radial-gradient(ellipse 900px 520px at 82% 72%, rgba(255,140,70,0.16) 0%, transparent 70%)",
          }}
        />

        <Container className="relative z-10">
          <div className="flex flex-col gap-7 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12" style={{ minHeight: "min(600px, 80vh)" }}>
            <div aria-hidden="true" className="order-2 lg:order-2">
              <div className="relative h-[280px] sm:h-[330px] lg:hidden">
                <div className="absolute right-[8%] top-5 w-[45%] drop-shadow-[0_24px_48px_rgba(0,0,0,0.22)]">
                  <Image
                    src={PHONE_FRONT_URL}
                    alt={t("imageAlt")}
                    width={1080}
                    height={1132}
                    className="w-full h-auto"
                    priority
                    fetchPriority="high"
                    sizes="45vw"
                  />
                </div>
                <div className="absolute left-[-2%] top-10 w-[72%] drop-shadow-[0_20px_40px_rgba(0,0,0,0.20)] opacity-95">
                  <Image
                    src={PHONE_LATERAL_URL}
                    alt={t("imageAlt")}
                    width={1080}
                    height={1132}
                    className="w-full h-auto"
                    priority
                    fetchPriority="high"
                    sizes="72vw"
                  />
                </div>
              </div>
            </div>

            <div
              data-hero="content"
              className="order-1 pt-6 text-center lg:order-1 lg:pt-0 lg:text-left"
            >
              <h1
                data-hero="title"
                className="font-display font-normal mb-4 leading-[1.08]"
                style={{ fontSize: "clamp(2.5rem, 6.5vh, 4.25rem)", letterSpacing: "-0.02em" }}
              >
                {t("title")}
              </h1>

              <p
                data-hero="subtitle"
                className="text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0"
                style={{ fontSize: "clamp(0.95rem, 2vh, 1.2rem)" }}
              >
                {t("subtitle")}
              </p>

              <HeroActions
                primaryLabel={t("button.primary")}
                secondaryLabel={t("button.secondary")}
                primaryHref={getPrimaryCtaHref(locale)}
                primaryExternal={isPrimaryCtaExternal()}
                ctaMode={CTA_MODE}
                pricingHref={getPricingHref(locale)}
              />

              <p className="mt-4 text-xs text-muted-foreground text-center lg:text-left">
                {t("trust")}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="font-display font-bold text-primary" style={{ fontSize: "clamp(1.1rem, 3vh, 1.875rem)" }}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>

        <HeroPhonesWrapper
          frontImage={PHONE_FRONT_URL}
          lateralImage={PHONE_LATERAL_URL}
          imageAlt={t("imageAlt")}
        />
      </section>
    </>
  );
}
