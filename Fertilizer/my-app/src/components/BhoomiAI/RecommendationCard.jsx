import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const { Text, Title } = Typography;

const RecommendationCard = ({ product }) => {
  const navigate = useNavigate();

  if (!product) return null;

  return (
    <Card 
      size="small" 
      style={{ borderRadius: 12, marginTop: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ 
          width: 60, 
          height: 60, 
          borderRadius: 8, 
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          overflow: 'hidden'
        }}>
          {product.image ? (
             <img src={`/src/assets/${product.image}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          ) : null}
          <span style={{ display: product.image ? 'none' : 'flex' }}>{product.placeholder || '📦'}</span>
        </div>
        <div style={{ flex: 1 }}>
          <Text strong style={{ display: 'block', fontSize: 13, marginBottom: 4, lineHeight: 1.2 }}>{product.name}</Text>
          <Text style={{ color: '#2E7D32', fontWeight: 600, fontSize: 13 }}>{formatCurrency(product.price)}</Text>
        </div>
      </div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
        <Button size="small" type="link" style={{ padding: 0, color: '#666' }} onClick={() => navigate(`/products/${product.id}`)}>
          View Details
        </Button>
        <Button size="small" type="primary" icon={<ShoppingCartOutlined />} style={{ background: '#C9A227', borderColor: '#C9A227', color: '#1a1a1a', borderRadius: 16 }}>
          Add
        </Button>
      </Space>
    </Card>
  );
};

export default RecommendationCard;
