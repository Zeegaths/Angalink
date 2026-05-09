# Angalink
### Fly Further. Build More.
**Version:** 1.0.0 (Hackathon Release)
**Stack:** Solana · Anchor · Next.js · Node.js · PostgreSQL · Neon

---

## What is Angalink?

Angalink is a per-seat charter booking platform built on Solana for the global builder economy. Builders earn ANGA travel credits through verifiable on-chain contributions — completed bounties, hackathon submissions, grant milestones — and redeem them for discounted flights to conferences, hackathons, and builder hubs across emerging markets.

Smart contracts hold booking funds in escrow and release automatically when flight departure is confirmed by an oracle. No intermediaries. No trust required. The more you build for the ecosystem, the cheaper it becomes to move.

**The problem it solves**

We had to fundraise to attend Solana Breakpoint. That should never happen. Angalink closes the gap between ecosystem contribution and physical presence.

---

## Key Features

1. **On-chain escrow** — Funds are locked on booking and released to the operator when departure is confirmed. Refunded automatically if the flight is cancelled.
2. **Contribution indexer** — Pulls verified activity from Superteam Earn and normalizes it into ANGA credit scores.
3. **Three builder tiers** — Community (25% off), Builder (50% off), Core (80% off).
4. **Conference routes** — Automatic discount gates when Solana events are announced.
5. **Autonomous booking agent** — Compatible with OpenClaw `skill.md`. Any agent can find routes, check credits, and book seats.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contracts | Rust, Anchor |
| Blockchain | Solana (Devnet) |
| Frontend | Next.js, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Wallet | Solana Wallet Adapter |
| Indexer | Superteam Earn API |

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
│   │   ├── indexer/            # Superteam Earn activity indexer
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

## Installation

**Prerequisites**

1. Node.js 20+
2. Rust 1.85+
3. Solana CLI 1.18+
4. Anchor CLI 0.30+
5. PostgreSQL (or a Neon account)

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
node -e "require('./prisma/seed')"
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

The indexer pulls their Superteam Earn activity and normalizes it into a credit score. Scores are stored on-chain via the `angalink-credits` program.

**2. Credit tiers are assigned automatically**

| Tier | Min Score | Discount |
|---|---|---|
| Community | 1 | 25% |
| Builder | 50 | 50% |
| Core | 200 | 80% |

**3. Builder books a seat**

The frontend builds an escrow transaction, sends it to the builder's wallet for signing, and waits for on-chain confirmation before recording the booking.

**4. Flight departs**

The oracle backend calls `confirm_departure` on the escrow contract. Funds are released to the operator automatically. If the flight is cancelled, `refund_booking` returns funds to the builder.

---

## API Reference

**GET /routes**

Returns all available routes with seats remaining.

```bash
curl http://localhost:3001/routes
```

**GET /credits/:wallet**

Returns a builder's credit score, tier, discount, and activity history.

```bash
curl http://localhost:3001/credits/59dj5oBdzRdGpUBjaigr8eh6S1ePKc7eHjZyBrR4LekR
```

**POST /bookings**

Records a booking after on-chain escrow transaction confirms.

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

Confirms flight departure and triggers fund release (authorized only).

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

Two routes are seeded for testing:

| Route | Origin | Destination | Type |
|---|---|---|---|
| NBO-EBB | Nairobi | Kampala | Standard |
| NBO-LOS | Nairobi | Lagos | Conference |

---

## Troubleshooting

**Routes show 0 SOL**

The base price is set too low for the SOL conversion rate. Update via:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.route.updateMany({ data: { basePriceUsdc: 70 } })
  .then(() => console.log('Updated'))
  .finally(() => prisma.\$disconnect());
"
```

**Transaction reverted during simulation**

Your Phantom wallet does not have enough devnet SOL. Visit `https://faucet.solana.com`, paste your wallet address, and request 2 SOL on Devnet.

**Backend shows EADDRINUSE**

Port 3001 is already in use. Kill the existing process:

```bash
pkill -f "ts-node-dev"
```

**Anchor build fails with source_file error**

Your Rust version is incompatible with anchor-syn. Use Rust 1.85:

```bash
rustup default 1.85.0
cargo clean
cargo build-sbf
```

---

## Roadmap

Phase 1 — Foundation (Months 1 to 3)
1. Real oracle integration via Flightradar24 API
2. Operator onboarding and route management dashboard
3. Colosseum and on-chain activity indexing
4. Solana Mobile (Seeker) app

Phase 2 — Network (Months 4 to 6)
1. Conference route program — automatic route opening when Solana events are announced
2. Operator network expansion across East Africa, Southeast Asia, and Latin America
3. Credit delegation — builders can gift credits to teammates

Phase 3 — Scale (Months 7 to 12)
1. Community governance over credit weights and tier thresholds
2. Charter operator DAO
3. Cross-ecosystem credit imports from Ethereum and Base activity

---

## Contributing

Pull requests are welcome. For major changes please open an issue first to discuss what you would like to change.

---

## License

MIT

---

*Built at Solana Hackathon 2026 — Nairobi, Kenya*