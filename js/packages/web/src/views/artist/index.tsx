import { Col, Divider, Row } from 'antd';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtCard } from '../../components/ArtCard';
import { useCreator, useCreatorArts } from '../../hooks';

export const ArtistView = () => {
  const { id } = useParams<{ id: string }>();
  const creator = useCreator(id);
  const artwork = useCreatorArts(id);

  const artworkGrid = (
    <div className="artwork-grid">
      {
        artwork.map((m, idx) => {
            const id = m.pubkey;
            return (
              <Link to={`/art/${id}`} key={idx}>
                <ArtCard
                  key={id}
                  pubkey={m.pubkey}
                  preview={false}
                  artView={true}
                />
              </Link>
            );
          })
        }
    </div>
  );

  return (
    <>
      <Col>
        <Divider />
        <Row
          style={{ margin: '0 30px', textAlign: 'left', fontSize: '1.4rem' }}
        >
          <Col span={24}>
            <h2>
              {creator?.info.name || creator?.info.address}
            </h2>
            <br />
            <div className="info-header">ABOUT THE CREATOR</div>
            <div className="info-content">{creator?.info.description}</div>
            <br />
            <div className="info-header">Art Created</div>
            {artwork.length > 0 ? artworkGrid : <div className="no-item">There&#39;s no item yet</div>}
          </Col>
        </Row>
      </Col>
    </>
  );
};
