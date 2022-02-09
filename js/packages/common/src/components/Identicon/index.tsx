import React, { useEffect, useRef } from 'react';

import Jazzicon from 'jazzicon';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

export const Identicon = (props: {
  address?: string | PublicKey;
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
}) => {
  const { style, className, alt } = props;
  const address =
    typeof props.address === 'string'
      ? props.address
      : props.address?.toBase58();
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (address && ref.current) {
      try {
        const width = style?.width || 16;
        const icon = Jazzicon(
            width,
            parseInt(bs58.decode(address).toString('hex').slice(5, 15), 16)
        );
        icon.style.borderRadius = `${width}px`;
        icon.firstChild.setAttribute('width', width);
        icon.firstChild.setAttribute('height', width);
        ref.current.innerHTML = '';
        ref.current.className = className || '';
        ref.current.appendChild(icon);
      } catch (err) {
        // TODO
      }
    }
  }, [address, style, className]);

  return (
    <div
      className="identicon-wrapper"
      title={alt}
      ref={ref as any}
      style={props.style}
    />
  );
};
