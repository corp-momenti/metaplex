import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Tabs, Dropdown, Menu } from 'antd';
import { useMeta } from '../../contexts';
import { CardLoader } from '../../components/MyLoader';

import { ArtworkViewState } from './types';
import { useItems } from './hooks/useItems';
import ItemCard from './components/ItemCard';
import { useUserAccounts } from '@oyster/common';
import { DownOutlined } from '@ant-design/icons';
import { isMetadata, isPack } from './utils';

const { TabPane } = Tabs;
const { Content } = Layout;

export const ArtworksView = () => {
  const { connected } = useWallet();
  const {
    isLoading,
    pullAllMetadata,
    storeIndexer,
    pullItemsPage,
    isFetching,
  } = useMeta();
  const { userAccounts } = useUserAccounts();

  const [activeKey, setActiveKey] = useState(ArtworkViewState.Metaplex);
  console.log( activeKey )

  const userItems = useItems({ activeKey });

  useEffect(() => {
    if (!isFetching) {
      pullItemsPage(userAccounts);
    }
  }, [isFetching]);

  // these lines always show owned list.
  // useEffect(() => {
  //   if (connected) {
  //     setActiveKey(ArtworkViewState.Owned);
  //   } else {
  //     setActiveKey(ArtworkViewState.Metaplex);
  //   }
  // }, [connected, setActiveKey]);

  const isDataLoading = isLoading || isFetching;

  const artworkGrid = (
    <div className="artwork-grid">
      {isDataLoading && [...Array(10)].map((_, idx) => <CardLoader key={idx} />)}
      {!isDataLoading &&
        userItems.map(item => {
          const pubkey = isMetadata(item)
            ? item.pubkey
            : isPack(item)
            ? item.provingProcessKey
            : item.edition?.pubkey || item.metadata.pubkey;

          return <ItemCard item={item} key={pubkey} />;
        })}
    </div>
  );

  const refreshButton = connected && storeIndexer.length !== 0 && (
    <Dropdown.Button
      className="refresh-button padding0"
      onClick={() => pullItemsPage(userAccounts)}
      icon={<DownOutlined />}
      overlayClassName="refresh-overlay"
      overlay={
        <Menu className="gray-dropdown">
          <Menu.Item onClick={() => pullAllMetadata()}>
            Load All Metadata
          </Menu.Item>
        </Menu>
      }
    >
      Refresh
    </Dropdown.Button>
  );

  return (
    <Layout style={{ margin: 0, marginTop: 30 }} id="items-tab">
      <Content style={{ display: 'flex', flexWrap: 'wrap' }} id="items-tabs">
        <Col style={{ width: '100%', marginTop: 10 }}>
          <Row>
            <Tabs
              activeKey={activeKey}
              onChange={key => setActiveKey(key as ArtworkViewState)}
              tabBarExtraContent={refreshButton}
            >
              <TabPane
                tab={<span className="tab-title" id="items-tab-all">&nbsp;</span>}
                key={ArtworkViewState.Metaplex}
              >
                {artworkGrid}
              </TabPane>
              {connected && (
                <TabPane
                  tab={<span className="tab-title" id="items-tab-owned">&nbsp;</span>}
                  key={ArtworkViewState.Owned}
                >
                  {artworkGrid}
                </TabPane>
              )}
              {/* {connected && (
                <TabPane
                  tab={<span className="tab-title">Created</span>}
                  key={ArtworkViewState.Created}
                >
                  {artworkGrid}
                </TabPane>
              )} */}
            </Tabs>
          </Row>
        </Col>
      </Content>
    </Layout>
  );
};