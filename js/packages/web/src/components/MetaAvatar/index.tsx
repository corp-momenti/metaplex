import React, { useState } from 'react';
import { Avatar } from 'antd';
import { Artist } from '../../types';
import { Identicon } from '@oyster/common';

const MetaAvatarItem = (props: {
  creator: Artist;
  size: number;
  alt?: string;
}) => {
  const { creator, size, alt } = props;
  const [noImage, setNoImage] = useState(false);
  const image = creator.image || '';

  return (
    <Avatar
      alt={alt}
      size={size}
      src={
        noImage ? (
          <div className="user-unknown"></div>
        ) : (
          image
        )
      }
      onError={() => {
        setNoImage(true);
        return false;
      }}
    />
  );
};

export const MetaAvatar = (props: {
  creators?: Artist[];
  showMultiple?: boolean;
  size?: number;
}) => {
  const { creators, showMultiple } = props;
  const size = props.size || 32;

  if (!creators || creators.length === 0) {
    return <Avatar size={size} src={false} />;
  }

  const controls = (creators || []).map((creator, _idx) => (
    <MetaAvatarItem key={_idx} creator={creator} alt={creator.name} size={size} />
  ));

  if (!showMultiple) {
    return controls[0];
  }

  return <Avatar.Group>{controls || null}</Avatar.Group>;
};

export const MetaAvatarDetailed = (props: {
  creators?: Artist[];
  size?: number;
}) => {
  const { creators } = props;
  const size = props.size || 32;
  if (!creators || creators.length === 0) {
    return <Avatar size={size} src={false} />;
  }
  return (
    <div>
      {(creators || []).map((creator, _idx) => (
        <div className="meta-avatar" key={_idx}>
          <MetaAvatarItem creator={creator} alt={creator.name} size={size} />
          <p>
            {creator.name ? creator.name : 'No name provided.'}
          </p>
        </div>
      ))}
    </div>
  );
};
