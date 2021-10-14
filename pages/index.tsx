import { FC, FormEventHandler, useState } from 'react';
import { GetServerSideProps } from 'next';
import {
  Block,
  Link,
  DataTable,
  DataTableRow,
  Input,
  Steth,
  Button,
  Stack,
} from '@lidofinance/lido-ui';
import Head from 'next/head';
import Switch from 'components/switch';
import Wallet from 'components/wallet';
import Section from 'components/section';
import Layout from 'components/layout';
import Faq from 'components/faq';
import { FAQItem, getFaqList } from 'lib/faqList';
import styled from 'styled-components';
import { useContractSWR, useSTETHContractRPC } from '@lido-sdk/react';

interface HomeProps {
  faqList: FAQItem[];
}

const InputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

const Home: FC<HomeProps> = ({ faqList }) => {
  const handleSubmit: FormEventHandler<HTMLFormElement> | undefined = (e) => {
    e.preventDefault();
    alert('Submitted');
  };

  const contractRpc = useSTETHContractRPC();
  const tokenName = useContractSWR({
    contract: contractRpc,
    method: 'name',
  });
  const [isToggled, setIsToggled] = useState(false);

  return (
    <Layout
      title="Lido Frontend Template"
      subtitle="Develop Lido Apps without hassle"
    >
      <Head>
        <title>Lido | Frontend Template</title>
      </Head>
      <Switch
        optionOne={'STAKE'}
        optionTwo={'WITHDRAW'}
        isToggled={isToggled}
        onToggle={() => setIsToggled(!isToggled)}
      />
      <Wallet />
      {isToggled ? (
        <Block>
          <form action="" method="post" onSubmit={handleSubmit}>
            <InputWrapper>
              <Input
                fullwidth
                placeholder="0"
                leftDecorator={<Steth />}
                label="Token amount"
              />
            </InputWrapper>
            <Stack justify="space-around">
              <Button type="submit">Withdraw</Button>
              <Button type="submit" color="success">
                Claim
              </Button>
            </Stack>
          </form>
        </Block>
      ) : (
        <Block>
          <form action="" method="post" onSubmit={handleSubmit}>
            <InputWrapper>
              <Input
                fullwidth
                placeholder="0"
                leftDecorator={<Steth />}
                label="Token amount"
              />
            </InputWrapper>
            <Button fullwidth type="submit">
              Submit
            </Button>
          </form>
        </Block>
      )}
      <Section title="Data table" headerDecorator={<Link href="#">Link</Link>}>
        <Block>
          <DataTable>
            <DataTableRow title="Token name" loading={tokenName.initialLoading}>
              {tokenName.data}
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
  const fileList = ['lido-frontend-template'];
  const faqList = await getFaqList(fileList);

  return { props: { faqList } };
};
