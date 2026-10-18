import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { TestimonialItem } from "@/types";
import { DEFAULT_TESTIMONIALS } from "@/lib/constants";
import SectionHeading from "@/components/common/SectionHeading";

export default function TestimonialsSection({
  testimonials = DEFAULT_TESTIMONIALS,
}: {
  testimonials?: TestimonialItem[];
}) {
  const activeTestimonials = testimonials.filter((t) => t.is_active);

  return (
    <section className="py-20 lg:py-28 bg-[#FCFAF6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Kata Klien Kami"
          title="Kepercayaan &amp; Cerita Bermakna"
          description="Dengarkan pengalaman autentik dari mereka yang telah mempercayakan perayaan momen berharga mereka bersama MOMEN.POTRAIT."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-8 border border-[#E8E1D5] shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                {/* Stars and Quote mark */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#B8976C] text-[#B8976C]"
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#C9BBA7]/60" />
                </div>

                {/* Content */}
                <p className="text-sm font-light text-[#4B4944] leading-relaxed italic mb-8">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="pt-6 border-t border-[#F4EFE6] flex items-center gap-3.5">
                {item.image_url ? (
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#E8E1D5]">
                    <Image
                      src={item.image_url}
                      alt={item.client_name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#161514] text-white flex items-center justify-center font-serif text-sm font-medium shrink-0">
                    {item.client_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-serif text-base font-normal text-[#161514]">
                    {item.client_name}
                  </h4>
                  <p className="text-[11px] text-[#9A8973] uppercase tracking-wider font-sans">
                    {item.client_role || item.session_type || "Client"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
