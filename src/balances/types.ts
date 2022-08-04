import { TransactionFromNode } from '@waves/ts-types';
import { NetworkName } from 'networks/types';

export interface AssetBalance {
  balance: string;
  sponsorBalance: string;
  minSponsoredAssetFee: string | null;
}

export interface BalancesItem {
  aliases: unknown[];
  assets: Record<string, AssetBalance>;
  available: string;
  leasedOut: string;
  network: NetworkName;
  nfts: unknown[];
  txHistory: TransactionFromNode[];
}
