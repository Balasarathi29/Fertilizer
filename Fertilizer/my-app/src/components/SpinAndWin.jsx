import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Typography, Tag, Card, Row, Col, Tabs, notification, Spin, Alert as AntAlert } from 'antd';
import { GiftOutlined, TrophyOutlined, CopyOutlined, CheckOutlined, ShoppingCartOutlined, CrownOutlined, SafetyCertificateOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { AuthContext, useDarkMode } from '../App';

const { Title, Text, Paragraph } = Typography;

// Helper: Custom Canvas Confetti Explosion
const triggerConfetti = () => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const particles = [];
    const colors = ['#2E7D32', '#D4AF37', '#1565C0', '#7B1FA2', '#E65100', '#FFD700', '#4CAF50'];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 100,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10
      });
    }

    let opacity = 1;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.rSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      opacity -= 0.015;
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };
    animate();
  } catch (e) {}
};

const DEFAULT_WHEEL_REWARDS = [
  { index: 0, label: "10% OFF First Order", code: "SPIN-10PER", type: "percentage", val: "10%", color: "#2E7D32" },
  { index: 1, label: "₹100 OFF First Order", code: "SPIN-FLAT100", type: "flat", val: "₹100", color: "#D4AF37" },
  { index: 2, label: "Free Shipping Voucher", code: "SPIN-FREESHIP", type: "shipping", val: "FREE", color: "#1565C0" },
  { index: 3, label: "15% Mega Discount", code: "SPIN-15PER", type: "percentage", val: "15%", color: "#7B1FA2" },
  { index: 4, label: "Free Seeds Sample", code: "SPIN-FREE-SEED", type: "gift", val: "FREE SEED", color: "#E65100" },
  { index: 5, label: "Better Luck Next Time", code: "NONE", type: "none", val: "TRY AGAIN", color: "#757575" }
];

const SpinAndWin = () => {
  const isDark = useDarkMode();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [wonReward, setWonReward] = useState(null);
  const [activeTab, setActiveTab] = useState('spin');
  const [wonCoupons, setWonCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  // Backend status state
  const [wheelStatus, setWheelStatus] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchStatus();
      fetchWonCoupons();
    }
  }, [visible, isAuthenticated]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSpinWheelStatus();
      setWheelStatus(data);
    } catch (e) {
      setWheelStatus({ eligible: false, reason: 'error', message: 'Could not connect to Spin Wheel service.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchWonCoupons = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiService.getMyCoupons();
      if (data?.won_coupons) {
        setWonCoupons(data.won_coupons);
      }
    } catch (e) {}
  };

  const handleSpin = async () => {
    if (spinning) return;

    if (!isAuthenticated) {
      setVisible(false);
      navigate('/login');
      notification.info({ message: 'Login Required', description: 'Please login or register to spin the First-Order Fortune Wheel!' });
      return;
    }

    const isAdmin = wheelStatus?.is_admin || user?.role?.toLowerCase() === 'admin';
    setSpinning(true);
    setWonReward(null);

    let rewardObj = null;
    let availableRewards = wheelStatus?.rewards || DEFAULT_WHEEL_REWARDS;

    try {
      let apiRes;
      if (isAdmin) {
        apiRes = await apiService.adminTestSpin();
      } else {
        apiRes = await apiService.spinWheel();
      }

      if (apiRes.allowed && apiRes.reward) {
        const winCode = apiRes.reward.code;
        // Find index matching backend reward
        const matchIdx = availableRewards.findIndex(r => r.code === winCode);
        const selectedIdx = matchIdx >= 0 ? matchIdx : 0;
        rewardObj = availableRewards[selectedIdx] || availableRewards[0];
        rewardObj.expiry_date = apiRes.reward.expiry_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        rewardObj.label = apiRes.reward.label || rewardObj.label;
        rewardObj.code = apiRes.reward.code || rewardObj.code;
      } else {
        setSpinning(false);
        notification.warning({ message: 'Spin Unavailable', description: apiRes.message || 'You cannot spin right now.' });
        return;
      }
    } catch (err) {
      setSpinning(false);
      notification.error({ message: 'Spin Failed', description: err.message || 'Could not complete spin.' });
      return;
    }

    // Calculate wheel rotation (5 full spins = 1800deg + target segment center)
    const numSlices = availableRewards.length || 6;
    const sliceAngle = 360 / numSlices;
    const targetCenter = 360 - (rewardObj.index * sliceAngle + sliceAngle / 2);
    const totalRotation = rotationDeg + 1800 + (targetCenter - (rotationDeg % 360));

    setRotationDeg(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setWonReward(rewardObj);

      if (rewardObj.type !== 'none' && (rewardObj.reward_type !== 'none')) {
        triggerConfetti();
        if (!isAdmin) {
          fetchWonCoupons();
        }
      }

      // Refresh status to update eligibility view
      fetchStatus();
    }, 4200);
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    notification.success({ message: 'Coupon Copied!', description: `${code} copied to clipboard.` });
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const rewardsList = wheelStatus?.rewards && wheelStatus.rewards.length > 0 ? wheelStatus.rewards : DEFAULT_WHEEL_REWARDS;
  const isEligible = wheelStatus?.eligible;
  const isAdmin = wheelStatus?.is_admin || user?.role?.toLowerCase() === 'admin';

  return (
    <>
      <Button
        type="primary"
        shape="round"
        icon={<GiftOutlined />}
        onClick={() => setVisible(true)}
        style={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #D4AF37 100%)',
          borderColor: '#D4AF37',
          color: '#fff',
          fontWeight: 800,
          boxShadow: '0 4px 14px rgba(27,67,50,0.4)',
          border: '1px solid #D4AF37'
        }}
      >
        Spin & Win 🎯
      </Button>

      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={560}
        centered
        destroyOnClose
        style={{ borderRadius: 24, overflow: 'hidden' }}
      >
        <div style={{ padding: '10px 0' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'spin',
                label: <span><GiftOutlined /> First-Order Spin & Win</span>,
                children: (
                  <div style={{ padding: '8px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                      <CrownOutlined style={{ fontSize: 24, color: '#D4AF37' }} />
                      <Title level={3} style={{ color: '#1B4332', margin: 0, fontWeight: 800 }}>
                        Bhoomi Bloom Spin & Win
                      </Title>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                      Exclusive First-Order Opportunity · Sustainable Farming Rewards
                    </Text>

                    {isAdmin && (
                      <AntAlert
                        message="Admin Preview & Test Mode"
                        description="You are logged in as Admin. Test spins will run full animations without consuming customer rewards or generating real coupons."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 12, textAlign: 'left' }}
                      />
                    )}

                    {loading ? (
                      <div style={{ padding: '60px 0' }}><Spin size="large" /></div>
                    ) : (
                      <>
                        {/* ─── SVG WHEEL DISPLAY ─── */}
                        <div style={{ position: 'relative', width: 290, height: 290, margin: '16px auto 24px' }}>
                          {/* Top Pointer */}
                          <div style={{
                            position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                            zIndex: 10, width: 0, height: 0,
                            borderLeft: '16px solid transparent',
                            borderRight: '16px solid transparent',
                            borderTop: '26px solid #D4AF37',
                            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))'
                          }} />

                          {/* Outer Wheel Container */}
                          <div style={{
                            width: '100%', height: '100%', borderRadius: '50%',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: '0 12px 30px rgba(27,67,50,0.3)',
                            border: '6px solid #D4AF37',
                            transition: 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)',
                            transform: `rotate(${rotationDeg}deg)`
                          }}>
                            {/* Conic Gradient Slices */}
                            <div style={{
                              width: '100%', height: '100%', borderRadius: '50%',
                              background: `conic-gradient(${rewardsList.map((r, i) =>
                                `${r.color || '#2E7D32'} ${(i * 360 / rewardsList.length).toFixed(2)}deg ${((i + 1) * 360 / rewardsList.length).toFixed(2)}deg`
                              ).join(', ')})`
                            }} />

                            {/* Slice Labels Overlay */}
                            {rewardsList.map((r, i) => {
                              const angle = (i * 360 / rewardsList.length) + (360 / rewardsList.length / 2);
                              return (
                                <div
                                  key={i}
                                  style={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    transformOrigin: '0 0',
                                    transform: `rotate(${angle}deg) translate(20px, -50%)`,
                                    color: '#fff', fontWeight: 800, fontSize: 11,
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                                    pointerEvents: 'none', whiteSpace: 'nowrap'
                                  }}
                                >
                                  {r.label}
                                </div>
                              );
                            })}
                          </div>

                          {/* Center Hub Button */}
                          <div
                            onClick={(isEligible || isAdmin) && !spinning ? handleSpin : undefined}
                            style={{
                              position: 'absolute', top: '50%', left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: 76, height: 76, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                              cursor: (isEligible || isAdmin) && !spinning ? 'pointer' : 'not-allowed',
                              zIndex: 5, border: '4px solid #D4AF37'
                            }}
                          >
                            <GiftOutlined style={{ fontSize: 24, color: '#D4AF37' }} />
                            <span style={{ fontSize: 10, fontWeight: 900, color: '#1B4332' }}>
                              {spinning ? 'SPINNING' : 'SPIN'}
                            </span>
                          </div>
                        </div>

                        {/* ─── RESULT OR ACTION BANNER ─── */}
                        {wonReward ? (
                          <Card style={{ borderRadius: 16, background: wonReward.type !== 'none' && wonReward.reward_type !== 'none' ? 'rgba(46,125,50,0.06)' : 'rgba(0,0,0,0.03)', border: '1px solid #D4AF37', marginTop: 12 }}>
                            {wonReward.type !== 'none' && wonReward.reward_type !== 'none' ? (
                              <>
                                <Tag color="green" style={{ fontSize: 14, padding: '4px 14px', borderRadius: 20, marginBottom: 8, fontWeight: 800 }}>
                                  🎉 YOU WON!
                                </Tag>
                                <Title level={4} style={{ color: '#1B4332', margin: '4px 0', fontWeight: 800 }}>{wonReward.label}</Title>
                                <div style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#fff', padding: '10px 18px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 12, border: `2px dashed ${isDark ? '#4caf50' : '#1B4332'}`, margin: '12px 0' }}>
                                  <Text strong style={{ fontSize: 20, color: isDark ? '#a5d6a7' : '#1B4332', letterSpacing: 1.5, fontFamily: 'monospace' }}>{wonReward.code}</Text>
                                  <Button
                                    size="small"
                                    icon={copiedCode === wonReward.code ? <CheckOutlined /> : <CopyOutlined />}
                                    onClick={() => copyCouponCode(wonReward.code)}
                                    type="primary"
                                    style={{ background: '#1B4332', borderRadius: 6, fontWeight: 700 }}
                                  >
                                    {copiedCode === wonReward.code ? 'Copied' : 'Copy'}
                                  </Button>
                                </div>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>Valid for 7 Days · Auto-usable at Checkout</Text>
                                <div style={{ marginTop: 14 }}>
                                  <Button
                                    type="primary"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={() => { setVisible(false); navigate('/checkout'); }}
                                    style={{ background: '#D4AF37', borderColor: '#D4AF37', color: '#1a1a1a', fontWeight: 800, borderRadius: 10 }}
                                  >
                                    Shop Now & Use Reward
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <Title level={4} style={{ color: '#757575' }}>Better Luck Next Time!</Title>
                                <Text type="secondary">Thank you for spinning the Bhoomi Bloom Fortune Wheel.</Text>
                              </>
                            )}
                          </Card>
                        ) : !isEligible && !isAdmin ? (
                          <Card style={{ borderRadius: 16, background: isDark ? 'rgba(250, 140, 22, 0.08)' : '#fffbe6', border: '1px solid #ffe58f', textAlign: 'center', marginTop: 12 }}>
                            <LockOutlined style={{ fontSize: 28, color: '#faad14', marginBottom: 8 }} />
                            <Title level={5} style={{ margin: '4px 0', color: '#d48806' }}>
                              {wheelStatus?.reason === 'completed_first_order'
                                ? 'First Order Already Placed'
                                : wheelStatus?.reason === 'already_spun'
                                ? 'First-Order Spin Used'
                                : !isAuthenticated
                                ? 'Login Required'
                                : 'Spin Wheel Unavailable'}
                            </Title>
                            <Paragraph type="secondary" style={{ fontSize: 13, margin: '4px 0 12px' }}>
                              {wheelStatus?.message || 'The Spin Wheel is available ONLY for your first order.'}
                            </Paragraph>

                            {!isAuthenticated ? (
                              <Button type="primary" onClick={() => { setVisible(false); navigate('/login'); }} style={{ background: '#1B4332', borderRadius: 8 }}>
                                Login / Register
                              </Button>
                            ) : (
                              <Button type="default" onClick={() => { setVisible(false); navigate('/products'); }} style={{ borderRadius: 8 }}>
                                Explore Products
                              </Button>
                            )}
                          </Card>
                        ) : (
                          <div style={{ marginTop: 16 }}>
                            <Button
                              type="primary"
                              size="large"
                              onClick={handleSpin}
                              loading={spinning}
                              style={{
                                background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
                                border: 'none',
                                padding: '0 48px',
                                height: 50,
                                borderRadius: 14,
                                fontWeight: 800,
                                fontSize: 16,
                                boxShadow: '0 6px 20px rgba(27,67,50,0.3)'
                              }}
                            >
                              {spinning ? 'Spinning Wheel...' : isAdmin ? 'Run Admin Test Spin 🎯' : 'Spin Wheel Now 🎯'}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              },
              {
                key: 'coupons',
                label: <span><TrophyOutlined /> My Won Rewards ({wonCoupons.length})</span>,
                children: (
                  <div style={{ padding: '16px 0', textAlign: 'left', maxHeight: 360, overflowY: 'auto' }}>
                    {wonCoupons.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <GiftOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 12 }} />
                        <Title level={5} type="secondary">No Rewards Won Yet</Title>
                        <Text type="secondary">Spin the First-Order Fortune Wheel to earn coupons & gifts!</Text>
                      </div>
                    ) : (
                      wonCoupons.map((c, i) => (
                        <Card key={i} style={{ marginBottom: 12, borderRadius: 14, background: '#fcfdfc', border: '1px solid #e8f5e9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Tag color="green" style={{ borderRadius: 8, fontWeight: 700 }}>{c.label || c.code}</Tag>
                              <div style={{ fontSize: 16, fontWeight: 800, color: '#1B4332', marginTop: 4, fontFamily: 'monospace' }}>{c.code}</div>
                              <Text type="secondary" style={{ fontSize: 11 }}>Expires: {c.expiry_date || '7 days'}</Text>
                            </div>
                            <Button
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => copyCouponCode(c.code)}
                              style={{ borderRadius: 8 }}
                            >
                              Copy
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )
              }
            ]}
          />
        </div>
      </Modal>
    </>
  );
};

export default SpinAndWin;
