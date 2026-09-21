"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Star,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export type BannerImage = {
  id: string;
  title: string;
  alt_text: string;
  image_url: string;
  cta: { label: string; link: string };
  overlay_text: { heading: string; subheading: string };
};

const AUTO_MS = 6000;
const TRANSITION_MS = 700;
const KEN_BURNS_MS = 6000;
const SWIPE_THRESHOLD = 40;
const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#2B1B14"/></svg>`,
  );

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

type HomepageBannerProps = {
  images: BannerImage[];
};

export function HomepageBanner({ images }: HomepageBannerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [copyReady, setCopyReady] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = images[activeIndex] ?? images[0];
  const canAutoplay =
    images.length > 1 &&
    !reducedMotion &&
    !isPaused &&
    !isHoverPaused &&
    isTabVisible;

  const goToSlide = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      const next = ((index % images.length) + images.length) % images.length;
      setActiveIndex(next);
    },
    [images.length],
  );

  const goNext = useCallback(() => goToSlide(activeIndex + 1), [activeIndex, goToSlide]);
  const goPrev = useCallback(() => goToSlide(activeIndex - 1), [activeIndex, goToSlide]);

  const onAutoplayTick = useEffectEvent(() => {
    goToSlide(activeIndex + 1);
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setCopyReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onVisibility = () => setIsTabVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!canAutoplay) return;
    const id = window.setInterval(() => onAutoplayTick(), AUTO_MS);
    return () => window.clearInterval(id);
  }, [canAutoplay, activeIndex]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;

    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (activeIndex + 1) % images.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (activeIndex - 1 + images.length) % images.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = images.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    goToSlide(nextIndex);
    requestAnimationFrame(() => tabRefs.current[nextIndex!]?.focus());
  };

  const onTouchStart = (event: ReactTouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: ReactTouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  if (!active) return null;

  return (
    <section
      aria-label={`${siteConfig.shortName} featured`}
      className="group/banner relative min-h-[70svh] max-h-[90svh] h-[90svh] w-full overflow-hidden bg-[#2B1B14]"
      onMouseEnter={() => setIsHoverPaused(true)}
      onMouseLeave={() => setIsHoverPaused(false)}
      onFocusCapture={() => setIsHoverPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsHoverPaused(false);
        }
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {images.map((img, index) => {

        const isActive = index === activeIndex;
        return (
          <div
            key={img.id}
            className="absolute inset-0 overflow-hidden"
            style={{
              opacity: isActive ? 1 : 0,
              transition: reducedMotion ? "none" : `opacity ${TRANSITION_MS}ms ease-in-out`,
              zIndex: isActive ? 1 : 0,
            }}
            aria-hidden={!isActive}
          >
            <div
              key={isActive ? `zoom-${img.id}-${activeIndex}` : `idle-${img.id}`}
              className="absolute inset-0"
              style={{
                transform: isActive && !reducedMotion ? "scale(1.04)" : "scale(1)",
                transition:
                  isActive && !reducedMotion
                    ? `transform ${KEN_BURNS_MS}ms linear`
                    : "none",
              }}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text}
                fill
                priority={index === 0}
                loading="eager"
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                // Bypass /_next/image — Node TLS fails on this network (SELF_SIGNED_CERT_IN_CHAIN)
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        );
      })}

      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#2B1B14]/85 via-[#2B1B14]/35 to-[#2B1B14]/15"
        aria-hidden
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-[4] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#2B1B14]/55 text-[#FAF6F0] opacity-0 transition hover:bg-[#2B1B14]/75 group-hover/banner:opacity-100 focus-visible:opacity-100 md:flex"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-[4] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#2B1B14]/55 text-[#FAF6F0] opacity-0 transition hover:bg-[#2B1B14]/75 group-hover/banner:opacity-100 focus-visible:opacity-100 md:flex"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <div
        className="absolute inset-0 z-[3] flex flex-col justify-end px-6 pb-28 pt-24 md:px-12 md:pb-32 lg:px-20"
        style={{
          opacity: copyReady ? 1 : 0,
          transform: copyReady ? "translateY(0)" : "translateY(1rem)",
          transition: reducedMotion
            ? "none"
            : "opacity 800ms ease-out, transform 800ms ease-out",
        }}
      >
        <p className="text-sm font-semibold tracking-[0.2em] text-[#C98A3B] uppercase md:text-base">
          {siteConfig.shortName}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.1] font-semibold text-[#FAF6F0] md:text-6xl lg:text-7xl">
          {siteConfig.tagline}
        </h1>

        <div
          key={active.id}
          aria-live="polite"
          style={{
            transition: reducedMotion ? "none" : "opacity 400ms ease-out",
          }}
        >
          <h2 className="mt-4 max-w-3xl font-display text-2xl leading-snug font-semibold text-[#FAF6F0]/95 md:text-3xl lg:text-4xl">
            {active.overlay_text.heading}
          </h2>
          <p className="mt-3 max-w-xl text-base text-[#FAF6F0]/85 md:text-lg">
            {active.overlay_text.subheading}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={active.cta.link}
            className="inline-flex w-fit items-center rounded-md bg-[#C98A3B] px-6 py-3 text-sm font-semibold tracking-wide text-[#2B1B14] transition-colors hover:bg-[#b57a32] md:text-base"
          >
            {active.cta.label}
          </Link>
          <Link
            href="/bread-pastries"
            className="inline-flex w-fit items-center rounded-md border border-[#FAF6F0]/55 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-[#FAF6F0] transition-colors hover:bg-[#FAF6F0]/10 md:text-base"
          >
            Explore the Bakes
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#FAF6F0]/80">
          <span className="flex gap-0.5 text-[#C98A3B]" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className="fill-[#C98A3B]" />
            ))}
          </span>
          <span>4.9 · Family bakery · London · Est. 2010</span>
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-10 z-[4] flex items-center justify-center gap-3 md:bottom-12">
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Banner slides"
            onKeyDown={onTabKeyDown}
          >
            {images.map((img, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={img.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-label={`Show slide ${index + 1}: ${img.title}`}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 bg-[#FAF6F0]"
                      : "w-2.5 bg-[#FAF6F0]/40 hover:bg-[#FAF6F0]/70"
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B1B14]/55 text-[#FAF6F0] transition hover:bg-[#2B1B14]/75"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-[4] flex justify-center text-[#FAF6F0]/70"
        aria-hidden
      >
        <ChevronDown
          size={22}
          className={reducedMotion ? "" : "animate-bounce"}
        />
      </div>
    </section>
  );
}
