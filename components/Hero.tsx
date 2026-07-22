"use client";

import GlitchText from "@/components/GlitchText";
import CollabCursors from "@/components/CollabCursors";

export default function Hero() {

  return (
    <section className="relative flex flex-col items-center w-full bg-[#050505] py-16 px-6 md:py-[100px] md:px-[120px] overflow-hidden">
      {/* Badge */}
      <div className="flex items-center justify-center gap-[8px] h-[32px] px-[12px] md:px-[16px] bg-[#1A1A1A] border-2 border-[#FFD400]">
        <div className="w-[8px] h-[8px] bg-[#FFD400] shrink-0" />
        <span className="font-ibm-mono text-[9px] md:text-[11px] font-bold text-[#FFD400] tracking-[1px] md:tracking-[2px] whitespace-nowrap">
          SECURE OFFLINE PAYMENTS
        </span>
      </div>

      <div className="h-8 md:h-[32px]" />

      {/* Headline */}
      <h1 className="font-grotesk text-[clamp(32px,10vw,96px)] font-bold text-[#F5F5F0] tracking-[-1px] leading-none text-center w-full max-w-[1100px]">
        <GlitchText text="SEND MONEY." speed={45} delay={100} />
        <br />
        <GlitchText text="EVEN WITHOUT" speed={45} delay={400} />
      </h1>
      <h1 className="font-grotesk text-[clamp(32px,10vw,96px)] font-bold text-[#FFD400] tracking-[-1px] leading-none text-center w-full max-w-[1100px]">
        <GlitchText text="INTERNET." speed={45} delay={700} />
      </h1>

      <div className="h-8 md:h-[32px]" />

      {/* Subheading */}
      <p className="font-ibm-mono text-[13px] md:text-[15px] text-[#888888] tracking-[1px] leading-[1.6] text-center w-full max-w-[800px]">
        SECURE OFFLINE UPI PAYMENTS USING BLUETOOTH, WIFI DIRECT, AND
        ENCRYPTED LOCAL COMMUNICATION.
        <br />
        NO INTERNET REQUIRED. FULL UPI STANDARD COMPLIANCE.
      </p>

      <div className="h-10 md:h-[48px]" />

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-[16px] w-full sm:w-auto">
        <button className="flex items-center justify-center w-full sm:w-[220px] h-[56px] bg-[#FFD400] hover:bg-[#e6c200] transition-colors">
          <span className="font-grotesk text-[12px] font-bold text-[#050505] tracking-[2px]">
            VIEW DEMO
          </span>
        </button>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full sm:w-[200px] h-[56px] bg-[#050505] border-2 border-[#3D3D3D] hover:border-[#888888] transition-colors">
          <span className="font-ibm-mono text-[12px] text-[#888888] tracking-[2px]">
            GITHUB &gt;
          </span>
        </a>
      </div>

      <div className="h-6 md:h-[24px]" />

      <p className="font-ibm-mono text-[11px] text-[#555555] tracking-[2px] text-center">
        OPEN SOURCE // AES-256 ENCRYPTION // INSTANT TRANSFERS
      </p>

      <div className="h-12 md:h-[64px]" />

      {/* Backend Dashboard */}
      <div
        className="w-full max-w-[1200px] overflow-hidden"
        style={{
          borderRadius: "12px",
          border: "1px solid rgba(45,45,45,0.6)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            background: "rgba(15,15,15,0.95)",
            borderBottom: "1px solid rgba(45,45,45,0.6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px", height: "12px", borderRadius: "50%",
                background: "#FF5F57", border: "0.5px solid rgba(0,0,0,0.1)",
              }}
              title="Close"
            />
            <div
              style={{
                width: "12px", height: "12px", borderRadius: "50%",
                background: "#FEBC2E", border: "0.5px solid rgba(0,0,0,0.1)",
              }}
              title="Minimize"
            />
            <div
              style={{
                width: "12px", height: "12px", borderRadius: "50%",
                background: "#28C840", border: "0.5px solid rgba(0,0,0,0.1)",
              }}
              title="Full Screen"
            />
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: "#555",
              letterSpacing: "0.5px",
              marginLeft: "8px",
            }}
          >
            UPI OFFLINE MESH — LIVE DEMO
          </span>
        </div>
        <iframe
          src="http://localhost:8080/"
          className="w-full"
          style={{ height: "555px", display: "block" }}
          title="UPI Offline Mesh Dashboard"
        />
      </div>

      {/* Collab cursors on the full hero */}
      <CollabCursors />
    </section>
  );
}


