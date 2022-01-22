import { PublicKey, AccountInfo } from '@solana/web3.js';

export type StringPublicKey = string;

export class LazyAccountInfoProxy<T> {
  executable: boolean = false;
  owner: StringPublicKey = '';
  lamports: number = 0;

  get data() {
    //
    return undefined as unknown as T;
  }
}

export interface LazyAccountInfo {
  executable: boolean;
  owner: StringPublicKey;
  lamports: number;
  data: [string, string];
}

const PubKeysInternedMap = new Map<string, PublicKey>();

export const toPublicKey = (key: string | PublicKey) => {
  if (typeof key !== 'string') {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};

export const pubkeyToString = (key: PublicKey | null | string = '') => {
  return typeof key === 'string' ? key : key?.toBase58() || '';
};

export interface PublicKeyStringAndAccount<T> {
  pubkey: string;
  account: AccountInfo<T>;
}

const use_custom_store = true;

export const WRAPPED_SOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const BPF_UPGRADE_LOADER_ID = new PublicKey(
  'BPFLoaderUpgradeab1e11111111111111111111111',
);

export const MEMO_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);

export const METADATA_PROGRAM_ID = use_custom_store
  ? ('3up4i565pbxRkLh5EiJeqLXvfwAK6gcPc2ccKULwby6H' as StringPublicKey)
  : ('metaMoxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as StringPublicKey);

export const VAULT_ID = use_custom_store
  ? ('6qs3VSQiwizCrbjAnDKF2JvRYjuGoQxd3tHHJEYv4o2K' as StringPublicKey)
  : ('vau1MoA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn' as StringPublicKey);

export const AUCTION_ID = use_custom_store
  ? ('qMR7hgRxHPFrAjtQpzo6a4pUZycnjqrL9gAfQHdS4RC' as StringPublicKey)
  : ('auctMoXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8' as StringPublicKey);

export const METAPLEX_ID = use_custom_store
  ? ('CypKQ9LpDD9xeq29RzSAbu918h9x1fPfGXsJ7SVviEn3' as StringPublicKey)
  : ('p1exMoJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98' as StringPublicKey);

// It is not used in store
export const PACK_CREATE_ID = new PublicKey(
  'packFeFNZzMfD9aVWL7QbGz1WcU7R9zpf6pvNsw2BLu',
);

export const ORACLE_ID = new PublicKey(
  'rndshKFf48HhGaPbaCd3WQYtgCNKzRgVQ3U2we4Cvf9',
);

export const SYSTEM = new PublicKey('11111111111111111111111111111111');
