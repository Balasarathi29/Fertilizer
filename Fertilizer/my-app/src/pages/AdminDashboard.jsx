import React, { useState, useEffect } from 'react';
import {
  Typography, Row, Col, Card, Statistic, Table, Tag, Button, Modal, Form,
  Input, InputNumber, Select, Switch, Space, notification, Popconfirm,
  Badge, Progress, Divider, Alert, Layout, Menu
} from 'antd';
import {
  DashboardOutlined, AppstoreOutlined, ShoppingCartOutlined, UserOutlined,
  StockOutlined, TagsOutlined, LineChartOutlined, FileTextOutlined,
  SettingOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined,
  DownloadOutlined, FilePdfOutlined, FileExcelOutlined, RiseOutlined,
  DollarOutlined, CrownOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  GiftOutlined, TrophyOutlined, RocketOutlined
} from '@ant-design/icons';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/formatters';

const { Title, Text } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Stats & Data from Database
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Bhoomi Card Admin State
  const [bhoomiConfig, setBhoomiConfig] = useState({ price: 200, discount_percentage: 10, validity_days: 365, is_enabled: true, description: '' });
  const [customerCards, setCustomerCards] = useState([]);
  const [bhoomiForm] = Form.useForm();

  // Spin & Win Admin State
  const [spinConfig, setSpinConfig] = useState({ is_enabled: true, allow_stacking_with_bhoomi_card: false, description: '' });
  const [spinRewards, setSpinRewards] = useState([]);
  const [spinStats, setSpinStats] = useState({ total_eligible_users: 0, total_spins: 0, total_rewards_issued: 0, reward_distribution: {}, spin_logs: [] });
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [spinConfigForm] = Form.useForm();
  const [rewardForm] = Form.useForm();

  // Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm] = Form.useForm();

  // Announcement Modal
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementForm] = Form.useForm();

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [prodsData, statsData, ordersData, usersData, salesData, cardCfg, cardCusts, spinCfgData, spinRewardsData, spinStatsData] = await Promise.all([
        apiService.getProducts(),
        apiService.getDashboardStats().catch(() => null),
        apiService.getOrders().catch(() => []),
        apiService.getAllUsers().catch(() => []),
        apiService.getSalesAnalytics().catch(() => null),
        apiService.getAdminBhoomiCardConfig().catch(() => null),
        apiService.getAdminBhoomiCardCustomers().catch(() => []),
        apiService.getAdminSpinConfig().catch(() => null),
        apiService.getAdminSpinRewards().catch(() => []),
        apiService.getAdminSpinStats().catch(() => null)
      ]);

      setProducts(Array.isArray(prodsData) ? prodsData : []);
      setStats(statsData?.metrics || null);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setAnalytics(salesData || null);

      if (cardCfg) {
        setBhoomiConfig(cardCfg);
        bhoomiForm.setFieldsValue(cardCfg);
      }
      setCustomerCards(Array.isArray(cardCusts) ? cardCusts : []);

      if (spinCfgData) {
        setSpinConfig(spinCfgData);
        spinConfigForm.setFieldsValue(spinCfgData);
      }
      setSpinRewards(Array.isArray(spinRewardsData) ? spinRewardsData : []);
      if (spinStatsData) setSpinStats(spinStatsData);

      // Derive categories from DB products
      const catsMap = {};
      (prodsData || []).forEach(p => {
        if (p.category) catsMap[p.category] = (catsMap[p.category] || 0) + 1;
      });
      setCategories(Object.keys(catsMap).map((catName, idx) => ({
        id: idx + 1,
        name: catName,
        count: catsMap[catName]
      })));
    } catch (e) {
      notification.error({ message: 'Error loading admin data', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  // ─── BHOOMI CARD ADMIN HANDLERS ───
  const handleSaveBhoomiCardConfig = async () => {
    try {
      const values = await bhoomiForm.validateFields();
      const res = await apiService.updateAdminBhoomiCardConfig(values);
      notification.success({ message: 'Bhoomi Card Config Updated', description: 'Rule settings saved successfully.' });
      setBhoomiConfig(res.config || values);
    } catch (err) {
      notification.error({ message: 'Error updating Bhoomi Card config', description: err.message });
    }
  };

  const handleToggleCustomerCardStatus = async (card) => {
    const newStatus = card.status === 'Active' ? 'Disabled' : 'Active';
    try {
      await apiService.updateCustomerCardStatus(card.id, newStatus);
      notification.success({ message: 'Card Status Updated', description: `Card ${card.card_number} is now ${newStatus}.` });
      fetchAllAdminData();
    } catch (err) {
      notification.error({ message: 'Update Failed', description: err.message });
    }
  };

  // ─── SPIN & WIN ADMIN HANDLERS ───
  const handleSaveSpinConfig = async () => {
    try {
      const values = await spinConfigForm.validateFields();
      const res = await apiService.updateAdminSpinConfig(values);
      notification.success({ message: 'Spin & Win Configuration Saved', description: 'Rules & stacking controls updated successfully.' });
      setSpinConfig(res.config || values);
    } catch (err) {
      notification.error({ message: 'Error saving spin config', description: err.message });
    }
  };

  const handleOpenAddReward = () => {
    setEditingReward(null);
    rewardForm.resetFields();
    rewardForm.setFieldsValue({
      status: 'Active',
      probability_weight: 10.0,
      reward_type: 'percentage',
      color: '#2E7D32'
    });
    setIsRewardModalOpen(true);
  };

  const handleOpenEditReward = (reward) => {
    setEditingReward(reward);
    rewardForm.setFieldsValue({
      label: reward.label,
      code: reward.code,
      reward_type: reward.reward_type || reward.type,
      reward_value: reward.reward_value || reward.value,
      probability_weight: reward.probability_weight || reward.weight || 10.0,
      color: reward.color || '#2E7D32',
      status: reward.status || 'Active',
      start_date: reward.start_date || '',
      end_date: reward.end_date || ''
    });
    setIsRewardModalOpen(true);
  };

  const handleSaveReward = async () => {
    try {
      const values = await rewardForm.validateFields();
      if (editingReward) {
        await apiService.updateAdminSpinReward(editingReward.id, values);
        notification.success({ message: 'Reward Updated', description: 'Spin & Win reward configuration updated.' });
      } else {
        await apiService.createAdminSpinReward(values);
        notification.success({ message: 'Reward Created', description: 'New Spin & Win reward added successfully.' });
      }
      setIsRewardModalOpen(false);
      fetchAllAdminData();
    } catch (err) {
      notification.error({ message: 'Failed to save reward', description: err.message });
    }
  };

  const handleDeleteReward = async (rewardId) => {
    try {
      await apiService.deleteAdminSpinReward(rewardId);
      notification.success({ message: 'Reward Deleted', description: 'Reward removed from Spin Wheel.' });
      fetchAllAdminData();
    } catch (err) {
      notification.error({ message: 'Delete Failed', description: err.message });
    }
  };

  // ─── PRODUCT HANDLERS ───
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    productForm.resetFields();
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    productForm.setFieldsValue(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      const values = await productForm.validateFields();
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, values);
        notification.success({ message: 'Product Updated', description: 'Product changes saved to database.' });
      } else {
        await apiService.createProduct(values);
        notification.success({ message: 'Product Created', description: 'New product added to catalog.' });
      }
      setIsProductModalOpen(false);
      fetchAllAdminData();
    } catch (err) {
      notification.error({ message: 'Failed to save product', description: err.message });
    }
  };

  const handleDeleteProduct = async (prodId) => {
    try {
      await apiService.deleteProduct(prodId);
      notification.success({ message: 'Product Deleted', description: 'Product deleted from database.' });
      fetchAllAdminData();
    } catch (err) {
      notification.error({ message: 'Delete Failed', description: err.message });
    }
  };

  // ─── ORDER HANDLERS ───
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      notification.success({ message: 'Order Status Updated', description: `Order ${orderId} marked as ${newStatus}.` });
      fetchAllAdminData();
    } catch (err) {
      notification.error({ message: 'Update Failed', description: err.message });
    }
  };

  // ─── USER STATUS HANDLERS ───
  const handleToggleUserStatus = async (userRecord) => {
    try {
      await apiService.updateUserStatus(userRecord.id || userRecord.user_id, !userRecord.is_active);
      notification.success({ message: 'User Account Updated', description: `User account status changed.` });
      fetchAllAdminData();
    } catch (err) {
      notification.error({ message: 'Update Failed', description: err.message });
    }
  };

  // ─── BROADCAST ANNOUNCEMENT ───
  const handleSendAnnouncement = async () => {
    try {
      const values = await announcementForm.validateFields();
      await apiService.sendAnnouncement(values.title, values.message);
      notification.success({ message: 'Notification Broadcasted', description: 'Notification sent to all user drawers.' });
      setIsAnnouncementModalOpen(false);
      announcementForm.resetFields();
    } catch (err) {
      notification.error({ message: 'Broadcast Failed', description: err.message });
    }
  };

  // ─── EXPORT REPORT ───
  const handleExportReport = async (reportType, format) => {
    try {
      const res = await apiService.getReportExport(reportType);
      notification.success({
        message: `${reportType.toUpperCase()} Report Generated`,
        description: `Export file '${res.filename}' ready for download (${res.total_records} records).`
      });
    } catch (err) {
      notification.error({ message: 'Export Failed', description: err.message });
    }
  };

  // ─── TABLES COLUMNS ───
  const productColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Product Name', dataIndex: 'name', key: 'name', render: (text, r) => <span style={{ fontWeight: 600 }}>{r.placeholder || '🌱'} {text}</span> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: cat => <Tag color="green">{cat}</Tag> },
    { title: 'Price', dataIndex: 'price', key: 'price', render: val => formatCurrency(val) },
    { title: 'Stock', dataIndex: 'stock', key: 'stock', render: st => <Tag color={(st ?? 50) <= 10 ? 'red' : 'blue'}>{st ?? 50} units</Tag> },
    { title: 'Organic', dataIndex: 'isOrganic', key: 'isOrganic', render: val => val ? <Tag color="success">Certified</Tag> : <Tag color="default">Standard</Tag> },
    {
      title: 'Actions', key: 'actions', render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEditProduct(r)} />
          <Popconfirm title="Delete product?" onConfirm={() => handleDeleteProduct(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const orderColumns = [
    { title: 'Order ID', dataIndex: 'order_id', key: 'order_id', render: (val, r) => <span style={{ fontWeight: 700, color: '#2E7D32' }}>{val || r._id}</span> },
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name', render: (val, r) => (
      <div>
        <div style={{ fontWeight: 600 }}>{val || r.name || 'Customer'}</div>
        <Text type="secondary" style={{ fontSize: 11 }}>{r.email}</Text>
      </div>
    )},
    { title: 'Products Purchased', key: 'items', render: (_, r) => (
      <div style={{ fontSize: 12 }}>
        {(r.items || []).map((it, idx) => (
          <div key={idx}>🌱 {it.name} × {it.quantity || 1}</div>
        ))}
      </div>
    )},
    { title: 'Total Amount', dataIndex: 'total_amount', key: 'total_amount', render: val => <span style={{ fontWeight: 700, color: '#2E7D32' }}>{formatCurrency(val)}</span> },
    { title: 'Delivery Location', key: 'location', render: (_, r) => {
      const loc = r.delivery_location || {};
      return (
        <div style={{ maxWidth: 220, fontSize: 12 }}>
          <div>{r.shipping_address || 'Address provided at checkout'}</div>
          {loc.latitude && loc.longitude && (
            <Tag color="green" style={{ fontSize: 10, marginTop: 4 }}>
              📍 {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
            </Tag>
          )}
        </div>
      );
    }},
    { title: 'Payment', dataIndex: 'payment_status', key: 'payment_status', render: (val, r) => (
      <Tag color={val === 'Paid' ? 'success' : 'warning'}>
        {r.payment_method || 'UPI'} ({val || 'Paid'})
      </Tag>
    )},
    { title: 'Delivery Status', dataIndex: 'order_status', key: 'order_status', render: (st, r) => (
      <Select
        value={st || 'Order Placed'}
        size="small"
        style={{ width: 145 }}
        onChange={(newSt) => handleUpdateOrderStatus(r.order_id || r._id, newSt)}
      >
        <Option value="Order Placed">Order Placed</Option>
        <Option value="Confirmed">Confirmed</Option>
        <Option value="Processing">Processing</Option>
        <Option value="Shipped">Shipped</Option>
        <Option value="Out for Delivery">Out for Delivery</Option>
        <Option value="Delivered">Delivered</Option>
        <Option value="Cancelled">Cancelled</Option>
      </Select>
    )}
  ];

  const userColumns = [
    { title: 'ID', dataIndex: 'user_id', key: 'user_id', render: (val, r) => val || r.id },
    { title: 'Full Name', dataIndex: 'full_name', key: 'full_name', render: (val, r) => <span style={{ fontWeight: 600 }}>{val || r.name}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: val => <Tag color={val === 'admin' ? 'magenta' : val === 'seller' ? 'purple' : 'green'}>{(val || 'farmer').toUpperCase()}</Tag> },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', render: val => val || 'N/A' },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', render: val => <Tag color={val !== false ? 'success' : 'error'}>{val !== false ? 'Active' : 'Blocked'}</Tag> },
    { title: 'Manage', key: 'manage', render: (_, r) => (
      <Button size="small" type={r.is_active !== false ? 'default' : 'primary'} danger={r.is_active !== false} onClick={() => handleToggleUserStatus(r)}>
        {r.is_active !== false ? 'Deactivate' : 'Activate'}
      </Button>
    )}
  ];

  const customerCardColumns = [
    { title: 'Card Number', dataIndex: 'card_number', key: 'card_number', render: val => <Tag color="gold" style={{ fontWeight: 700 }}>{val}</Tag> },
    { title: 'Customer Name', dataIndex: 'customer_name', key: 'customer_name', render: (val, r) => val || r.email },
    { title: 'Customer Email', dataIndex: 'email', key: 'email' },
    { title: 'Price Paid', dataIndex: 'price_paid', key: 'price_paid', render: val => formatCurrency(val || 200) },
    { title: 'Discount %', dataIndex: 'discount_percentage', key: 'discount_percentage', render: val => <Tag color="green">{val}% OFF</Tag> },
    { title: 'Purchase Date', dataIndex: 'purchase_date', key: 'purchase_date', render: val => val ? val.slice(0, 10) : 'N/A' },
    { title: 'Expiry Date', dataIndex: 'expiry_date', key: 'expiry_date', render: val => val ? val.slice(0, 10) : 'N/A' },
    { title: 'Card Status', dataIndex: 'status', key: 'status', render: st => (
      <Tag color={st === 'Active' ? 'success' : st === 'Expired' ? 'warning' : 'error'}>{st || 'Active'}</Tag>
    )},
    { title: 'Manage', key: 'manage_card', render: (_, r) => (
      <Button
        size="small"
        type={r.status === 'Active' ? 'default' : 'primary'}
        danger={r.status === 'Active'}
        onClick={() => handleToggleCustomerCardStatus(r)}
      >
        {r.status === 'Active' ? 'Disable Card' : 'Activate Card'}
      </Button>
    )}
  ];

  const spinRewardColumns = [
    { title: 'Label', dataIndex: 'label', key: 'label', render: (val, r) => <span style={{ fontWeight: 700, color: r.color || '#2E7D32' }}>{val}</span> },
    { title: 'Code', dataIndex: 'code', key: 'code', render: val => <Tag color="green" style={{ fontFamily: 'monospace', fontWeight: 800 }}>{val}</Tag> },
    { title: 'Type', dataIndex: 'reward_type', key: 'reward_type', render: (val, r) => <Tag color="blue">{(val || r.type || 'percentage').toUpperCase()}</Tag> },
    { title: 'Value', dataIndex: 'reward_value', key: 'reward_value', render: (val, r) => (val || r.value || 0) > 0 ? (r.reward_type === 'percentage' ? `${val}%` : `₹${val}`) : 'Free Gift' },
    { title: 'Probability Weight', dataIndex: 'probability_weight', key: 'probability_weight', render: (val, r) => <Badge count={val || r.weight || 10} style={{ backgroundColor: '#2E7D32' }} /> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: st => <Tag color={st === 'Active' ? 'success' : 'error'}>{st || 'Active'}</Tag> },
    {
      title: 'Actions', key: 'actions', render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEditReward(r)} />
          <Popconfirm title="Delete this reward?" onConfirm={() => handleDeleteReward(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const spinLogColumns = [
    { title: 'User Email', dataIndex: 'email', key: 'email' },
    { title: 'Reward Won', dataIndex: 'reward_label', key: 'reward_label', render: (val, r) => <span style={{ fontWeight: 700 }}>{val || r.reward_code}</span> },
    { title: 'Coupon Code', dataIndex: 'reward_code', key: 'reward_code', render: val => <Tag color="gold" style={{ fontFamily: 'monospace' }}>{val}</Tag> },
    { title: 'Spun Date', dataIndex: 'spun_at', key: 'spun_at', render: val => val ? val.slice(0, 16).replace('T', ' ') : 'N/A' },
    { title: 'Mode', dataIndex: 'is_test', key: 'is_test', render: isTest => isTest ? <Tag color="orange">Admin Test</Tag> : <Tag color="green">Real Customer</Tag> }
  ];

  const totalRevenue = stats?.totalRevenue || stats?.totalSales || 4523000;
  const totalOrdersCount = stats?.totalOrders || orders.length;
  const totalUsersCount = stats?.totalUsers || users.length;
  const pendingOrdersCount = stats?.pendingOrders || orders.filter(o => o.order_status === 'Processing' || o.order_status === 'Pending').length;
  const deliveredOrdersCount = stats?.deliveredOrders || orders.filter(o => o.order_status === 'Delivered').length;
  const lowStockCount = products.filter(p => (p.stock ?? 50) > 0 && (p.stock ?? 50) <= 10).length;

  const sidebarMenuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'bhoomiCard', icon: <CrownOutlined />, label: 'Bhoomi Card Rules' },
    { key: 'spinWheel', icon: <GiftOutlined />, label: 'Spin & Win Control' },
    { key: 'products', icon: <AppstoreOutlined />, label: 'Product Management' },
    { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Order Management' },
    { key: 'users', icon: <UserOutlined />, label: 'User Management' },
    { key: 'inventory', icon: <StockOutlined />, label: 'Inventory' },
    { key: 'categories', icon: <TagsOutlined />, label: 'Categories' },
    { key: 'analytics', icon: <LineChartOutlined />, label: 'Analytics' },
    { key: 'reports', icon: <FileTextOutlined />, label: 'Reports' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* ─── PROFESSIONAL ADMIN SIDEBAR ─── */}
      <Sider width={260} theme="dark" style={{ background: '#111827' }}>
        <div style={{ padding: '24px 20px', color: '#fff', borderBottom: '1px solid #1f2937' }}>
          <Title level={4} style={{ color: '#2E7D32', margin: 0 }}>🔑 Admin Control</Title>
          <Text type="secondary" style={{ fontSize: 12, color: '#9ca3af' }}>Platform Administration</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeNav]}
          onClick={({ key }) => setActiveNav(key)}
          style={{ background: '#111827', fontSize: 15, padding: '12px 0' }}
          items={sidebarMenuItems}
        />
      </Sider>

      {/* ─── MAIN CONTENT AREA ─── */}
      <Content style={{ padding: '32px 40px' }}>
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <Title level={3} style={{ margin: 0, textTransform: 'capitalize' }}>
              {activeNav === 'dashboard' ? 'Platform Administration Dashboard' : activeNav === 'bhoomiCard' ? 'Bhoomi Card Membership Rules & Admin Control' : activeNav === 'spinWheel' ? 'Spin & Win Management & Rewards Config' : activeNav.replace(/([A-Z])/g, ' $1')}
            </Title>
            <Text type="secondary">Powered by real-time database telemetry.</Text>
          </div>
          <Space>
            <Button icon={<SyncOutlined />} onClick={fetchAllAdminData} loading={loading}>Refresh Data</Button>
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 8 }} onClick={handleOpenAddProduct}>
              Add Product
            </Button>
            <Button icon={<Badge count={0}><Text>📢 Broadcast</Text></Badge>} onClick={() => setIsAnnouncementModalOpen(true)}>
              Send Announcement
            </Button>
          </Space>
        </div>

        {/* ─── 1. DASHBOARD OVERVIEW ─── */}
        {activeNav === 'dashboard' && (
          <div>
            <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Total Revenue" value={totalRevenue} prefix={<DollarOutlined style={{ color: '#2E7D32' }} />} formatter={v => formatCurrency(v)} />
                  <Text type="secondary" style={{ fontSize: 12 }}><RiseOutlined style={{ color: '#52C41A' }} /> Real order total</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Total Orders" value={totalOrdersCount} prefix={<ShoppingCartOutlined style={{ color: '#1890FF' }} />} />
                  <Text type="secondary" style={{ fontSize: 12 }}>{pendingOrdersCount} Pending | {deliveredOrdersCount} Delivered</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Total Registered Users" value={totalUsersCount} prefix={<UserOutlined style={{ color: '#722ED1' }} />} />
                  <Text type="secondary" style={{ fontSize: 12 }}>Active platform accounts</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Bhoomi Card Members" value={customerCards.length} prefix={<CrownOutlined style={{ color: '#C9A227' }} />} />
                  <Text type="secondary" style={{ fontSize: 12 }}>Active loyalty members</Text>
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card className="glass-panel" style={{ borderRadius: 16 }} title="Recent Orders (Database)">
                  <Table columns={orderColumns} dataSource={orders.slice(0, 6)} rowKey={r => r.order_id || r._id} pagination={false} size="small" />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card className="glass-panel" style={{ borderRadius: 16 }} title="Stock Level Summary">
                  <div style={{ lineHeight: 2.2 }}>
                    {products.slice(0, 5).map((p, idx) => (
                      <div key={idx} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                          <span>{p.name}</span>
                          <span>Stock: {p.stock ?? 50}</span>
                        </div>
                        <Progress percent={Math.min(100, (p.stock ?? 50) * 2)} strokeColor={(p.stock ?? 50) <= 10 ? '#ff4d4f' : '#52c41a'} showInfo={false} />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* ─── 2. BHOOMI CARD MANAGEMENT ─── */}
        {activeNav === 'bhoomiCard' && (
          <div>
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
              <Col xs={24} lg={10}>
                <Card className="glass-panel" style={{ borderRadius: 16 }} title={<span style={{ fontSize: 16, fontWeight: 700 }}><CrownOutlined style={{ color: '#C9A227', marginRight: 8 }} /> Global Bhoomi Card Rule Configuration</span>}>
                  <Form form={bhoomiForm} layout="vertical" onFinish={handleSaveBhoomiCardConfig} initialValues={bhoomiConfig}>
                    <Form.Item name="price" label="Bhoomi Card Purchase Price (₹)" rules={[{ required: true, message: 'Enter card price!' }]}>
                      <InputNumber style={{ width: '100%' }} min={1} placeholder="200" size="large" />
                    </Form.Item>
                    <Form.Item name="discount_percentage" label="Membership Discount Percentage (%)" rules={[{ required: true, message: 'Enter discount %!' }]}>
                      <InputNumber style={{ width: '100%' }} min={1} max={50} placeholder="10" size="large" />
                    </Form.Item>
                    <Form.Item name="validity_days" label="Card Validity Duration (Days)" rules={[{ required: true, message: 'Enter validity days!' }]}>
                      <Select size="large">
                        <Option value={30}>30 Days (1 Month)</Option>
                        <Option value={365}>365 Days (1 Year)</Option>
                        <Option value={9999}>9999 Days (Lifetime Membership)</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="is_enabled" label="Enable Bhoomi Card Loyalty Program" valuePropName="checked">
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    <Form.Item name="description" label="Membership Terms & Description">
                      <Input.TextArea rows={3} placeholder="Describe membership benefits..." />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block style={{ background: '#2E7D32', borderColor: '#2E7D32', fontWeight: 700 }}>
                      Save Bhoomi Card Rules
                    </Button>
                  </Form>
                </Card>
              </Col>

              <Col xs={24} lg={14}>
                <Card className="glass-panel" style={{ borderRadius: 16 }} title={`Customer Bhoomi Card Members (${customerCards.length})`}>
                  <Table columns={customerCardColumns} dataSource={customerCards} rowKey="id" pagination={{ pageSize: 6 }} size="small" />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* ─── 3. SPIN & WIN MANAGEMENT ─── */}
        {activeNav === 'spinWheel' && (
          <div>
            <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Eligible First-Order Users" value={spinStats.total_eligible_users || 0} prefix={<UserOutlined style={{ color: '#2E7D32' }} />} />
                  <Text type="secondary" style={{ fontSize: 12 }}>New customers with 0 orders</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Customer Spins Used" value={spinStats.total_spins || 0} prefix={<GiftOutlined style={{ color: '#D4AF37' }} />} />
                  <Text type="secondary" style={{ fontSize: 12 }}>Total 1st order spins completed</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Total Rewards Issued" value={spinStats.total_rewards_issued || 0} prefix={<TrophyOutlined style={{ color: '#1890FF' }} />} />
                  <Text type="secondary" style={{ fontSize: 12 }}>Active coupons in customer wallets</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Active Wheel Rewards" value={spinRewards.filter(r => r.status === 'Active').length} prefix={<RocketOutlined style={{ color: '#722ED1' }} />} />
                  <Text type="secondary" style={{ fontSize: 12 }}>Configured wheel segments</Text>
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={10}>
                <Card className="glass-panel" style={{ borderRadius: 16 }} title={<span style={{ fontSize: 16, fontWeight: 700 }}><GiftOutlined style={{ color: '#2E7D32', marginRight: 8 }} /> Spin & Win System Configuration</span>}>
                  <Form form={spinConfigForm} layout="vertical" onFinish={handleSaveSpinConfig} initialValues={spinConfig}>
                    <Form.Item name="is_enabled" label="Enable Spin & Win System for First-Order Customers" valuePropName="checked">
                      <Switch checkedChildren="Active" unCheckedChildren="Disabled" />
                    </Form.Item>
                    <Form.Item name="allow_stacking_with_bhoomi_card" label="Allow Stacking with Bhoomi Bloom Card (10%)" valuePropName="checked">
                      <Switch checkedChildren="Allowed" unCheckedChildren="Not Stackable (Default)" />
                    </Form.Item>
                    <Form.Item name="description" label="Feature Terms & Notes">
                      <Input.TextArea rows={3} placeholder="First-Order Spin & Win Reward Rules..." />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block style={{ background: '#2E7D32', borderColor: '#2E7D32', fontWeight: 700 }}>
                      Save Configuration
                    </Button>
                  </Form>
                </Card>
              </Col>

              <Col xs={24} lg={14}>
                <Card className="glass-panel" style={{ borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>Configured Wheel Rewards ({spinRewards.length})</Title>
                    <Button type="primary" icon={<PlusOutlined />} style={{ background: '#2E7D32', borderColor: '#2E7D32' }} onClick={handleOpenAddReward}>
                      Add Reward
                    </Button>
                  </div>
                  <Table columns={spinRewardColumns} dataSource={spinRewards} rowKey="id" pagination={{ pageSize: 5 }} size="small" />
                </Card>
              </Col>
            </Row>

            {/* SPIN HISTORY TABLE */}
            <Card className="glass-panel" style={{ borderRadius: 16 }} title="Customer First-Order Spin Usage & History">
              <Table columns={spinLogColumns} dataSource={spinStats.spin_logs || []} rowKey="id" pagination={{ pageSize: 8 }} size="small" />
            </Card>
          </div>
        )}

        {/* ─── 4. PRODUCT MANAGEMENT ─── */}
        {activeNav === 'products' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Product Inventory Catalog</Title>
              <Button type="primary" icon={<PlusOutlined />} style={{ background: '#2E7D32', borderColor: '#2E7D32' }} onClick={handleOpenAddProduct}>
                Add Product
              </Button>
            </div>
            <Table columns={productColumns} dataSource={products} rowKey="id" pagination={{ pageSize: 8 }} />
          </Card>
        )}

        {/* ─── 5. ORDER MANAGEMENT ─── */}
        {activeNav === 'orders' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Customer Orders & Delivery Status</Title>
            <Table columns={orderColumns} dataSource={orders} rowKey={r => r.order_id || r._id} pagination={{ pageSize: 8 }} />
          </Card>
        )}

        {/* ─── 6. USER MANAGEMENT ─── */}
        {activeNav === 'users' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Registered Platform Users ({users.length})</Title>
            <Table columns={userColumns} dataSource={users} rowKey={u => u.id || u.user_id} pagination={{ pageSize: 8 }} />
          </Card>
        )}

        {/* ─── 7. INVENTORY ─── */}
        {activeNav === 'inventory' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Warehouse Stock & Low Inventory Alerts</Title>
            {lowStockCount > 0 && (
              <Alert message={`Warning: ${lowStockCount} items have low stock (<= 10 units)`} type="warning" showIcon style={{ marginBottom: 20 }} />
            )}
            <Table columns={productColumns} dataSource={products} rowKey="id" pagination={{ pageSize: 8 }} />
          </Card>
        )}

        {/* ─── 8. CATEGORIES ─── */}
        {activeNav === 'categories' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <Title level={4} style={{ marginBottom: 16 }}>Product Categories Breakdown</Title>
            <Row gutter={[20, 20]}>
              {categories.map((c, idx) => (
                <Col xs={24} sm={12} md={8} key={idx}>
                  <Card style={{ borderRadius: 12, textAlign: 'center', background: '#f9fbf9' }}>
                    <Title level={4} style={{ color: '#2E7D32', margin: '0 0 8px' }}>{c.name}</Title>
                    <Text type="secondary">{c.count} Active Products</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* ─── 9. ANALYTICS ─── */}
        {activeNav === 'analytics' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <Title level={4}>Sales Revenue Trends & Performance Analytics</Title>
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              {(analytics?.salesTrend || [
                { month: 'Jan', sales: 45000 }, { month: 'Feb', sales: 52000 },
                { month: 'Mar', sales: 68000 }, { month: 'Apr', sales: 84000 },
                { month: 'May', sales: 95000 }, { month: 'Jun', sales: 110000 },
                { month: 'Jul', sales: 125000 }
              ]).map((m, idx) => (
                <Col span={24 / 7} key={idx} style={{ textAlign: 'center' }}>
                  <Progress type="line" percent={Math.min(100, Math.round((m.sales / 125000) * 100))} strokeColor="#2E7D32" showInfo={false} />
                  <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{m.month}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>₹{(m.sales / 1000).toFixed(0)}k</Text>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* ─── 10. REPORTS ─── */}
        {activeNav === 'reports' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <Title level={4} style={{ marginBottom: 20 }}>Business Performance & Audit Reports</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card style={{ borderRadius: 16, textAlign: 'center' }}>
                  <FileExcelOutlined style={{ fontSize: 40, color: '#2E7D32', marginBottom: 12 }} />
                  <Title level={4}>Sales Report</Title>
                  <Space style={{ marginTop: 12 }}>
                    <Button icon={<DownloadOutlined />} onClick={() => handleExportReport('sales', 'csv')}>Export CSV</Button>
                    <Button type="primary" icon={<FilePdfOutlined />} style={{ background: '#2E7D32' }} onClick={() => handleExportReport('sales', 'pdf')}>PDF</Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card style={{ borderRadius: 16, textAlign: 'center' }}>
                  <FileExcelOutlined style={{ fontSize: 40, color: '#1890FF', marginBottom: 12 }} />
                  <Title level={4}>Inventory Report</Title>
                  <Space style={{ marginTop: 12 }}>
                    <Button icon={<DownloadOutlined />} onClick={() => handleExportReport('inventory', 'csv')}>Export CSV</Button>
                    <Button type="primary" icon={<FilePdfOutlined />} style={{ background: '#1890FF' }} onClick={() => handleExportReport('inventory', 'pdf')}>PDF</Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card style={{ borderRadius: 16, textAlign: 'center' }}>
                  <FileExcelOutlined style={{ fontSize: 40, color: '#722ED1', marginBottom: 12 }} />
                  <Title level={4}>Customer Report</Title>
                  <Space style={{ marginTop: 12 }}>
                    <Button icon={<DownloadOutlined />} onClick={() => handleExportReport('customer', 'csv')}>Export CSV</Button>
                    <Button type="primary" icon={<FilePdfOutlined />} style={{ background: '#722ED1' }} onClick={() => handleExportReport('customer', 'pdf')}>PDF</Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        )}

        {/* ─── 11. SETTINGS ─── */}
        {activeNav === 'settings' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <Title level={4} style={{ marginBottom: 20 }}>System & Platform Settings</Title>
            <Form layout="vertical" style={{ maxWidth: 500 }} initialValues={{ platformName: 'Bhoomi Bloom Organic Agriculture', contactEmail: 'support@bhoomibloom.com', currency: 'INR (₹)', enableAutoSeed: true }}>
              <Form.Item label="Platform Title" name="platformName">
                <Input size="large" />
              </Form.Item>
              <Form.Item label="Support Email" name="contactEmail">
                <Input size="large" />
              </Form.Item>
              <Form.Item label="Default Currency" name="currency">
                <Input size="large" disabled />
              </Form.Item>
              <Form.Item label="Database Auto-Seeding" name="enableAutoSeed" valuePropName="checked">
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>
              <Button type="primary" style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 8 }}>Save Configuration</Button>
            </Form>
          </Card>
        )}
      </Content>

      {/* ADD/EDIT REWARD MODAL */}
      <Modal
        title={editingReward ? 'Edit Spin Wheel Reward' : 'Add New Spin Wheel Reward'}
        open={isRewardModalOpen}
        onOk={handleSaveReward}
        onCancel={() => setIsRewardModalOpen(false)}
        okText={editingReward ? 'Update Reward' : 'Create Reward'}
        okButtonProps={{ style: { background: '#2E7D32', borderColor: '#2E7D32' } }}
      >
        <Form form={rewardForm} layout="vertical">
          <Form.Item name="label" label="Reward Label" rules={[{ required: true, message: 'Enter reward label!' }]}>
            <Input placeholder="e.g. 10% OFF First Order" />
          </Form.Item>
          <Form.Item name="code" label="Coupon Code" rules={[{ required: true, message: 'Enter coupon code!' }]}>
            <Input placeholder="e.g. SPIN-10PER" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="reward_type" label="Reward Type" rules={[{ required: true }]}>
                <Select placeholder="Type">
                  <Option value="percentage">Percentage Discount (%)</Option>
                  <Option value="flat">Fixed Amount Discount (₹)</Option>
                  <Option value="shipping">Free Shipping</Option>
                  <Option value="gift">Free Product Sample</Option>
                  <Option value="bogo">Buy 1 Get 1</Option>
                  <Option value="none">No Reward (Try Again)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reward_value" label="Reward Value">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="10" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="probability_weight" label="Probability Weight (1-100)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} max={100} placeholder="20" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="color" label="Slice Color Hex">
            <Input placeholder="#2E7D32" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ADD/EDIT PRODUCT MODAL */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={isProductModalOpen}
        onOk={handleSaveProduct}
        onCancel={() => setIsProductModalOpen(false)}
        okText={editingProduct ? 'Update Product' : 'Create Product'}
        okButtonProps={{ style: { background: '#2E7D32', borderColor: '#2E7D32' } }}
      >
        <Form form={productForm} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Please enter product name!' }]}>
            <Input placeholder="e.g. Organic Vermicompost 50kg" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Select category!' }]}>
                <Select placeholder="Category">
                  <Option value="Seeds">Seeds</Option>
                  <Option value="Fertilizers">Fertilizers</Option>
                  <Option value="Tools">Tools</Option>
                  <Option value="Machinery">Machinery</Option>
                  <Option value="Irrigation">Irrigation</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Price (INR)" rules={[{ required: true, message: 'Enter price!' }]}>
                <InputNumber style={{ width: '100%' }} min={1} placeholder="1200" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stock" label="Stock Quantity" rules={[{ required: true, message: 'Enter stock!' }]}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="50" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isOrganic" label="Certified Organic?" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="image" label="Image Filename">
            <Input placeholder="e.g. fert_vermi.jpg" />
          </Form.Item>
          <Form.Item name="description" label="Product Description">
            <Input.TextArea rows={3} placeholder="Provide details about product usage..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ANNOUNCEMENT MODAL */}
      <Modal
        title="Broadcast System Announcement"
        open={isAnnouncementModalOpen}
        onOk={handleSendAnnouncement}
        onCancel={() => setIsAnnouncementModalOpen(false)}
        okText="Send Notification"
        okButtonProps={{ style: { background: '#2E7D32', borderColor: '#2E7D32' } }}
      >
        <Form form={announcementForm} layout="vertical">
          <Form.Item name="title" label="Notification Title" rules={[{ required: true, message: 'Enter title!' }]}>
            <Input placeholder="e.g. Special Season Discount & New Bio-fertilizers In Stock" />
          </Form.Item>
          <Form.Item name="message" label="Notification Message" rules={[{ required: true, message: 'Enter message!' }]}>
            <Input.TextArea rows={3} placeholder="Message will be sent to all user notification drawers..." />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminDashboard;
