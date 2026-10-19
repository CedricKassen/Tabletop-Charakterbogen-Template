import { StrictMode, useEffect, useState, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { sheetIds, loadSheet } from "./sheets";
import "./shell.css";

const params = new URLSearchParams(location.search);
const sheetId = params.get("sheet");

function SheetView({ id }: { id: string }) {
  const [Sheet, setSheet] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSheet(id)
      .then((mod) => {
        document.title = mod.title ?? id;
        setSheet(() => mod.default);
      })
      .catch((e: unknown) => setError(String(e)));
  }, [id]);

  // Signal "ready" for the PDF export script once fonts and images are loaded.
  useEffect(() => {
    if (!Sheet) return;
    const imgs = [...document.images].map((img) => img.decode().catch(() => undefined));
    Promise.all([document.fonts.ready, ...imgs]).then(() => (document.body.dataset.ready = "true"));
  }, [Sheet]);

  if (error) return <p className="shell-error">{error}</p>;
  if (!Sheet) return null;
  return (
    <>
      <nav className="shell-toolbar">
        <a href="/">← all sheets</a>
        <span>{id}</span>
        <button onClick={() => window.print()}>Print / Save as PDF</button>
      </nav>
      <main className={`cs-document sheet-${id}`} data-sheet={id}>
        <Sheet />
      </main>
    </>
  );
}

function Index() {
  return (
    <main className="shell-index">
      <h1>Character sheets</h1>
      <ul>
        {sheetIds.map((id) => (
          <li key={id}><a href={`/?sheet=${id}`}>{id}</a></li>
        ))}
      </ul>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>{sheetId ? <SheetView id={sheetId} /> : <Index />}</StrictMode>,
);
