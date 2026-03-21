# UPI Offline Mesh — Offline UPI Payments via Bluetooth Mesh Network

[![Java](https://img.shields.io/badge/Java-17%2B-orange)](https://adoptium.net)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/Aaditya022/UPI_Without_Internet/pulls)

> **Send money from a basement with zero internet.** Encrypted payment packets hop device-to-device via Bluetooth until one phone walks outside, hits 4G, and uploads to the backend. **Hybrid RSA + AES-GCM encryption**, **atomic idempotency**, and **defense-in-depth settlement** — all running on a single laptop for demo.

Built by [**Aaditya**](https://github.com/Aaditya022)

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Payment Lifecycle](#payment-lifecycle)
- [Encryption Scheme](#encryption-scheme)
- [Three Hard Problems](#three-hard-problems)
  - [1. Untrusted Intermediaries](#1-untrusted-intermediaries)
  - [2. Duplicate Storm](#2-duplicate-storm)
  - [3. Replay Attacks](#3-replay-attacks)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Frontend Landing Page](#frontend-landing-page)
- [Testing](#testing)
- [Production Roadmap](#production-roadmap)
- [Limitations](#limitations)
- [License](#license)

---

## System Architecture

```mermaid
graph TB
    subgraph "Offline Mesh Network"
        A[Sender Phone<br/>Alice] -->|Bluetooth Gossip| B[Stranger 1]
        B -->|Bluetooth Gossip| C[Stranger 2]
        C -->|Bluetooth Gossip| D[Stranger 3]
        D -->|Bluetooth Gossip| E[Bridge Node<br/>has 4G]
    end

    subgraph "Internet"
        E -->|HTTPS POST| F[Spring Boot Backend<br/>localhost:8080]
    end

    subgraph "Backend Pipeline"
        F --> G[1. SHA-256 Hash<br/>Ciphertext]
        G --> H[2. Idempotency Check<br/>ConcurrentHashMap]
        H -->|First Seen| I[3. RSA-OAEP Decrypt<br/>AES Key]
        H -->|Duplicate| J[❌ DROP]
        I --> K[4. AES-GCM Decrypt<br/>+ Verify Auth Tag]
        K -->|Tampered| L[❌ INVALID]
        K -->|Valid| M[5. Freshness Check<br/>&lt; 24h]
        M -->|Stale| N[❌ REJECTED]
        M -->|Fresh| O[6. Settlement<br/>@Transactional]
        O --> P[(H2 / PostgreSQL)]
    end

    style A fill:#1a1a2e,color:#fff
    style B fill:#16213e,color:#fff
    style C fill:#16213e,color:#fff
    style D fill:#16213e,color:#fff
    style E fill:#0f3460,color:#fff,stroke:#4ade80
    style F fill:#1a1a2e,color:#fff,stroke:#ffd400
    style P fill:#1a1a2e,color:#fff
```

---

## Data Flow

```mermaid
flowchart LR
    subgraph Sender["📱 Sender Phone (Offline)"]
        PI[PaymentInstruction<br/>sender, receiver,<br/>amount, nonce, time]
        EP[Encrypted Packet<br/>RSA-OAEP AES Key +<br/>AES-GCM Ciphertext]
        PI -->|Hybrid Encrypt| EP
    end

    subgraph Mesh["🔄 Bluetooth Mesh"]
        EP -->|Hop 1| N1[Node A]
        N1 -->|Hop 2| N2[Node B]
        N2 -->|Hop 3| N3[Bridge Node]
    end

    subgraph Backend["🖥️ Spring Boot Backend"]
        direction TB
        H[Hash SHA-256] --> ID[Idempotency<br/>putIfAbsent]
        ID -->|first| D[Decrypt]
        ID -->|duplicate| Dr[🛑 Drop]
        D --> F[Freshness<br/>Check]
        F -->|valid| S[Settle]
        F -->|stale| R[❌ Reject]
        S --> Ledger[(Ledger)]
    end

    N3 -->|HTTPS| H

    style PI fill:#0f0f0f,color:#ffd400,stroke:#ffd400
    style EP fill:#1a1a1a,color:#888,stroke:#2d2d2d
    style N1 fill:#1a1a1a,color:#888,stroke:#2d2d2d
    style N2 fill:#1a1a1a,color:#888,stroke:#2d2d2d
    style N3 fill:#0f0f0f,color:#4ade80,stroke:#4ade80
    style Backend fill:#0f0f0f,color:#fff,stroke:#ffd400
    style Ledger fill:#0f0f0f,color:#4ade80,stroke:#4ade80
```

---

## Payment Lifecycle

```mermaid
sequenceDiagram
    participant Alice as 📱 Alice (Offline)
    participant Mesh as 🔄 Bluetooth Mesh
    participant Bridge as 📡 Bridge Node
    participant Backend as 🖥️ Backend
    participant DB as 💾 Database

    Note over Alice,DB: Step 1: Compose & Encrypt
    Alice->>Alice: Create PaymentInstruction<br/>(sender, receiver, amount, nonce, time)
    Alice->>Alice: Generate ephemeral AES-256 key
    Alice->>Alice: AES-GCM encrypt JSON payload
    Alice->>Alice: RSA-OAEP encrypt AES key<br/>with server's public key
    Alice->>Alice: Pack: [RSA key][IV][ciphertext+tag]
    Alice->>Alice: Base64 encode → ciphertext

    Note over Alice,Mesh: Step 2: Inject into Mesh
    Alice->>Mesh: Broadcast MeshPacket<br/>{packetId, ttl=5, ciphertext}

    Note over Mesh,Bridge: Step 3: Gossip Rounds
    Mesh->>Mesh: TTL decrements per hop
    Mesh->>Bridge: Packet reaches bridge node

    Note over Bridge,Backend: Step 4: Bridge walks outside
    Bridge->>Backend: POST /api/bridge/ingest<br/>X-Bridge-Node-Id, X-Hop-Count

    Note over Backend,DB: Step 5: Ingestion Pipeline
    Backend->>Backend: SHA-256(ciphertext) → hash
    Backend->>Backend: putIfAbsent(hash) → first claimer?
    alt Duplicate
        Backend-->>Bridge: DUPLICATE_DROPPED
    else First Claim
        Backend->>Backend: RSA-OAEP decrypt → AES key
        Backend->>Backend: AES-GCM decrypt → PaymentInstruction
        Backend->>Backend: Check signedAt within 24h
        alt Stale/Invalid
            Backend-->>Bridge: INVALID
        else Fresh
            Backend->>DB: BEGIN TRANSACTION
            Backend->>DB: Debit sender, Credit receiver
            Backend->>DB: INSERT transaction record
            Backend->>DB: COMMIT
            Backend-->>Bridge: SETTLED ✓
        end
    end
```

---

## Encryption Scheme

```mermaid
flowchart TB
    subgraph Encrypt["🔐 Sender Encrypts"]
        JSON[PaymentInstruction JSON<br/>~300 bytes] --> AESP[AES-256-GCM Encrypt]
        KEY[Random AES-256 Key<br/>32 bytes] --> AESP
        IV[Random IV<br/>12 bytes] --> AESP
        AESP --> CT[AES Ciphertext + 16-byte GCM Tag]
        KEY --> RSA[RSA-OAEP Encrypt<br/>with Server Public Key]
        RSA --> EK[Encrypted AES Key<br/>256 bytes]
        EK --> PACK
        IV --> PACK
        CT --> PACK
        PACK[Pack: EK + IV + CT] --> B64[Base64 Encode]
        B64 --> WIRE[Wire Format: single base64 string]
    end

    subgraph Decrypt["🔓 Server Decrypts"]
        WIRE2[Wire Format] --> UNB64[Base64 Decode]
        UNB64 --> UNPACK[Unpack: EK + IV + CT]
        UNPACK --> RSA2[RSA-OAEP Decrypt<br/>with Server Private Key]
        RSA2 --> KEY2[AES-256 Key]
        UNPACK --> IV2[IV]
        UNPACK --> CT2[AES Ciphertext + Tag]
        KEY2 --> AESD[AES-256-GCM Decrypt]
        IV2 --> AESD
        CT2 --> AESD
        AESD -->|GCM Tag Validates| JSON2[PaymentInstruction]
        AESD -->|Tag Mismatch| FAIL[❌ Exception<br/>Tamper Detected]
    end

    style Encrypt fill:#0f0f0f,color:#ffd400,stroke:#ffd400
    style Decrypt fill:#0f0f0f,color:#4ade80,stroke:#4ade80
    style FAIL fill:#1a1a1a,color:#ff6b35,stroke:#ff6b35
    style WIRE fill:#1a1a1a,color:#888,stroke:#2d2d2d
    style WIRE2 fill:#1a1a1a,color:#888,stroke:#2d2d2d
```

---

## Three Hard Problems

### 1. Untrusted Intermediaries

A stranger's phone carries your transaction. How do you stop them from reading or modifying it?

**Solution: Hybrid Encryption (RSA-OAEP + AES-256-GCM)**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Wire Format                                  │
│  ┌──────────────────────┬──────────┬────────────────────────────┐   │
│  │ RSA-Encrypted AES Key│ GCM IV  │ AES-GCM Ciphertext + Tag  │   │
│  │     256 bytes        │ 12 bytes│     variable length        │   │
│  └──────────────────────┴──────────┴────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

- **AES-256-GCM** encrypts the actual payment payload (fast + authenticated)
- **RSA-OAEP** encrypts just the ephemeral AES key (solves RSA size limit)
- **GCM auth tag** detects any bit-flip tampering — decryption throws immediately
- Same scheme used by **TLS 1.3**, **Signal Protocol**, and **PGP**

**Why not pure RSA?** RSA-2048 can only encrypt ~245 bytes. Our JSON payload often exceeds that. The hybrid pattern scales to arbitrarily large payloads while keeping the security of RSA key exchange.

### 2. Duplicate Storm

Three bridge nodes hold the same packet. They all walk outside simultaneously. Three concurrent POSTs hit the server. How do you settle exactly once?

**Solution: Atomic Compare-and-Set on Ciphertext Hash**

```java
// IdempotencyService.java
Instant prev = seen.putIfAbsent(packetHash, now);
return prev == null;  // true = first claimer, false = duplicate
```

```mermaid
flowchart LR
    P1[POST 1] --> H1[Hash: a3f8c9]
    P2[POST 2] --> H2[Hash: a3f8c9]
    P3[POST 3] --> H3[Hash: a3f8c9]
    H1 --> CAS{ConcurrentHashMap<br/>putIfAbsent}
    H2 --> CAS
    H3 --> CAS
    CAS -->|first| S[Settle ✓]
    CAS -->|duplicate| D1[Drop]
    CAS -->|duplicate| D2[Drop]
```

**Why hash the ciphertext, not the packetId?**

| Key | Problem |
|---|---|
| `packetId` | Malicious intermediate can rewrite it |
| Cleartext JSON | Requires decrypt first (slow + exposes data) |
| **Ciphertext** | **Byte-identical for same payment. GCM-authenticated. Can hash before decrypt.** |

**Defense in depth:** The `transactions.packet_hash` column has a UNIQUE index. If the cache layer fails, the database rejects the second insert.

**Production path:** Replace `ConcurrentHashMap` with **Redis `SET key NX EX 86400`** — same semantics, distributed across replicas.

### 3. Replay Attacks

An attacker captures a ciphertext and replays it weeks later.

**Solution: Two independent layers**

| Layer | Mechanism | Bypass |
|---|---|---|
| **Freshness window** | `signedAt` epoch inside encrypted payload. Server rejects packets older than 24h. | Cannot modify `signedAt` without breaking GCM auth tag |
| **Idempotency cache** | Byte-identical ciphertext → same hash → `putIfAbsent` rejects duplicates | Cannot create same ciphertext without same AES key + IV + payload |

**Nonce ensures legitimate repeats settle correctly:** If Alice sends Bob ₹100 twice, each has a unique UUID nonce → different plaintext → different ciphertext → different hash → both settle.

---

## Project Structure

```
upi-offline-mesh/
├── pom.xml                              Maven build, Spring Boot 3.3, Java 17
├── mvnw / mvnw.cmd                      Maven wrapper (zero setup)
├── README.md                            ← you are here
│
├── src/main/java/com/demo/upimesh/
│   ├── UpiMeshApplication.java          Entry point
│   │
│   ├── model/                           Domain layer
│   │   ├── Account.java                 JPA entity with @Version (optimistic lock)
│   │   ├── AccountRepository.java       Spring Data JPA
│   │   ├── Transaction.java             Ledger entry, unique constraint on packet_hash
│   │   ├── TransactionRepository.java   Spring Data JPA
│   │   ├── MeshPacket.java              Wire format for Bluetooth gossip
│   │   └── PaymentInstruction.java      Decrypted payload
│   │
│   ├── crypto/                          Cryptography
│   │   ├── ServerKeyHolder.java         RSA-2048 keygen on startup
│   │   └── HybridCryptoService.java     RSA-OAEP + AES-256-GCM
│   │
│   ├── service/                         Business logic
│   │   ├── DemoService.java             Seeds accounts, simulates sender phone
│   │   ├── VirtualDevice.java           Simulated phone in the mesh
│   │   ├── MeshSimulatorService.java    Gossip protocol simulation
│   │   ├── IdempotencyService.java      ConcurrentHashMap = JVM Redis SETNX
│   │   ├── SettlementService.java       @Transactional debit/credit
│   │   └── BridgeIngestionService.java  THE pipeline: hash → claim → decrypt → freshness → settle
│   │
│   ├── controller/                      HTTP layer
│   │   ├── ApiController.java           REST endpoints
│   │   └── DashboardController.java     Serves dashboard HTML
│   │
│   └── config/
│       └── AppConfig.java               Scheduling for cache eviction
│
├── src/main/resources/
│   ├── application.properties           H2 in-memory DB, port 8080, TTL configs
│   └── templates/dashboard.html         Interactive demo dashboard
│
└── src/test/java/com/demo/upimesh/
    └── IdempotencyConcurrencyTest.java   3 concurrency tests
```

---

## Quick Start

### Prerequisites

- **JDK 17+** ([Download](https://adoptium.net))
- That's it. No database, no Redis, no Maven install.

### Run

```bash
git clone https://github.com/Aaditya022/UPI_Without_Internet.git
cd UPI_Without_Internet
chmod +x mvnw
./mvnw spring-boot:run
```

Open **http://localhost:8080** for the demo dashboard.

### Run Tests

```bash
./mvnw test
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Demo dashboard (Thymeleaf) |
| `GET` | `/api/server-key` | Server's RSA-2048 public key (base64) |
| `GET` | `/api/accounts` | All accounts and balances |
| `GET` | `/api/transactions` | Last 20 ledger entries |
| `GET` | `/api/mesh/state` | Virtual device mesh state |
| `POST` | `/api/demo/send` | Compose + encrypt + inject payment |
| `POST` | `/api/mesh/gossip` | Run one gossip round |
| `POST` | `/api/mesh/flush` | Bridges upload to backend (parallel) |
| `POST` | `/api/mesh/reset` | Clear mesh + idempotency cache |
| `POST` | `/api/bridge/ingest` | **Production endpoint** — real bridges POST here |

### Bridge Ingest Example

```http
POST /api/bridge/ingest
Content-Type: application/json
X-Bridge-Node-Id: phone-bridge-42
X-Hop-Count: 3

{
  "packetId": "550e8400-e29b-41d4-a716-446655440000",
  "ttl": 2,
  "createdAt": 1730000000000,
  "ciphertext": "base64-encoded-RSA-and-AES-blob..."
}
```

```json
{
  "outcome": "SETTLED",
  "packetHash": "a3f8c9...",
  "reason": null,
  "transactionId": 42
}
```

---

## Frontend Landing Page

A Next.js landing page accompanies this backend (located at `offline-upi-landing-page/`), providing:

- **Hero section** with an embedded live iframe of the backend dashboard
- **Interactive Demo** section that calls backend APIs directly:
  - View account balances in real-time
  - Compose and inject payments into the mesh
  - Run gossip rounds and flush bridges
  - View the transaction ledger and event log
- Dark, industrial design matching the backend's aesthetic
- API proxied through Next.js rewrites (no CORS issues)

```bash
cd offline-upi-landing-page
npm install
npm run dev
# Opens at http://localhost:3000
```

---

## Testing

```bash
./mvnw test
```

| Test | What it proves |
|---|---|
| `encryptDecryptRoundTrip` | Hybrid encryption is symmetric — encrypt + decrypt returns original |
| `tamperedCiphertextIsRejected` | Flipping one byte → `INVALID`, not a crash or settlement |
| `singlePacketDeliveredByThreeBridgesSettlesExactlyOnce` | 3 threads, 1 packet, simultaneous delivery → exactly 1 SETTLED, 2 DUPLICATE_DROPPED |

---

## Production Roadmap

| Component | Demo | Production |
|---|---|---|
| **Database** | H2 in-memory | PostgreSQL / MySQL with replicas |
| **Idempotency** | `ConcurrentHashMap` | Redis `SET NX EX` with cluster |
| **Key Management** | RSA keypair on startup | AWS KMS / HashiCorp Vault HSM |
| **Mobile Client** | Server-side `DemoService` | Android Kotlin, iOS Swift |
| **Mesh Transport** | In-process simulator | BLE GATT / Wi-Fi Direct |
| **Settlement** | Demo ledger | NPCI / bank core integration |
| **Auth** | None | mTLS + bridge-node certificates |
| **KYC** | Hardcoded accounts | Real KYC'd users, real VPAs |
| **Rate Limiting** | None | Per-bridge + per-sender velocity |
| **Observability** | Console logs | Structured logs → SIEM, alerts |
| **Frontend** | Thymeleaf + Next.js | Production SPA |

---

## Limitations

1. **No offline fund verification** — The receiver cannot verify sender has funds until settlement. Real offline UPI (UPI Lite) uses pre-funded hardware-backed wallets.

2. **Double-spend risk** — With ₹500 in account, a sender could send ₹500 to two different receivers offline. First settlement wins, second is rejected.

3. **BLE is hard on mobile** — Android throttles background BLE since Android 8. iOS peripheral mode is locked down. Real deployment needs OS-level cooperation.

4. **Metadata privacy** — Strangers carry encrypted packets. Ciphertext is unreadable, but packet existence is metadata that regulators may care about.

> **Honest naming:** This is a **"mesh-routed deferred settlement"** system, not real-time offline UPI. The cryptography and idempotency are production-quality engineering; the transport and settlement infrastructure are not.

---

## License

MIT License — see [LICENSE](LICENSE)

---

<p align="center">
  Built by <a href="https://github.com/Aaditya022">Aaditya</a>
  <br/>
  <sub>Offline UPI — Because connectivity shouldn't decide access to money.</sub>
</p>
