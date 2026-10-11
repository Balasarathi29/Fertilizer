import React, { useState, useEffect, useContext } from 'react';
import { Typography, Row, Col, Card, Button, Tag, Spin, notification, Progress, Divider, Avatar, Alert } from 'antd';
import { CrownOutlined, CheckCircleOutlined, RocketOutlined, ShoppingOutlined, SafetyCertificateOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;

const BhoomiCardPage = () => {
  const { user, requireAuth, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cardStatusData, setCardStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBhoomiCardStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchBhoomiCardStatus = async () => {
    setLoading(true);
    try {
      const data = await apiService.getBhoomiCardStatus();
      setCardStatusData(data);
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCard = () => {
    requireAuth(async () => {
      setSubmitting(true);
      try {
        const res = await apiService.purchaseBhoomiCard();
        notification.success({
          message: '🎉 Bhoomi Card Activated Successfully!',
          description: `Card ${res.card.card_number} activated! You get ${res.card.discount_percentage}% OFF on future orders.`,
          duration: 6
        });
        fetchBhoomiCardStatus();
      } catch (err) {
        notification.error({
          message: 'Purchase Failed',
          description: err.message || 'Complete at least 1 order to unlock Bhoomi Card membership.'
        });
      } finally {
        setSubmitting(false);
      }
    });
  };

  const config = cardStatusData?.config || { price: 200, discount_percentage: 10, validity_days: 365, is_enabled: true };
  const userCard = cardStatusData?.card || null;
  const isEligible = cardStatusData?.is_eligible || false;
  const completedOrdersCount = cardStatusData?.completed_orders_count || 0;
  const isCardActive = userCard && userCard.status === 'Active';

  return (
    <div style={{ padding: '60px 10%', background: 'var(--bg-app)', minHeight: '100vh' }}>
      {/* ─── HERO HEADER ─── */}
      <div style={{ textAlign: 'center', marginBottom: 40, maxWidth: 800, margin: '0 auto 40px' }}>
        <CrownOutlined style={{ fontSize: 56, color: '#D4AF37', marginBottom: 12 }} />
        <Title level={1} style={{ color: '#2E7D32', margin: 0 }}>
          Bhoomi Card VIP Membership
        </Title>
        <Text type="secondary" style={{ fontSize: 18, marginTop: 8, display: 'block' }}>
          Exclusive loyalty card for smart organic farmers. Unlock instant flat discounts on every order.
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <Row gutter={[32, 32]} justify="center">
          {/* ─── DIGITAL CARD DISPLAY ─── */}
          <Col xs={24} md={12} lg={10}>
            <Card
              style={{
                borderRadius: 24,
                height: 280,
                background: isCardActive
                  ? 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
                  : 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                color: '#fff',
                boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                position: 'relative',
                border: '2px solid #D4AF37',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text style={{ color: '#D4AF37', fontWeight: 800, letterSpacing: 2, fontSize: 14 }}>BHOOMI BLOOM</Text>
                  <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>VIP MEMBER CARD</Title>
                </div>
                <CrownOutlined style={{ fontSize: 36, color: '#D4AF37' }} />
              </div>

              <div style={{ margin: '20px 0' }}>
                <Text style={{ color: '#A0AEC0', fontSize: 12, letterSpacing: 1 }}>CARD NUMBER</Text>
                <Title level={3} style={{ color: '#fff', margin: '4px 0', letterSpacing: 4, fontFamily: 'monospace' }}>
                  {userCard ? userCard.card_number : 'BH-CARD-XXXXXX'}
                </Title>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <Text style={{ color: '#A0AEC0', fontSize: 11 }}>MEMBER NAME</Text>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                    {(userCard?.customer_name || user?.name || 'Valued Farmer').toUpperCase()}
                  </div>
                </div>
                <Tag color="gold" style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>
                  {config.discount_percentage}% OFF
                </Tag>
              </div>
            </Card>
          </Col>

          {/* ─── MEMBERSHIP STATUS & ACTION ─── */}
          <Col xs={24} md={12} lg={12}>
            <Card className="glass-panel" style={{ borderRadius: 20, padding: 12 }}>
              <Title level={3} style={{ marginTop: 0 }}>Membership Status</Title>

              {isCardActive ? (
                <div>
                  <Alert
                    message="Bhoomi Card Active!"
                    description={`Your membership (${userCard.card_number}) is active and valid until ${userCard.expiry_date ? userCard.expiry_date.slice(0, 10) : '365 Days'}. Enjoy ${userCard.discount_percentage}% discount on all future checkouts!`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 12 }}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingOutlined />}
                    style={{ background: '#2E7D32', borderColor: '#2E7D32', height: 48, fontWeight: 700, borderRadius: 12 }}
                    onClick={() => navigate('/products')}
                    block
                  >
                    Shop Now with {userCard.discount_percentage}% Discount
                  </Button>
                </div>
              ) : isEligible ? (
                <div>
                  <Tag color="green" style={{ fontSize: 13, padding: '4px 8px', borderRadius: 6, marginBottom: 12 }}>
                    🎉 Eligible to Join!
                  </Tag>
                  <Paragraph style={{ fontSize: 15 }}>
                    You have completed <strong>{completedOrdersCount} order(s)</strong>! Purchase your Bhoomi Card now for <strong>{formatCurrency(config.price)}</strong> and start saving <strong>{config.discount_percentage}%</strong> on every purchase!
                  </Paragraph>

                  <Button
                    type="primary"
                    size="large"
                    icon={<CrownOutlined />}
                    loading={submitting}
                    onClick={handlePurchaseCard}
                    style={{ background: '#D4AF37', borderColor: '#D4AF37', color: '#1a1a1a', height: 52, fontWeight: 800, fontSize: 16, borderRadius: 12 }}
                    block
                  >
                    Activate Bhoomi Card ({formatCurrency(config.price)})
                  </Button>
                </div>
              ) : (
                <div>
                  <Tag color="orange" style={{ fontSize: 13, padding: '4px 8px', borderRadius: 6, marginBottom: 12 }}>
                    Complete 1 Order to Unlock
                  </Tag>
                  <Paragraph style={{ fontSize: 15 }}>
                    Bhoomi Card membership is unlocked after your 1st completed order. Place your first order to get eligible!
                  </Paragraph>

                  <div style={{ margin: '16px 0' }}>
                    <Progress percent={completedOrdersCount >= 1 ? 100 : 0} format={() => `${completedOrdersCount}/1 Orders Completed`} strokeColor="#2E7D32" />
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<RocketOutlined />}
                    onClick={() => navigate('/products')}
                    style={{ background: '#2E7D32', borderColor: '#2E7D32', height: 48, fontWeight: 700, borderRadius: 12 }}
                    block
                  >
                    Explore Products & Place 1st Order
                  </Button>
                </div>
              )}

              <Divider style={{ margin: '24px 0' }} />

              <Title level={5}>Member Benefits</Title>
              <div style={{ lineHeight: 2 }}>
                <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> Flat {config.discount_percentage}% discount auto-applied at checkout</Text><br />
                <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> {config.validity_days} Days full validity</Text><br />
                <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> Priority shipping & dedicated agricultural support</Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default BhoomiCardPage;
