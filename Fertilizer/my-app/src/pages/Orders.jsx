import React, { useState, useEffect, useContext } from 'react';
import { Typography, Row, Col, Card, Button, Tag, Spin, Empty, Space, notification } from 'antd';
import {
  InboxOutlined, ShoppingOutlined, ArrowLeftOutlined,
  EnvironmentOutlined, CarOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/formatters';
import OrderTrackingModal from '../components/OrderTrackingModal';

const { Title, Text } = Typography;

const Orders = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const data = await apiService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      notification.error({
        message: 'Failed to Load Orders',
        description: err.message || 'Unable to fetch your order history.'
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 8%', background: 'var(--bg-app)', minHeight: '100vh' }}>
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1B2E1E' }}>
            📦 My Orders & Live Tracking
          </Title>
          <Text type="secondary">
            View your order history, live shipment tracking, and download invoices.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<ShoppingOutlined />}
          style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 10, fontWeight: 700 }}
          onClick={() => navigate('/products')}
        >
          Explore Products
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
          <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>Loading your orders...</Text>
        </div>
      ) : orders.length === 0 ? (
        <Card style={{ borderRadius: 20, textAlign: 'center', padding: '60px 20px' }}>
          <Empty
            image={<InboxOutlined style={{ fontSize: 64, color: '#2E7D32' }} />}
            description={<Text type="secondary">No orders placed yet under <strong>{user?.email}</strong>.</Text>}
          >
            <Button
              type="primary"
              size="large"
              style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 10, marginTop: 12 }}
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </Button>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order) => {
            const orderItems = (() => {
              try { return JSON.parse(order.items_json || '[]'); } catch { return []; }
            })();

            const statusFlow = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
            const currentStep = statusFlow.indexOf(order.order_status);
            const isCancelled = order.order_status === 'Cancelled';

            const statusColor = {
              'Order Placed': 'blue',
              'Confirmed': 'cyan',
              'Processing': 'orange',
              'Shipped': 'geekblue',
              'Out for Delivery': 'purple',
              'Delivered': 'success',
              'Cancelled': 'error',
            }[order.order_status] || 'default';

            return (
              <Card
                key={order.order_id}
                style={{
                  borderRadius: 18,
                  border: '1px solid rgba(46, 125, 50, 0.15)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  overflow: 'hidden'
                }}
              >
                {/* ── Order Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <Space size="middle">
                      <Text strong style={{ fontSize: 16, color: '#1B2E1E' }}>Order #{order.order_id}</Text>
                      <Tag color={statusColor} style={{ fontSize: 13, padding: '3px 12px', borderRadius: 10, fontWeight: 700 }}>
                        {isCancelled ? '❌ Cancelled' : order.order_status}
                      </Tag>
                    </Space>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                      Placed on: {order.order_date ? new Date(order.order_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#2E7D32' }}>
                      {formatCurrency(order.total_amount || 0)}
                    </div>
                    <Button
                      type="primary"
                      icon={<CarOutlined />}
                      size="small"
                      style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 8, marginTop: 6, fontWeight: 600 }}
                      onClick={() => {
                        setSelectedOrderId(order.order_id);
                        setTrackingModalOpen(true);
                      }}
                    >
                      🚚 Track Live Status
                    </Button>
                  </div>
                </div>

                {/* ── Order Items List ── */}
                {orderItems.length > 0 && (
                  <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 18px', marginBottom: 16, border: '1px solid #dcfce7' }}>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8, color: '#166534' }}>
                      Ordered Products ({orderItems.length})
                    </Text>
                    {orderItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: idx < orderItems.length - 1 ? 8 : 0 }}>
                        <Text style={{ fontSize: 14 }}>🌱 <strong>{item.name}</strong> × {item.quantity}</Text>
                        <Text strong style={{ fontSize: 14, color: '#2E7D32' }}>
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Summary & Delivery Address ── */}
                <Row gutter={[16, 12]} style={{ fontSize: 13, color: '#555', marginBottom: isCancelled ? 0 : 16 }}>
                  <Col xs={24} sm={12}>
                    <div>
                      <EnvironmentOutlined style={{ color: '#2E7D32', marginRight: 6 }} />
                      <strong>Delivery Destination:</strong>
                    </div>
                    <div style={{ color: '#666', marginTop: 2, paddingLeft: 20 }}>
                      {order.delivery_location?.formatted_address || order.shipping_address || 'Address provided at checkout'}
                    </div>
                  </Col>
                  <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                    <div>Payment: <strong>{order.payment_method}</strong> ({order.payment_status || 'Paid'})</div>
                    <div>
                      Shipping Fee: <strong style={{ color: order.shipping_charge === 0 ? '#52C41A' : '#333' }}>
                        {order.shipping_charge === 0 ? 'FREE ✅' : formatCurrency(order.shipping_charge || 0)}
                      </strong>
                    </div>
                    {order.discount_amount > 0 && (
                      <div style={{ color: '#2E7D32' }}>Discounts: <strong>- {formatCurrency(order.discount_amount)}</strong></div>
                    )}
                  </Col>
                </Row>

                {/* ── Shipment Timeline Stepper (Hidden if Cancelled) ── */}
                {!isCancelled && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '10px 0' }}>
                      <div style={{ position: 'absolute', top: 22, left: 0, right: 0, height: 3, background: '#e0e0e0', zIndex: 0 }} />
                      <div style={{
                        position: 'absolute', top: 22, left: 0, height: 3, background: '#2E7D32', zIndex: 1,
                        width: currentStep >= 0 ? `${Math.min(100, (currentStep / (statusFlow.length - 1)) * 100)}%` : '0%',
                        transition: 'width 0.6s ease'
                      }} />
                      {statusFlow.map((step, idx) => {
                        const done = currentStep >= idx;
                        const active = currentStep === idx;
                        const icons = ['📋', '✅', '⏳', '🚚', '📦', '✅'];
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: done ? '#2E7D32' : '#e0e0e0',
                              border: active ? '3px solid #A5D6A7' : 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, color: done ? '#fff' : '#bbb',
                              boxShadow: active ? '0 0 0 3px rgba(46,125,50,0.15)' : 'none',
                              transition: 'all 0.3s ease'
                            }}>
                              {done ? icons[idx] : '○'}
                            </div>
                            <div style={{ fontSize: 10, textAlign: 'center', marginTop: 4, color: done ? '#2E7D32' : '#bbb', fontWeight: active ? 700 : 400, lineHeight: 1.2 }}>
                              {step}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Order Tracking Modal ── */}
      <OrderTrackingModal
        open={trackingModalOpen}
        orderId={selectedOrderId}
        onClose={() => setTrackingModalOpen(false)}
        onOrderUpdated={fetchUserOrders}
      />
    </div>
  );
};

export default Orders;
