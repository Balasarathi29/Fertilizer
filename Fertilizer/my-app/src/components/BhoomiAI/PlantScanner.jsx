import React, { useState } from 'react';
import { Card, Button, Typography, Spin, Upload, message } from 'antd';
import { UploadOutlined, ScanOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useDarkMode } from '../../App';

const { Text, Title } = Typography;

const PlantScanner = ({ onComplete }) => {
  const isDark = useDarkMode();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimulatedUpload = (file) => {
    setScanning(true);
    // Simulate API delay for plant disease detection model
    setTimeout(() => {
      setScanning(false);
      const mockResult = {
        disease: 'Early Blight (Alternaria solani)',
        status: 'Warning',
        cause: 'Fungal infection exacerbated by high humidity and warm temperatures.',
        treatment: 'Apply organic copper-based fungicide or Neem Oil spray immediately. Ensure proper plant spacing for air circulation.',
        productId: 208 // Maps to Neem Oil Pesticide in mockProducts
      };
      setResult(mockResult);
      if (onComplete) onComplete(mockResult);
    }, 2500);
    return false; // Prevent default upload behavior
  };

  if (result) {
    return (
      <Card size="small" style={{ borderRadius: 12, marginTop: 8, background: isDark ? 'rgba(250, 174, 20, 0.1)' : '#fffcf0', border: '1px solid #ffe58f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />
          <Title level={5} style={{ margin: 0, color: '#faad14' }}>Analysis Complete</Title>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text><Text strong>Detected:</Text> {result.disease}</Text>
          <Text><Text strong>Cause:</Text> {result.cause}</Text>
          <Text><Text strong>Treatment:</Text> {result.treatment}</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card size="small" style={{ borderRadius: 12, marginTop: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5', border: `1px dashed ${isDark ? 'rgba(255,255,255,0.2)' : '#d9d9d9'}`, textAlign: 'center' }}>
      {scanning ? (
        <div style={{ padding: '20px 0' }}>
          <Spin indicator={<ScanOutlined style={{ fontSize: 24, color: '#2E7D32' }} spin />} />
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">Bhoomi Vision AI is analyzing...</Text>
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px 0' }}>
          <Upload showUploadList={false} beforeUpload={handleSimulatedUpload}>
            <Button icon={<UploadOutlined />} style={{ borderRadius: 16 }}>
              Upload Leaf Photo
            </Button>
          </Upload>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Supports JPG, PNG (Max 5MB)</Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlantScanner;
