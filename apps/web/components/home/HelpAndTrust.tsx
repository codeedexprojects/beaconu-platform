import { MessageSquare } from "lucide-react";

const avatarColors = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"];

export function HelpAndTrust() {
  return (
    <section className="px-4 md:px-6 lg:px-8 pb-2">
      <div className="lg:flex lg:gap-10 lg:items-start">
        <div className="lg:flex-1 mb-6 lg:mb-0">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-yellow-400 text-base" aria-hidden>
              ★
            </span>
            <h2 className="text-[12px] sm:text-[13px] font-bold text-orange-500 tracking-[0.18em] uppercase">
              Still Confused?
            </h2>
            <span className="text-yellow-400 text-base" aria-hidden>
              ★
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 mb-4" />

            <h3 className="text-[20px] sm:text-[24px] font-bold text-[#111827] mb-1.5">
              Need help deciding?
            </h3>
            <p className="text-[13px] sm:text-[14px] text-gray-400 mb-5 leading-relaxed">
              Talk to our expert counselors for free guidance.
            </p>

            <button className="w-full bg-[#0D0D0D] hover:bg-[#1A1A1A] text-white rounded-full py-3.5 sm:py-4 flex items-center justify-center gap-2.5 font-semibold text-[15px] transition-colors">
              <MessageSquare className="h-[18px] w-[18px]" strokeWidth={2} />
              Chat
            </button>
          </div>
        </div>

        <div className="lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:min-h-full">
          <div className="flex items-center mb-4 sm:mb-5">
            <div className="flex">
              {avatarColors.map((color, i) => (
                <div
                  key={i}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#F5F5F5] flex items-center justify-center"
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

          <h3 className="text-[22px] sm:text-[28px] lg:text-[32px] font-black text-[#111827] leading-tight mb-2">
            Trusted by
            <br />
            1,95,000+ Students
          </h3>
          <p className="text-[13px] sm:text-[14px] text-gray-500">
            Made with{" "}
            <span className="text-red-500" aria-label="love">
              ♥
            </span>{" "}
            for you by Beacon U
          </p>
        </div>
      </div>
    </section>
  );
}
