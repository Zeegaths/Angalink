import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";

export const ESCROW_PROGRAM_ID = new PublicKey("CDZRgr2xPTYD2HBoEEpZkE1uxdijwwT7DcABrmrCiChk");
export const CREDITS_PROGRAM_ID = new PublicKey("DJ27ho3n3tZLjxGbnH1fV83TybErnR3MoizNdL1EkWaV");
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

// Derive booking PDA
export function getBookingPda(builderKey: PublicKey, flightId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("booking"), builderKey.toBuffer(), Buffer.from(flightId)],
    ESCROW_PROGRAM_ID
  );
}

// Derive builder credit PDA
export function getBuilderPda(walletKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("builder"), walletKey.toBuffer()],
    CREDITS_PROGRAM_ID
  );
}

// Check if a builder account exists on-chain
export async function getBuilderAccount(
  connection: Connection,
  walletKey: PublicKey
): Promise<{ totalScore: number; tier: string; discountBps: number } | null> {
  try {
    const [pda] = getBuilderPda(walletKey);
    const accountInfo = await connection.getAccountInfo(pda);
    if (!accountInfo) return null;

    // Parse the account data manually
    // Layout: discriminator(8) + wallet(32) + total_score(8) + tier(1) + ...
    const data = accountInfo.data;
    const totalScore = Number(data.readBigUInt64LE(40));
    const tierByte = data[48];
    const tier = tierByte === 2 ? "CORE" : tierByte === 1 ? "BUILDER" : "COMMUNITY";
    const discountBps = tierByte === 2 ? 8000 : tierByte === 1 ? 5000 : 2500;

    return { totalScore, tier, discountBps };
  } catch {
    return null;
  }
}
