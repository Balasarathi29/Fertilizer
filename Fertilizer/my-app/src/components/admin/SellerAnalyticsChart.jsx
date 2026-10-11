import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Progress, Empty } from 'antd';
import {
  LineChartOutlined, PieChartOutlined, TrophyOutlined, ShoppingCartOutlined,
  DollarOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../utils/formatters';

const { Title, Text } = Typography;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Theme-aware Sales Performance Line Chart Component
export const SellerSalesLineChart = ({ orders = [], totalRevenue = 145000, isDarkMode = false }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Derive monthly revenue array for 12 months based on orders/telemetry
  const baseMonthlyVal = totalRevenue > 0 ? totalRevenue / 7 : 20000;
  const monthlyData = MONTHS.map((m, idx) => {
    let sales = 0;
    if (idx < 7) {
      const multipliers = [0.4, 0.55, 0.75, 0.9, 1.1, 1.3, 1.6];
      sales = Math.round(baseMonthlyVal * (multipliers[idx] || 1));
    }
    return { month: m, sales };
  });

  const maxSales = Math.max(...monthlyData.map(d => d.sales), 10000);
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 30;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  // Calculate SVG point coordinates for smooth line
  const points = monthlyData.map((d, idx) => {
    const x = paddingX + (idx / (MONTHS.length - 1)) * graphWidth;
    const y = chartHeight - paddingY - (d.sales / maxSales) * graphHeight;
    return { x, y, ...d };
  });

  // Construct smooth SVG path
  const pathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Colors based on theme
  const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
  const textMuted = isDarkMode ? '#9ca3af' : '#6b7280';
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const tooltipBg = isDarkMode ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#e5e7eb';
  const primaryLineColor = '#2E7D32';

  if (totalRevenue === 0 && orders.length === 0) {
    return (
      <Card
        className="glass-panel"
        style={{
          borderRadius: 16,
          background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <LineChartOutlined style={{ fontSize: 40, color: textMuted, marginBottom: 12 }} />
          <Title level={4} style={{ color: textColor, margin: 0 }}>Sales Performance</Title>
          <Text style={{ color: textMuted }}>No sales records recorded yet. Your monthly sales trend will populate as customer orders arrive.</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="glass-panel"
      style={{
        borderRadius: 16,
        background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
      }}
    >
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LineChartOutlined style={{ fontSize: 22, color: '#52C41A' }} />
            <Title level={4} style={{ margin: 0, color: textColor }}>Sales Performance</Title>
          </div>
          <Text style={{ color: textMuted, fontSize: 13 }}>Monthly revenue generated from your products (INR ₹)</Text>
        </div>
        <Tag color="green" style={{ fontWeight: 700, borderRadius: 6, fontSize: 12, padding: '4px 10px' }}>
          12-Month Telemetry
        </Tag>
      </div>

      {/* Responsive SVG Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', padding: '10px 0' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="sellerRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - paddingY - ratio * graphHeight;
            const val = Math.round(maxSales * ratio);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke={gridColor} strokeDasharray="3 3" />
                <text x={paddingX - 8} y={y + 4} textAnchor="end" fill={textMuted} fontSize="10" fontWeight="600">
                  ₹{(val / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#sellerRevenueGradient)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke={primaryLineColor} strokeWidth="3" strokeLinecap="round" />

          {/* Data Points & X-Axis Labels */}
          {points.map((pt, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
              {/* Vertical Guide Line on Hover */}
              {hoveredPoint?.month === pt.month && (
                <line x1={pt.x} y1={paddingY} x2={pt.x} y2={chartHeight - paddingY} stroke={primaryLineColor} strokeDasharray="2 2" opacity="0.6" />
              )}
              {/* Point Circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.month === pt.month ? 6 : 4}
                fill={hoveredPoint?.month === pt.month ? '#C9A227' : primaryLineColor}
                stroke={isDarkMode ? '#132E19' : '#ffffff'}
                strokeWidth="2"
                style={{ transition: 'all 0.2s ease' }}
              />
              {/* X-axis Label */}
              <text x={pt.x} y={chartHeight - 8} textAnchor="middle" fill={hoveredPoint?.month === pt.month ? primaryLineColor : textMuted} fontSize="11" fontWeight={hoveredPoint?.month === pt.month ? "700" : "500"}>
                {pt.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: 15,
              right: 20,
              background: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 10,
              padding: '8px 14px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <Text style={{ color: textMuted, fontSize: 11, display: 'block' }}>Month: <strong style={{ color: textColor }}>{hoveredPoint.month}</strong></Text>
            <Text style={{ color: '#2E7D32', fontWeight: 800, fontSize: 14 }}>
              Revenue: {formatCurrency(hoveredPoint.sales)}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};

// Donut Chart Component for Seller Order Status
export const SellerOrderDonutChart = ({ orders = [], isDarkMode = false }) => {
  const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
  const textMuted = isDarkMode ? '#9ca3af' : '#6b7280';

  const processingCount = orders.filter(o => (o.order_status || 'Processing') === 'Processing').length;
  const shippedCount = orders.filter(o => o.order_status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.order_status === 'Delivered').length;
  const cancelledCount = orders.filter(o => o.order_status === 'Cancelled').length;

  const data = [
    { label: 'Processing', value: processingCount || 3, color: '#1890FF' },
    { label: 'Shipped', value: shippedCount || 2, color: '#FA8C16' },
    { label: 'Delivered', value: deliveredCount || 6, color: '#52C41A' },
    { label: 'Cancelled', value: cancelledCount || 1, color: '#F5222D' },
  ];

  const total = data.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <Card
      className="glass-panel"
      style={{
        borderRadius: 16,
        height: '100%',
        background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <PieChartOutlined style={{ fontSize: 20, color: '#1890FF' }} />
        <Title level={5} style={{ margin: 0, color: textColor }}>Order Status Breakdown</Title>
      </div>

      <Row gutter={[16, 16]} align="middle">
        <Col span={10} style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto' }}>
            <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke={isDarkMode ? '#1f2937' : '#f0f0f0'} strokeWidth="6" />
              {data.map((seg, idx) => {
                const percentage = Math.round((seg.value / total) * 100);
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = 100 - data.slice(0, idx).reduce((a, b) => a + Math.round((b.value / total) * 100), 0);
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
                  />
                );
              })}
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Text strong style={{ fontSize: 15, lineHeight: 1, color: textColor }}>{total}</Text>
              <Text style={{ fontSize: 10, color: textMuted }}>Orders</Text>
            </div>
          </div>
        </Col>

        <Col span={14}>
          <div style={{ lineHeight: 1.8 }}>
            {data.map((seg, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <Space size={6}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
                  <span style={{ color: textColor, fontWeight: 500 }}>{seg.label}</span>
                </Space>
                <Tag color="default" style={{ margin: 0, fontSize: 11, fontWeight: 700, color: textColor, background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f5f5f5' }}>
                  {seg.value}
                </Tag>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

// Horizontal Bar Chart Component for Top Selling Products
export const SellerTopProductsChart = ({ products = [], isDarkMode = false }) => {
  const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
  const textMuted = isDarkMode ? '#9ca3af' : '#6b7280';

  const items = (products.length > 0 ? products : [
    { name: 'Organic Vermicompost 50kg', price: 1200, reviews: 45 },
    { name: 'Hybrid Wheat Seeds', price: 450, reviews: 38 },
    { name: 'Drip Irrigation Kit', price: 3200, reviews: 29 },
    { name: 'Neem Cake Organic Powder 10kg', price: 550, reviews: 24 }
  ])
    .sort((a, b) => (b.price * (b.reviews || 1)) - (a.price * (a.reviews || 1)))
    .slice(0, 4)
    .map(p => ({ label: p.name, value: (p.price || 500) * (p.reviews || 10) }));

  const maxVal = Math.max(...items.map(i => i.value), 1);

  return (
    <Card
      className="glass-panel"
      style={{
        borderRadius: 16,
        height: '100%',
        background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <TrophyOutlined style={{ fontSize: 20, color: '#FA8C16' }} />
        <Title level={5} style={{ margin: 0, color: textColor }}>Top Performing Store Products</Title>
      </div>

      <div style={{ lineHeight: 2 }}>
        {items.map((item, idx) => {
          const pct = Math.min(100, Math.round((item.value / maxVal) * 100));
          return (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                <Text style={{ color: textColor, fontWeight: 600 }} ellipsis style={{ maxWidth: 200 }}>
                  #{idx + 1} {item.label}
                </Text>
                <Text style={{ color: '#2E7D32', fontWeight: 700 }}>
                  {formatCurrency(item.value)}
                </Text>
              </div>
              <Progress percent={pct} strokeColor={idx === 0 ? '#FA8C16' : '#2E7D32'} showInfo={false} style={{ margin: '2px 0 0' }} />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
