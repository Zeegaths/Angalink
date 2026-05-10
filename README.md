# Angalink
### Fly Further. Build More.
**Version:** 1.0.0 (Hackathon Release)
**Stack:** Solana · Anchor · Next.js · Node.js · PostgreSQL · Neon

---

## What is Angalink?

Angalink is a per-seat charter booking platform built on Solana for the global builder economy. Builders earn ANGA travel credits through verifiable on-chain and off-chain contributions — and redeem them for discounted flights to conferences, hackathons, and builder hubs across emerging markets worldwide.

Smart contracts hold booking funds in escrow and release automatically when flight departure is confirmed by an oracle. No intermediaries. No trust required.

**The problem it solves**

We had to fundraise to attend Solana Breakpoint. That should never happen again. Every builder who ships consistently — whether they win or not — deserves to move. Angalink closes the gap between ecosystem contribution and physical presence.

**You do not have to win to fly cheaper. You just have to show up.**

---

## Key Features

1. **On-chain escrow** — Funds are locked on booking and released to the operator when departure is confirmed. Refunded automatically if the flight is cancelled.
2. **Full contribution graph** — Scores are built from wins, submissions, open source commits, deployed programs, governance votes, and event attendance. Not just winners.
3. **Three builder tiers** — Community (25% off), Builder (50% off), Core (80% off).
4. **Conference routes** — Automatic discount gates when Solana events are announced.
5. **Autonomous booking agent** — Compatible with OpenClaw skill.md. Any agent can find routes, check credits, and book seats.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contracts | Rust, Anchor |
| Blockchain | Solana Devnet |
| Frontend | Next.js, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Wallet | Solana Wallet Adapter |
| Indexer | Solana RPC, GitHub API, Superteam Earn |

---

## Project Structure

```
angalink/
├── contracts/
│   ├── angalink-escrow/        # Booking escrow program (Anchor)
│   └── angalink-credits/       # Builder credit and tier program (Anchor)
├── frontend/                   # Next.js app
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── routes/             # Route explorer
│   │   ├── book/[routeId]/     # Booking and escrow flow
│   │   └── dashboard/          # Builder credit dashboard
│   ├── components/
│   │   ├── BottomNav.tsx       # Mobile navigation
│   │   └── WalletProviderWrapper.tsx
│   └── lib/
│       ├── anchor.ts           # Program IDs and PDA helpers
│       └── escrow.ts           # Transaction builder
├── backend/                    # Express API
│   ├── src/
│   │   ├── api/                # Routes, bookings, credits, oracle endpoints
│   │   ├── indexer/            # Multi-source contribution indexer
│   │   └── oracle/             # Flight confirmation submitter
│   └── prisma/
│       ├── schema.prisma       # Database schema
│       └── seed.ts             # Demo route seeder
└── agent/                      # Autonomous booking agent (skill.md)
```

---

## Deployed Contracts

| Program | Address | Network |
|---|---|---|
| angalink-escrow | `CDZRgr2xPTYD2HBoEEpZkE1uxdijwwT7DcABrmrCiChk` | Solana Devnet |
| angalink-credits | `DJ27ho3n3tZLjxGbnH1fV83TybErnR3MoizNdL1EkWaV` | Solana Devnet |

---

## Contribution Scoring Model

Angalink scores builders across multiple signal sources. Winning is not required. Consistency and participation are rewarded equally.

**Activity sources and point weights**

| Activity | Points | Source |
|---|---|---|
| Hackathon win or placement | 75 | On-chain payment from ecosystem treasury |
| Grant approved | 50 | On-chain payment from ecosystem treasury |
| Deployed Solana program | 15 | Solana RPC |
| Hackathon submission | 25 | Colosseum / Superteam |
| Event attendance NFT | 8 | On-chain NFT check |
| Bounty win | 10 | On-chain payment |
| Governance vote | 5 | On-chain |
| GitHub commit to ecosystem repo | 2 | GitHub API |
| Bounty submission | 3 | Superteam Earn profile |
| Protocol interaction | 2 | Solana RPC |

**Builder tiers**

| Tier | Min Score | Discount | Who qualifies |
|---|---|---|---|
| Community | 1 | 25% | Anyone active in the ecosystem |
| Builder | 50 | 50% | Consistent shippers, with or without wins |
| Core | 200 | 80% | Significant long-term contributors |

**Data sources**

1. Solana RPC — deployed programs, on-chain payments, governance votes, protocol interactions (live)
2. Superteam Earn — on-chain payment verification for bounty and grant payouts (live)
3. GitHub API — commits to Solana ecosystem repos (planned)
4. Colosseum — hackathon submissions and placements (planned)
5. Superteam Earn OAuth — direct profile connection once API access is available (in discussion with Superteam)
6. On-chain NFT check — event attendance badges and proof-of-participation tokens (planned)

---

## Installation

**Prerequisites**

1. Node.js 20+
2. Rust 1.85+
3. Solana CLI 1.18+
4. Anchor CLI 0.30+
5. PostgreSQL or a Neon account

**Clone the repository**

```bash
git clone https://github.com/your-org/angalink.git
cd angalink
```

**Set up the backend**

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, ORACLE_ADMIN_SECRET, and program IDs
npm install
npx prisma migrate dev --name init
npm run dev
```

**Set up the frontend**

```bash
cd frontend
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL and NEXT_PUBLIC_RPC_URL
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Environment Variables

**backend/.env**

```
DATABASE_URL=postgresql://user:password@host/angalink
ORACLE_ADMIN_SECRET=your-secret-here
PORT=3001
FRONTEND_URL=http://localhost:3000
RPC_URL=https://api.devnet.solana.com
ESCROW_PROGRAM_ID=CDZRgr2xPTYD2HBoEEpZkE1uxdijwwT7DcABrmrCiChk
CREDITS_PROGRAM_ID=DJ27ho3n3tZLjxGbnH1fV83TybErnR3MoizNdL1EkWaV
```

**frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

---

## How It Works

**1. Builder connects wallet**

The indexer pulls their on-chain activity — deployed programs, ecosystem payments received, governance votes, protocol interactions — and combines it with signals from GitHub and Superteam Earn. Everything normalizes into a single ANGA credit score. A builder who submitted ten bounties without winning scores higher than someone who never shipped anything.

**2. Credit tiers are assigned automatically**

Tiers update in real time as the indexer runs. The discount is applied at checkout before the builder signs the transaction — no manual claiming, no coupon codes.

**3. Builder books a seat**

The frontend builds an escrow transaction, sends it to the builder's wallet for signing, and waits for on-chain confirmation before recording the booking.

**4. Flight departs**

The oracle backend calls `confirm_departure` on the escrow contract. Funds release to the operator automatically. If the flight is cancelled, `refund_booking` returns funds to the builder with no manual intervention.

---

## API Reference

**GET /routes**

Returns all available routes with seats remaining.

```bash
curl http://localhost:3001/routes
```

**GET /credits/:wallet**

Returns a builder's credit score, tier, discount, and full activity history.

```bash
curl http://localhost:3001/credits/YOUR_WALLET_ADDRESS
```

**POST /credits/verify**

Triggers a fresh index of a wallet's contribution history.

```bash
curl -X POST http://localhost:3001/credits/verify \
  -H "Content-Type: application/json" \
  -d '{"wallet": "YOUR_WALLET_ADDRESS"}'
```

**POST /bookings**

Records a booking after the on-chain escrow transaction confirms.

```bash
curl -X POST http://localhost:3001/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "onchainPubkey": "tx_signature_here",
    "builderWallet": "wallet_address",
    "routeId": "route_id",
    "seatCount": 1,
    "grossAmountUsdc": 70,
    "discountBps": 2500,
    "netAmountUsdc": 52.5,
    "flightId": "NBO-EBB-1234567890"
  }'
```

**POST /oracle/confirm**

Confirms flight departure and triggers fund release. Authorized callers only.

```bash
curl -X POST http://localhost:3001/oracle/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "NBO-EBB-1234567890",
    "adminSecret": "your-secret-here"
  }'
```

---

## Demo Routes

| Route | Origin | Destination | Type |
|---|---|---|---|
| NBO-EBB | Nairobi | Kampala | Standard |
| NBO-LOS | Nairobi | Lagos | Conference |

---

## Troubleshooting

**Routes show 0 SOL**

The base price is too low for the SOL conversion rate. Reset it:

```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.route.updateMany({ data: { basePriceUsdc: 70 } })
  .then(() => console.log('Updated to 70 USDC = 0.5 SOL'))
  .finally(() => prisma.\$disconnect());
"
```

**Transaction reverted during simulation**

Your Phantom wallet does not have enough devnet SOL. Go to `https://faucet.solana.com`, paste your wallet address, select Devnet, and request 2 SOL.

**Backend shows EADDRINUSE**

Port 3001 is already in use:

```bash
pkill -f "ts-node-dev"
cd backend && npm run dev
```

**Anchor build fails with source_file error**

Rust version mismatch. Use Rust 1.85:

```bash
rustup default 1.85.0
cargo clean
cargo build-sbf
```

---

## Roadmap

**Phase 1 — Foundation (Months 1 to 3)**

1. Real oracle integration via Flightradar24 API
2. GitHub indexer for ecosystem repo contributions
3. On-chain payment indexer for Superteam treasury verification
4. Colosseum submission indexing
5. Operator onboarding dashboard
6. Solana Mobile (Seeker) app

**Phase 2 — Network (Months 4 to 6)**

1. Superteam Earn OAuth integration
2. Event attendance NFT verification
3. Conference route program — automatic route creation when Solana events are announced
4. Operator network expansion across East Africa, Southeast Asia, and Latin America
5. Credit delegation — builders can gift credits to teammates

**Phase 3 — Scale (Months 7 to 12)**

1. Community governance over credit weights and tier thresholds
2. Charter operator DAO
3. Cross-ecosystem credit imports from Ethereum and Base
4. Open source the scoring engine so any ecosystem can plug in their own data sources
5. Global expansion beyond Solana — any on-chain contribution graph feeds the score

---

## Contributing

Pull requests are welcome. For major changes please open an issue first.

---

## License

MIT

---

