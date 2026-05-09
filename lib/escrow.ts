import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getBookingPda, ESCROW_PROGRAM_ID } from "./anchor";

const SOL_PRICE = 140;

export async function buildBookingTransaction(
  connection: Connection,
  builderKey: PublicKey,
  operatorKey: PublicKey,
  routeId: string,
  seatCount: number,
  netAmountUsdc: number,
  discountBps: number,
  flightId: string
): Promise<Transaction> {
  const [bookingPda] = getBookingPda(builderKey, flightId);

  // Convert USDC amount to lamports via SOL price
  const solAmount = netAmountUsdc / SOL_PRICE;
  const lamports = Math.round(solAmount * LAMPORTS_PER_SOL);

  // For the hackathon demo we use a SOL transfer to the PDA as the escrow
  // Full Anchor instruction wiring requires the IDL — this is the working demo path
  const tx = new Transaction();

  // Transfer SOL to booking PDA as escrow
  tx.add(
    SystemProgram.transfer({
      fromPubkey: builderKey,
      toPubkey: bookingPda,
      lamports,
    })
  );

  tx.feePayer = builderKey;
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  return tx;
}
