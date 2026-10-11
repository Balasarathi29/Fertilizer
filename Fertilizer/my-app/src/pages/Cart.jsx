import React, { useEffect, useState, useContext } from 'react';
import { Typography, Card, Button, List, Avatar, Spin, notification, Tag, Steps, Divider, Empty, Row, Col } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, MinusOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/formatters';
import { useDarkMode } from '../App';

const { Title, Text } = Typography;

// Shipping Rule: below ₹200 => ₹60, ₹200+ => FREE
const calcShipping = (subtotal) => subtotal < 200 ? 60 : 0;

const Cart = () => {
  const isDark = useDarkMode();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCart();
      if (data?.items && Array.isArray(data.items)) {
        // Ensure all quantities are at minimum 1
        setCartItems(data.items.map(item => ({ ...item, quantity: Math.max(1, parseInt(item.quantity) || 1) })));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Quantity update — clamp to minimum 1, never 0 or negative
  const handleQtyChange = async (item, delta) => {
    const currentQty = Math.max(1, parseInt(item.quantity) || 1);
    const newQty = Math.max(1, currentQty + delta); // Never below 1
    if (newQty === currentQty) return;

    // Optimistic UI update
    setCartItems(prev => prev.map(ci =>
      (ci.product_id || ci.id) === (item.product_id || item.id) ? { ...ci, quantity: newQty } : ci
    ));

    try {
      await apiService.updateCartQuantity(item.product_id || item.id, newQty);
    } catch (e) {
      // Revert on error
      setCartItems(prev => prev.map(ci =>
        (ci.product_id || ci.id) === (item.product_id || item.id) ? { ...ci, quantity: currentQty } : ci
      ));
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await apiService.removeFromCart(productId);
      notification.success({ message: 'Item Removed', description: 'Item removed from your cart.' });
      fetchCart();
    } catch (e) {
      setCartItems(prev => prev.filter(item => (item.product_id || item.id) !== productId));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * Math.max(1, item.quantity || 1)), 0);
  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;

  return (
    <div style={{ padding: '40px 10%', background: 'var(--bg-app)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <Title level={2} style={{ margin: 0 }}>Your Shopping Cart</Title>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : cartItems.length === 0 ? (
        <Card style={{ borderRadius: 20, textAlign: 'center', padding: '60px 0' }}>
          <Empty
            image={<ShoppingOutlined style={{ fontSize: 64, color: '#2E7D32' }} />}
            description={<Text type="secondary">Your cart is empty. Explore products!</Text>}
          >
            <Button type="primary" style={{ background: '#2E7D32', borderColor: '#2E7D32' }} onClick={() => navigate('/products')}>
              Explore Products
            </Button>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* ─── Cart Items List ─── */}
          <div style={{ flex: '1 1 600px' }}>
            <List
              className="glass-panel"
              style={{ borderRadius: 16 }}
              itemLayout="horizontal"
              dataSource={cartItems}
              renderItem={item => {
                const qty = Math.max(1, parseInt(item.quantity) || 1);
                const itemTotal = (item.price || 0) * qty;
                return (
                  <List.Item
                    style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar shape="square" size={64} style={{ background: '#e8f5e9', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.placeholder || '🌱'}
                        </Avatar>
                      }
                      title={<span style={{ fontSize: 16, fontWeight: 600 }}>{item.name}</span>}
                      description={
                        <div>
                          <Text type="secondary">Unit Price: <strong>{formatCurrency(item.price || 0)}</strong></Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>Subtotal: <strong style={{ color: '#2E7D32' }}>{formatCurrency(itemTotal)}</strong></Text>
                        </div>
                      }
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      {/* ─── Quantity Controller ─── */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
                        <Button
                          type="text"
                          icon={<MinusOutlined />}
                          onClick={() => handleQtyChange(item, -1)}
                          disabled={qty <= 1}
                          style={{ width: 36, height: 36, borderRadius: 0, color: qty <= 1 ? '#d9d9d9' : '#2E7D32' }}
                        />
                        <div style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>{qty}</div>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => handleQtyChange(item, +1)}
                          style={{ width: 36, height: 36, borderRadius: 0, color: '#2E7D32' }}
                        />
                      </div>

                      {/* ─── Item Total ─── */}
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#2E7D32', width: 90, textAlign: 'right' }}>
                        {formatCurrency(itemTotal)}
                      </div>

                      {/* ─── Remove Button ─── */}
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.product_id || item.id)}
                      />
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>

          {/* ─── Order Summary ─── */}
          <div style={{ flex: '1 1 300px', maxWidth: 380 }}>
            <Card className="glass-panel" title="Order Summary" style={{ borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text>Product Subtotal ({cartItems.length} items)</Text>
                <Text strong>{formatCurrency(subtotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text>Delivery / Shipping</Text>
                {shipping === 0 ? (
                  <Text strong style={{ color: '#52C41A' }}>FREE ✅</Text>
                ) : (
                  <Text strong style={{ color: '#fa541c' }}>+ {formatCurrency(shipping)}</Text>
                )}
              </div>
              {subtotal < 200 && subtotal > 0 && (
                <div style={{ background: isDark ? 'rgba(250, 140, 22, 0.12)' : '#fff7e6', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: isDark ? '#e6c96a' : '#d46b08' }}>
                  📦 Add ₹{200 - subtotal} more to get <strong>FREE delivery!</strong>
                </div>
              )}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0 }}>Order Total</Title>
                <Title level={4} style={{ margin: 0, color: '#2E7D32' }}>{formatCurrency(total)}</Title>
              </div>
              <Button
                className="gradient-btn"
                block
                size="large"
                style={{ background: '#2E7D32', borderColor: '#2E7D32', color: '#fff', fontWeight: 700, borderRadius: 10 }}
                disabled={cartItems.length === 0}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout →
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
