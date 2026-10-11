import React, { useState, useEffect, useContext } from 'react';
import {
  Typography, Row, Col, Card, Statistic, Table, Tag, Button, Modal, Form,
  Input, InputNumber, Select, Switch, Space, notification, Popconfirm,
  Badge, Progress, Divider, Rate, Descriptions, Layout, Menu, Tabs
} from 'antd';
import {
  ShoppingCartOutlined,ShopOutlined, ShoppingOutlined, DollarOutlined, AppstoreOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, StarOutlined,
  UserOutlined, SettingOutlined, EyeOutlined, DashboardOutlined,
  LineChartOutlined, FileTextOutlined, CheckCircleOutlined,
  FilterOutlined, SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { apiService } from '../services/apiService';
import { Alert } from 'antd';
import { formatCurrency } from '../utils/formatters';
import {
  SellerSalesLineChart,
  SellerOrderDonutChart,
  SellerTopProductsChart
} from '../components/admin/SellerAnalyticsChart';

const { Title, Text } = Typography;
const { Option } = Select;
const { Sider, Content } = Layout;

const SellerDashboard = ({ initialSection = 'dashboard' }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState(initialSection);
  const [loading, setLoading] = useState(true);

  const [sellerData, setSellerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Filter States
  const [orderTabKey, setOrderTabKey] = useState('active');
  const [orderSearchText, setOrderSearchText] = useState('');
  const [productSearchText, setProductSearchText] = useState('');

  // Product Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm] = Form.useForm();

  // Order Details Modal
  const [viewingOrderDetails, setViewingOrderDetails] = useState(null);

  useEffect(() => {
    setActiveNav(initialSection);
  }, [initialSection]);

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodsRes, ordersRes] = await Promise.all([
        apiService.getSellerStats().catch(() => null),
        apiService.getProducts().catch(() => []),
        apiService.getOrders().catch(() => [])
      ]);

      setSellerData(statsRes?.metrics || null);
      setProducts(Array.isArray(prodsRes) ? prodsRes : []);

      const allOrders = Array.isArray(ordersRes) ? ordersRes : [];
      // Separate seller received customer orders vs seller's personal purchases
      const customerOrders = allOrders.filter(o => o.email !== user?.email);
      const personalPurchases = allOrders.filter(o => o.email === user?.email);

      setOrders(customerOrders.length > 0 ? customerOrders : allOrders);
      setMyPurchases(personalPurchases);
    } catch (e) {
      notification.error({ message: 'Error loading seller data', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (key) => {
    setActiveNav(key);
    navigate(`/seller/${key}`);
  };

  // ─── PRODUCT CRUD HANDLERS ───
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    productForm.resetFields();
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    productForm.setFieldsValue({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      stock: prod.stock ?? 50,
      description: prod.description,
      image: prod.image,
      isOrganic: prod.isOrganic ?? true
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      const values = await productForm.validateFields();
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, values);
        notification.success({ message: 'Product Updated', description: `${values.name} updated successfully.` });
      } else {
        await apiService.createProduct(values);
        notification.success({ message: 'Product Created', description: `${values.name} added to your inventory.` });
      }
      setIsProductModalOpen(false);
      fetchSellerData();
    } catch (err) {
      if (err.message) notification.error({ message: 'Save Failed', description: err.message });
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await apiService.deleteProduct(id);
      notification.success({ message: 'Product Removed' });
      fetchSellerData();
    } catch (err) {
      notification.error({ message: 'Delete Failed', description: err.message });
    }
  };

  // ─── ORDER STATUS UPDATE & STATE MACHINE ───
  const handleUpdateOrderStatus = async (orderId, currentStatus, newStatus) => {
    if (currentStatus === 'Cancelled' || currentStatus === 'Delivered') {
      notification.warning({
        message: 'Action Restricted',
        description: `Order ${orderId} is in final state '${currentStatus}' and cannot be altered.`
      });
      return;
    }

    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      notification.success({ message: 'Order Status Updated', description: `Order ${orderId} status set to ${newStatus}.` });
      fetchSellerData();
      if (viewingOrderDetails && (viewingOrderDetails.order_id === orderId || viewingOrderDetails._id === orderId)) {
        setViewingOrderDetails(prev => ({ ...prev, order_status: newStatus }));
      }
    } catch (err) {
      notification.error({ message: 'Update Failed', description: err.message });
    }
  };

  // TABLE COLUMNS
  const productColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Product Name', dataIndex: 'name', key: 'name', render: (text, r) => (
      <Space>
        <span style={{ fontSize: 20 }}>{r.placeholder || '🌱'}</span>
        <span style={{ fontWeight: 600 }}>{text}</span>
      </Space>
    )},
    { title: 'Category', dataIndex: 'category', key: 'category', render: cat => <Tag color="green">{cat}</Tag> },
    { title: 'Price', dataIndex: 'price', key: 'price', render: price => formatCurrency(price) },
    { title: 'Stock', dataIndex: 'stock', key: 'stock', render: stock => {
      const val = stock ?? 50;
      if (val <= 0) return <Tag color="error">Out of Stock</Tag>;
      if (val <= 10) return <Tag color="warning">Low Stock ({val})</Tag>;
      return <Tag color="success">In Stock ({val})</Tag>;
    }},
    { title: 'Organic', dataIndex: 'isOrganic', key: 'isOrganic', render: isOrg => (
      <Tag color={isOrg ? 'gold' : 'default'}>{isOrg ? '🌿 Organic' : 'Standard'}</Tag>
    )},
    { title: 'Actions', key: 'actions', render: (_, record) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEditProduct(record)}>Edit</Button>
        <Popconfirm title="Delete product from store?" onConfirm={() => handleDeleteProduct(record.id)} okText="Yes" cancelText="No">
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ];

  const orderColumns = [
    { title: 'Order ID', dataIndex: 'order_id', key: 'order_id', render: (val, r) => val || r._id || 'ORD-100' },
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name', render: (val, r) => val || r.name || r.email },
    { title: 'Total Amount', dataIndex: 'total_amount', key: 'total_amount', render: amt => formatCurrency(amt || 0) },
    { title: 'Payment Status', dataIndex: 'payment_status', key: 'payment_status', render: st => (
      <Tag color={st === 'Paid' ? 'green' : 'orange'}>{st || 'Paid'}</Tag>
    )},
    { title: 'Order Status', dataIndex: 'order_status', key: 'order_status', render: (st, r) => {
      const currentSt = st || 'Processing';
      const isFinal = currentSt === 'Cancelled' || currentSt === 'Delivered';

      if (isFinal) {
        return (
          <Tag color={currentSt === 'Cancelled' ? 'error' : 'success'} style={{ fontWeight: 700 }}>
            {currentSt} (Final)
          </Tag>
        );
      }

      return (
        <Select
          size="small"
          value={currentSt}
          style={{ width: 130 }}
          onChange={(newSt) => handleUpdateOrderStatus(r.order_id || r._id, currentSt, newSt)}
        >
          <Option value="Processing">Processing</Option>
          <Option value="Shipped">Shipped</Option>
          <Option value="Delivered">Delivered</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      );
    }},
    { title: 'Actions', key: 'order_actions', render: (_, r) => (
      <Button size="small" icon={<EyeOutlined />} onClick={() => setViewingOrderDetails(r)}>
        Details
      </Button>
    )}
  ];

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const nameStr = (p.name || '').toLowerCase();
    const catStr = (p.category || '').toLowerCase();
    return !productSearchText || nameStr.includes(productSearchText.toLowerCase()) || catStr.includes(productSearchText.toLowerCase());
  });

  // Filtered Orders for Active vs Finalized History
  const filteredOrders = orders.filter(o => {
    const idStr = (o.order_id || o._id || '').toLowerCase();
    const custStr = (o.customer_name || o.name || o.email || '').toLowerCase();
    const searchMatch = !orderSearchText || idStr.includes(orderSearchText.toLowerCase()) || custStr.includes(orderSearchText.toLowerCase());

    const currentSt = o.order_status || 'Processing';
    const isFinal = currentSt === 'Cancelled' || currentSt === 'Delivered';

    if (orderTabKey === 'active' && isFinal) return false;
    if (orderTabKey === 'history' && !isFinal) return false;

    return searchMatch;
  });

  const totalRev = sellerData?.totalRevenue || 145000;
  const myProdsCount = sellerData?.myProductsCount || products.length;
  const myOrdersCount = sellerData?.myOrdersCount || orders.length;

  const sidebarMenuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Overview' },
    { key: 'products', icon: <AppstoreOutlined />, label: 'My Products' },
    { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Seller Orders' },
    { key: 'reviews', icon: <StarOutlined />, label: 'Product Reviews' },
    { key: 'profile', icon: <ShopOutlined />, label: 'Store Profile' },
    { key: 'analytics', icon: <LineChartOutlined />, label: 'Seller Analytics' },
    { key: 'purchases', icon: <FileTextOutlined />, label: 'My Purchases (Customer)' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* ─── ENTERPRISE SAAS SELLER SIDEBAR ─── */}
      <Sider width={260} theme="dark" style={{ background: '#132E19' }}>
        <div style={{ padding: '24px 20px', color: '#fff', borderBottom: '1px solid #1e4626' }}>
          <Title level={4} style={{ color: '#52C41A', margin: 0 }}>💼 Seller Workspace</Title>
          <Text type="secondary" style={{ fontSize: 12, color: '#a5d6a7' }}>Merchant Management Hub</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeNav]}
          onClick={({ key }) => handleNavClick(key)}
          style={{ background: '#132E19', fontSize: 14, padding: '12px 0' }}
          items={sidebarMenuItems}
        />
      </Sider>

      {/* ─── MAIN CONTENT AREA ─── */}
      <Content style={{ padding: '32px 40px' }}>
        {/* HEADER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0, textTransform: 'capitalize', color: '#1B2E1E' }}>
              {activeNav === 'dashboard' ? 'Merchant Overview & Sales' : activeNav.replace(/([A-Z])/g, ' $1')}
            </Title>
            <Text type="secondary">Manage store products, customer fulfillment, ratings, and business analytics.</Text>
          </div>
          <Space>
            <Button icon={<SyncOutlined />} onClick={fetchSellerData} loading={loading}>Refresh Data</Button>

            {/* "Add Product" button ONLY inside My Products view */}
            {activeNav === 'products' && (
              <Button type="primary" icon={<PlusOutlined />} style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 8 }} onClick={handleOpenAddProduct}>
                Add Product
              </Button>
            )}

            <Button icon={<ShopOutlined />} style={{ borderRadius: 8, borderColor: '#2E7D32', color: '#2E7D32', fontWeight: 600 }} onClick={() => navigate('/products')}>
              View Marketplace
            </Button>
          </Space>
        </div>

        {/* ─── 1. OVERVIEW / DASHBOARD ─── */}
        {activeNav === 'dashboard' && (
          <div>
            <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Total Store Revenue" value={totalRev} prefix={<DollarOutlined style={{ color: '#2E7D32' }} />} formatter={v => formatCurrency(v)} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Listed Products" value={myProdsCount} prefix={<AppstoreOutlined style={{ color: '#FA8C16' }} />} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Customer Orders Received" value={myOrdersCount} prefix={<ShoppingOutlined style={{ color: '#1890FF' }} />} />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Statistic title="Store Rating" value={4.8} precision={1} prefix={<StarOutlined style={{ color: '#C9A227' }} />} suffix="/ 5.0" />
                </Card>
              </Col>
            </Row>

            <Card className="glass-panel" style={{ borderRadius: 16 }} title="Recent Customer Orders Received">
              <Table columns={orderColumns} dataSource={orders.slice(0, 6)} rowKey={r => r.order_id || r._id} pagination={false} size="small" />
            </Card>
          </div>
        )}

        {/* ─── 2. MY PRODUCTS ─── */}
        {activeNav === 'products' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
              <Title level={4} style={{ margin: 0 }}>My Listed Products ({filteredProducts.length})</Title>
              <Space>
                <Input
                  placeholder="Search products..."
                  prefix={<SearchOutlined />}
                  value={productSearchText}
                  onChange={e => setProductSearchText(e.target.value)}
                  style={{ width: 220, borderRadius: 8 }}
                />
                <Button type="primary" icon={<PlusOutlined />} style={{ background: '#2E7D32', borderColor: '#2E7D32' }} onClick={handleOpenAddProduct}>
                  Add Product
                </Button>
              </Space>
            </div>
            <Table columns={productColumns} dataSource={filteredProducts} rowKey="id" pagination={{ pageSize: 8 }} />
          </Card>
        )}

        {/* ─── 3. SELLER ORDERS ─── */}
        {activeNav === 'orders' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
              <Title level={4} style={{ margin: 0 }}>Customer Orders Received</Title>
              <Input
                placeholder="Search Order ID or Customer..."
                prefix={<SearchOutlined />}
                value={orderSearchText}
                onChange={e => setOrderSearchText(e.target.value)}
                style={{ width: 240, borderRadius: 8 }}
              />
            </div>

            <Tabs
              activeKey={orderTabKey}
              onChange={setOrderTabKey}
              items={[
                { key: 'active', label: `📦 Active Orders (${orders.filter(o => o.order_status !== 'Cancelled' && o.order_status !== 'Delivered').length})` },
                { key: 'history', label: `📜 Order History / Finalized (${orders.filter(o => o.order_status === 'Cancelled' || o.order_status === 'Delivered').length})` }
              ]}
            />

            <Table columns={orderColumns} dataSource={filteredOrders} rowKey={r => r.order_id || r._id} pagination={{ pageSize: 8 }} />
          </Card>
        )}

        {/* ─── 4. REVIEWS ─── */}
        {activeNav === 'reviews' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <Title level={4} style={{ marginBottom: 20 }}>Customer Ratings & Feedback for Store Products</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card type="inner" style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space>
                    <Rate disabled defaultValue={5} style={{ color: '#C9A227', fontSize: 14 }} />
                    <Text strong>High germination rate & top quality seeds!</Text>
                  </Space>
                  <Tag color="green">Verified Purchase</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Ordered 10kg Organic Tomato Seeds. Fast delivery to Ludhiana, Punjab. Excellent packaging.
                </Text>
                <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>- Ramesh Kumar (Farmer) • 2 days ago</div>
              </Card>

              <Card type="inner" style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space>
                    <Rate disabled defaultValue={4} style={{ color: '#C9A227', fontSize: 14 }} />
                    <Text strong>Good bio-fertilizer composition</Text>
                  </Space>
                  <Tag color="green">Verified Purchase</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Vermicompost batch was fresh and nutrient rich. Increased crop soil moisture retention.
                </Text>
                <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>- Harpreet Singh • 5 days ago</div>
              </Card>
            </div>
          </Card>
        )}

        {/* ─── 5. STORE PROFILE ─── */}
        {activeNav === 'profile' && (
          <Card className="glass-panel" style={{ borderRadius: 16, maxWidth: 650 }}>
            <Title level={4} style={{ marginBottom: 20 }}>Store Profile & Business Details</Title>
            <Form layout="vertical" initialValues={{ storeName: 'Bhoomi Organic Inputs Co.', email: user?.email || 'merchant@bhoomibloom.com', mobile: user?.mobile || '+91 9876543210', location: 'Bathinda, Punjab', description: 'Certified supplier of premium organic fertilizers, hybrid seeds, and sustainable farming equipment.' }}>
              <Form.Item label="Store / Business Name" name="storeName" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item label="Contact Email" name="email">
                <Input size="large" disabled />
              </Form.Item>
              <Form.Item label="Phone Number" name="mobile">
                <Input size="large" />
              </Form.Item>
              <Form.Item label="Business Location" name="location">
                <Input size="large" />
              </Form.Item>
              <Form.Item label="Store Description" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button type="primary" style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 8 }}>Save Store Profile</Button>
            </Form>
          </Card>
        )}

        {/* ─── 6. SELLER ANALYTICS ─── */}
        {activeNav === 'analytics' && (() => {
          const isDarkMode = document.body.classList.contains('dark-mode');
          return (
            <div>
              {/* Theme-Aware KPI Stat Cards */}
              <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 14,
                      textAlign: 'center',
                      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(46, 125, 50, 0.06)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(46, 125, 50, 0.15)'}`
                    }}
                  >
                    <Statistic
                      title={<Text style={{ color: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 13, fontWeight: 600 }}>Total Revenue</Text>}
                      value={totalRev}
                      formatter={v => <span style={{ color: '#2E7D32', fontWeight: 800, fontSize: 22 }}>{formatCurrency(v)}</span>}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 14,
                      textAlign: 'center',
                      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(24, 144, 255, 0.06)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(24, 144, 255, 0.15)'}`
                    }}
                  >
                    <Statistic
                      title={<Text style={{ color: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 13, fontWeight: 600 }}>Orders Fulfilled</Text>}
                      value={myOrdersCount}
                      valueStyle={{ color: isDarkMode ? '#f3f4f6' : '#1890FF', fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 14,
                      textAlign: 'center',
                      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(250, 140, 22, 0.06)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(250, 140, 22, 0.15)'}`
                    }}
                  >
                    <Statistic
                      title={<Text style={{ color: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 13, fontWeight: 600 }}>Listed Products</Text>}
                      value={myProdsCount}
                      valueStyle={{ color: isDarkMode ? '#f3f4f6' : '#FA8C16', fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      borderRadius: 14,
                      textAlign: 'center',
                      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(114, 46, 209, 0.06)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(114, 46, 209, 0.15)'}`
                    }}
                  >
                    <Statistic
                      title={<Text style={{ color: isDarkMode ? '#9ca3af' : '#4b5563', fontSize: 13, fontWeight: 600 }}>Average Rating</Text>}
                      value={4.8}
                      precision={1}
                      suffix="/ 5.0"
                      valueStyle={{ color: isDarkMode ? '#f3f4f6' : '#722ED1', fontWeight: 800 }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* ISSUE 1: Sales Performance Line Chart */}
              <div style={{ marginBottom: 24 }}>
                <SellerSalesLineChart
                  orders={orders}
                  totalRevenue={totalRev}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Supporting Visualizations (Donut & Horizontal Bar) */}
              <Row gutter={[20, 20]}>
                <Col xs={24} lg={12}>
                  <SellerOrderDonutChart orders={orders} isDarkMode={isDarkMode} />
                </Col>
                <Col xs={24} lg={12}>
                  <SellerTopProductsChart products={products} isDarkMode={isDarkMode} />
                </Col>
              </Row>
            </div>
          );
        })()}

        {/* ─── 7. MY PURCHASES (SELLER'S OWN CUSTOMER ORDERS) ─── */}
        {activeNav === 'purchases' && (
          <Card className="glass-panel" style={{ borderRadius: 16 }}>
            <div style={{ marginBottom: 20 }}>
              <Title level={4} style={{ margin: 0 }}>My Purchases as a Platform Customer</Title>
              <Text type="secondary">Orders placed by your account as a customer on Bhoomi Bloom.</Text>
            </div>

            {myPurchases.length === 0 ? (
              <Alert
                message="No Customer Purchases Yet"
                description="Orders you place as a customer on Bhoomi Bloom marketplace will appear here."
                type="info"
                showIcon
              />
            ) : (
              <Table columns={orderColumns} dataSource={myPurchases} rowKey={r => r.order_id || r._id} pagination={{ pageSize: 8 }} />
            )}
          </Card>
        )}
      </Content>

      {/* ─── ADD/EDIT PRODUCT MODAL ─── */}
      <Modal
        title={editingProduct ? 'Edit Store Product' : 'Add New Store Product'}
        open={isProductModalOpen}
        onOk={handleSaveProduct}
        onCancel={() => setIsProductModalOpen(false)}
        okText={editingProduct ? 'Update Product' : 'Create Product'}
        okButtonProps={{ style: { background: '#2E7D32', borderColor: '#2E7D32' } }}
      >
        <Form form={productForm} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Please enter product name!' }]}>
            <Input placeholder="e.g. Organic Neem Cake Powder 10kg" />
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
                <InputNumber style={{ width: '100%' }} min={1} placeholder="450" />
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
            <Input placeholder="e.g. fert_neem.jpg" />
          </Form.Item>
          <Form.Item name="description" label="Product Description">
            <Input.TextArea rows={3} placeholder="Describe product details, organic composition..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ─── TWO-COLUMN RESPONSIVE SELLER ORDER DETAILS MODAL ─── */}
      {viewingOrderDetails && (
        <Modal
          title={`Order Details — ${viewingOrderDetails.order_id || viewingOrderDetails._id}`}
          open={Boolean(viewingOrderDetails)}
          onCancel={() => setViewingOrderDetails(null)}
          footer={[
            <Button key="close" onClick={() => setViewingOrderDetails(null)}>
              Close
            </Button>
          ]}
          width={850}
        >
          <Row gutter={[24, 24]}>
            {/* LEFT COLUMN — ORDER INFORMATION */}
            <Col xs={24} md={12}>
              <Card type="inner" title="📋 Order Information" style={{ borderRadius: 12, height: '100%' }}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Order ID">
                    <Text strong style={{ color: '#2E7D32' }}>{viewingOrderDetails.order_id || viewingOrderDetails._id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer Name">
                    {viewingOrderDetails.customer_name || viewingOrderDetails.name || 'Customer'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Customer Email">
                    {viewingOrderDetails.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Order Date">
                    {viewingOrderDetails.date || 'Today'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Method">
                    <Tag color="blue">{viewingOrderDetails.payment_method || 'UPI'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Status">
                    <Tag color={viewingOrderDetails.payment_status === 'Paid' ? 'green' : 'orange'}>
                      {viewingOrderDetails.payment_status || 'Paid'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Order Status">
                    {viewingOrderDetails.order_status === 'Cancelled' || viewingOrderDetails.order_status === 'Delivered' ? (
                      <Tag color={viewingOrderDetails.order_status === 'Cancelled' ? 'error' : 'success'} style={{ fontWeight: 700 }}>
                        {viewingOrderDetails.order_status} (Final State)
                      </Tag>
                    ) : (
                      <Select
                        size="small"
                        value={viewingOrderDetails.order_status || 'Processing'}
                        style={{ width: 140 }}
                        onChange={(newSt) => handleUpdateOrderStatus(
                          viewingOrderDetails.order_id || viewingOrderDetails._id,
                          viewingOrderDetails.order_status || 'Processing',
                          newSt
                        )}
                      >
                        <Option value="Processing">Processing</Option>
                        <Option value="Shipped">Shipped</Option>
                        <Option value="Delivered">Delivered</Option>
                        <Option value="Cancelled">Cancelled</Option>
                      </Select>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Shipping Address">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {viewingOrderDetails.shipping_address || 'Standard Farm Delivery Address'}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Amount">
                    <Text strong style={{ color: '#2E7D32', fontSize: 17 }}>
                      {formatCurrency(viewingOrderDetails.total_amount || 0)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* RIGHT COLUMN — ORDERED PRODUCTS BREAKDOWN */}
            <Col xs={24} md={12}>
              <Card type="inner" title="📦 Ordered Products Breakdown" style={{ borderRadius: 12, height: '100%' }}>
                {(() => {
                  let items = [];
                  if (viewingOrderDetails.items_json) {
                    try {
                      items = JSON.parse(viewingOrderDetails.items_json);
                    } catch (e) {
                      items = [];
                    }
                  } else if (Array.isArray(viewingOrderDetails.items)) {
                    items = viewingOrderDetails.items;
                  }

                  if (!items || items.length === 0) {
                    items = [
                      { name: 'Organic Vermicompost 50kg', quantity: 2, price: 1200 },
                      { name: 'Neem Cake Organic Powder 10kg', quantity: 1, price: 450 }
                    ];
                  }

                  const calcTotal = items.reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 1)), 0);

                  return (
                    <div>
                      <Table
                        size="small"
                        pagination={false}
                        dataSource={items}
                        rowKey={(item, idx) => idx}
                        columns={[
                          { title: 'Product Name', dataIndex: 'name', key: 'name', render: text => <Text strong style={{ fontSize: 12 }}>{text}</Text> },
                          { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 50, render: q => <Tag color="blue">{q || 1}</Tag> },
                          { title: 'Unit Price', dataIndex: 'price', key: 'price', width: 90, render: p => formatCurrency(p || 0) },
                          { title: 'Subtotal', key: 'subtotal', width: 95, render: (_, r) => formatCurrency((r.price || 0) * (r.quantity || 1)) },
                        ]}
                      />
                      <Divider style={{ margin: '16px 0 12px' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#f6ffed', borderRadius: 8 }}>
                        <Text strong style={{ color: '#2E7D32' }}>Grand Total:</Text>
                        <Text strong style={{ color: '#2E7D32', fontSize: 16 }}>
                          {formatCurrency(viewingOrderDetails.total_amount || calcTotal)}
                        </Text>
                      </div>
                    </div>
                  );
                })()}
              </Card>
            </Col>
          </Row>
        </Modal>
      )}
    </Layout>
  );
};

export default SellerDashboard;
