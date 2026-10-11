import React, { useState } from 'react';
import { Card, Typography, Upload, Button, message } from 'antd';
import { CameraOutlined, UploadOutlined, SyncOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const PlantScanner = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleScan = () => {
    setLoading(true);
    // Mock AI analysis delay
    setTimeout(() => {
      setLoading(false);
      setResult({
        problem: 'Nitrogen deficiency',
        details: 'The yellowing of older leaves (chlorosis) indicates a lack of nitrogen.',
        recommendation: 'Premium Organic Fertilizer',
        productId: 1
      });
      message.success('Analysis complete!');
    }, 2000);
  };

  const props = {
    name: 'file',
    multiple: false,
    beforeUpload: () => {
      handleScan();
      return false; // Prevent automatic upload
    },
  };

  return (
    <Card className="glass-panel" style={{ textAlign: 'center', background: 'var(--glass-bg)', overflow: 'hidden' }}>
      <div style={{ background: 'rgba(46, 125, 50, 0.1)', padding: '24px 0', marginBottom: 24, margin: '-24px -24px 24px' }}>
        <CameraOutlined style={{ fontSize: 32, color: '#2E7D32', marginBottom: 12 }} />
        <Title level={3} style={{ margin: 0 }}>AI Plant Scanner</Title>
      </div>
      
      {!result ? (
        <>
          <Paragraph type="secondary" style={{ marginBottom: 24 }}>
            Upload a clear photo of your plant's leaves to detect nutrient deficiencies instantly using Bhoomi AI.
          </Paragraph>
          
          <Dragger {...props} disabled={loading} style={{ background: 'transparent', border: '2px dashed var(--primary-color)' }}>
            <p className="ant-upload-drag-icon">
              {loading ? <SyncOutlined spin style={{ color: '#C9A227' }} /> : <UploadOutlined style={{ color: '#2E7D32' }} />}
            </p>
            <p className="ant-upload-text">Click or drag image to scan</p>
            <p className="ant-upload-hint">Support for a single image upload (JPG/PNG).</p>
          </Dragger>
        </>
      ) : (
        <div style={{ textAlign: 'left', padding: 12 }}>
          <Text type="secondary">Detected Issue:</Text>
          <Title level={4} style={{ color: '#dc2626', margin: '4px 0 12px' }}>{result.problem}</Title>
          <Paragraph>{result.details}</Paragraph>
          
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, borderRadius: 8, marginTop: 24 }}>
            <Text type="secondary">AI Recommendation:</Text>
            <Title level={5} style={{ margin: '4px 0 16px', color: '#166534' }}>{result.recommendation}</Title>
            <Button type="primary" className="gradient-btn" onClick={() => navigate(`/products/${result.productId}`)}>
              View Recommended Product
            </Button>
            <Button type="link" onClick={() => setResult(null)}>Scan another plant</Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlantScanner;
