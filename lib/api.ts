export interface Account {
  id: number;
  vpa: string;
  holderName: string;
  balance: number;
  version: number;
}

export interface Transaction {
  id: number;
  packetHash: string;
  senderVpa: string;
  receiverVpa: string;
  amount: number;
  settledAt: string;
}

export interface MeshDevice {
  deviceId: string;
  hasInternet: boolean;
  packetCount: number;
  packetIds: string[];
}

export interface MeshState {
  devices: MeshDevice[];
  idempotencyCacheSize: number;
}

export interface GossipResult {
  transfers: number;
  deviceCounts: Record<string, number>;
}

export interface SendResult {
  packetId: string;
  ciphertextPreview: string;
  ttl: number;
  injectedAt: string;
}

export interface BridgeUploadResult {
  bridgeNode: string;
  packetId: string;
  outcome: string;
  reason: string;
  transactionId: number;
}

export interface FlushResult {
  uploadsAttempted: number;
  results: BridgeUploadResult[];
}

export interface ServerKey {
  publicKey: string;
  algorithm: string;
  hybridScheme: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getAccounts: () => fetchJson<Account[]>("/api/accounts"),

  getTransactions: () => fetchJson<Transaction[]>("/api/transactions"),

  getMeshState: () => fetchJson<MeshState>("/api/mesh/state"),

  getServerKey: () => fetchJson<ServerKey>("/api/server-key"),

  sendPayment: (req: {
    senderVpa: string;
    receiverVpa: string;
    amount: number;
    pin: string;
    ttl?: number;
    startDevice?: string;
  }) =>
    fetchJson<SendResult>("/api/demo/send", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  gossipOnce: () =>
    fetchJson<GossipResult>("/api/mesh/gossip", { method: "POST" }),

  flushBridges: () =>
    fetchJson<FlushResult>("/api/mesh/flush", { method: "POST" }),

  resetMesh: () =>
    fetchJson<{ status: string }>("/api/mesh/reset", { method: "POST" }),
};
