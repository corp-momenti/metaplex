import React, { useCallback } from 'react';
import { Button, Select } from 'antd';
import { Tooltip } from 'antd';
import { useWallet } from '@solana/wallet-adapter-react';
import { ENDPOINTS, useConnectionConfig } from '../../contexts/connection';
import { useWalletModal } from '../../contexts';
import { notify, shortenAddress } from '../../utils';
import { CopyOutlined } from '@ant-design/icons';
import { Identicon } from '../Identicon';
import { Link } from 'react-router-dom';

export const Settings = ({
  additionalSettings,
}: {
  additionalSettings?: JSX.Element;
}) => {
  const { connected, disconnect, publicKey } = useWallet();
  const { endpoint } = useConnectionConfig();
  const { setVisible } = useWalletModal();
  const open = useCallback(() => setVisible(true), [setVisible]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* <Identicon
          address={publicKey?.toBase58()}
          style={{
            width: 128, height: 128, borderRadius: 64
          }}
        /> */}
        <div style={{
          width: 128,
          height: 128,
          borderRadius: 64,
          backgroundColor: '#0D0D0E',
          marginBottom: 16
        }}></div>
        {publicKey && (
          <>
            <Tooltip title="Address copied" trigger="click">
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: '19px',
                  color: '#0D0D0E',
                  cursor: 'pointer',
                  width: 231,
                  wordBreak: 'break-all',
                  textAlign: 'center'
                }}
                onClick={() =>
                  navigator.clipboard.writeText(publicKey?.toBase58() || '')
                }
              >
                &nbsp;{publicKey?.toBase58()}
              </div>
            </Tooltip>
          </>
        )}
        {additionalSettings}
      </div>
    </>
  );
};
