/**
 * "Mysteries of Pandoria" – the reference sheet (referenzen/Unbenanntes_Projekt.pdf)
 * rebuilt with the kit. The artwork in `assets/` is cut from the 300 dpi reference
 * scan; frames, plates and ornaments are applied in theme.css.
 *
 * The layout follows the reference's arrangement but on a regular grid: equal
 * gutters, aligned panel edges and one set of paddings and type sizes.
 */
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/600.css";
import "@fontsource-variable/roboto-serif/wdth.css";
import {
  Page, Grid, Stack, Section, Field, Lines, BulletList, FractionField, FieldRow,
  ValueBox, NoteBox, Table, StatTable, ImageSlot,
} from "../../kit";
import castlesLeft from "./assets/title-castles-left.png";
import castlesRight from "./assets/title-castles-right.png";
import lettering from "./assets/title-lettering.png";
import compass from "./assets/compass.png";
import iconKoerper from "./assets/icon-koerper.png";
import iconGeschick from "./assets/icon-geschick.png";
import iconIntelligenz from "./assets/icon-intelligenz.png";
import iconWeisheit from "./assets/icon-weisheit.png";
import iconWille from "./assets/icon-wille.png";
import iconAusdruck from "./assets/icon-ausdruck.png";
import "./theme.css";

export const title = "Mysteries of Pandoria – Charakter";

const Compass = () => <ImageSlot className="pd-compass" src={compass} />;

const attributes = [
  ["Körper", iconKoerper],
  ["Geschick", iconGeschick],
  ["Intelligenz", iconIntelligenz],
  ["Weisheit", iconWeisheit],
  ["Wille", iconWille],
  ["Ausdruck", iconAusdruck],
] as const;

/*
 * Two bands on one grid, 3 mm gutters everywhere:
 *   top:    Ident (74 mm) | title + Werte | Merkmale (74 mm)
 *   bottom: Pilger (55 mm) | Ressourcen + Fähigkeiten | Attribute + Passive (55 mm)
 * Ident/Merkmale end level with Werte, all bottom panels end on the page frame.
 */
const columns = "55mm 16mm minmax(0, 1fr) 16mm 55mm";
const rows = "50mm 38mm 20mm 41mm 1fr";
const areas = [
  "ident  ident  title  traits traits",
  "ident  ident  werte  traits traits",
  "pilger res    res    res    attr",
  "pilger skills skills skills attr",
  "pilger skills skills skills passive",
];

export default function Pandoria() {
  return (
    <Page size="A4" orientation="landscape" margin={8}>
      <Grid fill gap={3} columns={columns} rows={rows} areas={areas}>
        <Section area="ident" title="Person" className="pd-ident" decoration={<Compass />}>
          <Field label="Name:" />
          <Field label="Alter:" />
          <Field label="Größe:" />
          <Lines fill className="pd-background" label="Hintergrund / Beruf:" count={6} />
        </Section>

        <Stack area="title" className="pd-title" align="center" justify="center">
          <ImageSlot className="pd-castles pd-castles--left" src={castlesLeft} />
          <ImageSlot className="pd-lettering" src={lettering} alt="Mysteries of Pandoria – Charakter" />
          <ImageSlot className="pd-castles pd-castles--right" src={castlesRight} />
        </Stack>

        <Section area="traits" title="Körperliche Merkmale" className="pd-traits" decoration={<Compass />}>
          <BulletList fill count={11} />
        </Section>

        <Section area="werte" title="Werte" titlePlacement="banner" className="pd-plated pd-werte">
          <Grid fill columns="1fr 28mm 1fr" gap={6}>
            <Stack gap={0} justify="center">
              <FractionField label="LP:" />
              <FractionField label="VT:" />
              <Field label="Initiative:" />
            </Stack>
            <ValueBox shape="shield" label="AW" labelPosition="inside" size={28} className="pd-aw" />
            <FractionField label="Mentale Belastung:" labelPosition="above" className="pd-mental" />
          </Grid>
        </Section>

        <Section area="res" title="Ressourcen" titlePlacement="banner" className="pd-plated pd-res">
          <FieldRow gap={10}>
            <FractionField label="ZP:" />
            <FractionField label="NKP:" />
            <FractionField label="RP:" />
          </FieldRow>
        </Section>

        <Section area="pilger" title="Pilger" className="pd-table-panel pd-pilger">
          <Table
            fill
            columns={[
              { key: "seq", header: "Sequenz", width: 15, type: "check", pipShape: "circle" },
              { key: "pfad", header: "Pfad" },
            ]}
            rows={10}
          />
        </Section>

        <Section area="skills" title="Fähigkeiten" className="pd-table-panel pd-skills">
          <Table
            fill
            columns={[
              { key: "name", header: "Name", width: "22%" },
              { key: "funktion", header: "Funktion", width: "22%" },
              { key: "kosten", header: "Kosten", width: "20%" },
              { key: "wert", header: "Wert", width: "18%" },
              { key: "typ", header: "Typ" },
            ]}
            rows={6}
          />
        </Section>

        <Section area="attr" title="Attribute" className="pd-table-panel pd-attributes">
          <StatTable
            fill
            labelHeader="Attribut"
            columns={["Wert", "Bonus"]}
            labelWidth="44%"
            stats={attributes.map(([label, src]) => ({
              label,
              icon: <ImageSlot className="pd-icon" src={src} />,
            }))}
          />
        </Section>

        <Section area="passive" title="Passive Fähigkeit" className="pd-passive">
          <NoteBox fill className="pd-passive__box" />
        </Section>
      </Grid>
    </Page>
  );
}
