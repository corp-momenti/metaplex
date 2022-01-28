import React from 'react';
import { Card, CardProps, Button, Badge } from 'antd';
import { MetadataCategory, StringPublicKey } from '@oyster/common';
import { ArtContent } from '../ArtContent';
import { useArt } from '../../hooks';
import { Artist, ArtType } from '../../types';
import { MetaAvatar } from '../MetaAvatar';

const { Meta } = Card;

export interface ArtCardProps extends CardProps {
  pubkey?: StringPublicKey;

  image?: string;
  animationURL?: string;

  category?: MetadataCategory;

  name?: string;
  symbol?: string;
  description?: string;
  creators?: Artist[];
  preview?: boolean;
  small?: boolean;
  onClose?: () => void;

  height?: number;
  artView?: boolean;
  width?: number;

  count?: string;
}

export const ArtCard = (props: ArtCardProps) => {
  let {
    className,
    small,
    category,
    image,
    animationURL,
    name,
    preview,
    creators,
    description,
    onClose,
    pubkey,
    height,
    artView,
    width,
    count,
    ...rest
  } = props;
  const art = useArt(pubkey);
  creators = art?.creators || creators || [];
  name = art?.title || name || ' ';

  let badge = '';
  if (art.type === ArtType.NFT) {
    badge = 'Unique';
  } else if (art.type === ArtType.Master) {
    badge = 'NFT 0';
  } else if (art.type === ArtType.Print) {
    badge = `${art.edition} of ${art.supply}`;
  }

  const card = (
    <Card
      // hoverable={true}
      className={`art-card ${small ? 'small' : ''} ${className ?? ''}`}
      bordered={false}
      {...rest}
    >
      <div className={'card-art-info'}>
        <div className="auction-gray-wrapper">
          <div className="edition-badge">{badge}</div>
          <div className={'art-content-wrapper'}>
            <ArtContent
              pubkey={pubkey}
              uri={image}
              animationURL={animationURL}
              category={category}
              preview={preview}
              height={height}
              width={width}
              artView={artView}
              className="auction-image no-events"
            />
          </div>
          <div className="auction-meta">
            <div className={'card-artist-info'}>
              <MetaAvatar creators={creators} size={24} />
              <span className={'artist-name'}>
                  {creators[0]?.name ||
                    creators[0]?.address?.substr(0, 6) ||
                    'Go to auction'}
              </span>
            </div>
            <div className={'art-name'}>{name}</div>
          </div>
        </div>
      </div>
    </Card>
  );

  return art.creators?.find(c => !c.verified) ? (
    <Badge.Ribbon text="Unverified">{card}</Badge.Ribbon>
  ) : (
    card
  );
};
