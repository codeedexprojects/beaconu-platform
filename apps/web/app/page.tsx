"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";

const onboardingSchema = z.object({
  college_name: z
    .string()
    .trim()
    .min(2, "College name must be at least 2 characters"),
  university_name: z.string().trim().optional(),
  contact_person_name: z
    .string()
    .trim()
    .min(2, "Contact person name is required"),
  contact_email: z
    .string()
    .trim()
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Please enter a valid email address",
    }),
  contact_phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\+?[\d\s-]{10,15}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function HomePage(): React.JSX.Element {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      college_name: "",
      university_name: "",
      contact_person_name: "",
      contact_email: "",
      contact_phone: "",
      city: "",
      state: "",
      message: "",
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setStatus("submitting");
    try {
      const payload: Record<string, string> = {};
      (Object.keys(data) as (keyof OnboardingFormData)[]).forEach((k) => {
        const val = data[k];
        if (val && val.trim()) payload[k] = val.trim();
      });

      const res = await fetch(`${API_BASE}/api/v1/public/college-onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errorMsg =
          (body as { message?: string }).message ?? "Submission failed";
        throw new Error(errorMsg);
      }

      setStatus("success");
      reset();
      toast.success(
        "Request submitted successfully! We'll be in touch within 24 hours.",
      );
    } catch (err) {
      setStatus("error");
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Nav */}
      <nav className="nav">
        <a href="/" className="logo">
          <div className="logo-mark">B</div>
          <span className="logo-text">
            Beacon<span>U</span>
          </span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a
            href="/blogs"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-muted, #64748b)",
              textDecoration: "none",
              padding: "0.375rem 0.75rem",
              borderRadius: "0.5rem",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "#0f172a")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color =
                "var(--text-muted, #64748b)")
            }
          >
            Blog
          </a>
          <button className="nav-cta" onClick={scrollToForm}>
            Partner With Us
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-glow" />
        <div className="grid-pattern" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="badge-chip">
            <div className="badge-dot" />
            Now Onboarding Partner Colleges
          </div>
          <h1>
            Powering India&apos;s
            <br />
            <span className="gradient-text">College Experience</span>
          </h1>
          <p className="hero-sub">
            BeaconU is the all-in-one student engagement platform trusted by
            leading institutions. Partner with us to transform how your students
            learn, connect, and thrive.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={scrollToForm}>
              Request Onboarding →
            </button>
            <button className="btn-secondary">Learn More</button>
          </div>
          <div className="stats-row">
            {[
              ["500+", "Partner Colleges"],
              ["2M+", "Students Engaged"],
              ["98%", "Satisfaction Rate"],
              ["40+", "Cities Covered"],
            ].map(([num, label]) => (
              <div key={label} className="stat-item">
                <div className="stat-num">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <p className="section-label">Why BeaconU</p>
        <h2 className="section-title">Everything your campus needs</h2>
        <p className="section-sub">
          A unified platform built for modern Indian higher education
          institutions.
        </p>
        <div className="features-grid">
          {[
            {
              icon: "🎓",
              title: "Student Portal",
              desc: "Personalized dashboards, attendance tracking, and academic progress in one place.",
            },
            {
              icon: "📋",
              title: "Admissions Management",
              desc: "Streamlined application workflows from inquiry to enrollment with smart automation.",
            },
            {
              icon: "💬",
              title: "Community Hub",
              desc: "Connect students, faculty, and alumni through discussion boards and messaging.",
            },
            {
              icon: "📊",
              title: "Analytics Dashboard",
              desc: "Real-time insights on student performance, engagement, and campus operations.",
            },
            {
              icon: "🏆",
              title: "Events & Competitions",
              desc: "Manage campus events, hackathons, and cultural fests with built-in ticketing.",
            },
            {
              icon: "🤝",
              title: "Career Services",
              desc: "Placement tracking, job boards, and alumni network to boost student outcomes.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <div className="feature-title">{title}</div>
              <div className="feature-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Onboarding Form */}
      <section className="form-section" ref={formRef}>
        <div className="form-container">
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>
            Get Started
          </p>
          <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
            Partner with BeaconU
          </h2>
          <p className="section-sub" style={{ marginBottom: "2rem" }}>
            Fill in the form below and our team will get in touch within 24
            hours.
          </p>

          <div className="form-card">
            {status === "success" ? (
              <div className="success-box">
                <div className="success-icon">✓</div>
                <div className="success-title">Request Submitted!</div>
                <p className="success-msg">
                  Thank you for your interest in partnering with BeaconU.
                  <br />
                  Our team will review your request and reach out within 24
                  hours.
                </p>
                <button
                  className="btn-primary"
                  style={{
                    marginTop: "1.5rem",
                    width: "auto",
                    padding: "0.75rem 1.5rem",
                  }}
                  onClick={() => setStatus("idle")}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
                {status === "error" && (
                  <div className="error-box">
                    ⚠ Please check the form and try again
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="college_name">
                      College Name <span>*</span>
                    </label>
                    <input
                      id="college_name"
                      {...register("college_name")}
                      className={`form-input ${errors.college_name ? "error" : ""}`}
                      placeholder="e.g. St. Xavier's College"
                    />
                    {errors.college_name && (
                      <span className="error-text">
                        {errors.college_name.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="university_name">
                      University / Affiliation
                    </label>
                    <input
                      id="university_name"
                      {...register("university_name")}
                      className={`form-input ${errors.university_name ? "error" : ""}`}
                      placeholder="e.g. Mumbai University"
                    />
                    {errors.university_name && (
                      <span className="error-text">
                        {errors.university_name.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact_person_name">
                      Contact Person <span>*</span>
                    </label>
                    <input
                      id="contact_person_name"
                      {...register("contact_person_name")}
                      className={`form-input ${errors.contact_person_name ? "error" : ""}`}
                      placeholder="Your full name"
                    />
                    {errors.contact_person_name && (
                      <span className="error-text">
                        {errors.contact_person_name.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact_email">
                      Email Address <span>*</span>
                    </label>
                    <input
                      id="contact_email"
                      type="email"
                      {...register("contact_email")}
                      className={`form-input ${errors.contact_email ? "error" : ""}`}
                      placeholder="you@college.edu.in"
                    />
                    {errors.contact_email && (
                      <span className="error-text">
                        {errors.contact_email.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact_phone">
                      Phone Number
                    </label>
                    <input
                      id="contact_phone"
                      {...register("contact_phone")}
                      className={`form-input ${errors.contact_phone ? "error" : ""}`}
                      placeholder="+91 98765 43210"
                    />
                    {errors.contact_phone && (
                      <span className="error-text">
                        {errors.contact_phone.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      {...register("city")}
                      className={`form-input ${errors.city ? "error" : ""}`}
                      placeholder="e.g. Mumbai"
                    />
                    {errors.city && (
                      <span className="error-text">{errors.city.message}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="state">
                      State
                    </label>
                    <input
                      id="state"
                      {...register("state")}
                      className={`form-input ${errors.state ? "error" : ""}`}
                      placeholder="e.g. Maharashtra"
                    />
                    {errors.state && (
                      <span className="error-text">{errors.state.message}</span>
                    )}
                  </div>
                  <div className="form-group full">
                    <label className="form-label" htmlFor="message">
                      Message / Additional Info
                    </label>
                    <textarea
                      id="message"
                      {...register("message")}
                      className={`form-textarea ${errors.message ? "error" : ""}`}
                      placeholder="Tell us about your college, student strength, and what you're looking for..."
                    />
                    {errors.message && (
                      <span className="error-text">
                        {errors.message.message}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="form-submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting"
                    ? "Submitting..."
                    : "Submit Onboarding Request →"}
                </button>
                <p
                  style={{
                    textAlign: "center",
                    color: "#475569",
                    fontSize: "0.75rem",
                    marginTop: "0.875rem",
                  }}
                >
                  By submitting, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} BeaconU Technologies Pvt. Ltd. All rights
          reserved.
        </p>
      </footer>
    </>
  );
}
