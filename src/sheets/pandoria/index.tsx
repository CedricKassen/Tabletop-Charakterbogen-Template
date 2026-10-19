/**
 * "Mysteries of Pandoria" – the reference sheets rebuilt with the kit:
 *   page 1  referenzen/Unbenanntes_Projekt.pdf (character, values, abilities)
 *   page 2  referenzen/Foto - Ch. Bo. Spieler.pdf (skills, equipment)
 * The artwork in `assets/` is cut from the references (page-2 icons and the sword
 * are traced to SVG); frames, plates and ornaments are applied in theme.css.
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
import skillKampf from "./assets/skill-kampf.svg";
import skillKoerper from "./assets/skill-koerper.svg";
import skillGeschick from "./assets/skill-geschick.svg";
import skillIntelligenz from "./assets/skill-intelligenz.svg";
import skillWeisheit from "./assets/skill-weisheit.svg";
import skillWille from "./assets/skill-wille.svg";
import skillAusdruck from "./assets/skill-ausdruck.svg";
import armorKopf from "./assets/armor-kopf.svg";
import armorUmhang from "./assets/armor-umhang.svg";
import armorTorso from "./assets/armor-torso.svg";
import armorHaende from "./assets/armor-haende.svg";
import armorBeine from "./assets/armor-beine.svg";
import armorFuesse from "./assets/armor-fuesse.svg";
import sword from "./assets/sword.svg";
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

function CharacterPage() {
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

/* ---------- page 2: Fertigkeiten, Ausrüstung ---------- */

const skillGroups = [
  ["Kampf-Fertigkeiten", skillKampf, ["Nahkampf", "Fernkampf", "Magie"]],
  ["Körper", skillKoerper, ["Athletik", "Robustheit / Verteidigung"]],
  ["Geschick", skillGeschick, ["Agilität / Ausweichen", "Schleichen", "Diebstahl"]],
  ["Intelligenz", skillIntelligenz, ["Arkane Kunde", "Religion", "Handwerk", "Alchemie"]],
  ["Weisheit", skillWeisheit, ["Ritual-Magie", "Wahrnehmung", "Okkultismus", "Medizin"]],
  ["Wille", skillWille, ["Überleben"]],
  ["Ausdruck", skillAusdruck, ["Überreden", "Einschüchtern", "Auftreten"]],
] as const;

const armor = [
  ["Kopf", armorKopf],
  ["Umhang", armorUmhang],
  ["Torso", armorTorso],
  ["Hände", armorHaende],
  ["Beine", armorBeine],
  ["Füße", armorFuesse],
] as const;

/*
 * The skill table is one header table plus one block per group: the group's icon
 * spans its rows, so each group is a grid of icon cell + headless table. Value
 * columns have fixed widths, so they line up with the header table.
 */
const skillValues = [
  { key: "attr", header: "Attributs-Bonus", width: 25 },
  { key: "punkte", header: "Bonus-Punkte", width: 25 },
  { key: "gesamt", header: "Insgesamter Bonus", width: 25 },
];
const iconColumn = "18mm";

function SkillTable() {
  return (
    <Stack fill gap={0} className="pd-skills-table">
      <Table
        className="pd-skills-head"
        columns={[{ key: "icon", width: iconColumn }, { key: "name", header: "Fertigkeiten / Proben" }, ...skillValues]}
      />
      {skillGroups.map(([group, icon, skills]) => (
        <Grid
          key={group}
          className="pd-skill-group"
          columns={`${iconColumn} minmax(0, 1fr)`}
          gap={0}
          style={{ flex: `${skills.length + 1} 1 0` }}
        >
          <Stack className="pd-skill-group__icon" align="center" justify="center">
            <ImageSlot src={icon} />
          </Stack>
          <Table
            fill
            headless
            columns={[{ key: "name" }, ...skillValues]}
            data={[group, ...skills].map((name) => ({ name }))}
          />
        </Grid>
      ))}
    </Stack>
  );
}

const columns2 = "minmax(0, 1fr) minmax(0, 1fr)";
const rows2 = "90mm 52mm 1fr";
const areas2 = [
  "skills armor",
  "skills weapons",
  "skills items",
];

function EquipmentPage() {
  return (
    <Page size="A4" orientation="landscape" margin={8}>
      <Grid fill gap={3} columns={columns2} rows={rows2} areas={areas2}>
        <Section area="skills" title="Fertigkeiten / Proben" className="pd-table-panel pd-skills2">
          <SkillTable />
        </Section>

        <Section area="armor" title="Gegenstände & Ausrüstung" className="pd-table-panel pd-armor">
          <StatTable
            fill
            labelHeader="Rüstungsteil"
            columns={["Rüstungswert", "Name", "Eigenschaft"]}
            labelWidth="27%"
            stats={armor.map(([label, src]) => ({
              label,
              icon: <ImageSlot className="pd-armor__icon" src={src} />,
            }))}
          />
        </Section>

        <Section area="weapons" title="Waffen" className="pd-table-panel pd-weapons">
          <Grid fill columns="16mm minmax(0, 1fr)" gap={0}>
            <ImageSlot className="pd-sword" src={sword} />
            <Table
              fill
              columns={[
                { key: "name", header: "Waffenname", width: "28%" },
                { key: "faehigkeit", header: "Waffenfähigkeit", width: "28%" },
                { key: "art", header: "Waffenart", width: "22%" },
                { key: "werte", header: "Werte" },
              ]}
              rows={5}
            />
          </Grid>
        </Section>

        <Section area="items" title="Besondere Items" className="pd-table-panel pd-items">
          <Table
            fill
            columns={[
              { key: "name", header: "Name", width: "30%" },
              { key: "faehigkeit", header: "Fähigkeit", width: "44%" },
              { key: "werte", header: "Werte" },
            ]}
            rows={4}
          />
        </Section>
      </Grid>
    </Page>
  );
}

export default function Pandoria() {
  return (
    <>
      <CharacterPage />
      <EquipmentPage />
    </>
  );
}
