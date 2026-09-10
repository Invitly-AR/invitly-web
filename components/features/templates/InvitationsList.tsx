"use client";

import { Template } from "@/utils/types";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Play } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import { InvitationsListSkeleton } from "@/components/shared/skeletons/InvitationsListSkeleton";
import { Button } from "@/components/ui/button";
import { useTemplates } from "@/hooks/useTemplates";
import { analytics } from "@/utils/analytics";
import { getPersonalizationHref } from "@/src/config/personalization";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PREVIEWS DE PLANTILLAS EN LA HOME
 * ─────────────────────────────────────────────────────────────────────────────
 * Historia de este componente, para que no se vuelva atrás por accidente:
 *
 * 1. Carrusel horizontal con pin de ScrollTrigger + `containerAnimation`.
 *    Obligaba a `height: 100vh`, que obligaba al `md:-mt-[100vh]` de la sección
 *    contenedora — ese margen negativo es el que tapaba el resto de la home.
 *
 * 2. Bento grid asimétrico. Resolvió el solapamiento pero no se apreciaba
 *    ningún diseño: las `preview_url` son capturas de celular de ~1358×2150
 *    (relación 0.63). En un tile chico y encima con degradado oscuro, una
 *    invitación se ve como un rectángulo de color.
 *
 * 3. Esta versión. Tres decisiones, todas al servicio de que el diseño SE VEA:
 *      · Una selección acotada de previews. La home no es el catálogo; su
 *        trabajo es que alguien diga "ah, así se va a ver la mía".
 *      · Relación de aspecto NATURAL de la imagen. Sin recorte: se ve la
 *        portada completa, que es lo que hace elegir un diseño.
 *      · Nombre, categoría y acciones DEBAJO de la imagen. El degradado negro
 *        encima tapaba justo el tercio inferior del diseño.
 *      · Composición editorial: el diseño central lidera y los laterales lo
 *        acompañan. En mobile se exploran con scroll horizontal nativo.
 *
 * Cero JavaScript de animación.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DEMO_BASE_URL = "https://inv.bento.com.ar/demo";
const TEMPLATE_PREVIEW_BASE =
  "https://invitation-bucket-aws.s3.us-east-2.amazonaws.com/templates-preview";

/** Relación real de las capturas que sirve la API. Evita cualquier recorte. */
const PREVIEW_ASPECT = "1358 / 2150";

const HOME_PREVIEW_COUNT = 5;

const FALLBACK_TEMPLATE_DATA = [
  {
    id: "home-confetti",
    name: "confetti-pop",
    display_name: "Confetti",
    categoryKey: "birthday",
    preview_url: `${TEMPLATE_PREVIEW_BASE}/Confetti.webp`,
  },
  {
    id: "home-phantom",
    name: "phantom",
    display_name: "Phantom",
    categoryKey: "quinces",
    preview_url: `${TEMPLATE_PREVIEW_BASE}/Phantom.webp`,
  },
  {
    id: "home-autumn",
    name: "autumn",
    display_name: "Otoño",
    categoryKey: "wedding",
    preview_url: `${TEMPLATE_PREVIEW_BASE}/Autumn.webp`,
  },
  {
    id: "home-blush",
    name: "blush",
    display_name: "Blush",
    categoryKey: "quinces",
    preview_url: `${TEMPLATE_PREVIEW_BASE}/Blush.webp`,
  },
  {
    id: "home-noir",
    name: "corporate-noir",
    display_name: "Noir",
    categoryKey: "corporate",
    preview_url: `${TEMPLATE_PREVIEW_BASE}/Noir.webp`,
  },
] as const;

const FALLBACK_CATEGORY_NAMES = {
  es: {
    birthday: "Cumpleaños",
    quinces: "15 años",
    wedding: "Boda",
    corporate: "Corporativos",
  },
  en: {
    birthday: "Birthday",
    quinces: "Quinceañera",
    wedding: "Wedding",
    corporate: "Corporate",
  },
} as const;

function getFallbackTemplates(locale: string): Template[] {
  const labels = locale === "es" ? FALLBACK_CATEGORY_NAMES.es : FALLBACK_CATEGORY_NAMES.en;

  return FALLBACK_TEMPLATE_DATA.map((template) => ({
    id: template.id,
    name: template.name,
    display_name: template.display_name,
    preview_url: template.preview_url,
    category: {
      id: `home-${template.categoryKey}`,
      key: template.categoryKey,
      display_name: labels[template.categoryKey],
    },
  }));
}

/**
 * Orden editorial de la home: cumpleanos, XV, boda, XV y corporativo.
 * Los nombres preferidos mantienen el resultado estable aunque cambie el orden
 * de respuesta de la API. La categoria funciona como fallback mientras un
 * template preferido (por ejemplo Meadow en QA) todavia no este publicado.
 */
const CURATED_TEMPLATE_SLOTS = [
  { names: ["confetti-pop", "flowers", "carousel"], categoryKey: "birthday" },
  { names: ["meadow", "phantom", "disco", "blush"], categoryKey: "quinces" },
  { names: ["autumn"], categoryKey: "wedding" },
  { names: ["shimmer", "disco", "blush", "phantom"], categoryKey: "quinces" },
  { names: ["corporate-noir", "corporate-summit"], categoryKey: "corporate" },
] as const;

const DESKTOP_STEP_CLASSES = [
  "lg:mt-16",
  "lg:mt-8",
  "lg:mt-0",
  "lg:mt-8",
  "lg:mt-16",
] as const;

function curateHomeTemplates(invitations: Template[]): Template[] {
  const usedIds = new Set<Template["id"]>();

  return CURATED_TEMPLATE_SLOTS.flatMap(({ names, categoryKey }) => {
    const preferredTemplate = names.reduce<Template | undefined>(
      (match, name) =>
        match ??
        invitations.find(
          (invitation) => invitation.name === name && !usedIds.has(invitation.id)
        ),
      undefined
    );
    const categoryFallback = invitations.find(
      (invitation) =>
        invitation.category?.key === categoryKey && !usedIds.has(invitation.id)
    );
    const anyFallback = invitations.find((invitation) => !usedIds.has(invitation.id));
    const selectedTemplate = preferredTemplate ?? categoryFallback ?? anyFallback;

    if (!selectedTemplate) return [];

    usedIds.add(selectedTemplate.id);
    return [selectedTemplate];
  });
}

interface TemplatePreviewCardProps {
  invitation: Template;
  index: number;
  isMobile?: boolean;
  viewDemo: string;
  get: string;
}

function TemplatePreviewCard({
  invitation,
  index,
  isMobile = false,
  viewDemo,
  get,
}: TemplatePreviewCardProps) {
  const isFeatured = index === 2;
  const stepClass = DESKTOP_STEP_CLASSES[index] ?? "lg:mt-16";

  return (
    <article
      className={`group flex h-full flex-col ${isMobile ? "" : stepClass}`}
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:-translate-y-1"
        style={{
          boxShadow: isFeatured
            ? "0 24px 56px rgba(32, 0, 65, 0.15)"
            : "0 14px 38px rgba(32, 0, 65, 0.1)",
        }}
      >
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: PREVIEW_ASPECT, backgroundColor: "#F5F1E8" }}
        >
          {invitation.preview_url && (
            <Image
              src={invitation.preview_url}
              alt={`Invitación digital ${invitation.display_name} — ${
                invitation.category?.display_name ?? ""
              }`}
              fill
              className="object-contain transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.015]"
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 30vw, 20vw"
              unoptimized
            />
          )}
        </div>
      </div>

      <div className="mt-5 px-1">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p
              className="font-mono uppercase mb-1.5"
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.26em",
                color: "rgba(32, 0, 65, 0.48)",
              }}
            >
              {invitation.category?.display_name}
            </p>
            <h3
              className="font-display font-normal leading-tight"
              style={{
                fontSize: isFeatured ? "1.55rem" : "1.35rem",
                color: "#200041",
                letterSpacing: "-0.015em",
              }}
            >
              {invitation.display_name}
            </h3>
          </div>
          <span
            className="hidden shrink-0 font-mono tabular-nums lg:block"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              color: "rgba(32, 0, 65, 0.28)",
            }}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            asChild
            variant="outline"
            className="min-h-11 min-w-0 flex-1 rounded-full px-3 text-[0.8rem]"
          >
            <a
              href={`${DEMO_BASE_URL}/${invitation.name}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.templateDemoClicked(invitation.name, invitation.category?.display_name)}
            >
              <Play size={11} fill="currentColor" aria-hidden="true" />
              {viewDemo}
            </a>
          </Button>
          <Button
            asChild
            className="group/action min-h-11 min-w-0 flex-1 rounded-full px-3 text-[0.8rem]"
          >
            <a
              href={getPersonalizationHref(invitation.name, "home_templates")}
              onClick={() => {
                analytics.templateSelected(invitation.name, invitation.category?.display_name);
                analytics.personalizationStarted(invitation.name, invitation.category?.display_name, "home_templates");
              }}
            >
              {get}
              <ArrowRight className="transition-transform group-hover/action:translate-x-0.5" size={13} strokeWidth={2.5} aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function InvitationsList() {
  const t = useTranslations("Templates");
  const locale = useLocale();
  const { data: invitations = [], isLoading } = useTemplates([]);
  const source = invitations.length > 0 ? invitations : getFallbackTemplates(locale);

  const list = curateHomeTemplates(source).slice(0, HOME_PREVIEW_COUNT);

  if (isLoading) return <InvitationsListSkeleton />;

  return (
    <div>
      <div className="-mx-4 sm:hidden">
        <Swiper slidesPerView={1.16} spaceBetween={20} grabCursor className="px-4 pb-6" aria-label={t("featuredInvitations")}>
          {list.map((invitation: Template, index: number) => (
            <SwiperSlide key={invitation.id} className="!h-auto">
              <TemplatePreviewCard
                invitation={invitation}
                index={index}
                isMobile
                viewDemo={t("viewDemo")}
                get={t("get")}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hidden sm:mx-auto sm:grid sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:max-w-7xl lg:grid-cols-5 lg:items-start lg:gap-5 lg:pt-0">
        {list.map((invitation: Template, index: number) => {
          return (
            <TemplatePreviewCard
              key={invitation.id}
              invitation={invitation}
              index={index}
              viewDemo={t("viewDemo")}
              get={t("get")}
            />
          );
        })}
      </div>

      <div
        className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-6 border-t px-2 py-8 text-center sm:flex-row sm:text-left md:mt-14"
        style={{ borderColor: "rgba(32, 0, 65, 0.12)" }}
      >
        <h3
          className="font-display font-normal leading-tight"
          style={{
            fontSize: "clamp(1.25rem, 2vw, 1.7rem)",
            color: "#200041",
            letterSpacing: "-0.02em",
          }}
        >
          {t("seeAllTitle")}
        </h3>
        <Button asChild className="group/action min-h-12 shrink-0 rounded-full px-6">
          <Link href={`/${locale}/templates`}>
            {t("seeAllCta")}
            <ArrowRight
              className="transition-transform group-hover/action:translate-x-0.5"
              size={15}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </Link>
        </Button>
      </div>
    </div>
  );
}
