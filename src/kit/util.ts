import type { CSSProperties } from "react";

/** Props every kit component accepts. */
export interface BaseProps {
  className?: string;
  style?: CSSProperties;
  /** Shorthand for `grid-area` – place the component in a named `Grid` area. */
  area?: string;
  /** Grow to fill the remaining space of the parent (flex column / grid cell). */
  fill?: boolean;
}

/** A length: numbers are millimetres, strings are passed through (e.g. "40%", "2em"). */
export type Length = number | string;

export const len = (v: Length | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === "number" ? `${v}mm` : v;

export const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).join(" ");

/** Merge the shared BaseProps into the root element's props. */
export function base(
  props: BaseProps,
  cls: string,
  style?: CSSProperties & Record<`--${string}`, string | number | undefined>,
) {
  return {
    className: cx(cls, props.className),
    style: { gridArea: props.area, ...style, ...props.style } as CSSProperties,
    "data-fill": props.fill || undefined,
  };
}

export const range = (n: number) => Array.from({ length: Math.max(0, n) }, (_, i) => i);
