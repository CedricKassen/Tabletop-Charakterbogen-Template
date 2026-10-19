/**
 * Draws Pandoria's frame and plate artwork as SVG:
 *
 *   node scripts/pandoria-art.ts      # → src/sheets/pandoria/assets/*.svg
 *
 * All coordinates are millimetres. The ornaments are built from tapered strokes
 * (a centre line plus a width profile, filled as one outline), which gives the
 * swelling-and-thinning line of an engraving. Corner ornaments are drawn for the
 * top-left corner, symmetric about the diagonal, and mirrored into the others.
 */
import { writeFileSync } from "node:fs";

const out = new URL("../src/sheets/pandoria/assets/", import.meta.url).pathname;

type P = [number, number];
const f = (n: number) => +n.toFixed(3);

/* ---------- geometry ---------- */

function cubic(p0: P, p1: P, p2: P, p3: P, n = 40): P[] {
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return pts;
}

/** Joins point runs, dropping the duplicate point where two runs meet. */
const chain = (...runs: P[][]) => runs.flatMap((r, i) => (i ? r.slice(1) : r));

/**
 * Logarithmic spiral around `c`, from angle a0 (radius r0) to a1 (radius r1).
 * Angles in degrees, screen orientation (y down): increasing angle turns clockwise.
 */
function spiral(c: P, r0: number, r1: number, a0: number, a1: number, n = 80): P[] {
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = ((a0 + (a1 - a0) * t) * Math.PI) / 180;
    const r = r0 * Math.pow(r1 / r0, t);
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return pts;
}

/**
 * Continues a run of points with a spiral that picks up its end tangent: `turn` is the
 * total angle in degrees (positive curls clockwise on the page), r0/r1 the radius at
 * the start and at the eye.
 */
function curl(pts: P[], turn: number, r0: number, r1: number, n = 90): P[] {
  const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const t: P = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const s = Math.sign(turn);
  // the centre lies to the right of the direction of travel for a clockwise curl
  const c: P = [b[0] - s * t[1] * r0, b[1] + s * t[0] * r0];
  const a0 = (Math.atan2(b[1] - c[1], b[0] - c[0]) * 180) / Math.PI;
  return chain(pts, spiral(c, r0, r1, a0, a0 + turn, n));
}

/** A smooth curve through `pts` (Catmull-Rom), `n` points per segment. */
function through(pts: P[], n = 20): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    out.push(...cubic(p1, c1, c2, p2, n).slice(i ? 1 : 0));
  }
  return out;
}

const arcLength = (pts: P[]) =>
  pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/** Arc-length parameters (0..1) of a polyline. */
function lengths(pts: P[]) {
  const d = [0];
  for (let i = 1; i < pts.length; i++) {
    d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return d.map((x) => x / d[d.length - 1]);
}

/** A width profile from (t, width) stops, eased between stops. */
function profile(...stops: [number, number][]) {
  return (t: number) => {
    for (let i = 1; i < stops.length; i++) {
      const [t0, w0] = stops[i - 1], [t1, w1] = stops[i];
      if (t <= t1) {
        const k = (t - t0) / (t1 - t0 || 1);
        const s = k * k * (3 - 2 * k);
        return w0 + (w1 - w0) * s;
      }
    }
    return stops[stops.length - 1][1];
  };
}

/** Filled outline of a stroke along `pts` whose width follows `w(t)`. */
function taper(pts: P[], w: (t: number) => number): string {
  const ts = lengths(pts);
  const left: P[] = [], right: P[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, h = w(ts[i]) / 2;
    left.push([p[0] + nx * h, p[1] + ny * h]);
    right.push([p[0] - nx * h, p[1] - ny * h]);
  });
  const ring = [...left, ...right.reverse()];
  return "M" + ring.map((p) => `${f(p[0])} ${f(p[1])}`).join("L") + "Z";
}

const path = (d: string, extra = "") => `<path d="${d}"${extra}/>`;
const dot = (c: P, r: number, extra = "") => `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r)}"${extra}/>`;
/** Mirror of a drawing across the diagonal y = x. */
const mirrorDiag = (g: string) => `<g transform="matrix(0 1 1 0 0 0)">${g}</g>`;

/* ---------- panel frame ---------- */

/*
 * Rules, measured from the panel's border edge: outer rule 0–0.51, inner rule 0.85–1.27.
 * The images extend 0.68 mm outside the border box (border-image-outset).
 */
const RULE = { outer: [0, 0.51], inner: [0.85, 1.27] } as const;
const OUTSET = 0.68;
const SLICE = 11;
const SIZE = 3 * SLICE;

/** Maps diagonal coordinates (u along the corner's bisector, v across it) to x, y. */
const diag = ([u, v]: P): P => [(u + v) / Math.SQRT2, (u - v) / Math.SQRT2];

/**
 * The scrolled corner, shared by panels and page. Origin at the outer rule's outer corner,
 * the rules as in RULE; `k` scales the ornament (not the rules), `from` is where the
 * drawn piece of the inner rule starts. Drawn for the top edge and mirrored across the
 * diagonal: each stem starts in a small spiral beside the diagonal (the two face each
 * other), runs along its edge in place of the inner rule in a gentle S, swelling, and
 * rolls up into a large spiral with a ball at its eye; a pointed leaf springs from the
 * stem into the hollow beside the spiral. The inner rule ends a little further on in a
 * small curl of its own.
 */
function scrollCorner(k: number, from: number): string {
  const y = (RULE.inner[0] + RULE.inner[1]) / 2, w = RULE.inner[1] - RULE.inner[0];
  const K = (x: number, yy: number): P => [x * k, yy * k];
  // y of a stem point whose top edge keeps the inner rule's gap to the outer rule
  const hug = (half: number) => RULE.inner[0] + half;

  // the stem: a small spiral beside the diagonal, along the edge in a gentle S, then
  // rolling up into the large spiral
  const run = through([K(3.35, 1.3), [4.1 * k, hug(0.2 * k)], K(5.4, 1.5), [6.7 * k, hug(0.2 * k)], [7.5 * k, hug(0.2 * k)]], 24);
  const start = curl([...run].reverse(), -330, 0.75 * k, 0.26 * k, 80).reverse();
  const stem = curl(chain(start, run.slice(1)), 350, 1.25 * k, 0.38 * k, 130);
  const ts = arcLength(start) / arcLength(stem), te = 1 - arcLength(stem.slice(-131)) / arcLength(stem);
  const at = (t: number) => te + (1 - te) * t;
  const scroll = path(taper(stem, profile(
    [0, 0.2 * k], [ts * 0.55, 0.36 * k], [ts, 0.26 * k], [(ts + te) / 2, 0.4 * k], [at(0), 0.36 * k],
    [at(0.3), 0.58 * k], [at(0.7), 0.32 * k], [1, 0.26 * k],
  ))) + dot(stem[0], 0.25 * k) + dot(stem[stem.length - 1], 0.34 * k);

  // the leaf, from the underside of the stem into the hollow left of the spiral
  const leafLine = cubic(K(4.7, 1.6), K(4.9, 2.5), K(5.5, 3.1), K(6.5, 3.35), 40);
  const leaf = path(taper(leafLine, profile([0, 0.14 * k], [0.45, 0.82 * k], [0.8, 0.4 * k], [1, 0.02]))) +
    path(taper(cubic(K(4.95, 2.2), K(5.15, 2.75), K(5.6, 3.05), K(6.1, 3.22), 20),
      profile([0, 0.01], [0.4, 0.12 * k], [1, 0.01])), ` fill="#fff"`);

  // the inner rule's end: it turns down and curls back under itself (on the panels the
  // curl must stay inside the 11 mm corner slice, or the border-image stretches it)
  const ruleEnd = curl(cubic([from, y], [from, y], K(9.5, y / k), K(9.5, y / k), 4), -290, 0.48 * k, 0.2 * k, 50);
  const rule = path(taper(ruleEnd, profile([0, w], [0.3, w], [0.75, 0.3 * k], [1, 0.24 * k]))) +
    dot(ruleEnd[ruleEnd.length - 1], 0.26 * k);

  return scroll + leaf + rule;
}

function cornerOrnament(k: number, from: number): string {
  const half = scrollCorner(k, from);
  // a drop on the diagonal pointing into the corner, and a pearl below the two small spirals
  const drop = cubic(diag([2.9 * k, 0]), diag([2.9 * k, 0]), diag([1.3 * k, 0]), diag([1.3 * k, 0]), 30);
  return half + mirrorDiag(half) +
    path(taper(drop, profile([0, 0.05 * k], [0.25, 0.6 * k], [1, 0.02]))) +
    dot(diag([5.35 * k, 0]), 0.28 * k);
}

/** Plain square corner: both rules meet at right angles. */
function plainCorner(): string {
  const [o0, o1] = RULE.outer, [i0, i1] = RULE.inner;
  return (
    path(`M${o0} ${o0}H${SLICE}V${o1}H${o1}V${SLICE}H${o0}Z`) +
    path(`M${i0} ${i0}H${SLICE}V${i1}H${i1}V${SLICE}H${i0}Z`)
  );
}

/** Straight rules of the panel frame along the top edge between two corners. */
function panelRulesTop(from: number, to: number) {
  return [RULE.outer, RULE.inner]
    .map(([a, b]) => `<rect x="${f(from)}" y="${a}" width="${f(to - from)}" height="${f(b - a)}"/>`)
    .join("");
}

function ornamentedCorner(): string {
  // the outer rule runs into the corner; the inner one ends in a curl (see scrollCorner)
  const [o0, o1] = RULE.outer;
  return path(`M${o0} ${o0}H${SLICE}V${o1}H${o1}V${SLICE}H${o0}Z`) + cornerOrnament(1, SLICE);
}

/** The four corners in tl, tr, br, bl order; `plain` lists the corners without ornament. */
function panelFrame(plain: ("tl" | "tr" | "br" | "bl")[] = []) {
  const at = {
    tl: `translate(${OUTSET} ${OUTSET})`,
    tr: `translate(${SIZE - OUTSET} ${OUTSET}) scale(-1 1)`,
    br: `translate(${SIZE - OUTSET} ${SIZE - OUTSET}) scale(-1 -1)`,
    bl: `translate(${OUTSET} ${SIZE - OUTSET}) scale(1 -1)`,
  };
  const body = (Object.keys(at) as (keyof typeof at)[])
    .map((k) => `<use href="#${plain.includes(k) ? "p" : "o"}" transform="${at[k]}"/>`)
    .join("");
  // the middle slices: straight rules along each edge
  const inner = SIZE - 2 * OUTSET;
  const edge = panelRulesTop(SLICE - OUTSET, inner - SLICE + OUTSET);
  const edges = [
    `translate(${OUTSET} ${OUTSET})`,
    `translate(${OUTSET} ${SIZE - OUTSET}) scale(1 -1)`,
    `translate(${OUTSET} ${OUTSET}) matrix(0 1 1 0 0 0)`,
    `translate(${SIZE - OUTSET} ${OUTSET}) matrix(0 1 -1 0 0 0)`,
  ].map((t) => `<g transform="${t}">${edge}</g>`).join("");
  return svg(SIZE, SIZE,
    `<defs><g id="o">${ornamentedCorner()}</g><g id="p">${plainCorner()}</g></defs>${edges}${body}`);
}

/* ---------- page frame ---------- */

/*
 * The page frame is inset 3.26 mm from the paper edge (see theme.css); coordinates here
 * start at that inset. Its double rule mirrors the panels'. The corner ornaments sit
 * over the corner panels' own corners (4.74 mm in), so those panels use a plain corner;
 * a white strip hides the panel's rules where the ornament takes over.
 */
const PAGE = { size: 60.96, outer: [2.37, 2.88], inner: [3.22, 3.64], panel: 4.74 } as const;

/** Scale of the page corners' ornament relative to the panels', and where their inner rule's drawn piece starts. */
const PAGE_K = 1.5;
const PAGE_FROM = 17.5;

function pageCorner(): string {
  const o = PAGE.outer[0];
  const orn = cornerOrnament(PAGE_K, PAGE_FROM);
  // The corner panel's rules give way to the ornament: a white strip covers them up to
  // just past the inner rule's curl, and each ends there in a pearl, the inner one a
  // little later (all inside the 20.32 mm corner slice, or the border-image would stretch
  // them). The browser snaps the panel's and the page's frames to its pixel grid
  // independently, so the panel's rules can sit up to ~0.15 mm off; the pearls sit over
  // the cut ends and hide that.
  const p0 = PAGE.panel - o - 0.15, p1 = p0 + RULE.inner[1] + 0.3, len = 10.6 * PAGE_K, len2 = len + 0.8;
  const strip = `<rect x="${f(p0)}" y="${f(p0)}" width="${f(len - p0)}" height="${f(p1 - p0)}"/>` +
    `<rect x="${f(len)}" y="${f(PAGE.panel - o + RULE.inner[0] - 0.2)}" width="${f(len2 - len)}" height="${f(RULE.inner[1] - RULE.inner[0] + 0.4)}"/>`;
  const at = (r: readonly [number, number]) => PAGE.panel - o + 0.075 + (r[0] + r[1]) / 2;
  const ends = dot([len, at(RULE.outer)], 0.42) + dot([len2, at(RULE.inner)], 0.36);
  return `<g transform="translate(${o} ${o})"><g fill="#fff">${strip}${mirrorDiag(strip)}</g>` +
    `${orn}${ends}${mirrorDiag(ends)}</g>`;
}

function pageFrame() {
  const { size, outer, inner } = PAGE;
  // the outer rule runs into the corners; the inner one ends where the corner's own piece takes over
  const rule = ([a, b]: readonly [number, number], inset: number) => {
    const s0 = f(a + inset), len = f(size - 2 * (a + inset)), t = f(b - a);
    return `<rect x="${s0}" y="${a}" width="${len}" height="${t}"/>` +
      `<rect x="${s0}" y="${f(size - b)}" width="${len}" height="${t}"/>` +
      `<rect x="${a}" y="${s0}" width="${t}" height="${len}"/>` +
      `<rect x="${f(size - b)}" y="${s0}" width="${t}" height="${len}"/>`;
  };
  const corners = [
    "", `translate(${size} 0) scale(-1 1)`, `translate(${size} ${size}) scale(-1 -1)`, `translate(0 ${size}) scale(1 -1)`,
  ].map((t) => `<use href="#c" transform="${t}"/>`).join("");
  return svg(size, size, `<defs><g id="c">${pageCorner()}</g></defs>${rule(outer, 0)}${rule(inner, outer[0] - inner[0] + PAGE_FROM - 1)}${corners}`);
}

/* ---------- heading plate ---------- */

/*
 * The plate is one SVG that scales to the heading: it has no viewBox, so its width is
 * the element's, while the two ends are drawn at a fixed size in mm and pinned to the
 * left and right edge (the right one mirrored). The silhouette has notched corners and
 * a pointed end; inside it, from the edge in: a black outline, a white gap (it masks
 * the frame rule running behind the plate), the black body and a white hairline.
 *
 * Each band is a full-size rect shown through a mask of the silhouette inset by the
 * band's depth (the silhouette in white, its outline stroked in black). Ends and middle
 * overlap inside each mask, so no edge is ever cut straight and nothing leaves a seam.
 */
const PLATE = { h: 8.55, end: 6.1 } as const;

function plate() {
  const { h } = PLATE, cy = h / 2;
  const x1 = 1.75, rn = 1.25, top = 0.25, bot = h - 0.25, cut = 7.5, mid = 3;
  // the left end's outline, open towards the middle
  const outline =
    `M${cut} ${top}L${x1 + rn} ${top}A${rn} ${rn} 0 0 1 ${x1} ${top + rn}` +
    `C${x1} ${cy - 1.3} 0.55 ${cy - 0.55} 0.12 ${cy}` +
    `C0.55 ${cy + 0.55} ${x1} ${cy + 1.3} ${x1} ${f(bot - rn)}` +
    `A${rn} ${rn} 0 0 1 ${x1 + rn} ${bot}L${cut} ${bot}`;
  const end = (body: string) =>
    `<svg width="${cut}mm" height="${h}mm" viewBox="0 0 ${cut} ${h}" overflow="visible">${body}</svg>`;
  /** Both halves: the left one as given, the right one mirrored at the right edge. */
  const halves = (body: string) =>
    body + `<svg x="100%" overflow="visible"><g transform="scale(-1 1)">${body}</g></svg>`;
  const midRect = (y0: number, y1: number, fill: string) =>
    `<rect x="${mid}mm" y="${f(y0)}mm" width="50%" height="${f(y1 - y0)}mm" fill="${fill}"/>`;

  const masks = (depth: number, i: number) => {
    const white = end(path(`${outline}Z`, ` fill="#fff"`)) + midRect(top, bot, "#fff");
    const black = depth
      ? end(path(outline, ` fill="none" stroke="#000" stroke-width="${f(2 * depth)}" stroke-linejoin="round"`)) +
        midRect(top - depth, top + depth, "#000") + midRect(bot - depth, bot + depth, "#000")
      : "";
    return `<mask id="m${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">` +
      halves(white) + halves(black) + `</mask>`;
  };
  const bands: [number, string][] = [[0, "#000"], [0.3, "#fff"], [0.65, "#000"], [1.07, "#fff"], [1.25, "#000"]];
  // a small white lozenge and a dot in each end
  const x = 2.35;
  const orn = end(
    path(`M${x} ${cy}L${f(x + 0.55)} ${f(cy - 0.55)}L${f(x + 1.1)} ${cy}L${f(x + 0.55)} ${f(cy + 0.55)}Z`, ` fill="#fff"`) +
    dot([x + 1.55, cy], 0.17, ` fill="#fff"`),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">` +
    `<defs>${bands.map(([d], i) => masks(d, i)).join("")}</defs>` +
    bands.map(([, c], i) => `<rect width="100%" height="100%" fill="${c}" mask="url(#m${i})"/>`).join("") +
    halves(orn) + `</svg>\n`;
}

/* ---------- output ---------- */

/** An SVG file showing the area `x`, `y`, `w`, `h` of `body` (extra root attributes in `attrs`). */
function svg(w: number, h: number, body: string, x = 0, y = 0, attrs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f(w)}" height="${f(h)}" ` +
    `viewBox="${f(x)} ${f(y)} ${f(w)} ${f(h)}"${attrs}><g fill="#000">${body}</g></svg>\n`;
}

const files: Record<string, string> = {
  "frame.svg": panelFrame(),
  "frame-tl.svg": panelFrame(["tl"]),
  "frame-tr.svg": panelFrame(["tr"]),
  "frame-bl.svg": panelFrame(["bl"]),
  "frame-br.svg": panelFrame(["br"]),
  "frame-l.svg": panelFrame(["tl", "bl"]),
  "page-frame.svg": pageFrame(),
  "plate.svg": plate(),
};
for (const [name, content] of Object.entries(files)) writeFileSync(out + name, content);
console.log(`wrote ${Object.keys(files).join(", ")}`);
