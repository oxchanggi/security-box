export enum EWalletStatus {
  BOX = 'box',
  UNBOX = 'unbox',
}

export enum EWalletNetworkType {
  EVM = 'evm',
  SOLANA = 'solana',
  COSMOS = 'cosmos',
  CELESTIA = 'celestia',
  INJECTIVE = 'inj',
}

export enum ESolanaTransactionType {
  VERSIONED_TRANSACTION = 'versioned_transaction',
  LEGACY_TRANSACTION = 'legacy_transaction',
}

export enum EZksyncLiteTransactionType {
  TRANSFER = 'transfer',
  WITHDRAW_SYNC_TO_ETHEREUM = 'withdraw_sync_to_ethereum',
  SWAP = 'swap',
  ORDER = 'order',
  MINT_NFT = 'mintNFT',
  WITHDRAW_NFT = 'withdrawNFT',
  FORCED_EXIT = 'forced_exit',
}
