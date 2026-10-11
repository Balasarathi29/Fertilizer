import React from 'react';
import { Card, Skeleton, Space, Typography } from 'antd';
import BhoomiRobotMascot from './BhoomiAI/BhoomiRobotMascot';

const { Text } = Typography;

const LoadingState = ({ message = 'Gathering agricultural intelligence...', type = 'card' }) => {
  if (type === 'inline') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0' }}>
        <BhoomiRobotMascot size={36} state="thinking" />
        <Text style={{ color: '#2E7D32', fontWeight: 600 }}>{message}</Text>
      </div>
    );
  }

  return (
    <Card
      bordered={false}
      className="bhoomi-card"
      style={{
        padding: 32,
        textAlign: 'center',
        margin: '24px auto',
        maxWidth: 600,
      }}
    >
      <div className="bhoomi-robot-float" style={{ marginBottom: 16 }}>
        <BhoomiRobotMascot size={64} state="thinking" />
      </div>
      <Text strong style={{ fontSize: 16, color: '#1B5E20', display: 'block', marginBottom: 20 }}>
        {message}
      </Text>
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
  );
};

export default LoadingState;
