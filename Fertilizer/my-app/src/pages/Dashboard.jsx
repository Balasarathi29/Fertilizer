import React, { useEffect, useState, useContext } from 'react';
import { Typography, Row, Col, Card, Avatar, Divider, List, Tag, Spin, Button, Table, notification, Progress, Space, Input } from 'antd';
import {
  UserOutlined, InboxOutlined, HeatMapOutlined, CheckCircleOutlined,
  ShoppingOutlined, SettingOutlined, RocketOutlined, CloudOutlined,
  EnvironmentOutlined, ExperimentOutlined, RiseOutlined, CrownOutlined,
  CheckOutlined, StarOutlined
} from '@ant-design/icons';
import { AuthContext, useDarkMode } from '../App';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import OrderTrackingModal from '../components/OrderTrackingModal';

const { Title, Text } = Typography;

const Dashboard = () => {
  const isDark = useDarkMode();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropHistory, setCropHistory] = useState([]);

  // Order Tracking Modal State
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  // Bhoomi Card state
  const [bhoomiCardData, setBhoomiCardData] = useState(null);
  const [purchasingCard, setPurchasingCard] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    loadCropHistory();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, cardData] = await Promise.all([
        apiService.getDashboardStats().catch(() => null),
        apiService.getOrders().catch(() => []),
        apiService.getBhoomiCardStatus().catch(() => null)
      ]);

      setStats(statsData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setBhoomiCardData(cardData);
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseBhoomiCard = async () => {
    setPurchasingCard(true);
    try {
      const res = await apiService.purchaseBhoomiCard();
      notification.success({
        message: '🎉 Bhoomi Card Activated!',
        description: `Your card (${res.card.card_number}) is active. Enjoy ${res.card.discount_percentage}% discount on future orders!`,
        duration: 6
      });
      fetchDashboardData();
    } catch (err) {
      notification.error({
        message: 'Purchase Failed',
        description: err.message || 'Could not purchase Bhoomi Card. Please complete at least 1 order first.'
      });
    } finally {
      setPurchasingCard(false);
    }
  };

  const loadCropHistory = () => {
    try {
      const stored = localStorage.getItem('crop_history');
      if (stored) {
        setCropHistory(JSON.parse(stored));
      } else {
        setCropHistory([
          {
            id: 1,
            crop: 'Wheat',
            confidence: '95.2%',
            yield: '3.0 Tons/Acre',
            state: 'Punjab',
            district: 'Ludhiana',
            date: 'Today',
            weather: '27.5°C Partly Cloudy'
          }
        ]);
      }
    } catch (err) {
      setCropHistory([]);
    }
  };

  const latestPrediction = cropHistory[0] || null;

  // Bhoomi Card calculations
  const cardConfig = bhoomiCardData?.config || { price: 100, discount_percentage: 10, validity_days: 365, is_enabled: true };
  const userCard = bhoomiCardData?.card || null;
  const isEligible = bhoomiCardData?.is_eligible || false;
  const completedOrdersCount = bhoomiCardData?.completed_orders_count || 0;
  const isCardActive = userCard && userCard.status === 'Active';

  return (
    <div style={{ padding: '40px 10%', background: 'var(--bg-app)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>My Farmer Dashboard</Title>
          <Text type="secondary">Overview of your agricultural investments, orders, and AI crop recommendations.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            type="primary"
            icon={<RocketOutlined />}
            style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 10 }}
            onClick={() => navigate('/crop-recommendation')}
          >
            New Crop Analysis
          </Button>
        </div>
      </div>

      {/* ─── BHOOMI CARD MEMBERSHIP BANNER / WIDGET ─── */}
      <Card
        style={{
          borderRadius: 20,
          marginBottom: 32,
          background: isCardActive
            ? 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)'
            : isEligible
            ? 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8faf8 100%)',
          color: isCardActive || isEligible ? '#ffffff' : 'inherit',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: isCardActive ? '2px solid #D4AF37' : '1px solid #E2E8F0'
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                size={64}
                icon={<CrownOutlined />}
                style={{
                  background: isCardActive ? '#D4AF37' : '#2E7D32',
                  color: isCardActive ? '#1a1a1a' : '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Title level={3} style={{ margin: 0, color: isCardActive || isEligible ? '#fff' : '#2E7D32' }}>
                    {isCardActive ? 'Bhoomi Card VIP Member' : 'Bhoomi Card Loyalty Membership'}
                  </Title>
                  {isCardActive && <Tag color="gold" style={{ fontSize: 13, fontWeight: 700, borderRadius: 6 }}>ACTIVE</Tag>}
                </div>
                
                {isCardActive ? (
                  <div style={{ marginTop: 8, opacity: 0.9 }}>
                    <Text style={{ color: '#fff', fontSize: 14 }}>
                      Card Code: <strong>{userCard.card_number}</strong> | Discount: <strong style={{ color: '#D4AF37' }}>{userCard.discount_percentage}% OFF</strong> on all future purchases
                    </Text>
                    <br />
                    <Text style={{ color: '#E2E8F0', fontSize: 12 }}>
                      Valid until: {userCard.expiry_date ? userCard.expiry_date.slice(0, 10) : '365 Days'}
                    </Text>
                  </div>
                ) : isEligible ? (
                  <div style={{ marginTop: 8, opacity: 0.9 }}>
                    <Text style={{ color: '#fff', fontSize: 14 }}>
                      🎉 Congratulations! You have completed <strong>{completedOrdersCount} order(s)</strong> and unlocked Bhoomi Card eligibility!
                    </Text>
                    <br />
                    <Text style={{ color: '#CBD5E0', fontSize: 12 }}>
                      Enjoy automatic {cardConfig.discount_percentage}% discount on eligible future orders.
                    </Text>
                  </div>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Complete your 1st order to unlock Bhoomi Card membership eligibility!
                    </Text>
                    <div style={{ maxWidth: 300, marginTop: 8 }}>
                      <Progress percent={completedOrdersCount >= 1 ? 100 : 0} format={() => `${completedOrdersCount}/1 Orders`} strokeColor="#2E7D32" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            {isCardActive ? (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="large"
                style={{ background: '#D4AF37', borderColor: '#D4AF37', color: '#1a1a1a', fontWeight: 700, borderRadius: 10 }}
              >
                {userCard.discount_percentage}% Discount Active
              </Button>
            ) : isEligible ? (
              <Button
                type="primary"
                icon={<CrownOutlined />}
                size="large"
                loading={purchasingCard}
                onClick={handlePurchaseBhoomiCard}
                style={{ background: '#D4AF37', borderColor: '#D4AF37', color: '#1a1a1a', fontWeight: 700, borderRadius: 10, height: 48 }}
              >
                Purchase Bhoomi Card ({formatCurrency(cardConfig.price)})
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<ShoppingOutlined />}
                size="large"
                onClick={() => navigate('/products')}
                style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 10 }}
              >
                Explore Products to Order
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Profile & Recent Region Card */}
        <Col xs={24} md={8}>
          <Card className="glass-panel" style={{ textAlign: 'center', borderRadius: 20 }}>
            <Avatar size={90} icon={<UserOutlined />} style={{ marginBottom: 16, background: '#2E7D32' }} />
            <Title level={4} style={{ marginBottom: 4 }}>{user?.name || 'Farmer Account'}</Title>
            <Tag color="green" style={{ borderRadius: 10, fontSize: 12 }}>{user?.role ? user.role.toUpperCase() : 'FARMER'}</Tag>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'left', lineHeight: 2 }}>
              <Text strong>Email:</Text> <Text>{user?.email || 'farmer@bhoomibloom.com'}</Text><br />
              <Text strong>Mobile:</Text> <Text>{user?.mobile || user?.phone || '+91 9876543210'}</Text><br />
              <Text strong>Recent State:</Text> <Text>{latestPrediction?.state || user?.location || 'Punjab'}</Text><br />
              <Text strong>Recent District:</Text> <Text>{latestPrediction?.district || 'Ludhiana'}</Text>
            </div>
          </Card>

          {/* Weather Snapshot Card */}
          {latestPrediction && (
            <Card className="glass-panel" title={<span style={{ fontSize: 16, fontWeight: 700 }}><CloudOutlined style={{ color: '#0288D1', marginRight: 8 }} /> Regional Weather Snapshot</span>} style={{ marginTop: 24, borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary"><EnvironmentOutlined /> {latestPrediction.district}, {latestPrediction.state}</Text>
                  <Title level={3} style={{ margin: '4px 0', color: '#0288D1' }}>{latestPrediction.weather}</Title>
                </div>
                <Tag color="blue">Live Climate</Tag>
              </div>
            </Card>
          )}
        </Col>

        {/* Analytics, Predictions & Orders */}
        <Col xs={24} md={16}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
          ) : (
            <>
              {/* Key Metrics */}
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12}>
                  <Card className="glass-panel" style={{ borderRadius: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Avatar size={48} style={{ background: '#e8f5e9', color: '#2E7D32' }} icon={<InboxOutlined />} />
                      <div>
                        <Title level={4} style={{ margin: 0 }}>{orders.length}</Title>
                        <Text type="secondary">Total Orders Placed</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card className="glass-panel" style={{ borderRadius: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Avatar size={48} style={{ background: isDark ? 'rgba(201, 162, 39, 0.15)' : '#fff8e1', color: '#C9A227' }} icon={<ShoppingOutlined />} />
                      <div>
                        <Title level={4} style={{ margin: 0 }}>₹{(stats?.metrics?.totalSpent || 0).toLocaleString()}</Title>
                        <Text type="secondary">Total Invested in Organic Farming</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Latest AI Crop Recommendation Snapshot */}
              {latestPrediction && (
                <Card
                  className="glass-panel"
                  title={<span style={{ fontSize: 16, fontWeight: 700 }}><RocketOutlined style={{ color: '#2E7D32', marginRight: 8 }} /> Last AI Crop Recommendation</span>}
                  style={{ marginTop: 24, borderRadius: 20 }}
                  extra={<Tag color="green">Confidence: {latestPrediction.confidence}</Tag>}
                >
                  <Row gutter={[16, 16]} align="middle">
                    <Col span={12}>
                      <Text type="secondary">Recommended Crop</Text>
                      <Title level={3} style={{ margin: 0, color: '#2E7D32' }}>{latestPrediction.crop}</Title>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Expected Yield</Text>
                      <Title level={4} style={{ margin: 0 }}>{latestPrediction.yield}</Title>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Crop Prediction History */}
              <Card
                className="glass-panel"
                title={<span style={{ fontSize: 16, fontWeight: 700 }}><RiseOutlined style={{ color: '#7B1FA2', marginRight: 8 }} /> Prediction History Log</span>}
                style={{ marginTop: 24, borderRadius: 20 }}
              >
                <Table
                  dataSource={cropHistory}
                  rowKey="id"
                  pagination={{ pageSize: 4 }}
                  columns={[
                    { title: 'Date', dataIndex: 'date', key: 'date' },
                    { title: 'Location', key: 'location', render: (_, r) => `${r.district}, ${r.state}` },
                    { title: 'Recommended Crop', dataIndex: 'crop', key: 'crop', render: val => <Tag color="green">{val}</Tag> },
                    { title: 'Confidence', dataIndex: 'confidence', key: 'confidence' },
                    { title: 'Yield', dataIndex: 'yield', key: 'yield' }
                  ]}
                />
              </Card>

              {/* My Orders — Flipkart-style tracking cards */}
              <Card
                className="glass-panel"
                title={<span style={{ fontSize: 16, fontWeight: 700 }}><InboxOutlined style={{ color: '#2E7D32', marginRight: 8 }} /> My Orders</span>}
                style={{ marginTop: 24, borderRadius: 20 }}
                extra={<Button type="link" size="small" onClick={() => navigate('/products')}>Shop More →</Button>}
              >
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>
                    No orders placed yet. <Button type="link" onClick={() => navigate('/products')}>Explore Marketplace</Button>
                  </div>
                ) : (
                  orders.slice(0, 8).map((order) => {
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
                      <div key={order.order_id} style={{ border: '1px solid #e6f4ea', borderRadius: 16, padding: '18px 20px', marginBottom: 20, background: '#fafffe' }}>
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <Text strong style={{ fontSize: 14, color: '#1B2E1E' }}>Order ID: {order.order_id}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {order.order_date ? new Date(order.order_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Space>
                              <Tag color={statusColor} style={{ fontSize: 13, padding: '3px 10px', borderRadius: 10 }}>
                                {isCancelled ? '❌ Cancelled' : order.order_status}
                              </Tag>
                              <Button
                                size="small"
                                type="primary"
                                style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                                onClick={() => {
                                  setSelectedOrderId(order.order_id);
                                  setTrackingModalOpen(true);
                                }}
                              >
                                🚚 Track Package
                              </Button>
                            </Space>
                            <br />
                            <Text strong style={{ color: '#2E7D32', fontSize: 16 }}>₹{(order.total_amount || 0).toLocaleString()}</Text>
                          </div>
                        </div>

                        {/* Order Items */}
                        {orderItems.length > 0 && (
                          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                            {orderItems.slice(0, 3).map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontSize: 13 }}>🌱 {item.name} × {item.quantity}</Text>
                                <Text strong style={{ fontSize: 13 }}>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</Text>
                              </div>
                            ))}
                            {orderItems.length > 3 && <Text type="secondary" style={{ fontSize: 11 }}>+{orderItems.length - 3} more items</Text>}
                          </div>
                        )}

                        {/* Breakdown Row */}
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, color: '#666', marginBottom: 12 }}>
                          {order.items_subtotal != null && <span>Subtotal: <strong>₹{order.items_subtotal}</strong></span>}
                          {order.shipping_charge != null && (
                            <span>Shipping: <strong style={{ color: order.shipping_charge === 0 ? '#52C41A' : '#fa541c' }}>
                              {order.shipping_charge === 0 ? 'FREE ✅' : `₹${order.shipping_charge}`}
                            </strong></span>
                          )}
                          {order.discount_amount > 0 && <span>Discount: <strong style={{ color: '#2E7D32' }}>-₹{order.discount_amount}</strong></span>}
                          <span>Payment: <strong>{order.payment_method}</strong></span>
                          <span>Status: <strong>{order.payment_status || 'Paid'}</strong></span>
                        </div>

                        {/* Delivery Address */}
                        {(order.delivery_location?.formatted_address || order.shipping_address) && (
                          <div style={{ fontSize: 12, color: '#666', marginBottom: isCancelled ? 0 : 12 }}>
                            <EnvironmentOutlined style={{ color: '#2E7D32', marginRight: 4 }} />
                            {order.delivery_location?.formatted_address || order.shipping_address}
                          </div>
                        )}

                        {/* Status Progress Stepper (hidden if cancelled) */}
                        {!isCancelled && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                              {/* Progress line */}
                              <div style={{ position: 'absolute', top: 14, left: 0, right: 0, height: 2, background: '#e0e0e0', zIndex: 0 }} />
                              <div style={{
                                position: 'absolute', top: 14, left: 0, height: 2, background: '#2E7D32', zIndex: 1,
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
                                    <div style={{ fontSize: 9, textAlign: 'center', marginTop: 4, color: done ? '#2E7D32' : '#bbb', fontWeight: active ? 700 : 400, lineHeight: 1.2, maxWidth: 56 }}>
                                      {step}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </Card>
            </>
          )}
        </Col>
      </Row>

      {/* ─── Order Tracking Modal ─── */}
      <OrderTrackingModal
        open={trackingModalOpen}
        orderId={selectedOrderId}
        onClose={() => setTrackingModalOpen(false)}
        onOrderUpdated={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
