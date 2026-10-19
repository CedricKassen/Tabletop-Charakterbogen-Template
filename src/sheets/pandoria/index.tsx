/**
 * "Mysteries of Pandoria" – the reference sheet (referenzen/Unbenanntes_Projekt.pdf)
 * rebuilt with the kit. Structure only: every ornament / artwork position is an
 * empty <ImageSlot> so a theme (or a later pass) can drop graphics in.
 */
import {
  Page, Grid, Stack, Section, Field, Lines, BulletList, FractionField, FieldRow,
  ValueBox, NoteBox, Table, StatTable, ImageSlot,
} from "../../kit";
import "./theme.css";

export const title = "Mysteries of Pandoria – Charakter";

const Compass = () => <ImageSlot className="pd-compass" placeholder="ornament" />;

export default function Pandoria() {
  return (
    <Page size="A4" orientation="landscape">
      <Grid
        fill
        columns="66mm 1fr 66mm"
        rows="auto auto auto 1fr"
        areas={[
          "ident  title  traits",
          "ident  werte  traits",
          "pilger res    right",
          "pilger skills right",
        ]}
      >
        <Section area="ident" decoration={<Compass />}>
          <Field label="Name:" labelWidth={20} />
          <Field label="Alter:" labelWidth={20} />
          <Field label="Größe:" labelWidth={20} />
          <Lines className="pd-background" label="Hintergrund / Beruf:" count={4} />
        </Section>

        <Stack area="title" align="center" gap={1} className="pd-title">
          <ImageSlot className="pd-title__art" placeholder="title artwork" />
          <h1 className="pd-title__name">Mysteries of Pandoria</h1>
          <div className="pd-title__sub">Charakter</div>
        </Stack>

        <Section area="traits" title="Körperliche Merkmale:" decoration={<Compass />}>
          <BulletList className="pd-traits" count={9} />
        </Section>

        <Section area="werte" title="Werte" titlePlacement="banner">
          <Grid columns="1fr auto 1fr" gap={4} className="pd-werte">
            <Stack gap={1}>
              <FractionField label="LP:" labelWidth={18} />
              <FractionField label="VT:" labelWidth={18} />
              <Field label="Initiative:" labelWidth={18} />
            </Stack>
            <ValueBox shape="shield" label="AW" labelPosition="inside" size={17} />
            <Stack gap={1} justify="center">
              <FractionField label="Mentale Belastung:" labelPosition="above" />
            </Stack>
          </Grid>
        </Section>

        <Section area="res" title="Ressourcen" titlePlacement="banner">
          <FieldRow gap={6}>
            <FractionField label="ZF:" />
            <FractionField label="NKP:" />
            <FractionField label="BizP:" />
          </FieldRow>
        </Section>

        <Section area="pilger" title="Pilger" titlePlacement="banner">
          <Table
            fill
            columns={[
              { key: "seq", header: "Sequenz", width: 18, type: "check", pipShape: "circle" },
              { key: "pfad", header: "Pfad" },
            ]}
            rows={14}
          />
        </Section>

        <Section area="skills" title="Fähigkeiten" titlePlacement="banner">
          <Table
            fill
            columns={[
              { key: "name", header: "Name" },
              { key: "funktion", header: "Funktion" },
              { key: "kosten", header: "Kosten" },
              { key: "wert", header: "Wert" },
              { key: "typ", header: "Typ" },
            ]}
            rows={11}
          />
        </Section>

        <Stack area="right">
          <Section title="Attribute" className="pd-attributes">
            <StatTable
              labelHeader="Attribut"
              columns={["Wert", "Bonus"]}
              labelWidth="50%"
              stats={["Körper", "Geschick", "Intelligenz", "Weisheit", "Wille", "Ausdruck"].map((label) => ({
                label,
                icon: <ImageSlot className="pd-icon" placeholder="" />,
              }))}
            />
          </Section>
          <Section fill title="Passive Fähigkeit" className="pd-passive">
            <NoteBox fill className="pd-passive__box" />
          </Section>
        </Stack>
      </Grid>
    </Page>
  );
}
