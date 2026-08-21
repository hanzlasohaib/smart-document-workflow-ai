import { Surface } from "@/components/surface";

export function SourceText({ text }: { text: string }) {
  const value = text.trim();
  if (!value) return null;

  return (
    <section aria-labelledby="source-text-heading" className="mt-8">
      <h2
        id="source-text-heading"
        className="font-display text-2xl tracking-[-0.03em] text-ink"
      >
        Source text
      </h2>
      <p className="mt-2 text-sm leading-[1.6] text-ink-muted">
        Text produced by OCR. Use it to check extracted fields.
      </p>
      <Surface className="mt-4 p-4">
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-[1.6] text-ink-muted">
          {value}
        </pre>
      </Surface>
    </section>
  );
}
