import type { ReactNode } from "react";
import { base, len, range, type BaseProps, type Length } from "./util";
import { Pips, type PipShape } from "./tracks";

export type Row = Record<string, ReactNode>;

export interface Column {
  key: string;
  header?: ReactNode;
  width?: Length;
  align?: "left" | "center" | "right";
  /**
   * What an empty cell shows:
   * - `text`: blank writing space (default)
   * - `pips`: a row of `pips` bubbles
   * - `check`: one checkbox
   */
  type?: "text" | "pips" | "check";
  pips?: number;
  pipShape?: PipShape;
  /** Full control over a cell. Receives the row data (if any) and the row index. */
  render?: (row: Row | undefined, index: number) => ReactNode;
}

export interface TableProps extends BaseProps {
  columns: Column[];
  /** Minimum number of rows; blank rows are added after `data`. */
  rows?: number;
  data?: Row[];
  /** Hide the header row. */
  headless?: boolean;
  caption?: ReactNode;
  /** Row height; defaults to `--cs-row-height`. With `fill`, rows stretch evenly. */
  rowHeight?: Length;
}

/** A ruled table: abilities, inventory, weapons, spells, contacts, ... */
export function Table({ columns, rows = 0, data = [], headless, caption, rowHeight, ...rest }: TableProps) {
  const count = Math.max(rows, data.length);
  return (
    <div {...base(rest, "cs-table", { "--cs-row-height": len(rowHeight) })}>
      <table className="cs-table__table">
        {caption && <caption className="cs-table__caption">{caption}</caption>}
        <colgroup>
          {columns.map((c) => <col key={c.key} style={{ width: len(c.width) }} />)}
        </colgroup>
        {!headless && (
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="cs-table__th" data-key={c.key} style={{ textAlign: c.align }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {range(count).map((r) => (
            <tr key={r} className="cs-table__row">
              {columns.map((c) => (
                <td key={c.key} className="cs-table__td" data-key={c.key} data-type={c.type ?? "text"} style={{ textAlign: c.align }}>
                  {cell(c, data[r], r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cell(c: Column, row: Row | undefined, r: number): ReactNode {
  if (c.render) return c.render(row, r);
  const v = row?.[c.key];
  if (v != null) return v;
  if (c.type === "pips") return <Pips count={c.pips ?? 3} shape={c.pipShape} />;
  if (c.type === "check") return <Pips count={1} shape={c.pipShape ?? "square"} />;
  return null;
}

export interface ListItem {
  label: ReactNode;
  /** Small secondary text, e.g. the governing attribute "(DEX)". */
  note?: ReactNode;
  value?: ReactNode;
  /** Number of pre-filled marker pips. */
  filled?: number;
}

export interface ListTableProps extends BaseProps {
  title?: ReactNode;
  items: (ReactNode | ListItem)[];
  /** Marker in front of each item: none, one checkbox, or several pips (ranks). */
  marker?: "none" | "check" | "pips";
  pips?: number;
  pipShape?: PipShape;
  /** Dotted leader between label and value. */
  leader?: boolean;
  /** Show a value box at the end of each line. */
  showValue?: boolean;
}

const isItem = (i: unknown): i is ListItem =>
  typeof i === "object" && i !== null && !Array.isArray(i) && !("$$typeof" in i);

/** A skill-list style table: `[o] Athletics (STR) ........ [  ]` */
export function ListTable({
  title, items, marker = "check", pips = 3, pipShape, leader = true, showValue = true, ...rest
}: ListTableProps) {
  return (
    <div {...base(rest, "cs-list")} data-leader={leader || undefined}>
      {title && <div className="cs-list__title">{title}</div>}
      {items.map((raw, i) => {
        const item: ListItem = isItem(raw) ? raw : { label: raw as ReactNode };
        return (
          <div key={i} className="cs-list__item">
            {marker !== "none" && (
              <Pips
                className="cs-list__marker"
                count={marker === "check" ? 1 : pips}
                filled={item.filled}
                shape={pipShape}
              />
            )}
            <span className="cs-list__label">
              {item.label}
              {item.note && <span className="cs-list__note"> {item.note}</span>}
            </span>
            <span className="cs-list__leader" aria-hidden />
            {showValue && <span className="cs-list__value">{item.value}</span>}
          </div>
        );
      })}
    </div>
  );
}
