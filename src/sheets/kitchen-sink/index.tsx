import {
  Page, Grid, Stack, Section, Banner, Divider,
  Field, FieldRow, Lines, BulletList, FractionField, ValueBox, NoteBox,
  Pips, Track, Clock, Scale,
  Table, ListTable, StatBlock, StatTable, ImageSlot,
} from "../../kit";
import "./theme.css";

export const title = "Kitchen sink – every component";

const SKILLS = [
  { label: "Acrobatics", note: "(DEX)" },
  { label: "Arcana", note: "(INT)", filled: 1 },
  { label: "Athletics", note: "(STR)" },
  { label: "Deception", note: "(CHA)" },
  { label: "Insight", note: "(WIS)", value: "+3" },
  "Perception",
  "Stealth",
];

export default function KitchenSink() {
  return (
    <>
      <Page size="A4" orientation="portrait">
        <Banner before="✦" after="✦">Kitchen sink – page 1: layout, fields, stats</Banner>

        <Grid columns="1fr 30mm" gap={4}>
          <Section title="Field">
            <FieldRow>
              <Field label="Name" />
              <Field label="Player" value="Pre-filled value" />
            </FieldRow>
            <FieldRow>
              <Field label="Class" labelPosition="below" />
              <Field label="Level" labelPosition="below" width={15} align="center" />
              <Field label="Background" labelPosition="above" />
            </FieldRow>
            <Stack gap={1}>
              <Field label="Aligned" labelWidth={18} />
              <Field label="Labels" labelWidth={18} />
            </Stack>
          </Section>
          <ImageSlot framed placeholder="Portrait (framed)" />
        </Grid>

        <Grid columns={3}>
          <Section title="FractionField">
            <FractionField label="HP" />
            <FractionField label="Mana" current="7" max="12" />
            <FractionField label="Stress" captions={["current", "max"]} />
          </Section>
          <Section title="Lines">
            <Lines count={4} label="Backstory" />
          </Section>
          <Section title="BulletList">
            <BulletList count={4} />
          </Section>
        </Grid>

        <Section title="ValueBox – shapes">
          <Stack direction="row" justify="space-between" align="end">
            <ValueBox label="square" />
            <ValueBox label="rounded" shape="rounded" />
            <ValueBox label="circle" shape="circle" value="14" />
            <ValueBox label="shield" shape="shield" value="AW" />
            <ValueBox label="hexagon" shape="hexagon" />
            <ValueBox label="diamond" shape="diamond" />
            <ValueBox label="heart" shape="heart" />
            <ValueBox label="inside" labelPosition="inside" size={20} sub="temp" />
          </Stack>
        </Section>

        <Section title="StatBlock">
          <Stack direction="row" justify="space-between">
            {["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((a, i) => (
              <StatBlock key={a} abbr={a} label="Attribute" score={i === 0 ? "16" : undefined} modifier={i === 0 ? "+3" : undefined} />
            ))}
          </Stack>
          <Grid columns={3} gap={2}>
            <StatBlock layout="inline" label="Body" />
            <StatBlock layout="inline" label="Mind" />
            <StatBlock layout="inline" label="Soul" noModifier />
          </Grid>
        </Section>

        <Grid columns={2} fill>
          <Section title="StatTable">
            <StatTable
              labelHeader="Attribute"
              columns={["Value", "Bonus"]}
              stats={[
                { label: "Body", icon: "◆" },
                { label: "Agility", icon: "◆", values: ["12", "+1"] },
                { label: "Intellect", icon: "◆" },
                { label: "Will", icon: "◆" },
              ]}
            />
          </Section>
          <Section title="Section with decoration & footer" decoration={<span className="ks-corner">❧</span>} footer={<Divider label="footer" />}>
            <NoteBox fill title="NoteBox (fill)" />
          </Section>
        </Grid>

        <Grid columns={3} gap={4}>
          <Section title="Banner placement" titlePlacement="banner">
            <Field label="Title on border" />
          </Section>
          <Section title="Side" titlePlacement="side">
            <Lines count={2} />
          </Section>
          <Section title="Header slot" header={<ValueBox size={7} />}>
            <Field label="Something" />
          </Section>
        </Grid>
      </Page>

      <Page size="A4" orientation="portrait">
        <Banner>Kitchen sink – page 2: tracks, tables</Banner>

        <Grid columns={2}>
          <Section title="Pips">
            <Pips label="Death saves – success" count={3} />
            <Pips label="Failure" count={3} shape="square" filled={1} />
            <Pips label="XP (grouped by 5)" count={20} groupSize={5} size={2.5} />
            <Pips label="Diamond" count={6} shape="diamond" />
            <Pips label="Inspiration" count={1} labelPosition="right" />
            <Pips label="Label above" count={8} labelPosition="above" />
          </Section>
          <Section title="Track / Scale">
            <Track label="Health" steps={[{ label: "OK" }, { label: "Hurt", note: "-1" }, { label: "Bad", note: "-2" }, { label: "Down", note: "-4" }]} filled={1} />
            <Track label="Stress" steps={9} />
            <Scale label="Sanity" from={0} to={10} marked={7} />
            <Scale label="Die" values={["d4", "d6", "d8", "d10", "d12"]} />
          </Section>
        </Grid>

        <Section title="Clock">
          <Stack direction="row" justify="space-around">
            <Clock label="4 segments" />
            <Clock label="6 segments" segments={6} filled={2} />
            <Clock label="8 segments" segments={8} filled={5} />
            <Clock label="12 segments" segments={12} size={18} />
          </Stack>
        </Section>

        <Grid columns="1fr 70mm">
          <Section title="Table">
            <Table
              columns={[
                { key: "prep", header: "", width: 6, type: "check" },
                { key: "name", header: "Spell", width: "30%" },
                { key: "level", header: "Lvl", width: 10, align: "center" },
                { key: "effect", header: "Effect" },
                { key: "uses", header: "Uses", width: 16, type: "pips", pips: 3 },
              ]}
              data={[{ name: "Magic Missile", level: "1", effect: "3 × 1d4+1" }]}
              rows={6}
            />
          </Section>
          <Section title="ListTable">
            <ListTable items={SKILLS} />
          </Section>
        </Grid>

        <Grid columns={2} fill>
          <Section title="Table (fill, headless)">
            <Table fill headless columns={[{ key: "item" }, { key: "qty", width: 12 }]} rows={8} />
          </Section>
          <Section title="ListTable – ranks, no leader">
            <ListTable marker="pips" pips={5} pipShape="square" leader={false} showValue={false} items={["Swords", "Bows", { label: "Lore", filled: 2 }, "Riding"]} />
            <Divider />
            <Stack direction="row" align="center" gap={2}>
              <ImageSlot width={12} height={12} placeholder="icon" />
              <ImageSlot width={30} height={12} placeholder="logo" />
              <ImageSlot width={12} height={12}>
                <svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="0.4" /></svg>
              </ImageSlot>
            </Stack>
            <NoteBox ruled fill title="NoteBox (ruled)" />
          </Section>
        </Grid>
      </Page>
    </>
  );
}
