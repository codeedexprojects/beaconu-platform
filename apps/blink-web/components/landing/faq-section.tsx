const FAQS = [
  {
    question: "Who can join Blink?",
    answer:
      "Academic Counsellors and MindCare (mental health) counsellors can apply to join the Blink counsellor network through this page.",
  },
  {
    question: "What does 'Request to join' mean?",
    answer:
      "Submitting the form doesn't create an account right away. The Blink team reviews every request first, and you'll be notified by email once it's approved — at which point your counsellor account is set up.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Most requests are reviewed within a few business days. You'll receive an email update once a decision is made.",
  },
  {
    question: "How do I earn through Blink?",
    answer:
      "Counsellors are compensated for the sessions they conduct with students, paid out through the BeaconU counsellor wallet.",
  },
  {
    question:
      "What's the difference between Academic and MindCare counselling?",
    answer:
      "Academic Counsellors guide students on choosing the right stream, course, and college. MindCare Counsellors are licensed mental health professionals who support student wellbeing through confidential sessions.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="border-t border-border/60 bg-secondary/40 py-20"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-border rounded-xl border border-border bg-card">
          {FAQS.map((faq) => (
            <div key={faq.question} className="p-6">
              <h3 className="text-sm font-semibold sm:text-base">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
