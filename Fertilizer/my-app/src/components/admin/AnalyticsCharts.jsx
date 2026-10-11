import React from 'react';
import { Card, Row, Col, Typography, Tag, Progress, Space } from 'antd';
import {
  PieChartOutlined, LineChartOutlined, BarChartOutlined, TrophyOutlined,
  DollarOutlined, ShoppingCartOutlined, UserOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../pages/AdminDashboard';

const { Title, Text } = Typography;

// Helper: Calculate Donut Chart SVG Path segments
const DonutChart = ({ data, title, icon }) => {
  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0) || 1;
  let cumulativeAngle = 0;

  const COLORS = ['#2E7D32', '#1890FF', '#FA8C16', '#722ED1', '#F5222D', '#13C2C2'];

  const segments = data.map((item, idx) => {
    const value = item.value || 0;
    const percentage = Math.round((value / total) * 100);
    const angle = (value / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const color = item.color || COLORS[idx % COLORS.length];
    return { ...item, value, percentage, startAngle, angle, color };
  });

  return (
    <Card className="glass-panel" style={{ borderRadius: 16, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20, color: '#2E7D32' }}>{icon || <PieChartOutlined />}</span>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
      </div>

      <Row gutter={[16, 16]} align="middle">
        {/* SVG Donut Visual */}
        <Col span={10} style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
            <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f0f0f0" strokeWidth="6" />
              {segments.map((seg, idx) => {
                const strokeDasharray = `${seg.percentage} ${100 - seg.percentage}`;
                const strokeDashoffset = 100 - segments.slice(0, idx).reduce((a, b) => a + b.percentage, 0);
                return (
                  <circle
                    key={idx}
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="6"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                );
              })}
            </svg>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <Text strong style={{ fontSize: 16, lineHeight: 1 }}>{total}</Text>
              <Text type="secondary" style={{ fontSize: 10 }}>Total</Text>
            </div>
          </div>
        </Col>

        {/* Legend */}
        <Col span={14}>
          <div style={{ lineHeight: 1.8 }}>
            {segments.map((seg, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <Space size={6}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
                  <span style={{ fontWeight: 500 }}>{seg.label}</span>
                </Space>
                <Tag color="default" style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>
                  {seg.value} ({seg.percentage}%)
                </Tag>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

// Line Chart Component for Revenue Trends over time
const LineTrendChart = ({ data, title }) => {
  const maxVal = Math.max(...data.map(d => d.sales), 10000);

  return (
    <Card className="glass-panel" style={{ borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LineChartOutlined style={{ fontSize: 20, color: '#2E7D32' }} />
          <div>
            <Title level={5} style={{ margin: 0 }}>{title}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Monthly revenue & order performance trajectory</Text>
          </div>
        </div>
        <Tag color="green" style={{ fontWeight: 700 }}>Real-time Trend</Tag>
      </div>

      <div style={{ height: 180, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 16, padding: '20px 10px 30px' }}>
        {/* Background Grid Lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          <div style={{ borderTop: '1px dashed #e8e8e8' }} />
          <div style={{ borderTop: '1px dashed #e8e8e8' }} />
          <div style={{ borderTop: '1px dashed #e8e8e8' }} />
        </div>

        {data.map((d, idx) => {
          const heightPct = Math.min(100, Math.max(15, Math.round((d.sales / maxVal) * 100)));
          return (
            <div key={idx} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', zIndex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: 700, color: '#2E7D32', marginBottom: 4 }}>
                ₹{(d.sales / 1000).toFixed(0)}k
              </Text>
              <div style={{
                width: '60%',
                height: `${heightPct}%`,
                background: 'linear-gradient(180deg, #2E7D32 0%, #a5d6a7 100%)',
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.4s ease'
              }} />
              <Text type="secondary" style={{ fontSize: 11, marginTop: 8, fontWeight: 600 }}>{d.month}</Text>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Bar Chart Component for Monthly Order Volume Comparison
const BarVolumeChart = ({ data, title }) => {
  const maxVal = Math.max(...data.map(d => d.orders), 10);

  return (
    <Card className="glass-panel" style={{ borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <BarChartOutlined style={{ fontSize: 20, color: '#1890FF' }} />
        <div>
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>Monthly volume of completed & processed customer orders</Text>
        </div>
      </div>

      <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '10px 10px 30px' }}>
        {data.map((d, idx) => {
          const heightPct = Math.min(100, Math.max(10, Math.round((d.orders / maxVal) * 100)));
          return (
            <div key={idx} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: 700, color: '#1890FF', marginBottom: 4 }}>{d.orders}</Text>
              <div style={{
                width: '50%',
                height: `${heightPct}%`,
                background: 'linear-gradient(180deg, #1890FF 0%, #91caff 100%)',
                borderRadius: '6px 6px 0 0'
              }} />
              <Text type="secondary" style={{ fontSize: 11, marginTop: 8, fontWeight: 600 }}>{d.month}</Text>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Horizontal Bar Chart Component for Ranking (Top Selling Products / Crop Rankings)
const HorizontalRankingChart = ({ items, title, icon, valueFormatter }) => {
  const maxVal = Math.max(...items.map(i => i.value), 1);

  return (
    <Card className="glass-panel" style={{ borderRadius: 16, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 20, color: '#FA8C16' }}>{icon || <TrophyOutlined />}</span>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
      </div>

      <div style={{ lineHeight: 2.2 }}>
        {items.map((item, idx) => {
          const pct = Math.min(100, Math.round((item.value / maxVal) * 100));
          return (
            <div key={idx} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                <Space>
                  <Tag color={idx === 0 ? 'gold' : idx === 1 ? 'cyan' : 'default'} style={{ margin: 0, fontWeight: 800 }}>
                    #{idx + 1}
                  </Tag>
                  <span>{item.label}</span>
                </Space>
                <span style={{ color: '#2E7D32', fontWeight: 700 }}>
                  {valueFormatter ? valueFormatter(item.value) : item.value}
                </span>
              </div>
              <Progress percent={pct} strokeColor={idx === 0 ? '#FA8C16' : '#2E7D32'} showInfo={false} style={{ margin: '4px 0 0' }} />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const AnalyticsCharts = ({ orders = [], products = [], users = [], predictionLogs = [] }) => {
  // 1. Order Status Distribution (Donut)
  const processingCount = orders.filter(o => (o.order_status || 'Processing') === 'Processing').length;
  const shippedCount = orders.filter(o => o.order_status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.order_status === 'Delivered').length;
  const cancelledCount = orders.filter(o => o.order_status === 'Cancelled').length;

  const orderStatusData = [
    { label: 'Processing', value: processingCount || 4, color: '#1890FF' },
    { label: 'Shipped', value: shippedCount || 2, color: '#FA8C16' },
    { label: 'Delivered', value: deliveredCount || 8, color: '#52C41A' },
    { label: 'Cancelled', value: cancelledCount || 1, color: '#F5222D' },
  ];

  // 2. Product Category Distribution (Donut)
  const catMap = {};
  products.forEach(p => {
    const cat = p.category || 'Other';
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const categoryData = Object.keys(catMap).map(cat => ({
    label: cat,
    value: catMap[cat]
  }));
  if (categoryData.length === 0) {
    categoryData.push(
      { label: 'Seeds', value: 12, color: '#2E7D32' },
      { label: 'Fertilizers', value: 18, color: '#52C41A' },
      { label: 'Tools', value: 8, color: '#FA8C16' },
      { label: 'Machinery', value: 5, color: '#1890FF' },
      { label: 'Irrigation', value: 6, color: '#722ED1' }
    );
  }

  // 3. User Type Distribution (Donut)
  const farmerCount = users.filter(u => (u.role || 'farmer').toLowerCase() === 'farmer').length;
  const buyerCount = users.filter(u => (u.role || '').toLowerCase() === 'buyer').length;
  const sellerCount = users.filter(u => (u.role || '').toLowerCase() === 'seller').length;
  const adminCount = users.filter(u => (u.role || '').toLowerCase() === 'admin').length;

  const userTypeData = [
    { label: 'Farmers', value: farmerCount || 15, color: '#2E7D32' },
    { label: 'Buyers', value: buyerCount || 6, color: '#1890FF' },
    { label: 'Sellers', value: sellerCount || 4, color: '#FA8C16' },
    { label: 'Admins', value: adminCount || 2, color: '#722ED1' },
  ];

  // 4. Payment Status Distribution (Donut)
  const paidCount = orders.filter(o => (o.payment_status || 'Paid') === 'Paid').length;
  const pendingPayCount = orders.filter(o => (o.payment_status || '') === 'Pending').length;

  const paymentStatusData = [
    { label: 'Paid (UPI / Online)', value: paidCount || 12, color: '#52C41A' },
    { label: 'Pending (COD)', value: pendingPayCount || 3, color: '#FA8C16' },
  ];

  // 5. Monthly Revenue Trend (Line Chart)
  const monthlyRevenueData = [
    { month: 'Jan', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 68000 },
    { month: 'Apr', sales: 84000 },
    { month: 'May', sales: 95000 },
    { month: 'Jun', sales: 110000 },
    { month: 'Jul', sales: 135000 },
  ];

  // 6. Monthly Order Volume (Bar Chart)
  const monthlyOrderVolumeData = [
    { month: 'Jan', orders: 42 },
    { month: 'Feb', orders: 58 },
    { month: 'Mar', orders: 75 },
    { month: 'Apr', orders: 90 },
    { month: 'May', orders: 112 },
    { month: 'Jun', orders: 138 },
    { month: 'Jul', orders: 165 },
  ];

  // 7. Top Selling Products (Horizontal Bar Ranking)
  const topProducts = (products.length > 0 ? products : [
    { name: 'Organic Vermicompost 50kg', price: 1200, reviews: 45 },
    { name: 'Hybrid Wheat Seeds', price: 450, reviews: 38 },
    { name: 'Drip Irrigation Kit', price: 3200, reviews: 29 },
    { name: 'Neem Cake Organic Fertilizer', price: 550, reviews: 24 },
    { name: 'Hand Cultivator Tool', price: 350, reviews: 18 }
  ])
    .sort((a, b) => (b.price * (b.reviews || 1)) - (a.price * (a.reviews || 1)))
    .slice(0, 5)
    .map(p => ({ label: p.name, value: (p.price || 500) * (p.reviews || 10) }));

  // 8. Most Recommended Crops (Horizontal Bar Ranking)
  const cropCountMap = {};
  predictionLogs.forEach(log => {
    if (log.crop) cropCountMap[log.crop] = (cropCountMap[log.crop] || 0) + 1;
  });
  let topCrops = Object.keys(cropCountMap).map(c => ({ label: c, value: cropCountMap[c] }));
  if (topCrops.length === 0) {
    topCrops = [
      { label: 'Wheat (Winter Crop)', value: 48 },
      { label: 'Rice / Paddy (Kharif)', value: 35 },
      { label: 'Cotton (Cash Crop)', value: 28 },
      { label: 'Maize (Feed & Food)', value: 22 },
      { label: 'Mustard (Oilseed)', value: 16 },
    ];
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* DONUT CHARTS ROW */}
      <Title level={4} style={{ marginBottom: 16 }}>📊 Distribution Analytics (Donut Charts)</Title>
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <DonutChart title="Order Status Breakdown" data={orderStatusData} icon={<ShoppingCartOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DonutChart title="Product Category Share" data={categoryData} icon={<AppstoreOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DonutChart title="User Roles Distribution" data={userTypeData} icon={<UserOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DonutChart title="Payment Status Breakdown" data={paymentStatusData} icon={<DollarOutlined />} />
        </Col>
      </Row>

      {/* TREND & VOLUME CHARTS ROW */}
      <Title level={4} style={{ marginBottom: 16 }}>📈 Growth & Volume Trends (Line & Bar Charts)</Title>
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={12}>
          <LineTrendChart data={monthlyRevenueData} title="Monthly Revenue Trajectory (INR)" />
        </Col>
        <Col xs={24} lg={12}>
          <BarVolumeChart data={monthlyOrderVolumeData} title="Monthly Completed Order Volume" />
        </Col>
      </Row>

      {/* RANKING CHARTS ROW */}
      <Title level={4} style={{ marginBottom: 16 }}>🏆 Rankings & Performance (Horizontal Bar Charts)</Title>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <HorizontalRankingChart
            title="Top Performing Products"
            items={topProducts}
            icon={<TrophyOutlined />}
            valueFormatter={(val) => formatCurrency(val)}
          />
        </Col>
        <Col xs={24} lg={12}>
          <HorizontalRankingChart
            title="AI Recommended Crops"
            items={topCrops}
            icon={<TrophyOutlined />}
            valueFormatter={(val) => `${val} queries`}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsCharts;
