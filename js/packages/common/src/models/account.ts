import {
  AccountInfo,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';

import { AccountInfo as TokenAccountInfo, Token } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '../utils/ids';
import BufferLayout from 'buffer-layout';

export interface TokenAccount {
  pubkey: string;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}

export interface ParsedDataAccount {
  amount: number;
  rawAmount: string;
  parsedAssetAddress: string;
  parsedAccount: any;
  assetDecimals: number;
  assetIcon: any;
  name: string;
  symbol: string;
  sourceAddress: string;
  targetAddress: string;
}

export const ParsedDataLayout = BufferLayout.struct([
  BufferLayout.blob(32, 'amount'),
  BufferLayout.u8('toChain'),
  BufferLayout.blob(32, 'sourceAddress'),
  BufferLayout.blob(32, 'targetAddress'),
  BufferLayout.blob(32, 'assetAddress'),
  BufferLayout.u8('assetChain'),
  BufferLayout.u8('assetDecimals'),
  BufferLayout.seq(BufferLayout.u8(), 1), // 4 byte alignment because a u32 is following
  BufferLayout.u32('nonce'),
  BufferLayout.blob(1001, 'vaa'),
  BufferLayout.seq(BufferLayout.u8(), 3), // 4 byte alignment because a u32 is following
  BufferLayout.u32('vaaTime'),
  BufferLayout.u32('lockupTime'),
  BufferLayout.u8('pokeCounter'),
  BufferLayout.blob(32, 'signatureAccount'),
  BufferLayout.u8('initialized'),
]);

export function approve(
  instructions: TransactionInstruction[],
  cleanupInstructions: TransactionInstruction[],
  account: PublicKey,
  owner: PublicKey,
  amount: number,
  // Note: This auto revoke cause error so turn off it temporarily
  autoRevoke = false,

  // if delegate is not passed ephemeral transfer authority is used
  delegate?: PublicKey,
  existingTransferAuthority?: Keypair,
): Keypair {
  const tokenProgram = TOKEN_PROGRAM_ID;

  const transferAuthority = existingTransferAuthority || Keypair.generate();
  //const delegateKey = delegate ?? transferAuthority.publicKey;

  instructions.push(
    Token.createApproveInstruction(
      tokenProgram,
      account,
      delegate ?? transferAuthority.publicKey,
      owner,
      [],
      amount,
    ),
  );

  if (autoRevoke) {
    cleanupInstructions.push(
      Token.createRevokeInstruction(tokenProgram, account, owner, []),
    );
  }

  return transferAuthority;
}
