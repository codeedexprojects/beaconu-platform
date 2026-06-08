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
      "Tell us about your background, qualifications, and experience. No account is created yet — your request goes straight to the Blink team for review.",
  },
  {
    step: "03",
    title: "Get reviewed by the Blink team",
    description:
      "Our team verifies your details and approves your request — you'll be notified by email once you're cleared to go.",
  },
  {
    step: "04",
    title: "Start counselling and making an impact",
    description:
      "Set up your profile, share your availability, and start running sessions — with your earnings tracked in your counsellor wallet.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border/60 py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-balance text-muted-foreground">
            From application to your first payout — here&apos;s what to expect.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-border bg-card p-6"
            >
              <span className="text-sm font-semibold text-primary">
                {item.step}
              </span>
              <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
