"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Account, Transaction, MeshDevice } from "@/lib/api";

export default function DemoDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [devices, setDevices] = useState<MeshDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const [sender, setSender] = useState("alice@upi");
  const [receiver, setReceiver] = useState("bob@upi");
  const [amount, setAmount] = useState("100");
  const [pin, setPin] = useState("1234");
  const [sending, setSending] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 50));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [accs, txs, mesh] = await Promise.all([
        api.getAccounts(),
        api.getTransactions(),
        api.getMeshState(),
      ]);
      setAccounts(accs);
      setTxns(txs);
      setDevices(mesh.devices);
      setError("");
    } catch (e: unknown) {
      setError(String(e instanceof Error ? e.message : e));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await api.sendPayment({
        senderVpa: sender,
        receiverVpa: receiver,
        amount: Number(amount),
        pin,
      });
      addLog(
        `Sent ₹${amount} from ${sender} → ${receiver} (packet: ${result.packetId.slice(0, 8)}...)`
      );
      await refresh();
    } catch (e: unknown) {
      addLog(`Send failed: ${String(e instanceof Error ? e.message : e)}`);
    } finally {
      setSending(false);
    }
  };

  const handleGossip = async () => {
    try {
      const result = await api.gossipOnce();
      addLog(
        `Gossip round: ${result.transfers} transfers | ${Object.entries(result.deviceCounts).map(([d, c]) => `${d}:${c}`).join(", ")}`
      );
      await refresh();
    } catch (e: unknown) {
      addLog(`Gossip failed: ${String(e instanceof Error ? e.message : e)}`);
    }
  };

  const handleFlush = async () => {
    try {
      const result = await api.flushBridges();
      const settled = result.results.filter((r) => r.outcome === "SETTLED").length;
      const dupes = result.results.filter((r) => r.outcome === "DUPLICATE_DROPPED").length;
      addLog(`Flush: ${result.uploadsAttempted} uploaded | ${settled} settled, ${dupes} duplicates`);
      await refresh();
    } catch (e: unknown) {
      addLog(`Flush failed: ${String(e instanceof Error ? e.message : e)}`);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetMesh();
      addLog("Mesh and idempotency cache reset");
      await refresh();
    } catch (e: unknown) {
      addLog(`Reset failed: ${String(e instanceof Error ? e.message : e)}`);
    }
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center w-full bg-[#050505] py-16 px-6 md:py-[100px]">
        <div className="font-ibm-mono text-[12px] text-[#555] tracking-[2px] animate-pulse">
          CONNECTING TO BACKEND...
        </div>
      </section>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center w-full bg-[#050505] py-16 px-6 md:py-[100px]">
        <div className="font-ibm-mono text-[12px] text-[#FF6B35] tracking-[2px]">
          BACKEND OFFLINE — Start the server with <code className="text-[#FFD400]">./mvnw spring-boot:run</code>
        </div>
        <div className="font-ibm-mono text-[10px] text-[#555] mt-2">{error}</div>
      </section>
    );
  }

  return (
    <section
      id="demo"
      className="flex flex-col w-full bg-[#050505] py-16 px-6 md:py-[100px] md:px-[120px] gap-10 md:gap-[48px]"
    >
      {/* Header */}
      <div className="flex items-center gap-[8px]">
        <div className="w-[8px] h-[8px] bg-[#4ADE80]" />
        <span className="font-ibm-mono text-[11px] font-bold text-[#4ADE80] tracking-[2px]">
          [LIVE DEMO]
        </span>
      </div>
      <h2 className="font-grotesk text-[32px] md:text-[56px] font-bold text-[#F5F5F0] tracking-[-1px] leading-none">
        INTERACTIVE DEMO
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px]">
        {/* ── Column 1: Account Balances + Send ── */}
        <div className="flex flex-col gap-[2px]">
          <div className="bg-[#0F0F0F] border border-[#2D2D2D] p-6">
            <h3 className="font-grotesk text-[14px] font-bold text-[#FFD400] tracking-[1px] mb-4">
              ACCOUNT BALANCES
            </h3>
            <div className="flex flex-col gap-2">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between py-2 border-b border-[#1D1D1D] last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-grotesk text-[13px] text-[#F5F5F0]">
                      {acc.holderName}
                    </span>
                    <span className="font-ibm-mono text-[10px] text-[#555]">
                      {acc.vpa}
                    </span>
                  </div>
                  <span className="font-grotesk text-[16px] font-bold text-[#4ADE80]">
                    ₹{acc.balance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F0F0F] border border-[#2D2D2D] p-6">
            <h3 className="font-grotesk text-[14px] font-bold text-[#FFD400] tracking-[1px] mb-4">
              SEND PAYMENT
            </h3>
            <div className="flex flex-col gap-3">
              <input
                className="w-full h-[40px] px-3 bg-[#1A1A1A] border border-[#2D2D2D] font-ibm-mono text-[12px] text-[#F5F5F0] outline-none focus:border-[#FFD400]"
                placeholder="Sender VPA (e.g. alice@upi)"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              />
              <input
                className="w-full h-[40px] px-3 bg-[#1A1A1A] border border-[#2D2D2D] font-ibm-mono text-[12px] text-[#F5F5F0] outline-none focus:border-[#FFD400]"
                placeholder="Receiver VPA (e.g. bob@upi)"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  className="flex-1 h-[40px] px-3 bg-[#1A1A1A] border border-[#2D2D2D] font-ibm-mono text-[12px] text-[#F5F5F0] outline-none focus:border-[#FFD400]"
                  placeholder="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input
                  className="w-[100px] h-[40px] px-3 bg-[#1A1A1A] border border-[#2D2D2D] font-ibm-mono text-[12px] text-[#F5F5F0] outline-none focus:border-[#FFD400]"
                  placeholder="PIN"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full h-[44px] bg-[#FFD400] hover:bg-[#e6c200] disabled:opacity-50 font-grotesk text-[12px] font-bold text-[#050505] tracking-[2px] transition-colors"
              >
                {sending ? "SENDING..." : "INJECT INTO MESH"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Column 2: Mesh State + Controls ── */}
        <div className="flex flex-col gap-[2px]">
          <div className="bg-[#0F0F0F] border border-[#2D2D2D] p-6">
            <h3 className="font-grotesk text-[14px] font-bold text-[#FFD400] tracking-[1px] mb-4">
              MESH DEVICES
            </h3>
            <div className="flex flex-col gap-2">
              {devices.map((dev) => (
                <div
                  key={dev.deviceId}
                  className="flex items-center justify-between py-2 border-b border-[#1D1D1D] last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-[6px] h-[6px] ${dev.hasInternet ? "bg-[#4ADE80]" : "bg-[#FF6B35]"}`}
                    />
                    <span className="font-ibm-mono text-[11px] text-[#F5F5F0]">
                      {dev.deviceId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {dev.packetIds.length > 0 && (
                      <div className="flex gap-1">
                        {dev.packetIds.map((pid, i) => (
                          <span
                            key={i}
                            className="font-ibm-mono text-[8px] text-[#FFD400] bg-[#1A1A1A] px-1 py-[1px]"
                          >
                            {pid}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="font-ibm-mono text-[10px] text-[#555]">
                      {dev.packetCount} pkt
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F0F0F] border border-[#2D2D2D] p-6">
            <h3 className="font-grotesk text-[14px] font-bold text-[#FFD400] tracking-[1px] mb-4">
              CONTROLS
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleGossip}
                className="w-full h-[44px] bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#FFD400] font-grotesk text-[12px] font-bold text-[#F5F5F0] tracking-[2px] transition-colors"
              >
                RUN GOSSIP ROUND
              </button>
              <button
                onClick={handleFlush}
                className="w-full h-[44px] bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#4ADE80] font-grotesk text-[12px] font-bold text-[#F5F5F0] tracking-[2px] transition-colors"
              >
                BRIDGES UPLOAD
              </button>
              <button
                onClick={handleReset}
                className="w-full h-[44px] bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#FF6B35] font-grotesk text-[12px] font-bold text-[#FF6B35] tracking-[2px] transition-colors"
              >
                RESET MESH
              </button>
            </div>
          </div>
        </div>

        {/* ── Column 3: Ledger + Log ── */}
        <div className="flex flex-col gap-[2px]">
          <div className="bg-[#0F0F0F] border border-[#2D2D2D] p-6 max-h-[300px] overflow-y-auto">
            <h3 className="font-grotesk text-[14px] font-bold text-[#FFD400] tracking-[1px] mb-4">
              TRANSACTION LEDGER
            </h3>
            {txns.length === 0 ? (
              <p className="font-ibm-mono text-[11px] text-[#555]">
                No transactions yet. Send a payment and flush bridges.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {txns.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col py-2 border-b border-[#1D1D1D] last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-grotesk text-[12px] text-[#4ADE80] font-bold">
                        +₹{tx.amount.toLocaleString()}
                      </span>
                      <span className="font-ibm-mono text-[10px] text-[#555]">
                        {new Date(tx.settledAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-ibm-mono text-[10px] text-[#666]">
                      {tx.senderVpa} → {tx.receiverVpa}
                    </div>
                    <div className="font-ibm-mono text-[8px] text-[#444]">
                      #{tx.packetHash.slice(0, 12)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#0F0F0F] border border-[#2D2D2D] p-6 max-h-[300px] overflow-y-auto">
            <h3 className="font-grotesk text-[14px] font-bold text-[#FFD400] tracking-[1px] mb-4">
              EVENT LOG
            </h3>
            {log.length === 0 ? (
              <p className="font-ibm-mono text-[11px] text-[#555]">
                Events will appear here as you interact with the demo.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {log.map((entry, i) => (
                  <div
                    key={i}
                    className="font-ibm-mono text-[10px] text-[#888] leading-[1.6]"
                  >
                    <span className="text-[#444]">&gt;</span> {entry}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-[6px] h-[6px] bg-[#4ADE80] animate-pulse" />
        <span className="font-ibm-mono text-[10px] text-[#555] tracking-[1px]">
          CONNECTED TO BACKEND — DATA UPDATES IN REAL TIME
        </span>
      </div>
    </section>
  );
}
