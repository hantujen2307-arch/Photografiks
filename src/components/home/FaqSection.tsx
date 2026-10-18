"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaqItem } from "@/types";
import { DEFAULT_FAQS } from "@/lib/constants";
import SectionHeading from "@/components/common/SectionHeading";
import { cn } from "@/lib/utils";

export default function FaqSection({
  faqs = DEFAULT_FAQS,
}: {
  faqs?: FaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const activeFaqs = faqs.filter((f) => f.is_active);

  return (
    <section className="py-20 lg:py-28 bg-[#F4EFE6]/40 border-t border-[#E8E1D5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Tanya Jawab"
          title="Pertanyaan yang Sering Diajukan"
          description="Segala hal yang perlu Anda ketahui mengenai reservasi, persiapan konsep, fasilitas studio, dan alur kerja MOMEN.POTRAIT."
        />

        <div className="space-y-4">
          {activeFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id || index}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden",
                  isOpen
                    ? "bg-white border-[#161514]/20 shadow-sm"
                    : "bg-white/60 border-[#E8E1D5] hover:bg-white"
                )}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg sm:text-xl font-normal text-[#161514]">
                    {faq.question}
                  </span>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300",
                      isOpen
                        ? "bg-[#161514] text-[#FCFAF6] rotate-180"
                        : "bg-[#F4EFE6] text-[#6B6862]"
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm font-light text-[#6B6862] leading-relaxed border-t border-[#F4EFE6] animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
