export type ProcessStep = {
  title: string;
  body: string;
};

type ProcessStepsProps = {
  headingId?: string;
  heading: string;
  description?: string;
  steps: ProcessStep[];
};

export function ProcessSteps({
  headingId = "process-heading",
  heading,
  description,
  steps,
}: ProcessStepsProps) {
  return (
    <section aria-labelledby={headingId} className="border-t border-border bg-paper">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:px-10 md:py-16">
        <h2
          id={headingId}
          className="font-display text-[clamp(2rem,5vw,2.5rem)] tracking-[-0.03em] text-ink [overflow-wrap:anywhere]"
        >
          {heading}
        </h2>
        {description ? (
          <p className="prose-measure mt-4 text-pretty text-base leading-[1.6] text-ink-muted">
            {description}
          </p>
        ) : null}
        <ol className="mt-12 list-none space-y-10 p-0">
          {steps.map((step) => (
            <li key={step.title} className="border-t border-border pt-6">
              <h3 className="font-display text-2xl tracking-[-0.03em] text-ink [overflow-wrap:anywhere]">
                {step.title}
              </h3>
              <p className="prose-measure mt-2 text-pretty leading-[1.6] text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
