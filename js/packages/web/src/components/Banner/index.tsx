import React from 'react';
import { useEffect } from 'react';

export const Banner = (props: {
  actionComponent?: JSX.Element;
  children?: React.ReactNode;
}) => {
  return (
    <>
      <div id="mobile-banner">
        <div className="banner-content">
            <h1 className="ivri-h1">Beyond</h1>
            <h1 className="ivri-h1">The <img src={'/ivri-copyright-outlined.png'} className='ivri-outlined' /></h1>
            <h6 className="ivri-h6">Seize your moment with ivori</h6>
          {props.actionComponent}
        </div>
      </div>
      <div id={'current-banner'}>
        <div id="banner-inner">
            <h1 className="ivri-h1">Beyond</h1>
            <h1 className="ivri-h1 ivri-h--flex">The <img src={'/ivri-copyright-outlined.png'} alt="Surface." className='ivri-outlined-img' /></h1>
            <h6 className="ivri-h6">Seize your moment with ivori</h6>
            {props.actionComponent}
          </div>
          {props.children}
      </div>
    </>
  );
};
