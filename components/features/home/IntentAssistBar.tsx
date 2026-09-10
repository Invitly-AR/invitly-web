"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ANALYTICS_SIGNAL_EVENT, analytics } from "@/utils/analytics";
import { openWhatsApp } from "@/utils/openWhatsapp";

type AssistTrigger = "multiple_demos" | "pricing_idle";

const DEMO_COUNT_KEY = "bento_demo_views";
const DISMISSED_KEY = "bento_intent_assist_dismissed";
const CONVERTED_KEY = "bento_intent_assist_converted";

export default function IntentAssistBar() {
  const t = useTranslations("IntentAssist");
  const [trigger, setTrigger] = useState<AssistTrigger | null>(null);

  useEffect(() => {
    let pricingTimer: ReturnType<typeof setTimeout> | undefined;

    const reveal = (nextTrigger: AssistTrigger) => {
      if (sessionStorage.getItem(DISMISSED_KEY) || sessionStorage.getItem(CONVERTED_KEY)) return;
      setTrigger((current) => {
        if (current) return current;
        analytics.intentAssistShown(nextTrigger);
        return nextTrigger;
      });
    };

    const handleSignal = (event: Event) => {
      const detail = (event as CustomEvent<{ event?: string }>).detail;
      if (!detail?.event) return;

      if (detail.event === "Template Demo Clicked") {
        const nextCount = Number(sessionStorage.getItem(DEMO_COUNT_KEY) ?? 0) + 1;
        sessionStorage.setItem(DEMO_COUNT_KEY, String(nextCount));
        if (nextCount >= 2) reveal("multiple_demos");
        return;
      }

      if (detail.event === "Pricing Section Viewed") {
        pricingTimer = setTimeout(() => reveal("pricing_idle"), 7_000);
        return;
      }

      if (detail.event === "Plan Selected" || detail.event === "Personalization Started") {
        sessionStorage.setItem(CONVERTED_KEY, "true");
        setTrigger(null);
      }
    };

    window.addEventListener(ANALYTICS_SIGNAL_EVENT, handleSignal);
    return () => {
      window.removeEventListener(ANALYTICS_SIGNAL_EVENT, handleSignal);
      if (pricingTimer) clearTimeout(pricingTimer);
    };
  }, []);

  const dismiss = () => {
    if (!trigger) return;
    sessionStorage.setItem(DISMISSED_KEY, "true");
    analytics.intentAssistDismissed(trigger);
    setTrigger(null);
  };

  const contact = () => {
    if (!trigger) return;
    analytics.intentAssistClicked(trigger);
    sessionStorage.setItem(CONVERTED_KEY, "true");
    openWhatsApp(t("message"));
    setTrigger(null);
  };

  return (
    <AnimatePresence>
      {trigger ? (
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          aria-label={t("title")}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[80] mx-auto max-w-2xl rounded-2xl border border-[#200041]/10 bg-[#FFF9F4] p-3 sm:inset-x-6 sm:flex sm:items-center sm:gap-4 sm:p-4"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3 pr-9 sm:items-center sm:pr-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFA459]/15 text-[#B65312]">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-tight text-[#200041]">{t("title")}</p>
              <p className="mt-1 text-sm leading-snug text-[#200041]/65">{t("description")}</p>
            </div>
          </div>

          <Button
            type="button"
            className="mt-3 w-full shrink-0 rounded-xl sm:mt-0 sm:w-auto"
            onClick={contact}
          >
            {t("cta")}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-9 w-9 rounded-xl text-[#200041]/55 hover:bg-[#200041]/5 hover:text-[#200041] sm:static"
            onClick={dismiss}
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
