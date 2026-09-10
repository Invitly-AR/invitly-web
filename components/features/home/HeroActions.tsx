"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/utils/analytics";

interface Props {
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  primaryExternal: boolean;
  ctaMode: string;
  pricingHref: string;
}

/**
 * Acciones del hero.
 *
 * Es un componente cliente sólo para poder trackear los clicks: sin esto no hay
 * forma de saber cuánta gente llega al CTA principal, que es exactamente el dato
 * que faltaba para decidir si la home vende o no.
 */
export default function HeroActions({
  primaryLabel,
  secondaryLabel,
  primaryHref,
  primaryExternal,
  ctaMode,
  pricingHref,
}: Props) {
  return (
    <div
      data-hero="cta"
      className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
    >
      <Button asChild size="lg" className="group w-full sm:w-auto">
        <Link
          href={primaryHref}
          onClick={() => analytics.heroCtaClicked(ctaMode)}
          aria-label={primaryLabel}
          {...(primaryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {primaryLabel}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>

      <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
        <Link
          href={pricingHref}
          onClick={() => analytics.pricingLinkClicked("hero")}
          aria-label={secondaryLabel}
        >
          {secondaryLabel}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
