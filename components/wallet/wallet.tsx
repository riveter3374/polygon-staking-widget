import {
  WalletCard,
  WalletCardBalance,
  WalletCardRow,
  WalletCardAccount,
} from 'components/walletCard';
import { Divider, Text } from '@lidofinance/lido-ui';
import { useContractSWR, useSDK } from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import FormatToken from 'components/formatToken';
import { utils, BigNumber } from 'ethers';
import { formatBalance } from 'utils';
import FallbackWallet from 'components/fallbackWallet';
import { WalletComponent } from './types';
import {
  useLidoMaticRPC,
  useLidoMaticWeb3,
  useMaticTokenRPC,
  useMaticTokenWeb3,
} from 'hooks';
import { useState, useEffect } from 'react';

const Wallet: WalletComponent = (props) => {
  const { account } = useSDK();

  const stMaticTokenRPC = useLidoMaticRPC();
  const stMaticTokenWeb3 = useLidoMaticWeb3();
  const maticTokenRPC = useMaticTokenRPC();
  const maticTokenWeb3 = useMaticTokenWeb3();
  const maticBalance = useContractSWR({
    contract: maticTokenRPC,
    method: 'balanceOf',
    params: [account],
  });

  const stMaticBalance = useContractSWR({
    contract: stMaticTokenRPC,
    method: 'balanceOf',
    params: [account],
  });

  const [maticEquiv, setMaticEquiv] = useState<BigNumber>();
  const [maticSymbol, setMaticSymbol] = useState('MATIC');
  const [stMaticSymbol, setStMaticSymbol] = useState('stMATIC');
  const [apr, setApr] = useState();

  useEffect(() => {
    fetch('api/stats')
      .then((res) => res.json())
      .then((data) => {
        setApr(data.apr);
      });
  }, []);

  useEffect(() => {
    if (maticTokenWeb3) {
      maticTokenWeb3.symbol().then((res) => {
        setMaticSymbol(res);
      });
    }
    if (stMaticTokenWeb3) {
      stMaticTokenWeb3.symbol().then((res) => {
        setStMaticSymbol(res);
      });

      const amount = utils.parseUnits(
        formatBalance(stMaticBalance.data),
        'ether',
      );
      stMaticTokenWeb3.convertStMaticToMatic(amount).then(([res]) => {
        setMaticEquiv(res);
      });
    }
  }, [maticTokenWeb3, stMaticTokenWeb3, stMaticBalance.data]);

  return (
    <WalletCard {...props}>
      <WalletCardRow>
        <WalletCardBalance
          title="Available to stake"
          loading={maticBalance.loading}
          value={
            <FormatToken amount={maticBalance.data} symbol={maticSymbol} />
          }
        />
        <WalletCardAccount account={account} />
      </WalletCardRow>
      <Divider />
      <WalletCardRow>
        <WalletCardBalance
          small
          title="Staked amount"
          loading={stMaticBalance.initialLoading}
          value={
            <>
              <FormatToken
                amount={stMaticBalance.data}
                symbol={stMaticSymbol}
              />
            </>
          }
          extra={
            <>
              <FormatToken amount={maticEquiv} symbol={maticSymbol} approx />
            </>
          }
        />
        <WalletCardBalance
          small
          title="Lido APR"
          loading={!apr}
          value={
            <>
              <Text style={{ color: '#53BA95' }} size="xs">
                {`${apr}%`}
              </Text>
            </>
          }
        />
      </WalletCardRow>
    </WalletCard>
  );
};

const WalletWrapper: WalletComponent = (props) => {
  const { active } = useWeb3();
  return active ? <Wallet {...props} /> : <FallbackWallet {...props} />;
};

export default WalletWrapper;
