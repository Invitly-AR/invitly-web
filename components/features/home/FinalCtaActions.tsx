"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/utils/analytics";
import { openWhatsApp } from "@/utils/openWhatsapp";

interface Props {
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  primaryExternal: boolean;
  ctaMode: string;
  whatsappMessage: string;
}

export default function FinalCtaActions({
  primaryLabel,
  secondaryLabel,
  primaryHref,
  primaryExternal,
  ctaMode,
  whatsappMessage,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link
          href={primaryHref}
          onClick={() => analytics.finalCtaClicked(ctaMode)}
          aria-label={primaryLabel}
          {...(primaryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {primaryLabel}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        aria-label={secondaryLabel}
        onClick={() => {
          analytics.whatsappClicked('final_cta');
          openWhatsApp(whatsappMessage);
        }}
      >
        <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
        {secondaryLabel}
      </Button>
    </div>
  );
}
