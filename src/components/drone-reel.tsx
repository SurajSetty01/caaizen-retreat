"use client";

import { ArrowRight, Play } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const MP4_SRC = "/retreat/video/drone-reel.mp4";
const WEBM_SRC = "/retreat/video/drone-reel.webm";
const POSTER_SRC = "/retreat/video/drone-reel-poster.jpg";

export function DroneReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    // Inside the click handler, so browsers permit unmuted playback.
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => undefined);
    });
    setIsPlaying(true);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-[#0d130c] text-white">
      {/* Brand glows for depth. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(85,114,71,0.28),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(201,162,93,0.22),transparent_45%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-y-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-16">
        {/* Copy column */}
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#e0bd76]">
            Watch before you visit
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
            See why buyers are choosing The&nbsp;Retreat
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/72">
            Acres of green, wide open roads and gated calm just off Mysore Road
            in Bidadi. Take a look at the land, then book your site visit before
            the best plots are gone.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#lead"
              className="group inline-flex h-12 items-center justify-center gap-2 bg-[#c9a25d] px-6 text-sm font-bold uppercase tracking-[0.18em] text-[#0d130c] transition hover:bg-[#e0bd76]"
            >
              Book a site visit
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </a>
            <p className="text-sm font-semibold text-white/60">
              Plots from{" "}
              <span className="font-display text-xl font-semibold text-[#e0bd76]">
                &#8377;1.5 Cr
              </span>
            </p>
          </div>
        </div>

        {/* Video column: the portrait frame is the focal point. */}
        <div className="group relative mx-auto w-full max-w-[360px]">
          <div
            className="pointer-events-none absolute -inset-5 bg-[#c9a25d]/25 opacity-70 blur-3xl transition duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />

          <div className="relative aspect-[9/16] w-full overflow-hidden border border-[#c9a25d]/50 bg-black shadow-[0_45px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              controls={isPlaying}
              preload="none"
              playsInline
              poster={POSTER_SRC}
            >
              <source src={WEBM_SRC} type="video/webm" />
              <source src={MP4_SRC} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {!isPlaying ? (
              <button
                type="button"
                onClick={handlePlay}
                aria-label="Play the video with sound"
                className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,rgba(13,19,12,0.1),rgba(13,19,12,0.7))] transition"
              >
                {/* Pulsing ring + solid gold disc: a proper play affordance. */}
                <span className="relative grid size-20 place-items-center">
                  <span
                    className="absolute inset-0 animate-ping rounded-full bg-[#c9a25d]/40"
                    aria-hidden="true"
                  />
                  <span className="relative grid size-16 place-items-center rounded-full bg-[#c9a25d] text-[#0d130c] shadow-2xl shadow-black/50 transition duration-300 group-hover:scale-105 group-hover:bg-[#e0bd76]">
                    <Play className="size-7 translate-x-0.5 fill-current" />
                  </span>
                </span>
                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold uppercase tracking-[0.24em] text-white/90">
                  Play with sound
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
