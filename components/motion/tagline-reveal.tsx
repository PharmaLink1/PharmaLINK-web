"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

// One word lights up as the section crosses the viewport. Opacity only, driven by
// the section's scroll progress, so the effect stays cheap on low-end phones.
function Word({
  children,
  progress,
  start,
}: {
  children: string;
  progress: MotionValue<number>;
  start: number;
}) {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, [start, start + 0.16], [0.28, 1]);

  if (reduce) return <span className="inline-block">{children}</span>;

  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}

/** Large type moment: the page's promise, revealed word by word on scroll. */
export function TaglineReveal({ lines }: { lines: string[] }) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.6"],
  });

  const { words, starts } = React.useMemo(() => {
    const grouped = lines.map((line) => line.split(" "));
    const total = grouped.flat().length;
    const offsets = grouped.map((line, lineIndex) => {
      const before = grouped
        .slice(0, lineIndex)
        .reduce((count, previous) => count + previous.length, 0);
      return line.map((_, wordIndex) => ((before + wordIndex) / total) * 0.84);
    });
    return { words: grouped, starts: offsets };
  }, [lines]);

  return (
    <h2
      ref={ref}
      className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl"
    >
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden="true">
        {words.map((line, lineIndex) => (
          <span key={lineIndex} className="block">
            {line.map((word, wordIndex) => (
              <React.Fragment key={`${lineIndex}-${wordIndex}`}>
                <Word progress={scrollYProgress} start={starts[lineIndex][wordIndex]}>
                  {word}
                </Word>
                {wordIndex < line.length - 1 && " "}
              </React.Fragment>
            ))}
          </span>
        ))}
      </span>
    </h2>
  );
}
