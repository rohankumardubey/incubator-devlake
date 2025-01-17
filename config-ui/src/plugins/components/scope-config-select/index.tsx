/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { useState, useEffect, useMemo } from 'react';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Table, Button, Modal } from 'antd';

import API from '@/api';
import { Buttons } from '@/components';
import { useRefreshData } from '@/hooks';

import { ScopeConfigForm } from '../scope-config-form';

import * as S from './styled';

interface Props {
  plugin: string;
  connectionId: ID;
  scopeConfigId?: ID;
  onCancel: () => void;
  onSubmit: (trId: ID) => void;
}

export const ScopeConfigSelect = ({ plugin, connectionId, scopeConfigId, onCancel, onSubmit }: Props) => {
  const [version, setVersion] = useState(1);
  const [trId, setTrId] = useState<ID>();
  const [isOpen, setIsOpen] = useState(false);
  const [updatedId, setUpdatedId] = useState<ID>();

  const { ready, data } = useRefreshData(() => API.scopeConfig.list(plugin, connectionId), [version]);

  const dataSource = useMemo(
    () => (data ? (data.length ? [{ id: 'None', name: 'No Scope Config' }].concat(data) : []) : []),
    [data],
  );

  useEffect(() => {
    setTrId(scopeConfigId);
  }, [scopeConfigId]);

  const handleShowDialog = () => {
    setIsOpen(true);
  };

  const handleHideDialog = () => {
    setIsOpen(false);
    setUpdatedId(undefined);
  };

  const handleUpdate = async (id: ID) => {
    setUpdatedId(id);
    handleShowDialog();
  };

  const handleSubmit = async (trId: ID) => {
    handleHideDialog();
    setVersion((v) => v + 1);
    setTrId(trId);
  };

  return (
    <S.Wrapper>
      <Buttons position="top">
        <Button type="primary" icon={<PlusOutlined rev={undefined} />} onClick={handleShowDialog}>
          Add New Scope Config
        </Button>
      </Buttons>
      <Table
        rowKey="id"
        size="small"
        loading={!ready}
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          {
            title: '',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id) =>
              id !== 'None' ? (
                <Button type="link" icon={<EditOutlined rev={undefined} />} onClick={() => handleUpdate(id)} />
              ) : null,
          },
        ]}
        dataSource={dataSource}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: trId ? [trId] : [],
          onChange: (selectedRowKeys) => setTrId(selectedRowKeys[0]),
        }}
        pagination={false}
      />
      <Buttons position="bottom" align="right">
        <Button style={{}} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" disabled={!trId} onClick={() => trId && onSubmit?.(trId)}>
          Save
        </Button>
      </Buttons>
      <Modal
        open={isOpen}
        width={960}
        centered
        footer={null}
        title={!updatedId ? 'Add Scope Config' : 'Edit Scope Config'}
        onCancel={handleHideDialog}
      >
        <ScopeConfigForm
          plugin={plugin}
          connectionId={connectionId}
          showWarning={!!updatedId}
          scopeConfigId={updatedId}
          onCancel={onCancel}
          onSubmit={handleSubmit}
        />
      </Modal>
    </S.Wrapper>
  );
};
