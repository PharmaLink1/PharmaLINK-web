"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PlusIcon } from "@/components/ui/icons";

/** Best guess before the real header is measured on mount — avoids a flash
 * of wrong sizing, but the real value always wins once available. */
const FALLBACK_HEADER_HEIGHT_PX = 69;

/**
 * Desktop-only left brand panel for the registration screens. Page 3 (node
 * 6:121) uses a teal mix-blend overlay + bottom gradient with a logo and
 * tagline; Page 4 (node 6:213) is just the bare photo with no overlay at
 * all. `tagline` being omitted renders the plain-photo variant instead of
 * guessing which treatment to force. Hidden below `lg`, where the form
 * pane takes the full width instead.
 *
 * Full-bleed cover, height-capped to the viewport (not the scrollable
 * content) via `sticky` + `h-[calc(100vh-headerHeight)]`: the source
 * photos are ~560-585px wide, and stretching them to match an arbitrarily
 * tall form's full scroll height upscaled them well past their real
 * resolution (blurry). Capping at viewport height keeps the required
 * upscale small, `sticky` holds the photo in the viewport instead of
 * scrolling away when a long form (e.g. Pharmacy Registration) scrolls
 * past it, and measuring the header's real height (rather than a
 * hardcoded guess) keeps the photo flush against it — no gap, no overlap
 * — even if the header's height ever changes (a longer Amharic label
 * wrapping, a browser zoom level, a future header tweak, etc).
 */
export function AuthBrandPanel({
  imageSrc,
  appName,
  tagline,
}: {
  imageSrc: string;
  appName: string;
  tagline?: string;
}) {
  const [headerHeight, setHeaderHeight] = useState(FALLBACK_HEADER_HEIGHT_PX);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const updateHeight = () => setHeaderHeight(header.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hidden lg:block lg:w-[45%]">
      {/* Sticky wrapper: pins the panel in the viewport as a long form
          scrolls past it. next/image's `fill` needs its own immediate
          `position: relative` ancestor (sticky doesn't count for Next's
          validation), hence the extra nested div below rather than putting
          both roles on one element. */}
      <div className="sticky w-full" style={{ top: headerHeight, height: `calc(100vh - ${headerHeight}px)` }}>
        <div className="relative h-full w-full overflow-hidden">
          <Image src={imageSrc} alt="" fill sizes="45vw" quality={100} className="object-cover" priority />
          {tagline && (
            <>
              <div className="absolute inset-0 bg-[rgba(15,83,71,0.2)] mix-blend-multiply" aria-hidden="true" />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-8">
                <div className="flex max-w-[448px] flex-col gap-4 pb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white/20 backdrop-blur-[2px]">
                      <PlusIcon />
                    </span>
                    <span className="text-2xl font-bold tracking-[-0.6px] text-white">{appName}</span>
                  </div>
                  <p className="text-lg leading-7 text-white/90">{tagline}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
