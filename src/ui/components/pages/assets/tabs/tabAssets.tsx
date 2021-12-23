import * as styles from '../../styles/assets.styl';
import { icontains } from '../helpers';
import { Trans } from 'react-i18next';
import { AssetItem } from '../assetItem';
import { Asset, Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import * as React from 'react';
import { SearchInput } from '../../Assets';
import { useAppSelector } from '../../../../store';
import { TabPanel } from '../../../ui';
import { CARD_FULL_HEIGHT, sortAssetEntries, useAssetFilter } from './helpers';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { BalanceAssets } from '../../../../reducers/updateState';
import { Tooltip } from '../../../ui/tooltip';
import cn from 'classnames';

const Row = ({ data, index, style }) => {
  const { assetEntries, assets, onInfoClick, onSendClick } = data;
  const [assetId, { balance }] = assetEntries[index];
  return (
    <div style={style}>
      <AssetItem
        balance={
          assets[assetId] &&
          new Money(new BigNumber(balance), new Asset(assets[assetId]))
        }
        assetId={assetId}
        onInfoClick={onInfoClick}
        onSendClick={onSendClick}
      />
    </div>
  );
};

const PLACEHOLDERS = [...Array(4).keys()].map<[number, BalanceAssets[string]]>(
  key => [
    key,
    {
      balance: '0',
      sponsorBalance: '0',
      minSponsoredAssetFee: '0',
    },
  ]
);

interface Props {
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}

export function TabAssets({ onInfoClick, onSendClick }: Props) {
  const assets = useAppSelector(state => state.assets);
  const showSuspiciousAssets = useAppSelector(
    state => state.uiState?.showSuspiciousAssets
  );
  const address = useAppSelector(state => state.selectedAccount.address);
  const myAssets = useAppSelector(state => state.balances[address]?.assets);

  const {
    term: [term, setTerm],
    onlyMy: [onlyMy, setOnlyMy],
    onlyFavorites: [onlyFav, setOnlyFav],
    clearFilters,
  } = useAssetFilter();

  const assetEntries = myAssets
    ? sortAssetEntries(
        Object.entries(myAssets).filter(
          ([assetId]) =>
            (!onlyFav || assets[assetId]?.isFavorite === onlyFav) &&
            (!onlyMy || assets[assetId]?.issuer === address) &&
            (!term ||
              assetId === term ||
              icontains(assets[assetId]?.displayName, term))
        ),
        assets,
        showSuspiciousAssets
      )
    : PLACEHOLDERS;

  return (
    <TabPanel className={styles.assetsPanel}>
      <div className={styles.filterContainer}>
        <SearchInput
          value={term ?? ''}
          onInput={e => setTerm(e.target.value)}
          onClear={() => setTerm('')}
        />
        <Tooltip content={<Trans i18nKey="assets.onlyFavorites" />}>
          {props => (
            <div
              className={styles.filterBtn}
              onClick={() => setOnlyFav(!onlyFav)}
              {...props}
            >
              <svg
                className={styles.filterBtnIcon}
                fill={onlyFav ? 'var(--color-submit400)' : 'none'}
                stroke={
                  onlyFav ? 'var(--color-submit400)' : 'var(--color-basic500)'
                }
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M10.6472 6.66036L10.7648 6.9373L11.0645 6.96315L15.2801 7.32666L12.0848 10.0999L11.8574 10.2972L11.9254 10.5904L12.8808 14.7108L9.25837 12.5244L9 12.3685L8.74163 12.5244L5.12113 14.7096L6.08193 10.5911L6.15049 10.2972L5.92239 10.0996L2.72308 7.32803L6.93477 6.97071L7.2352 6.94522L7.35286 6.66761L9.00035 2.78048L10.6472 6.66036Z" />
              </svg>
            </div>
          )}
        </Tooltip>

        <Tooltip content={<Trans i18nKey="assets.onlyMyAssets" />}>
          {props => (
            <div
              className={styles.filterBtn}
              onClick={() => setOnlyMy(!onlyMy)}
              {...props}
            >
              <svg
                className={styles.filterBtnIcon}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  fill="var(--color-submit-400)"
                  // fill={onlyMy ? 'var(--color-submit400)' : 'var(--color-basic500)'}
                  fillOpacity=".01"
                  d="M0 0h14v14H0z"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
                  fill={
                    onlyMy ? 'var(--color-submit400)' : 'var(--color-basic500)'
                  }
                />
              </svg>
            </div>
          )}
        </Tooltip>
      </div>

      {assetEntries.length === 0 ? (
        <div className={cn('basic500 center margin-min-top', styles.tabInfo)}>
          {term || onlyMy || onlyFav ? (
            <>
              <div className="margin-min">
                <Trans i18nKey="assets.notFoundAssets" />
              </div>
              <p className="blue link" onClick={() => clearFilters()}>
                <Trans i18nKey="assets.resetFilters" />
              </p>
            </>
          ) : (
            <Trans i18nKey="assets.emptyAssets" />
          )}
        </div>
      ) : (
        <div className={styles.assetList}>
          <AutoSizer>
            {({ height, width }) => {
              return (
                <List
                  height={height}
                  width={width}
                  itemCount={assetEntries.length}
                  itemSize={CARD_FULL_HEIGHT}
                  itemData={{ assetEntries, assets, onInfoClick, onSendClick }}
                  itemKey={(index, itemData) =>
                    `${itemData.assetEntries[index][0]}:${
                      assets[itemData.assetEntries[index][0]]?.isFavorite
                    }`
                  }
                >
                  {Row}
                </List>
              );
            }}
          </AutoSizer>
        </div>
      )}
    </TabPanel>
  );
}