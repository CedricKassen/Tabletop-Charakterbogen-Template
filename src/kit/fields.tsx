import type { ReactNode } from "react";
import { base, len, range, type BaseProps, type Length } from "./util";

type LabelPosition = "left" | "above" | "below";

export interface FieldProps extends BaseProps {
  label?: ReactNode;
  /** Pre-filled value. Leave empty for a blank writing line. */
  value?: ReactNode;
  labelPosition?: LabelPosition;
  /** Fixed width of the whole field. Without it, the field grows to fill its row. */
  width?: Length;
  /** Fixed width of the label column – useful to align a stack of fields. */
  labelWidth?: Length;
  align?: "left" | "center" | "right";
}

/** A label followed by a line to write on. */
export function Field({ label, value, labelPosition = "left", width, labelWidth, align, ...rest }: FieldProps) {
  return (
    <div
      {...base(rest, "cs-field", { width: len(width), "--cs-label-width": len(labelWidth) })}
      data-label-position={labelPosition}
    >
      {label && <span className="cs-field__label">{label}</span>}
      <span className="cs-field__line" style={{ textAlign: align }}>{value}</span>
    </div>
  );
}

export interface FieldRowProps extends BaseProps {
  gap?: Length;
  children?: ReactNode;
}

/** Several fields side by side on one line. */
export function FieldRow({ gap, children, ...rest }: FieldRowProps) {
  return <div {...base(rest, "cs-field-row", { gap: len(gap) })}>{children}</div>;
}

export interface LinesProps extends BaseProps {
  label?: ReactNode;
  /** Number of ruled lines. */
  count?: number;
  values?: ReactNode[];
  /** Height of each line; defaults to `--cs-row-height`. */
  lineHeight?: Length;
}

/** A block of ruled lines for free text (background, notes, ...). */
export function Lines({ label, count = 4, values = [], lineHeight, ...rest }: LinesProps) {
  return (
    <div {...base(rest, "cs-lines", { "--cs-row-height": len(lineHeight) })}>
      {label && <div className="cs-lines__label">{label}</div>}
      {range(Math.max(count, values.length)).map((i) => (
        <div key={i} className="cs-lines__line">{values[i]}</div>
      ))}
    </div>
  );
}

export interface BulletListProps extends BaseProps {
  label?: ReactNode;
  count?: number;
  values?: ReactNode[];
  /** Marker in front of every line. */
  marker?: ReactNode;
  lineHeight?: Length;
}

/** Ruled lines with a bullet marker in front of each. */
export function BulletList({ label, count = 5, values = [], marker = "•", lineHeight, ...rest }: BulletListProps) {
  return (
    <div {...base(rest, "cs-bullets", { "--cs-row-height": len(lineHeight) })}>
      {label && <div className="cs-bullets__label">{label}</div>}
      {range(Math.max(count, values.length)).map((i) => (
        <div key={i} className="cs-bullets__item">
          <span className="cs-bullets__marker" aria-hidden>{marker}</span>
          <span className="cs-bullets__line">{values[i]}</span>
        </div>
      ))}
    </div>
  );
}

export interface FractionFieldProps extends BaseProps {
  label?: ReactNode;
  current?: ReactNode;
  max?: ReactNode;
  separator?: ReactNode;
  labelPosition?: LabelPosition;
  labelWidth?: Length;
  /** Optional captions under the two lines, e.g. "current" / "max". */
  captions?: [ReactNode, ReactNode];
}

/** "LP: ____ / ____" – current and maximum of a value. */
export function FractionField({
  label, current, max, separator = "/", labelPosition = "left", labelWidth, captions, ...rest
}: FractionFieldProps) {
  return (
    <div
      {...base(rest, "cs-fraction", { "--cs-label-width": len(labelWidth) })}
      data-label-position={labelPosition}
    >
      {label && <span className="cs-fraction__label">{label}</span>}
      <span className="cs-fraction__values">
        <span className="cs-fraction__part" data-part="current">
          <span className="cs-fraction__line">{current}</span>
          {captions && <span className="cs-fraction__caption">{captions[0]}</span>}
        </span>
        <span className="cs-fraction__separator">{separator}</span>
        <span className="cs-fraction__part" data-part="max">
          <span className="cs-fraction__line">{max}</span>
          {captions && <span className="cs-fraction__caption">{captions[1]}</span>}
        </span>
      </span>
    </div>
  );
}

export type BoxShape = "square" | "rounded" | "circle" | "shield" | "hexagon" | "diamond" | "heart";

/** SVG outlines for the non-rectangular shapes, drawn in a 100×100 viewBox. */
const SHAPE_PATHS: Partial<Record<BoxShape, string>> = {
  shield: "M50 2 L96 14 V46 C96 74 76 90 50 98 C24 90 4 74 4 46 V14 Z",
  hexagon: "M50 2 L94 26 V74 L50 98 L6 74 V26 Z",
  diamond: "M50 2 L98 50 L50 98 L2 50 Z",
  heart: "M50 94 C20 72 3 54 3 32 C3 15 16 4 30 4 C40 4 47 10 50 18 C53 10 60 4 70 4 C84 4 97 15 97 32 C97 54 80 72 50 94 Z",
};

export interface ValueBoxProps extends BaseProps {
  label?: ReactNode;
  value?: ReactNode;
  shape?: BoxShape;
  /** Width of the box; height follows the shape's aspect ratio. Defaults to `--cs-box-size`. */
  size?: Length;
  labelPosition?: "above" | "below" | "inside";
  /** A secondary small box (e.g. temporary HP, modifier). */
  sub?: ReactNode;
}

/** A single prominent value: armour, initiative, level, ... */
export function ValueBox({ label, value, shape = "square", size, labelPosition = "below", sub, ...rest }: ValueBoxProps) {
  const path = SHAPE_PATHS[shape];
  return (
    <div
      {...base(rest, "cs-valuebox", { "--cs-box-size": len(size) })}
      data-shape={shape}
      data-label-position={labelPosition}
    >
      {label && labelPosition !== "below" && <span className="cs-valuebox__label">{label}</span>}
      <span className="cs-valuebox__box">
        {path && (
          <svg className="cs-valuebox__outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={path} vectorEffect="non-scaling-stroke" />
          </svg>
        )}
        <span className="cs-valuebox__value">{value}</span>
        {sub && <span className="cs-valuebox__sub">{sub}</span>}
      </span>
      {label && labelPosition === "below" && <span className="cs-valuebox__label">{label}</span>}
    </div>
  );
}

export interface NoteBoxProps extends BaseProps {
  title?: ReactNode;
  value?: ReactNode;
  /** Minimum height; use `fill` to take all remaining space instead. */
  minHeight?: Length;
  /** Draw ruled lines inside the box. */
  ruled?: boolean;
}

/** An empty area for free-form notes or sketches. */
export function NoteBox({ title, value, minHeight, ruled, ...rest }: NoteBoxProps) {
  return (
    <div {...base(rest, "cs-notebox", { minHeight: len(minHeight) })} data-ruled={ruled || undefined}>
      {title && <div className="cs-notebox__title">{title}</div>}
      <div className="cs-notebox__body">{value}</div>
    </div>
  );
}
