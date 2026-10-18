import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedPortfolio from "@/components/home/FeaturedPortfolio";
import PackagesSection from "@/components/home/PackagesSection";
import FaqSection from "@/components/home/FaqSection";
import { getPublicSupabase, withTimeout } from "@/lib/supabase/public";
import { getStoredPackages } from "@/lib/data/packages-store";
import { getStoredPortfolio } from "@/lib/data/portfolio-store";
import {
  DEFAULT_FAQS,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/constants";

// Enable Edge CDN caching with Incremental Static Regeneration (ISR)
export const revalidate = 60;

export default async function HomePage() {
  let packages = getStoredPackages();
  let portfolio = getStoredPortfolio();
  let faqs = DEFAULT_FAQS;
  let settings = DEFAULT_SITE_SETTINGS;

  try {
    const supabase = getPublicSupabase();
    if (supabase) {
      const fetchAllData = Promise.all([
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
          .from("faqs")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase.from("site_settings").select("key, value"),
      ]);

      const [pkgRes, portRes, faqRes, settingsRes] = await withTimeout(
        fetchAllData,
        [
          { data: packages },
          { data: portfolio },
          { data: DEFAULT_FAQS },
          { data: [] },
        ] as any,
        1500
      );

      if (pkgRes?.data && pkgRes.data.length > 0) packages = pkgRes.data;
      if (portRes?.data && portRes.data.length > 0) portfolio = portRes.data;
      if (faqRes?.data && faqRes.data.length > 0) faqs = faqRes.data;
      if (settingsRes?.data && settingsRes.data.length > 0) {
        const mergedSettings = { ...DEFAULT_SITE_SETTINGS };
        settingsRes.data.forEach((row: { key: string; value: unknown }) => {
          if (row.key in mergedSettings) {
            let val = row.value;
            if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) {
              try {
                val = JSON.parse(val);
              } catch {
                // keep as string
              }
            }
            (mergedSettings as Record<string, unknown>)[row.key] = val;
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
        imageUrl={settings.hero_image_url}
        secondaryImageUrl={settings.hero_secondary_image_url}
      />
      <FeaturedPortfolio items={portfolio} />
      <PackagesSection packages={packages} />
      <FaqSection faqs={faqs} />
      <Footer settings={settings} />
    </main>
  );
}
