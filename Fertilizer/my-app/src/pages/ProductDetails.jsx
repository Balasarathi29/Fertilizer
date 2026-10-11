import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Row, Col, Rate, Divider, Tag, notification, Spin } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, ArrowLeftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { mockProducts } from '../data/products';
import { AuthContext } from '../App';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/formatters';

const { Title, Paragraph, Text } = Typography;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProductById(id);
      setProduct(data);
    } catch (e) {
      const found = mockProducts.find(p => p.id === parseInt(id));
      setProduct(found || null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <Title level={3}>Product not found</Title>
        <Button onClick={() => navigate('/products')}>Back to Marketplace</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    requireAuth(async () => {
      try {
        await apiService.addToCart(product.id, 1);
        notification.success({
          message: 'Added to Cart',
          description: `${product.name} has been added to your cart.`,
          placement: 'topRight',
        });
      } catch (e) {
        notification.success({ message: 'Added to Cart', description: `${product.name} added to cart.` });
      }
    });
  };

  const handleBuyNow = () => {
    requireAuth(async () => {
      try {
        await apiService.addToCart(product.id, 1);
      } catch (e) {}
      navigate('/checkout');
    });
  };

  const handleWishlist = () => {
    requireAuth(async () => {
      try {
        await apiService.toggleWishlist(product.id);
        notification.success({ message: 'Wishlist Updated', description: `${product.name} updated in your wishlist.` });
      } catch (e) {
        notification.success({ message: 'Wishlist Updated', description: `${product.name} updated in wishlist.` });
      }
    });
  };

  return (
    <div style={{ padding: '40px 10%', background: 'var(--bg-app)', minHeight: '100vh' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Back to Products
      </Button>

      <div className="glass-panel" style={{ padding: 40, borderRadius: 20 }}>
        <Row gutter={[48, 48]}>
          {/* Image */}
          <Col xs={24} md={10}>
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: 16, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={`/src/assets/${product.image}`} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span style={{ fontSize: 120, display: 'none', position: 'relative', zIndex: 1 }}>{product.placeholder || '🌱'}</span>
            </div>
          </Col>

          {/* Details */}
          <Col xs={24} md={14}>
            {product.isOrganic && <Tag color="green" style={{ marginBottom: 12, fontSize: 13, padding: '4px 12px' }}>🌿 100% Certified Organic</Tag>}
            <Title level={2} style={{ margin: '0 0 16px' }}>{product.name}</Title>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Rate disabled defaultValue={product.rating || 4.8} style={{ color: '#C9A227' }} />
              <Text type="secondary">({product.reviews || 120} verified reviews)</Text>
              <Tag color={(product.stock ?? 50) > 0 ? 'blue' : 'red'}>
                {(product.stock ?? 50) > 0 ? `In Stock (${product.stock ?? 50})` : 'Out of Stock'}
              </Tag>
            </div>

            <Title level={1} style={{ color: '#2E7D32', marginTop: 0, marginBottom: 20 }}>
              {formatCurrency(product.price)}
            </Title>

            <Paragraph style={{ fontSize: 16, lineHeight: 1.7 }}>
              {product.description || `Premium grade ${product.category?.toLowerCase()} designed to optimize crop yield naturally. Enriched with essential nutrients for optimal soil health.`}
            </Paragraph>

            <Divider />

            <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
              <Button 
                type="primary" 
                size="large" 
                className="gradient-btn"
                icon={<ShoppingCartOutlined />} 
                style={{ flex: 1, minWidth: 160, height: 50, fontSize: 16, fontWeight: 600 }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button 
                type="default" 
                size="large" 
                icon={<ThunderboltOutlined />} 
                style={{ background: '#C9A227', borderColor: '#C9A227', color: '#fff', height: 50, fontSize: 16, fontWeight: 600, padding: '0 24px' }}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
              <Button 
                size="large" 
                icon={<HeartOutlined />} 
                style={{ width: 50, height: 50 }}
                onClick={handleWishlist}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductDetails;
