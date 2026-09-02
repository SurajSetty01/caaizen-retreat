"use client";

import { Play, Volume2 } from "lucide-react";
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

    // Runs inside the click handler, so browsers allow unmuted playback.
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => undefined);
    });
    setIsPlaying(true);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-[#0d130c] px-5 py-24 text-white md:px-8 md:py-32">
      {/* Soft brand glows for depth, no photographic clutter. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,93,0.16),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(85,114,71,0.18),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#e0bd76]">
          The Retreat in motion
        </p>
        <h2 className="mt-5 font-display text-4xl font-semibold leading-tight md:text-6xl">
          A short film of the life waiting here
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
          Green all the way to the horizon, wide plotted roads and the calm of
          open land. Press play to experience it with sound.
        </p>

        {/* The video is the hero: a single, self-contained portrait frame. */}
        <div className="group relative mt-12 w-full max-w-[340px]">
          {/* Ambient gold aura behind the frame instead of empty space. */}
          <div
            className="pointer-events-none absolute -inset-4 bg-[#c9a25d]/20 opacity-60 blur-3xl transition duration-500 group-hover:opacity-90"
            aria-hidden="true"
          />

          <div className="relative aspect-[9/16] w-full overflow-hidden border border-[#c9a25d]/45 bg-black shadow-[0_35px_90px_-25px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
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
                aria-label="Play the film with sound"
                className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,rgba(13,19,12,0.15),rgba(13,19,12,0.65))] transition"
              >
                <span className="grid size-[4.5rem] place-items-center bg-[#c9a25d] text-[#0d130c] shadow-2xl shadow-black/50 transition duration-300 group-hover:scale-105 group-hover:bg-[#e0bd76]">
                  <Play className="size-7 translate-x-0.5 fill-current" />
                </span>
                <span className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-[0.22em] text-white/90">
                  <Volume2 className="size-3.5" />
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
