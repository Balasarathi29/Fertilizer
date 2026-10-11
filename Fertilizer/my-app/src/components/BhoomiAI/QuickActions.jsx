import React from 'react';
import { Tag } from 'antd';
import {
  CameraOutlined,
  BulbOutlined,
  CloudOutlined,
  ExperimentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    { label: 'Crop Recommendation', icon: <BulbOutlined /> },
    { label: 'Scan Plant Disease', icon: <CameraOutlined /> },
    { label: 'Fertilizer Advice', icon: <ExperimentOutlined /> },
    { label: 'Weather Update', icon: <CloudOutlined /> },
    { label: 'Farming Calendar', icon: <CalendarOutlined /> },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {actions.map((action) => (
          <Tag
            key={action.label}
            icon={action.icon}
            onClick={() => onActionClick(action.label)}
            style={{
              cursor: 'pointer',
              padding: '6px 16px',
              borderRadius: 20,
              flexShrink: 0,
              background: '#e8f5e9',
              border: '1px solid #a5d6a7',
              color: '#2E7D32',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            className="quick-action-tag"
          >
            {action.label}
          </Tag>
        ))}
      </div>

      <style>{`
        .quick-action-tag:hover {
          background: #2E7D32 !important;
          color: #ffffff !important;
          border-color: #2E7D32 !important;
        }
      `}</style>
    </>
  );
};

export default QuickActions;