"use client";

import { useState } from "react";
import SectionHeader from "./SectionHeader";

const faqs = [
  {
    question: "HOW SECURE ARE OFFLINE PAYMENTS?",
    answer:
      "EXTREMELY SECURE. WE USE AES-256 ENCRYPTION, THE SAME STANDARD USED BY BANKS AND GOVERNMENTS. ALL COMMUNICATION IS LOCAL — NO DATA LEAVES YOUR DEVICE.",
    defaultOpen: true,
  },
  { question: "WHAT HAPPENS WHEN I GO ONLINE?", answer: "YOUR OFFLINE TRANSACTIONS AUTOMATICALLY SYNC WITH THE UPI NETWORK WHEN YOU REGAIN CONNECTIVITY. SETTLEMENT IS INSTANT AND BACKED BY PARTICIPATING BANKS." },
  { question: "DOES IT WORK WITH ALL UPI PROVIDERS?", answer: "YES. OFFLINE UPI IS BUILT ON THE STANDARD UPI PROTOCOL AND WORKS WITH ALL NPCI-REGISTERED UPI PROVIDERS INCLUDING GOOGLE PAY, PHONEPE, AND PAYTM." },
  { question: "WHAT'S THE TRANSACTION LIMIT?", answer: "TRANSACTION LIMITS FOLLOW STANDARD UPI GUIDELINES SET BY NPCI. MOST USERS CAN SEND UP TO ₹100,000 PER TRANSACTION WITH DAILY LIMITS AROUND ₹500,000." },
  { question: "CAN I SEND TO MULTIPLE PEOPLE OFFLINE?", answer: "YES. YOU CAN CONDUCT MULTIPLE TRANSACTIONS OFFLINE. EACH TRANSACTION IS SECURELY ENCRYPTED AND QUEUED FOR SETTLEMENT WHEN YOU RECONNECT." },
  { question: "WHAT HAPPENS IF MY PHONE DIES BEFORE SYNCING?", answer: "THE PACKET IS STORED LOCALLY AND RETRANSMITTED WHEN THE DEVICE RESTARTS. IF ALREADY GOSSIPED TO OTHER DEVICES, THEY CONTINUE RELAYING IT THROUGH THE MESH EVEN IF YOUR PHONE IS OFF." },
  { question: "IS THERE A FEE FOR OFFLINE TRANSACTIONS?", answer: "THE OFFLINE MESH LAYER IS FREE AND OPEN SOURCE. STANDARD UPI TRANSACTION FEES FROM YOUR BANK MAY APPLY, SAME AS REGULAR ONLINE UPI." },
  { question: "DOES IT WORK INTERNATIONALLY?", answer: "THE MESH NETWORKING WORKS ANYWHERE DEVICES ARE IN BLUETOOTH RANGE. HOWEVER, UPI SETTLEMENT REQUIRES NPCI INTEGRATION AND IS CURRENTLY AVAILABLE PRIMARILY IN INDIA." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
      <section id="faq" className="flex flex-col w-full bg-[#060606] py-16 px-6 md:py-[100px] md:px-[120px]">
      <div className="w-full max-w-[480px]">
        <SectionHeader
          label="[06] // FAQ"
          title={"GOT\nQUESTIONS?"}
          subtitle="EVERYTHING YOU NEED TO KNOW ABOUT OFFLINE UPI PAYMENTS."
          titleWidth="w-full"
          subtitleWidth="w-full"
        />
      </div>

      <div className="h-10 md:h-[64px]" />

      {/* FAQ items */}
      <div className="flex flex-col w-full">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="flex flex-col w-full border-t border-t-[#1D1D1D]">
              <button
                className="flex items-center justify-between w-full py-5 md:h-[72px] text-left gap-4"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span className="font-grotesk text-[14px] md:text-[16px] font-bold text-[#F5F5F0] tracking-[1px]">
                  {faq.question}
                </span>
                <div
                  className="flex items-center justify-center w-[32px] h-[32px] shrink-0"
                  style={{ backgroundColor: isOpen ? "#FFD400" : "#1A1A1A", border: isOpen ? "none" : "1px solid #3D3D3D" }}
                >
                  <span
                    className="font-ibm-mono text-[14px] font-bold"
                    style={{ color: isOpen ? "#050505" : "#888888" }}
                  >
                    {isOpen ? "—" : "+"}
                  </span>
                </div>
              </button>
              {isOpen && faq.answer && (
                <div className="pb-8">
                  <p className="font-ibm-mono text-[12px] md:text-[13px] text-[#888888] tracking-[1px] leading-[1.6]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div className="border-t border-t-[#1D1D1D]" />
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-[16px] pt-10 md:pt-[48px]">
        <span className="font-ibm-mono text-[13px] text-[#555555] tracking-[1px]">
          HAVE MORE QUESTIONS?
        </span>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-ibm-mono text-[13px] font-bold text-[#FFD400] tracking-[1px] cursor-pointer hover:underline">
          CHECK GITHUB &gt;
        </a>
      </div>
    </section>
  );
}
