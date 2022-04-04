import { FC, useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import {
  Block,
  Link,
  DataTable,
  DataTableRow,
  Text,
} from '@lidofinance/lido-ui';
import Tabs from 'components/tabs';
import Wallet from 'components/wallet';
import Section from 'components/section';
import Layout from 'components/layout';
import Faq from 'components/faq';
import { FAQItem, getFaqList } from 'lib/faqList';
import { useContractSWR, useSDK } from '@lido-sdk/react';
import { useLidoMaticRPC, useMaticTokenWeb3 } from 'hooks';
import Stake from 'components/stake';
import Unstake from 'components/unstake';
import Claim from 'components/claim';
import { formatBalance } from 'utils';
import { SCANNERS, LIDO_MATIC_BY_NETWORK } from 'config';

interface HomeProps {
  faqList: FAQItem[];
}

const Home: FC<HomeProps> = ({ faqList }) => {
  const { chainId } = useSDK();
  const maticTokenWeb3 = useMaticTokenWeb3();
  const lidoMaticRPC = useLidoMaticRPC();
  const [selectedTab, setSelectedTab] = useState('STAKE');
  const [symbol, setSymbol] = useState('MATIC');

  const [stakers, setStakers] = useState();
  const [apr, setApr] = useState();
  const [price, setPrice] = useState(0);

  maticTokenWeb3?.symbol().then(setSymbol);

  const totalTokenStaked = useContractSWR({
    contract: lidoMaticRPC,
    method: 'getTotalPooledMatic',
  });

  useEffect(() => {
    fetch('api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStakers(data.stakers);
        setApr(data.apr);
        setPrice(data.price);
      });
  }, []);

  return (
    <Layout
      title="Lido on Polygon"
      subtitle="Stake Matic and receive stMatic while staking."
    >
      <Tabs
        options={['STAKE', 'UNSTAKE', 'CLAIM']}
        selected={selectedTab}
        onSelectTab={setSelectedTab}
      />
      <Wallet />
      {selectedTab === 'STAKE' ? <Stake /> : null}
      {selectedTab === 'UNSTAKE' ? (
        <Unstake changeTab={setSelectedTab} />
      ) : null}
      {selectedTab === 'CLAIM' ? <Claim changeTab={setSelectedTab} /> : null}
      <Section
        title="Lido statistics"
        headerDecorator={
          <Link
            href={`${SCANNERS[chainId]}token/${LIDO_MATIC_BY_NETWORK[chainId]}`}
          >
            View on Etherscan
          </Link>
        }
      >
        <Block>
          <DataTable title="Lido">
            <DataTableRow title="Annual percentage rate" loading={!apr}>
              <Text style={{ color: '#53BA95' }} size="xs">
                {`${apr}%`}
              </Text>
            </DataTableRow>
            <DataTableRow
              title="Total staked with Lido"
              loading={totalTokenStaked.initialLoading}
            >
              {formatBalance(totalTokenStaked.data)} {symbol}
            </DataTableRow>

            <DataTableRow title="Stakers" loading={!stakers}>
              {chainId != 1 ? 'TBD' : stakers}
            </DataTableRow>

            <DataTableRow
              title="stMATIC market cap"
              loading={totalTokenStaked.initialLoading && price !== 0}
            >
              {`$ ${Number(formatBalance(totalTokenStaked.data)) * price}`}
            </DataTableRow>
          </DataTable>
        </Block>
      </Section>
      <Faq faqList={faqList} />
    </Layout>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // list of .md files from /faq/
  const fileList = [
    'lido-polygon',
    'how-does-it-work',
    'liquid-staking',
    'stMatic',
    'requesting-withdraw',
    'ldo',
    'fees',
  ];
  const faqList = await getFaqList(fileList);

  return { props: { faqList } };
};
