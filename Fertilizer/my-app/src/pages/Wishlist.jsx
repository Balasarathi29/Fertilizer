import React, { useEffect, useState } from 'react';
import { Typography, Button, List, Avatar, notification, Spin } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, ArrowLeftOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/formatters';

const { Title, Text } = Typography;

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await apiService.getWishlist();
      if (data && Array.isArray(data.products)) {
        setWishlistProducts(data.products);
      } else if (data && Array.isArray(data.product_ids) && data.product_ids.length > 0) {
        const allProds = await apiService.getProducts().catch(() => []);
        const filtered = allProds.filter(p => data.product_ids.includes(p.id));
        setWishlistProducts(filtered);
      } else {
        setWishlistProducts([]);
      }
    } catch (e) {
      setWishlistProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      const res = await apiService.removeFromWishlist(product.id);
      notification.success({ message: 'Wishlist Updated', description: `${product.name} removed from your wishlist.` });
      if (res && Array.isArray(res.products)) {
        setWishlistProducts(res.products);
      } else {
        fetchWishlist();
      }
    } catch (e) {
      setWishlistProducts(prev => prev.filter(p => p.id !== product.id));
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      await apiService.addToCart(product.id, 1);
      await apiService.removeFromWishlist(product.id);
      notification.success({
        message: 'Moved to Cart',
        description: `${product.name} has been moved to your cart.`,
      });
      fetchWishlist();
    } catch (e) {
      notification.error({ message: 'Action Failed', description: e.message });
    }
  };

  return (
    <div style={{ padding: '40px 10%', background: 'var(--bg-app)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#2E7D32' }}>
            <HeartOutlined style={{ marginRight: 12, color: '#ff4d4f' }} />
            Your Saved Wishlist ({wishlistProducts.length})
          </Title>
          <Text type="secondary">Products saved specially for your account.</Text>
        </div>
        <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 10 }} onClick={() => navigate('/products')}>
          Explore Products
        </Button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <List
            className="glass-panel"
            style={{ borderRadius: 16 }}
            itemLayout="horizontal"
            dataSource={wishlistProducts}
            locale={{ emptyText: 'Your wishlist is empty. Save products for later!' }}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button type="primary" icon={<ShoppingCartOutlined />} style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 8 }} onClick={() => handleMoveToCart(item)}>Move to Cart</Button>,
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveFromWishlist(item)} />
                ]}
                style={{ padding: 24, borderBottom: '1px solid rgba(0,0,0,0.05)' }}
              >
                <List.Item.Meta
                  avatar={<Avatar shape="square" size={64} style={{ background: '#e8f5e9', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.placeholder || '🌱'}</Avatar>}
                  title={<span style={{ fontSize: 16, fontWeight: 600 }}>{item.name}</span>}
                  description={<Text type="secondary">{item.category}</Text>}
                />
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2E7D32', marginRight: 24 }}>{formatCurrency(item.price)}</div>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Wishlist;
