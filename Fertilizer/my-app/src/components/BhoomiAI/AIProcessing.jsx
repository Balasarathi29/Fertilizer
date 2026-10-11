import React, { useState, useEffect } from 'react';
import { Card, Progress, Typography, Tag } from 'antd';
import { CheckCircleFilled, SyncOutlined } from '@ant-design/icons';
import BhoomiRobotMascot from './BhoomiRobotMascot';

const { Title, Text } = Typography;

const DEFAULT_STEPS = [
  { id: 1, text: 'Checking farming region & location', icon: '📍' },
  { id: 2, text: 'Analyzing real-time weather parameters', icon: '🌤️' },
  { id: 3, text: 'Evaluating soil NPK & pH balance', icon: '🧪' },
  { id: 4, text: 'Matching high-yield crop varieties', icon: '🌾' },
  { id: 5, text: 'Selecting organic fertilizers & nutrients', icon: '🌿' },
];

const AIProcessing = ({ onComplete, durationPerStep = 600 }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex < DEFAULT_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, durationPerStep);
      return () => clearTimeout(timer);
    } else if (currentStepIndex === DEFAULT_STEPS.length) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, durationPerStep, onComplete]);

  const percent = Math.min(100, Math.round((currentStepIndex / DEFAULT_STEPS.length) * 100));

  return (
    <Card
      bordered={false}
      className="bhoomi-card"
      style={{
        maxWidth: 580,
        margin: '32px auto',
        padding: '36px 24px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,250,243,0.95))',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Tag
          color="#2E7D32"
          style={{
            borderRadius: 20,
            padding: '4px 16px',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          BHOOMI AI IN ACTION
        </Tag>
      </div>

      <div className="bhoomi-robot-float" style={{ marginBottom: 20 }}>
        <BhoomiRobotMascot size={96} state="analyzing" />
      </div>

      <Title level={3} style={{ color: '#1B2E1E', margin: '0 0 8px 0', fontWeight: 800 }}>
        Intelligent Farming Analysis
      </Title>
      <Text type="secondary" style={{ fontSize: 14 }}>
        Synthesizing soil composition, weather metrics, and agronomic data...
      </Text>

      <div style={{ margin: '24px 0 32px 0' }}>
        <Progress
          percent={percent}
          strokeColor={{ '0%': '#2E7D32', '100%': '#C9A227' }}
          status={percent === 100 ? 'success' : 'active'}
          strokeWidth={10}
        />
      </div>

      <div
        style={{
          textAlign: 'left',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 16,
          padding: '20px 24px',
          border: '1px solid rgba(46,125,50,0.12)',
        }}
      >
        {DEFAULT_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: idx < DEFAULT_STEPS.length - 1 ? '1px dashed rgba(0,0,0,0.06)' : 'none',
                opacity: isDone || isCurrent ? 1 : 0.4,
                transition: 'opacity 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{step.icon}</span>
                <Text
                  strong={isCurrent || isDone}
                  style={{
                    fontSize: 14,
                    color: isDone ? '#1B5E20' : isCurrent ? '#C9A227' : '#666',
                  }}
                >
                  {step.text}
                </Text>
              </div>

              <div>
                {isDone ? (
                  <CheckCircleFilled style={{ color: '#2E7D32', fontSize: 18 }} />
                ) : isCurrent ? (
                  <SyncOutlined spin style={{ color: '#C9A227', fontSize: 16 }} />
                ) : (
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: '2px solid #ccc',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AIProcessing;
