import { Money } from '@waves/data-entities';
import { AssetDetail } from 'assets/types';
import { MessageStoreItem } from 'messages/types';
import { PreferencesAccount } from 'preferences/types';
import { ComponentType } from 'react';
import { IMoneyLike } from 'ui/utils/converters';
import { PackageItem } from './Package/parseTx';

export interface MessageComponentProps {
  className?: string;
  txType: string;
  autoClickProtection?: boolean;
  pending?: boolean;
  collapsed?: boolean;
  txHash: string | string[];
  assets: Record<string, AssetDetail>;
  message: MessageStoreItem;
  selectedAccount: Partial<PreferencesAccount>;

  onClose: (...args: unknown[]) => void;
  onNext: (...args: unknown[]) => void;
  onList: (...args: unknown[]) => void;
  approve: (
    e: { preventDefault: () => void } | null | undefined,
    params?: {
      notifyPermissions?: {
        origin: string | undefined;
        canUse: boolean;
      } | null;
      approvePermissions?: {
        origin: string | undefined;
        params: Partial<{
          type: 'allowAutoSign';
          totalAmount: string | null;
          interval: number | null;
          approved?: unknown[];
        }>;
      } | null;
    }
  ) => void;
  reject: (...args: unknown[]) => void;
  rejectForever: (...args: unknown[]) => void;
  selectAccount: () => void;
}

export interface MessageCardComponentProps {
  assets: Record<string, AssetDetail>;
  className?: string;
  collapsed?: boolean;
  message: MessageStoreItem;
}

export interface MessageFinalComponentProps {
  isApprove: boolean;
  isReject: boolean;
  isSend: boolean | undefined;
  message: MessageStoreItem;
  assets: Record<string, AssetDetail>;
}

export interface MessageConfig {
  type: string;
  message: ComponentType<MessageComponentProps>;
  card: ComponentType<MessageCardComponentProps>;
  final: ComponentType<MessageFinalComponentProps>;
  isMe: (tx: { type?: unknown }, type: string | null) => boolean;
  messageType: string;
  getAmount?: (
    tx: AssetDetail & {
      amount?: string | IMoneyLike;
      assetId: string;
      decimals?: number;
      quantity: string;
      lease?: { amount: string };
    },
    item: unknown
  ) => IMoneyLike | Money;
  getAmounts?: (tx: { payment?: IMoneyLike[] }) => IMoneyLike[];
  getAmountSign: (tx: { orderType?: unknown }) => '-' | '+' | '';
  getAssetsId: (
    tx: PackageItem[] & {
      fee?: { assetId?: string };
      feeAssetId?: string;
    }
  ) => string[];
  getFee: (tx: {
    fee?: IMoneyLike | string;
    matcherFee?: IMoneyLike | string;
  }) => IMoneyLike;
}