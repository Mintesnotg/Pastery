import Link from "next/link";
import Image from "next/image";

// Intrinsic size of public/logo.svg and public/logo-dark.svg (kept for aspect ratio; CSS sets the rendered height).
const LOCKUP_WIDTH = 310;
const LOCKUP_HEIGHT = 64;

type LogoProps = {
  dark?: boolean;
  /** Set for above-the-fold placements (site header) so the lockup isn't lazy-loaded. */
  priority?: boolean;
};

export default function Logo({ dark = false, priority = false }: LogoProps) {
  return (
    <Link href="/" className="group inline-flex items-center" aria-label="House of Bread London – home">
      <Image
        src={dark ? "/logo-dark.svg" : "/logo.svg"}
        alt="House of Bread London"
        width={LOCKUP_WIDTH}
        height={LOCKUP_HEIGHT}
        priority={priority}
        unoptimized
        className="h-11 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </Link>
  );
}
