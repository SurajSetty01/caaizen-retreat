"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type VillaImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
};

export function VillaCarousel({ images }: { images: VillaImage[] }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [frameHeight, setFrameHeight] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const activeImage = images[activeIndex];

  const updateFrameHeight = useCallback(() => {
    const frame = frameRef.current;
    if (!frame || !activeImage) {
      return;
    }

    const nextHeight = Math.round(
      frame.clientWidth * (activeImage.height / activeImage.width),
    );

    setFrameHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  }, [activeImage]);

  const goToIndex = useCallback(
    (index: number, nextDirection = index >= activeIndex ? 1 : -1) => {
      if (images.length === 0) {
        return;
      }

      setDirection(nextDirection);
      setActiveIndex((index + images.length) % images.length);
    },
    [activeIndex, images.length],
  );

  useEffect(() => {
    updateFrameHeight();

    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const observer = new ResizeObserver(updateFrameHeight);
    observer.observe(frame);

    return () => observer.disconnect();
  }, [updateFrameHeight]);

  useEffect(() => {
    if (
      isPaused ||
      images.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      goToIndex(activeIndex + 1, 1);
    }, 4300);

    return () => window.clearInterval(timer);
  }, [activeIndex, goToIndex, images.length, isPaused]);

  if (!activeImage) {
    return null;
  }

  return (
    <div
      className="group relative w-full overflow-hidden bg-[#10170f] shadow-2xl shadow-black/10"
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={
          frameHeight
            ? { height: `${frameHeight}px` }
            : { aspectRatio: `${activeImage.width} / ${activeImage.height}` }
        }
      >
        {images.map((image, index) => {
          const isActive = index === activeIndex;

          return (
            <Image
            key={image.src}
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              draggable={false}
              className={[
                "absolute inset-0 object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isActive
                  ? "z-10 translate-x-0 scale-100 opacity-100"
                  : direction > 0
                    ? "z-0 translate-x-5 scale-[1.015] opacity-0"
                    : "z-0 -translate-x-5 scale-[1.015] opacity-0",
              ].join(" ")}
            />
          );
        })}

        <button
          type="button"
          aria-label="Show next villa image"
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={() => goToIndex(activeIndex + 1, 1)}
        />
      </div>

      <div className="pointer-events-none absolute left-3 top-3 z-30 bg-[#10170f]/58 px-2.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
        {String(activeIndex + 1).padStart(2, "0")} /{" "}
        {String(images.length).padStart(2, "0")}
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex items-center justify-center">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#10170f]/42 px-2 py-1.5 backdrop-blur">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Show ${image.label}`}
              aria-current={activeIndex === index}
              onClick={() => goToIndex(index)}
              className={[
                "h-1.5 transition-all duration-300",
                activeIndex === index
                  ? "w-7 bg-[#e0bd76]"
                  : "w-3 bg-white/55 hover:bg-white",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous villa image"
        onClick={() => goToIndex(activeIndex - 1, -1)}
        className="absolute left-3 top-1/2 z-30 grid size-9 -translate-y-1/2 place-items-center bg-[#10170f]/45 text-white opacity-80 backdrop-blur transition hover:bg-[#10170f]/70 hover:text-[#e0bd76] md:opacity-0 md:group-hover:opacity-90"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Next villa image"
        onClick={() => goToIndex(activeIndex + 1, 1)}
        className="absolute right-3 top-1/2 z-30 grid size-9 -translate-y-1/2 place-items-center bg-[#10170f]/45 text-white opacity-80 backdrop-blur transition hover:bg-[#10170f]/70 hover:text-[#e0bd76] md:opacity-0 md:group-hover:opacity-90"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
