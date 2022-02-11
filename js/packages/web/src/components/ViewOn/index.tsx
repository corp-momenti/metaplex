import React from 'react';
import { Col, Button } from 'antd';
import { useArt } from '../../hooks';
import { useConnectionConfig } from '@oyster/common';

export const ViewOn = ({ id }: { id: string }) => {
  const { endpoint } = useConnectionConfig();
  const art = useArt(id);

  return (
    <>
      <Col>
        <h6>View on</h6>
        <div style={{ display: 'flex' }}>
          <Button
            className="tag ivri-btn ivri-btn--outline"
            onClick={() => window.open(art.uri || '', '_blank')}
          >
            Metadata
          </Button>
          <Button
            className="tag ivri-btn ivri-btn--outline"
            onClick={() => {
              const cluster = endpoint.name;
              const explorerURL = new URL(
                `account/${art?.mint || ''}`,
                'https://explorer.solana.com',
              );
              if (!cluster.includes('mainnet')) {
                explorerURL.searchParams.set('cluster', cluster);
              }
              window.open(explorerURL.href, '_blank');
            }}
          >
            Transaction
          </Button>
        </div>
      </Col>
    </>
  );
};
