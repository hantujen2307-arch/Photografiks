import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  isDark?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  isDark = false,
  className,
}: SectionHeadingProps) {
  const alignClass =
    align === "center"
      ? "text-center mx-auto items-center"
      : align === "right"
      ? "text-right ml-auto items-end"
      : "text-left items-start";

  return (
    <div className={cn("flex flex-col max-w-3xl mb-8 sm:mb-12 md:mb-16", alignClass, className)}>
      {eyebrow && (
        <span
          className={cn(
            "text-[10px] sm:text-[11px] font-sans tracking-[0.22em] sm:tracking-[0.25em] uppercase font-semibold mb-2 sm:mb-3 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full inline-block",
            isDark
              ? "bg-white/10 text-[#C9BBA7] border border-white/15"
              : "bg-[#F4EFE6] text-[#846F54] border border-[#E8E1D5]"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-serif text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight leading-[1.2] sm:leading-[1.15]",
          isDark ? "text-[#FCFAF6]" : "text-[#161514]"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-2.5 sm:mt-4 text-xs sm:text-base leading-relaxed font-light",
            isDark ? "text-[#A9A59E]" : "text-[#6B6862]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
