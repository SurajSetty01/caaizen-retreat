"use client";

import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const MP4_SRC = "/retreat/video/drone-reel.mp4";
const WEBM_SRC = "/retreat/video/drone-reel.webm";
const POSTER_SRC = "/retreat/video/drone-reel-poster.jpg";

export function DroneReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Ambient background loop is opt-in: only enabled on wider screens and when
  // the visitor has not asked for reduced motion. Starts false so SSR and the
  // first client paint agree (avoids hydration mismatch), then upgrades.
  const [ambientEnabled, setAmbientEnabled] = useState(false);

  useEffect(() => {
    const motionOk = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    );
    const wideEnough = window.matchMedia("(min-width: 768px)");

    const sync = () => setAmbientEnabled(motionOk.matches && wideEnough.matches);
    sync();

    motionOk.addEventListener("change", sync);
    wideEnough.addEventListener("change", sync);

    return () => {
      motionOk.removeEventListener("change", sync);
      wideEnough.removeEventListener("change", sync);
    };
  }, []);

  // Keep the ambient loop actually playing once it becomes enabled. autoPlay
  // covers first mount; this handles the case where it gets enabled later
  // (e.g. viewport widened or reduced-motion toggled off).
  useEffect(() => {
    const ambient = ambientRef.current;
    if (!ambient) {
      return;
    }

    if (ambientEnabled) {
      ambient.play().catch(() => {
        // Autoplay can still be refused; the darkened poster remains as a
        // perfectly good static backdrop, so there is nothing to recover.
      });
    } else {
      ambient.pause();
    }
  }, [ambientEnabled]);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    // Play with sound — this runs inside the click handler, so browsers allow
    // unmuted playback.
    video.muted = false;
    video.play().catch(() => {
      // If unmuted play is somehow refused, retry muted so the visitor still
      // sees the footage rather than a dead frame.
      video.muted = true;
      video.play().catch(() => undefined);
    });
    setIsPlaying(true);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-[#10170f] px-5 py-20 text-white md:px-8 md:py-28">
      {/* Ambient, blurred, oversized loop of the same footage — pure atmosphere. */}
      {ambientEnabled ? (
        <video
          ref={ambientRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 scale-110 object-cover opacity-45 blur-2xl"
          autoPlay
          loop
          muted
          playsInline
          poster={POSTER_SRC}
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={WEBM_SRC} type="video/webm" />
          <source src={MP4_SRC} type="video/mp4" />
        </video>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center opacity-35 blur-2xl"
          style={{ backgroundImage: `url(${POSTER_SRC})` }}
          aria-hidden="true"
        />
      )}

      {/* Depth + brand overlays over the ambient layer. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,18,11,0.82),rgba(12,18,11,0.62)_45%,rgba(12,18,11,0.9))]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(201,162,93,0.22),transparent_45%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_minmax(300px,380px)]">
        {/* Editorial column */}
        <div className="animate-rise max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#e0bd76]">
            Aerial film
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
            See the land the way the birds do
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/72">
            A drone pass over The Retreat — the canopy, the plotted layout and
            the quiet that surrounds it. Tap play to watch the reel with sound.
          </p>
          <button
            type="button"
            onClick={handlePlay}
            className="group mt-8 inline-flex h-12 items-center gap-3 bg-[#c9a25d] px-6 text-sm font-bold uppercase tracking-[0.18em] text-[#10170f] transition hover:bg-[#e0bd76] lg:hidden"
          >
            <Play className="size-4 fill-current" />
            Play the reel
          </button>
        </div>

        {/* Portrait video frame */}
        <div className="animate-rise-delayed mx-auto w-full max-w-[380px]">
          <div className="relative aspect-[9/16] w-full overflow-hidden border border-[#c9a25d]/45 bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
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

            {/* Click-to-play overlay — removed once playback starts so native
                controls take over. */}
            {!isPlaying ? (
              <button
                type="button"
                onClick={handlePlay}
                aria-label="Play the drone reel with sound"
                className="group absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,rgba(12,18,11,0.05),rgba(12,18,11,0.5))] transition"
              >
                <span className="grid size-20 place-items-center bg-[#c9a25d]/95 text-[#10170f] shadow-2xl shadow-black/40 backdrop-blur transition-all duration-300 group-hover:scale-105 group-hover:bg-[#e0bd76]">
                  <Play className="size-8 translate-x-0.5 fill-current" />
                </span>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold uppercase tracking-[0.22em] text-white/90">
                  Watch with sound
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
