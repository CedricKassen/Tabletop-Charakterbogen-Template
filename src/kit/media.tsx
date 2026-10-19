import type { ReactNode } from "react";
import { base, len, type BaseProps, type Length } from "./util";

export interface ImageSlotProps extends BaseProps {
  src?: string;
  alt?: string;
  width?: Length;
  height?: Length;
  fit?: "contain" | "cover" | "fill";
  /** Shown on screen when no `src` is set. Hidden in print unless `printPlaceholder`. */
  placeholder?: ReactNode;
  printPlaceholder?: boolean;
  /** Draw a frame around the slot (e.g. a portrait box to draw in). */
  framed?: boolean;
  /** Arbitrary content (inline SVG, icon component) instead of an image. */
  children?: ReactNode;
}

/** A place for a picture: portrait, logo, emblem, icon, ornament. */
export function ImageSlot({
  src, alt = "", width, height, fit = "contain", placeholder, printPlaceholder, framed, children, ...rest
}: ImageSlotProps) {
  const empty = !src && !children;
  return (
    <div
      {...base(rest, "cs-image", { width: len(width), height: len(height) })}
      data-empty={empty || undefined}
      data-framed={framed || undefined}
      data-print-placeholder={printPlaceholder || undefined}
    >
      {src && <img className="cs-image__img" src={src} alt={alt} style={{ objectFit: fit }} />}
      {children}
      {empty && placeholder && <span className="cs-image__placeholder">{placeholder}</span>}
    </div>
  );
}
