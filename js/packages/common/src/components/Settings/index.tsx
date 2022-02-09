import React from 'react';
import { Tooltip } from 'antd';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMeta } from '../../contexts';
import { shortenAddress } from '../../utils';
import { Identicon } from '../Identicon';

export const Settings = ({
  additionalSettings,
}: {
  additionalSettings?: JSX.Element;
}) => {
  const { publicKey } = useWallet();
  const { whitelistedCreatorsByCreator } = useMeta();

  if (!publicKey) {
    return null
  }

  let image = (
    <Identicon
      address={publicKey?.toBase58()}
      style={{width: 128, marginBottom: 16}}
    />
  );


  const creator = whitelistedCreatorsByCreator[publicKey.toBase58()]

  if (creator && creator.info.image) {
    image = <img className="user-image" src={creator.info.image} />;
  }

  return (
    <>
      <div className="settings">
        {image}
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
                &nbsp;{shortenAddress(publicKey?.toBase58())}
              </div>
            </Tooltip>
          </>
        )}
        {additionalSettings}
      </div>
    </>
  );
};
