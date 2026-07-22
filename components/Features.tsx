import SectionHeader from "./SectionHeader";

interface FeatureCardProps {
  iconColor: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  bgColor?: string;
  borderColor?: string;
}

function FeatureCard({
  iconColor,
  title,
  description,
  tag,
  tagColor,
  bgColor = "#111111",
  borderColor = "#2D2D2D",
}: FeatureCardProps) {
  return (
    <div
      className="flex flex-col gap-5 p-8 md:p-[32px] border w-full md:flex-1 md:h-[320px]"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div className="w-[40px] h-[40px] shrink-0" style={{ backgroundColor: iconColor }} />
      <h3 className="font-grotesk text-[18px] font-bold text-[#F5F5F0] tracking-[1px] leading-[1.2] whitespace-pre-line">
        {title}
      </h3>
      <p className="font-ibm-mono text-[12px] text-[#666666] tracking-[1px] leading-[1.6]">
        {description}
      </p>
      <div
        className="flex items-center justify-center h-[28px] px-[12px] bg-[#1A1A1A] border w-fit"
        style={{ borderColor: tagColor }}
      >
        <span className="font-ibm-mono text-[11px] tracking-[2px]" style={{ color: tagColor }}>
          {tag}
        </span>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="flex flex-col w-full bg-[#050505] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]"
    >
      <SectionHeader
        label="[01] // KEY FEATURES"
        title={"OFFLINE PAYMENTS.\nSECURE & INSTANT."}
        subtitle="ENGINEERED FOR CONNECTIVITY GAPS. BUILT FOR INDIA'S MOBILE-FIRST USERS."
      />

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <FeatureCard
          iconColor="#FFD400"
          title={"OFFLINE\nPAYMENTS"}
          description="TRANSFER WITHOUT INTERNET. TRUE P2P PAYMENTS OVER BLUETOOTH OR WIFI DIRECT. EACH TRANSACTION ENCRYPTED WITH AES-256-GCM FOR END-TO-END SECURITY."
          tag="P2P"
          tagColor="#FFD400"
          borderColor="#FFD400"
        />
        <FeatureCard
          iconColor="#60A5FA"
          title={"BLUETOOTH\nDISCOVERY"}
          description="INSTANT DEVICE DISCOVERY. NEARBY DEVICES AUTOMATICALLY DETECTED. MESH ROUTING WITH TTL-BASED FLOODING ENSURES DELIVERY ACROSS MULTIPLE HOPS."
          tag="NEARBY"
          tagColor="#60A5FA"
          bgColor="#0F0F0F"
          borderColor="#60A5FA"
        />
        <FeatureCard
          iconColor="#4ADE80"
          title={"QR-BASED\nPAIRING"}
          description="SECURE PAIRING VIA QR. ZERO MANUAL CONFIGURATION. PUBLIC KEY FINGERPRINT IN QR PREVENTS MAN-IN-THE-MIDDLE ATTACKS."
          tag="SECURE"
          tagColor="#4ADE80"
          borderColor="#4ADE80"
        />
      </div>
    </section>
  );
}
