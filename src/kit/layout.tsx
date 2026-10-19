import type { ReactNode } from "react";
import { base, len, type BaseProps, type Length } from "./util";

export type PageSize = "A4" | "A5" | "Letter";

export interface PageProps extends BaseProps {
  size?: PageSize;
  orientation?: "portrait" | "landscape";
  /** Inner margin (padding) of the sheet. Defaults to `--cs-page-margin`. */
  margin?: Length;
  children?: ReactNode;
}

/** One physical sheet of paper. Prints as exactly one page of the given size. */
export function Page({ size = "A4", orientation = "portrait", margin, children, ...rest }: PageProps) {
  return (
    <section
      {...base(rest, "cs-page", { "--cs-page-margin": len(margin) })}
      data-size={size}
      data-orientation={orientation}
    >
      {children}
    </section>
  );
}

export interface GridProps extends BaseProps {
  /** Number of equal columns, or a `grid-template-columns` string. */
  columns?: number | string;
  /** Number of equal rows, or a `grid-template-rows` string. */
  rows?: number | string;
  /** `grid-template-areas`, one string per row, e.g. `["head head", "left main"]`. */
  areas?: string[];
  gap?: Length;
  children?: ReactNode;
}

const template = (v: number | string | undefined) =>
  typeof v === "number" ? `repeat(${v}, minmax(0, 1fr))` : v;

export function Grid({ columns, rows, areas, gap, children, ...rest }: GridProps) {
  return (
    <div
      {...base(rest, "cs-grid", {
        gridTemplateColumns: template(columns),
        gridTemplateRows: template(rows),
        gridTemplateAreas: areas?.map((a) => `"${a}"`).join(" "),
        gap: len(gap),
      })}
    >
      {children}
    </div>
  );
}

export interface StackProps extends BaseProps {
  direction?: "row" | "column";
  gap?: Length;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "space-between" | "space-around";
  wrap?: boolean;
  children?: ReactNode;
}

export function Stack({ direction = "column", gap, align, justify, wrap, children, ...rest }: StackProps) {
  return (
    <div
      {...base(rest, "cs-stack", {
        flexDirection: direction,
        gap: len(gap),
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
      })}
      data-direction={direction}
    >
      {children}
    </div>
  );
}

export interface SectionProps extends BaseProps {
  title?: ReactNode;
  /**
   * - `top`: heading row inside the frame (default)
   * - `banner`: heading sits centred on the top border
   * - `side`: heading runs vertically along the left edge
   */
  titlePlacement?: "top" | "banner" | "side";
  /** Extra content placed next to the title (e.g. a small value box). */
  header?: ReactNode;
  footer?: ReactNode;
  /** Purely decorative layer (corner ornaments, background art). Positioned over the whole frame. */
  decoration?: ReactNode;
  /** Remove the frame border. */
  frameless?: boolean;
  children?: ReactNode;
}

/** A framed panel – the basic building block of most sheets. */
export function Section({
  title, titlePlacement = "top", header, footer, decoration, frameless, children, ...rest
}: SectionProps) {
  return (
    <section {...base(rest, "cs-section")} data-title-placement={titlePlacement} data-frameless={frameless || undefined}>
      {decoration && <div className="cs-section__decoration" aria-hidden>{decoration}</div>}
      {(title || header) && (
        <header className="cs-section__header">
          {title && <h2 className="cs-section__title">{title}</h2>}
          {header}
        </header>
      )}
      <div className="cs-section__body">{children}</div>
      {footer && <footer className="cs-section__footer">{footer}</footer>}
    </section>
  );
}

export interface BannerProps extends BaseProps {
  children?: ReactNode;
  /** Content left/right of the text, e.g. ornaments. */
  before?: ReactNode;
  after?: ReactNode;
}

/** A standalone heading strip, e.g. a sheet title or a section label between panels. */
export function Banner({ children, before, after, ...rest }: BannerProps) {
  return (
    <div {...base(rest, "cs-banner")}>
      {before && <span className="cs-banner__before" aria-hidden>{before}</span>}
      <span className="cs-banner__text">{children}</span>
      {after && <span className="cs-banner__after" aria-hidden>{after}</span>}
    </div>
  );
}

export interface DividerProps extends BaseProps {
  label?: ReactNode;
  direction?: "horizontal" | "vertical";
}

export function Divider({ label, direction = "horizontal", ...rest }: DividerProps) {
  return (
    <div {...base(rest, "cs-divider")} data-direction={direction} role="separator">
      {label && <span className="cs-divider__label">{label}</span>}
    </div>
  );
}
