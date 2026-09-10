import { Suspense, lazy } from "react";
import type { Metadata } from "next";
import Hero from "@/components/features/home/Hero";
import ProblemSection from "@/components/features/home/ProblemSection";

const SocialProofBanner = lazy(() => import("@/components/features/home/SocialProofBanner"));
import StructuredData from "@/components/shared/StructuredData";
import { generatePageMetadata } from "@/src/utils/metadata";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getServiceSchema,
  getEventSchema,
} from "@/src/utils/structuredData";

const LiveDemo = lazy(() => import("@/components/features/home/LiveDemo"));
const DashboardShowcase = lazy(() => import("@/components/features/home/DashboardShowcase"));
const TemplatesSection = lazy(() => import("@/components/features/home/TemplatesSection"));
const Pricing = lazy(() => import("@/components/features/home/Pricing"));
const RiskReversal = lazy(() => import("@/components/features/home/RiskReversal"));
const FAQ = lazy(() => import("@/components/features/home/FAQ"));
const FinalCta = lazy(() => import("@/components/features/home/FinalCta"));
const IntentAssistBar = lazy(() => import("@/components/features/home/IntentAssistBar"));

import { FeaturesSkeleton } from "@/components/shared/skeletons/FeaturesSkeleton";
import {
  TemplatesSectionSkeleton,
  BannerSkeleton,
  FAQSkeleton,
} from "@/components/shared/skeletons/HomeSectionSkeletons";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const description =
    locale === "es"
      ? "Invitaciones digitales con panel de control para bodas, XV años, cumpleaños y eventos corporativos. RSVP automático, álbum colaborativo, playlist moderada y gestión completa de invitados. Pagás una vez por evento, desde $60.000. Sin suscripción."
      : "Digital invitations with a control panel for weddings, birthdays and corporate events. Automatic RSVP, collaborative album, moderated playlist and complete guest management. One payment per event. No subscription.";

  const keywords =
    locale === "es"
      ? [
          "invitaciones digitales argentina",
          "crear invitaciones online",
          "invitaciones para bodas",
          "invitaciones para cumpleaños",
          "rsvp automático",
          "plantillas de invitaciones",
          "alternativa a invitaciones impresas",
          "confirmación de asistencia online",
        ]
      : [
          "digital invitations argentina",
          "create online invitations",
          "wedding invitations",
          "birthday invitations",
          "automatic rsvp",
          "invitation templates",
          "alternative to printed invitations",
          "online rsvp",
        ];

  const baseMetadata = generatePageMetadata({
    title: "",
    description,
    path: "",
    locale,
    keywords,
  });

  const absoluteTitle =
    locale === "es"
      ? "Invitaciones Digitales y Gestión de Eventos | Bento"
      : "Digital Invitations & Event Management | Bento";

  return {
    ...baseMetadata,
    title: {
      absolute: absoluteTitle,
    },
  };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HOME — estructura de embudo
 * ─────────────────────────────────────────────────────────────────────────────
 * El orden NO es estético, es un argumento de venta. Cada bloque responde a la
 * objeción que deja abierta el anterior:
 *
 *   1  Hero              → qué es y cuánto sale
 *   2  Templates         → cómo se va a ver el mío
 *   3  Problema          → por qué te importa
 *   4  Demo interactiva  → cómo se siente (única vista del panel pre-compra)
 *   5  Panel real        → qué estás comprando
 *   6  Precio            → cuánto sale exactamente
 *   7  Sin riesgo        → qué pasa si me arrepiento
 *   8  FAQ               → objeciones de compra restantes
 *   9  CTA final         → dónde hago click
 *
 * Antes la home terminaba en el FAQ, sin CTA de cierre, y el precio vivía en
 * otra página. Si movés un bloque, movés el argumento.
 *
 * `HowItWorksSection` quedó DESMONTADA a propósito: la demo interactiva del
 * bloque 3 cumple su función de forma verificable, y su pin costaba ~7
 * viewports de scroll. El componente sigue en el repo por si se quiere volver.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const structuredData = [
    getOrganizationSchema(locale),
    getWebSiteSchema(locale),
    getServiceSchema(locale),
    getEventSchema(locale),
  ];

  return (
    <div className="min-h-screen">
      <StructuredData data={structuredData} />

      <Hero />

      <Suspense fallback={<BannerSkeleton />}>
        <SocialProofBanner />
      </Suspense>

      <Suspense fallback={<TemplatesSectionSkeleton />}>
        <TemplatesSection />
      </Suspense>

      <ProblemSection />

      <Suspense fallback={<FeaturesSkeleton />}>
        <LiveDemo />
      </Suspense>

      <Suspense fallback={<FeaturesSkeleton />}>
        <DashboardShowcase />
      </Suspense>

      <Suspense fallback={<FeaturesSkeleton />}>
        <Pricing />
      </Suspense>

      <Suspense fallback={<FeaturesSkeleton />}>
        <RiskReversal />
      </Suspense>

      <Suspense fallback={<FAQSkeleton />}>
        <FAQ />
      </Suspense>

      <Suspense fallback={<BannerSkeleton />}>
        <FinalCta />
      </Suspense>

      <IntentAssistBar />
    </div>
  );
}
