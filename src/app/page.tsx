import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedPortfolio from "@/components/home/FeaturedPortfolio";
import PackagesSection from "@/components/home/PackagesSection";
import BookingProcess from "@/components/home/BookingProcess";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FaqSection from "@/components/home/FaqSection";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_PACKAGES,
  DEFAULT_PORTFOLIO,
  DEFAULT_TESTIMONIALS,
  DEFAULT_FAQS,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/constants";

export default async function HomePage() {
  let packages = DEFAULT_PACKAGES;
  let portfolio = DEFAULT_PORTFOLIO;
  let testimonials = DEFAULT_TESTIMONIALS;
  let faqs = DEFAULT_FAQS;
  let settings = DEFAULT_SITE_SETTINGS;

  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const [pkgRes, portRes, testRes, faqRes, settingsRes] = await Promise.all([
        supabase
          .from("packages")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("portfolio_items")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("faqs")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("site_settings")
          .select("key, value"),
      ]);

      if (pkgRes.data && pkgRes.data.length > 0) packages = pkgRes.data;
      if (portRes.data && portRes.data.length > 0) portfolio = portRes.data;
      if (testRes.data && testRes.data.length > 0) testimonials = testRes.data;
      if (faqRes.data && faqRes.data.length > 0) faqs = faqRes.data;
      if (settingsRes.data && settingsRes.data.length > 0) {
        const mergedSettings = { ...DEFAULT_SITE_SETTINGS };
        settingsRes.data.forEach((row) => {
          if (row.key in mergedSettings) {
            (mergedSettings as Record<string, unknown>)[row.key] = row.value;
          }
        });
        settings = mergedSettings;
      }
    }
  } catch (error) {
    console.error("Error fetching homepage data from Supabase:", error);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#FCFAF6]">
      <Navbar />
      <HeroSection
        headline={settings.hero_headline}
        subheadline={settings.hero_subheadline}
      />
      <FeaturedPortfolio items={portfolio} />
      <PackagesSection packages={packages} />
      <BookingProcess />
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection faqs={faqs} />
      <Footer settings={settings} />
    </main>
  );
}
