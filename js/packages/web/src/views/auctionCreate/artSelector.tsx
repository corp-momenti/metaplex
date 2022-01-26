import React, { useMemo, useState } from 'react';
import { Row, Button, Modal, ButtonProps } from 'antd';
import { useUserArts } from '../../hooks';
import { SafetyDepositDraft } from '../../actions/createAuctionManager';
import AuctionItemCard from './AuctionItemCard';

export interface ArtSelectorProps extends ButtonProps {
  selected: SafetyDepositDraft[];
  setSelected: (selected: SafetyDepositDraft[]) => void;
  allowMultiple: boolean;
  filter?: (i: SafetyDepositDraft) => boolean;
}

export const ArtSelector = (props: ArtSelectorProps) => {
  const { selected, setSelected, allowMultiple } = props;
  let items = useUserArts();
  if (props.filter) items = items.filter(props.filter);
  const selectedItems = useMemo<Set<string>>(
    () => new Set(selected.map(item => item.metadata.pubkey)),
    [selected],
  );

  const [visible, setVisible] = useState(false);

  const open = () => {
    clear();

    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  const clear = () => {
    setSelected([]);
  };

  const confirm = () => {
    close();
  };

  return (
    <>
      <div>
        {selected.map(m => {
          const key = m?.metadata.pubkey || '';
          return (
            <AuctionItemCard
              key={key}
              current={m}
              onSelect={open}
              onClose={() => {
                setSelected(selected.filter(_ => _.metadata.pubkey !== key));
                confirm();
              }}
            />
          );
        })}
        {(allowMultiple || selectedItems.size === 0) && (
          <div
            className="ant-card ant-card-bordered art-card"
            style={{ width: 200, height: 300, display: 'flex' }}
            onClick={open}
          >
            <span className="text-center">Add an NFT</span>
          </div>
        )}
      </div>

      <Modal
        title="Select the NFT you want to sell"
        className="modal-box instructions-modal"
        visible={visible}
        onCancel={close}
        onOk={confirm}
        width={1100}
        footer={null}
        closeIcon={<span>Close</span>}
      >
        <Row
          className="content-action"
          style={{ overflowY: 'auto', height: '50vh' }}
        >
        {
          items.length === 0 ? 
            <div className="artwork-empty">You have no item to sell</div> :
            <div className="artwork-grid">
              {
                items.map(m => {
                  const id = m.metadata.pubkey;
                  const isSelected = selectedItems.has(id);

                  const onSelect = () => {
                    let list = [...selectedItems.keys()];
                    if (allowMultiple) {
                      list = [];
                    }

                    const newSet = isSelected
                      ? new Set(list.filter(item => item !== id))
                      : new Set([...list, id]);

                    const selected = items.filter(item =>
                      newSet.has(item.metadata.pubkey),
                    );
                    setSelected(selected);

                    if (!allowMultiple) {
                      confirm();
                    }
                  };

                  return (
                    <AuctionItemCard
                      key={id}
                      isSelected={isSelected}
                      current={m}
                      onSelect={onSelect}
                    />
                  );
                })
              }
            </div>
        }
        </Row>
      </Modal>
    </>
  );
};
