import { MessageSquare } from "lucide-react";

const avatarColors = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"];

export function HelpAndTrust() {
  return (
    <section className="px-4 space-y-6 pb-2">
      {/* Still Confused CTA */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-yellow-400 text-base" aria-hidden>
            ★
          </span>
          <h2 className="text-[12px] font-bold text-orange-500 tracking-[0.18em] uppercase">
            Still Confused?
          </h2>
          <span className="text-yellow-400 text-base" aria-hidden>
            ★
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          {/* Orange top accent bar */}
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 mb-4" />

          <h3 className="text-[20px] font-bold text-[#111827] mb-1.5">
            Need help deciding?
          </h3>
          <p className="text-[13px] text-gray-400 mb-4 leading-relaxed">
            Talk to our expert counselors for free guidance.
          </p>

          <button className="w-full bg-[#0D0D0D] hover:bg-[#1A1A1A] text-white rounded-full py-3.5 flex items-center justify-center gap-2.5 font-semibold text-[15px] transition-colors">
            <MessageSquare className="h-[18px] w-[18px]" strokeWidth={2} />
            Chat
          </button>
        </div>
      </div>

      {/* Trusted by section */}
      <div className="pb-2">
        {/* Overlapping avatars */}
        <div className="flex items-center mb-3">
          <div className="flex">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-[#F5F5F5] flex items-center justify-center"
                style={{
                  backgroundColor: color,
                  marginLeft: i > 0 ? "-10px" : "0",
                  zIndex: avatarColors.length - i,
                  position: "relative",
                }}
              />
            ))}
          </div>
          <span className="text-gray-400 text-[14px] font-medium ml-2">
            ···
          </span>
        </div>

        <h3 className="text-[22px] font-black text-[#111827] leading-tight mb-1">
          Trusted by
          <br />
          1,95,000+ Students
        </h3>
        <p className="text-[13px] text-gray-500">
          Made with{" "}
          <span className="text-red-500" aria-label="love">
            ♥
          </span>{" "}
          for you by Beacon U
        </p>
      </div>
    </section>
  );
}
