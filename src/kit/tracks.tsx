import type { ReactNode } from "react";
import { base, len, range, type BaseProps, type Length } from "./util";

export type PipShape = "circle" | "square" | "diamond";

export interface PipsProps extends BaseProps {
  label?: ReactNode;
  count?: number;
  /** How many pips are pre-filled. */
  filled?: number;
  shape?: PipShape;
  direction?: "row" | "column";
  /** Insert a larger gap after every n pips (e.g. 5 for tally-like groups). */
  groupSize?: number;
  /** Diameter of one pip; defaults to `--cs-pip-size`. */
  size?: Length;
  labelPosition?: "left" | "above" | "right";
}

/** A row of checkboxes / bubbles: death saves, spell slots, inspiration, xp, ... */
export function Pips({
  label, count = 5, filled = 0, shape = "circle", direction = "row", groupSize, size,
  labelPosition = "left", ...rest
}: PipsProps) {
  return (
    <div
      {...base(rest, "cs-pips", { "--cs-pip-size": len(size) })}
      data-direction={direction}
      data-label-position={labelPosition}
    >
      {label && <span className="cs-pips__label">{label}</span>}
      <span className="cs-pips__items">
        {range(count).map((i) => (
          <span
            key={i}
            className="cs-pip"
            data-shape={shape}
            data-filled={i < filled || undefined}
            data-group-end={(groupSize && (i + 1) % groupSize === 0 && i + 1 < count) || undefined}
          />
        ))}
      </span>
    </div>
  );
}

export interface TrackStep {
  label?: ReactNode;
  /** Small text under the label, e.g. a penalty "-1". */
  note?: ReactNode;
}

export interface TrackProps extends BaseProps {
  label?: ReactNode;
  /** Number of steps, or one entry per step. */
  steps: number | (ReactNode | TrackStep)[];
  filled?: number;
  /** Size of each step box; defaults to `--cs-track-size`. */
  size?: Length;
}

const isStep = (s: unknown): s is TrackStep =>
  typeof s === "object" && s !== null && !Array.isArray(s) && !("$$typeof" in s);

/** A labelled step track: health levels, stress, conditions, corruption, ... */
export function Track({ label, steps, filled = 0, size, ...rest }: TrackProps) {
  const list = typeof steps === "number" ? range(steps).map(() => ({})) : steps;
  return (
    <div {...base(rest, "cs-track", { "--cs-track-size": len(size) })}>
      {label && <span className="cs-track__label">{label}</span>}
      <span className="cs-track__steps">
        {list.map((s, i) => {
          const step: TrackStep = isStep(s) ? s : { label: s as ReactNode };
          return (
            <span key={i} className="cs-track__step" data-filled={i < filled || undefined}>
              <span className="cs-track__box" />
              {step.label != null && <span className="cs-track__step-label">{step.label}</span>}
              {step.note != null && <span className="cs-track__step-note">{step.note}</span>}
            </span>
          );
        })}
      </span>
    </div>
  );
}

export interface ClockProps extends BaseProps {
  label?: ReactNode;
  segments?: number;
  filled?: number;
  /** Diameter; defaults to `--cs-clock-size`. */
  size?: Length;
}

/** A segmented progress clock (Blades in the Dark style). */
export function Clock({ label, segments = 4, filled = 0, size, ...rest }: ClockProps) {
  const r = 48;
  const point = (i: number) => {
    const a = (i / segments) * 2 * Math.PI - Math.PI / 2;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)].map((n) => n.toFixed(3)).join(" ");
  };
  return (
    <div {...base(rest, "cs-clock", { "--cs-clock-size": len(size) })}>
      <svg className="cs-clock__face" viewBox="0 0 100 100" aria-hidden>
        {range(segments).map((i) => (
          <path
            key={i}
            className="cs-clock__segment"
            data-filled={i < filled || undefined}
            d={`M50 50 L${point(i)} A${r} ${r} 0 0 1 ${point(i + 1)} Z`}
          />
        ))}
      </svg>
      {label && <span className="cs-clock__label">{label}</span>}
    </div>
  );
}

export interface ScaleProps extends BaseProps {
  label?: ReactNode;
  from?: number;
  to?: number;
  /** Explicit values instead of a numeric range, e.g. dice ["d4","d6","d8"]. */
  values?: ReactNode[];
  /** Pre-marked value (gets `data-marked`). */
  marked?: ReactNode;
}

/** A row of values to circle: sanity 0–10, die sizes, ranks, ... */
export function Scale({ label, from = 0, to = 10, values, marked, ...rest }: ScaleProps) {
  const list = values ?? range(to - from + 1).map((i) => from + i);
  return (
    <div {...base(rest, "cs-scale")}>
      {label && <span className="cs-scale__label">{label}</span>}
      <span className="cs-scale__values">
        {list.map((v, i) => (
          <span key={i} className="cs-scale__value" data-marked={(marked != null && v === marked) || undefined}>
            {v}
          </span>
        ))}
      </span>
    </div>
  );
}
