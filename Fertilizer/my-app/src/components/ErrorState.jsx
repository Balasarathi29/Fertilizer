import React from 'react';
import { Card, Button, Typography } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ErrorState = ({ title = 'Temporary Disruption', message = 'Agricultural information is temporarily unavailable. Please try again.', onRetry }) => {
  return (
    <Card
      bordered={false}
      className="bhoomi-card"
      style={{
        padding: '36px 24px',
        textAlign: 'center',
        margin: '24px auto',
        maxWidth: 520,
        background: 'rgba(255, 248, 240, 0.9)',
        border: '1px solid rgba(230, 81, 0, 0.2)',
      }}
    >
      <div style={{ fontSize: 48, color: '#E65100', marginBottom: 12 }}>
        <WarningOutlined />
      </div>
      <Title level={4} style={{ color: '#E65100', margin: '0 0 8px 0' }}>
        {title}
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 14 }}>
        {message}
      </Text>
      {onRetry && (
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          style={{
            background: '#2E7D32',
            borderColor: '#2E7D32',
            borderRadius: 12,
            height: 44,
            padding: '0 24px',
            fontWeight: 700,
          }}
        >
          Try Again
        </Button>
      )}
    </Card>
  );
};

export default ErrorState;
