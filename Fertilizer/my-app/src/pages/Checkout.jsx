import React, { useContext, useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Form, Input, Button, Divider, Steps, notification, Select, Radio, Spin, Tag } from 'antd';
import { CreditCardOutlined, SafetyCertificateOutlined, CheckCircleOutlined, BankOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext, useDarkMode } from '../App';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/formatters';

const { Title, Text } = Typography;

const Checkout = () => {
  const isDark = useDarkMode();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Bhoomi Card state
  const [bhoomiCardData, setBhoomiCardData] = useState(null);
  
  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    setLoading(true);
    try {
      const [cartData, cardStatusData] = await Promise.all([
        apiService.getCart().catch(() => ({ items: [] })),
        apiService.getBhoomiCardStatus().catch(() => null)
      ]);

      if (cartData?.items && Array.isArray(cartData.items) && cartData.items.length > 0) {
        setCartItems(cartData.items);
      } else {
        setCartItems([]);
      }

      setBhoomiCardData(cardStatusData);
    } catch (e) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * Math.max(1, parseInt(item.quantity) || 1)), 0);

  // Shipping Rule: below ₹200 = ₹60, ₹200+ = FREE
  const baseShipping = subtotal < 200 ? 60 : 0;

  // Compute Bhoomi Card discount
  const activeCard = bhoomiCardData?.card && bhoomiCardData.card.status === 'Active' ? bhoomiCardData.card : null;
  const cardDiscountPct = activeCard ? (activeCard.discount_percentage || 10.0) : 0.0;
  const bhoomiDiscountAmount = activeCard ? Math.round((subtotal * cardDiscountPct) / 100) : 0;

  // Compute Coupon discount
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount_amount || 0 : 0;
  const isFreeShippingCoupon = appliedCoupon?.discount_type === 'shipping';
  const shipping = isFreeShippingCoupon ? 0 : baseShipping;

  const totalDiscount = bhoomiDiscountAmount + couponDiscountAmount;
  const total = Math.max(0, subtotal - totalDiscount + shipping);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await apiService.applyCoupon(couponCodeInput.trim(), subtotal);
      setAppliedCoupon(res);
      notification.success({ message: 'Coupon Applied!', description: res.message });
    } catch (err) {
      notification.error({ message: 'Coupon Error', description: err.message || 'Invalid coupon code.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      // Read saved delivery location if any
      let deliveryLocationSnapshot = null;
      try {
        const savedLoc = localStorage.getItem('bhoomi_delivery_location');
        if (savedLoc) deliveryLocationSnapshot = JSON.parse(savedLoc);
      } catch {}

      const orderPayload = {
        items: cartItems.map(i => ({
          product_id: i.product_id || i.id,
          name: i.name,
          price: i.price,
          quantity: Math.max(1, parseInt(i.quantity) || 1),
          image: i.image || ''
        })),
        shipping_address: deliveryLocationSnapshot?.formatted_address ||
          `${values.address}, ${values.city || ''}, ${values.state || ''} - ${values.pincode || ''}`,
        payment_method: paymentMethod,
        total_amount: total,
        discount_amount: totalDiscount,
        shipping_charge: shipping,
        coupon_code: appliedCoupon?.code || '',
        delivery_location: deliveryLocationSnapshot || {
          formatted_address: `${values.address}, ${values.city || ''}, ${values.state || ''} - ${values.pincode || ''}`,
          city: values.city || '',
          state: values.state || '',
          pincode: values.pincode || ''
        }
      };

      const res = await apiService.createOrder(orderPayload);

      notification.success({
        message: 'Order Placed Successfully!',
        description: `Order ID ${res.order_id || 'BB-ORD-1001'} placed for ${formatCurrency(total)}.`,
        icon: <CheckCircleOutlined style={{ color: '#2E7D32' }} />,
        placement: 'topRight',
      });

      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      notification.error({
        message: 'Checkout Failed',
        description: err.message || 'Failed to place order. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '60px 10%', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Title level={2} style={{ color: '#2E7D32' }}>Secure Checkout</Title>
        <Steps 
          current={1} 
          items={[
            { title: 'Cart' },
            { title: 'Shipping & Payment' },
            { title: 'Confirmation' },
          ]}
          style={{ maxWidth: 600, margin: '0 auto' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Title level={4}>Shipping Information</Title>
              <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleFinish} 
                initialValues={{ 
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: user?.mobile || user?.phone || '',
                  address: user?.location || 'Main Village Road, Farm Bed #4',
                  city: 'Bathinda',
                  state: 'Punjab',
                  pincode: '151001'
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter name' }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="phone" label="Mobile Phone" rules={[{ required: true, message: 'Please enter phone' }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="address" label="Farm / Delivery Address" rules={[{ required: true, message: 'Please enter address' }]}>
                  <Input.TextArea rows={2} placeholder="Enter your full farm/delivery address" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="city" label="City / Town" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="state" label="State" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="pincode" label="PIN Code" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>Select Payment Method</Title>
                <div style={{ marginBottom: 20 }}>
                  <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} buttonStyle="solid" size="large">
                    <Radio.Button value="UPI">📱 UPI / GPay / PhonePe</Radio.Button>
                    <Radio.Button value="Card">💳 Credit / Debit Card</Radio.Button>
                    <Radio.Button value="COD">💵 Cash on Delivery</Radio.Button>
                  </Radio.Group>
                </div>

                <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 12, marginBottom: 24, border: '1px solid #e0e0e0' }}>
                  <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <SafetyCertificateOutlined style={{ color: '#52c41a' }} /> 256-bit Encrypted SSL Payment Gateway
                  </Text>
                  {paymentMethod === 'Card' && (
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item name="cardNumber" label="Card Number">
                          <Input size="large" prefix={<CreditCardOutlined />} placeholder="4532 0000 0000 0000" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  {paymentMethod === 'UPI' && (
                    <Form.Item name="upiId" label="UPI ID / VPA">
                      <Input size="large" prefix={<BankOutlined />} placeholder="farmer@upi or 9876543210@paytm" />
                    </Form.Item>
                  )}
                  {paymentMethod === 'COD' && (
                    <Text strong style={{ color: '#2E7D32' }}>Pay with Cash or UPI upon doorstep delivery to your farm.</Text>
                  )}
                </div>

                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block 
                  loading={submitting}
                  style={{ background: '#C9A227', borderColor: '#C9A227', color: '#1a1a1a', fontWeight: 700, height: 56, fontSize: 18 }}
                >
                  Place Order ({formatCurrency(total)})
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Title level={4}>Order Summary</Title>
              <Divider style={{ margin: '16px 0' }} />

              {cartItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                  <span>{item.name} x {item.quantity || 1}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                </div>
              ))}

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text>Subtotal</Text>
                <Text strong>{formatCurrency(subtotal)}</Text>
              </div>

              {activeCard && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, background: '#f0fdf4', padding: '8px 12px', borderRadius: 8 }}>
                  <Text style={{ color: '#2E7D32', fontWeight: 600 }}>
                    <CrownOutlined style={{ marginRight: 6, color: '#C9A227' }} />
                    Bhoomi Card Discount ({cardDiscountPct}%)
                  </Text>
                  <Text strong style={{ color: '#2E7D32' }}>-{formatCurrency(bhoomiDiscountAmount)}</Text>
                </div>
              )}

              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, background: isDark ? 'rgba(250, 140, 22, 0.12)' : '#fffbe6', padding: '8px 12px', borderRadius: 8 }}>
                  <Text style={{ color: isDark ? '#e6c96a' : '#d48806', fontWeight: 600 }}>
                    🏷️ Coupon ({appliedCoupon.code})
                  </Text>
                  <Text strong style={{ color: isDark ? '#e6c96a' : '#d48806' }}>-{formatCurrency(couponDiscountAmount)}</Text>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text>Shipping</Text>
                <Text strong style={{ color: shipping === 0 ? '#52c41a' : undefined }}>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </Text>
              </div>

              {/* Coupon Application Box */}
              <div style={{ margin: '16px 0' }}>
                <Input.Search
                  placeholder="Enter Spin / Promo Coupon Code"
                  value={couponCodeInput}
                  onChange={e => setCouponCodeInput(e.target.value)}
                  onSearch={handleApplyCoupon}
                  enterButton="Apply"
                  loading={couponLoading}
                  size="middle"
                />
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {activeCard && (
                <div style={{ marginBottom: 16 }}>
                  <Tag color="gold" style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6 }}>
                    ✨ Active Member: {activeCard.card_number}
                  </Tag>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Total Amount</Title>
                <Title level={3} style={{ color: '#2E7D32', margin: 0 }}>{formatCurrency(total)}</Title>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Checkout;
