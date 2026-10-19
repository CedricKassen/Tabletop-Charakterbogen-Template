import type { ReactNode } from "react";
import { base, type BaseProps } from "./util";
import { Table, type Column, type Row } from "./tables";

export interface StatBlockProps extends BaseProps {
  label: ReactNode;
  /** Short form shown prominently, e.g. "STR". */
  abbr?: ReactNode;
  score?: ReactNode;
  modifier?: ReactNode;
  /** `stacked`: label / big score / small modifier bubble. `inline`: one row. */
  layout?: "stacked" | "inline";
  /** Hide the modifier bubble. */
  noModifier?: boolean;
}

/** A classic attribute block (score + modifier). */
export function StatBlock({ label, abbr, score, modifier, layout = "stacked", noModifier, ...rest }: StatBlockProps) {
  return (
    <div {...base(rest, "cs-stat")} data-layout={layout}>
      <span className="cs-stat__label">
        {label}
        {abbr && <span className="cs-stat__abbr">{abbr}</span>}
      </span>
      <span className="cs-stat__score">{score}</span>
      {!noModifier && <span className="cs-stat__modifier">{modifier}</span>}
    </div>
  );
}

export interface StatDef {
  label: ReactNode;
  icon?: ReactNode;
  /** Pre-filled values keyed by column header index (0 = first value column). */
  values?: ReactNode[];
}

export interface StatTableProps extends BaseProps {
  stats: StatDef[];
  /** Headers of the value columns, e.g. ["Value", "Bonus"]. */
  columns?: ReactNode[];
  /** Header of the label column. */
  labelHeader?: ReactNode;
  labelWidth?: string | number;
}

/** Attribute list as a table: icon + name, followed by value columns. */
export function StatTable({ stats, columns = ["Value", "Mod"], labelHeader = "Attribute", labelWidth = "45%", ...rest }: StatTableProps) {
  const cols: Column[] = [
    {
      key: "label",
      header: labelHeader,
      width: labelWidth,
      render: (row) => row?.label,
    },
    ...columns.map((h, i) => ({ key: `v${i}`, header: h, align: "center" as const })),
  ];
  const data: Row[] = stats.map((s) => {
    const row: Row = {
      label: (
        <span className="cs-stattable__label">
          {s.icon && <span className="cs-stattable__icon">{s.icon}</span>}
          <span>{s.label}</span>
        </span>
      ),
    };
    s.values?.forEach((v, i) => (row[`v${i}`] = v));
    return row;
  });
  return <Table {...rest} className={["cs-stattable", rest.className].filter(Boolean).join(" ")} columns={cols} data={data} />;
}
