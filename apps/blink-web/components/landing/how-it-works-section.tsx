import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01",
    title: "Choose your track",
    description:
      "Pick whether you're joining as an Academic Counsellor or a MindCare Counsellor.",
  },
  {
    step: "02",
    title: "Send your request",
    description:
      "Tell us about your background, qualifications, and experience.",
  },
  {
    step: "03",
    title: "Meet the Blink team",
    description:
      "Our team reviews your details and lets you know when you're cleared to go.",
  },
  {
    step: "04",
    title: "Make an impact",
    description:
      "Set your availability, start sessions, and track your earnings.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-primary py-20 text-primary-foreground"
    >
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white">
              From hello to impact
            </p>
            <h2 className="mt-3 max-w-xl text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Start with a request.
              <br />
              Grow from there.
            </h2>
          </div>
          <p className="max-w-sm text-balance text-primary-foreground/70">
            A considered, human process from your first application to your
            first student session.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-2xl border border-white/20 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, index) => (
            <div
              key={item.step}
              className={cn(
                "p-8 transition-colors hover:bg-white/10",
                index !== 0 && "sm:border-l sm:border-white/20",
                index === 2 && "sm:border-l-0 lg:border-l",
              )}
            >
              <span className="text-sm font-semibold text-white">
                {item.step}
              </span>
              <h3 className="mt-4 font-serif text-xl font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-primary-foreground/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
