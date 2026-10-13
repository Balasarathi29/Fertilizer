import React, { useContext, useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Badge, Switch, Dropdown, Popover, List, Typography, Empty, Tag } from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  UserOutlined,
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  EnvironmentOutlined,
  CarOutlined,
  InboxOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { apiService } from '../services/apiService';
import bhoomiBloomLogo from '../assets/bhoomi_bloom_logo.jpg';
import bhoomiBloomLogoTransparent from '../assets/bhoomi_bloom_logo_transparent.png';
import SpinAndWin from './SpinAndWin';
import DeliveryLocationModal from './DeliveryLocationModal';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const { isAuthenticated, user, logout, requireAuth, wishlistIds } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [savedLocation, setSavedLocation] = useState(() => {
    try {
      const loc = localStorage.getItem('bhoomi_delivery_location');
      return loc ? JSON.parse(loc) : null;
    } catch { return null; }
  });

  // Wishlist count always reads from global AuthContext (single source of truth)
  const wishlistCount = Array.isArray(wishlistIds) ? wishlistIds.length : 0;

  useEffect(() => {
    if (isAuthenticated) {
      fetchNavbarBadgeData();
    } else {
      setNotifications([]);
      setCartCount(0);
    }
  }, [isAuthenticated, location.pathname]);

  const fetchNavbarBadgeData = async () => {
    try {
      const [notifsData, cartData] = await Promise.all([
        apiService.getNotifications().catch(() => []),
        apiService.getCart().catch(() => ({ items: [] })),
      ]);

      setNotifications(Array.isArray(notifsData) ? notifsData : []);
      setCartCount(cartData?.items?.length || 0);
    } catch (e) {
      setNotifications([]);
    }
  };

  const handleLocationSaved = (locData) => {
    setSavedLocation(locData);
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await apiService.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (e) {}
  };

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const userMenuItems = [
    {
      key: 'myOrders',
      icon: <CarOutlined style={{ color: '#2E7D32' }} />,
      label: 'My Orders & Live Tracking',
      onClick: () => navigate('/orders')
    },
    {
      key: 'bhoomiCard',
      icon: <CrownOutlined style={{ color: '#D4AF37' }} />,
      label: 'Bhoomi Card VIP',
      onClick: () => navigate('/bhoomi-card')
    },
    ...(user?.role === 'seller' ? [{
      key: 'seller',
      icon: <ShopOutlined />,
      label: 'Seller Workspace',
      onClick: () => navigate('/seller/dashboard')
    }] : []),
    ...(user?.role === 'admin' ? [{
      key: 'admin',
      icon: <SettingOutlined />,
      label: 'Admin Control Center',
      onClick: () => navigate('/admin/dashboard')
    }] : []),
    {
      key: 'cart',
      icon: <ShoppingCartOutlined />,
      label: 'My Cart',
      onClick: () => navigate('/cart')
    },
    {
      key: 'wishlist',
      icon: <HeartOutlined />,
      label: 'My Wishlist',
      onClick: () => navigate('/wishlist')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => logout()
    }
  ];

  const menuItems = [
    { key: '/', label: <Link to="/">Home</Link> },
    { key: '/about', label: <Link to="/about">About Us</Link> },
    { key: '/crop-recommendation', label: <Link to="/crop-recommendation">🌾 Crop AI</Link> },
    { key: '/bhoomi-card', label: <Link to="/bhoomi-card" style={{ color: '#D4AF37', fontWeight: 600 }}>👑 Bhoomi Card</Link> },
  ];

  const shopMenuItems = [
    {
      key: 'all-products',
      icon: <ShopOutlined style={{ color: '#2E7D32' }} />,
      label: 'All Products',
      onClick: () => navigate('/products')
    },
    { type: 'divider' },
    {
      key: 'seeds',
      icon: <span style={{ fontSize: 14 }}>🌱</span>,
      label: 'Seeds',
      onClick: () => navigate('/seeds')
    },
    {
      key: 'machinery',
      icon: <span style={{ fontSize: 14 }}>🚜</span>,
      label: 'Machinery',
      onClick: () => navigate('/machinery')
    },
    {
      key: 'irrigation',
      icon: <span style={{ fontSize: 14 }}>💧</span>,
      label: 'Irrigation',
      onClick: () => navigate('/irrigation')
    },
    {
      key: 'tools',
      icon: <span style={{ fontSize: 14 }}>⛏️</span>,
      label: 'Tools',
      onClick: () => navigate('/tools')
    },
    {
      key: 'fertilizers',
      icon: <span style={{ fontSize: 14 }}>🌿</span>,
      label: 'Fertilizers',
      onClick: () => navigate('/fertilizers')
    },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      key: '/admin/dashboard',
      label: <Link to="/admin/dashboard" style={{ color: '#C9A227', fontWeight: 600 }}>⚡ Admin Panel</Link>
    });
  } else if (user?.role === 'seller') {
    menuItems.push({
      key: '/seller/dashboard',
      label: <Link to="/seller/dashboard" style={{ color: isDarkMode ? '#4caf50' : '#2E7D32', fontWeight: 600 }}>💼 Seller Center</Link>
    });
  }

  // Real Database Notifications Content
  const notificationContent = (
      <div style={{ width: 340, maxHeight: 400, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : '#f0f0f0'}` }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
        <Tag color="green">{unreadNotifCount} New</Tag>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No new notifications" /> }}
        renderItem={item => (
          <List.Item
            onClick={() => handleMarkAsRead(item.id)}
              style={{
                padding: '10px 8px',
                cursor: 'pointer',
                background: item.is_read ? 'transparent' : (isDarkMode ? 'rgba(76,175,80,0.14)' : '#f0fdf4'),
                borderRadius: 8,
                marginBottom: 4
              }}
          >
            <List.Item.Meta
              avatar={<CheckCircleOutlined style={{ color: '#2E7D32', fontSize: 18, marginTop: 4 }} />}
              title={<span style={{ fontWeight: item.is_read ? 500 : 700, fontSize: 13 }}>{item.title}</span>}
              description={<Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Text>}
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <>
      <Header
        className="glass-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          background: isDarkMode
            ? 'rgba(15, 23, 42, 0.75)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0 40px',
          height: '80px',
          boxShadow: isDarkMode ? '0 6px 24px rgba(0,0,0,0.5)' : '0 4px 20px rgba(15,23,42,0.08)',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Gradient accent line along the bottom edge */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, #4caf50 20%, #D4AF37 50%, #4caf50 80%, transparent 100%)',
          opacity: isDarkMode ? 0.9 : 0.75,
          pointerEvents: 'none'
        }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <img
          src={isDarkMode ? bhoomiBloomLogoTransparent : bhoomiBloomLogo}
          alt="Bhoomi Bloom Logo"
          style={{
            height: '42px',
            width: '42px',
            borderRadius: '50%',
            display: 'block',
            objectFit: 'cover',
            filter: isDarkMode ? 'brightness(1.45) drop-shadow(0 2px 6px rgba(0,0,0,0.5))' : 'none',
            boxShadow: isDarkMode
              ? 'none'
              : '0 0 0 1px rgba(46,125,50,0.30), 0 2px 8px rgba(46,125,50,0.18)',
          }}
        />
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#2E7D32', letterSpacing: '-0.5px' }}>Bhoomi Bloom</span>
      </div>

      <Menu
        mode="horizontal"
        theme={isDarkMode ? 'dark' : 'light'}
        selectedKeys={[location.pathname]}
        style={{
          flex: 1,
          justifyContent: 'center',
          borderBottom: 'none',
          background: 'transparent',
          fontSize: 15,
          fontWeight: 500
        }}
        items={menuItems}
      />

      <Dropdown
        menu={{ items: shopMenuItems }}
        placement="bottomCenter"
        arrow={{ pointAtCenter: true }}
        overlayStyle={{ minWidth: 220 }}
      >
        <Button
          type="text"
          icon={<ShopOutlined style={{ fontSize: 16 }} />}
          style={{
            marginRight: 8,
            borderRadius: 20,
            padding: '0 14px',
            fontWeight: 600,
            color: isDarkMode ? '#fff' : '#2E7D32',
            background: isDarkMode ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.08)',
            border: `1px solid ${isDarkMode ? 'rgba(76,175,80,0.22)' : 'rgba(46,125,50,0.16)'}`
          }}
        >
          Shop <DownOutlined style={{ fontSize: 12, marginLeft: 6 }} />
        </Button>
      </Dropdown>

      <Space size={12}>
        <Switch
          checked={isDarkMode}
          onChange={(checked) => setIsDarkMode(checked)}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
        />
        
        <Button type="text" icon={<SearchOutlined style={{ fontSize: 20 }} />} onClick={() => navigate('/products')} />

        {/* Flipkart-style Delivery Location Widget */}
        <div
          onClick={() => setLocationModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            padding: '4px 10px',
            borderRadius: 20,
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#d9d9d9'}`,
            background: savedLocation ? (isDarkMode ? 'rgba(76,175,80,0.15)' : '#f0fdf4') : 'transparent',
            maxWidth: 180,
            transition: 'all 0.2s ease',
          }}
          title="Set your delivery location"
        >
          <EnvironmentOutlined style={{ color: isDarkMode ? '#4caf50' : '#2E7D32', fontSize: 18, flexShrink: 0 }} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 10, color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#888', lineHeight: 1 }}>Deliver to</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: isDarkMode ? '#4caf50' : '#2E7D32', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {savedLocation ? (savedLocation.area || savedLocation.city || 'Location Set') : 'Select Location'}
            </div>
          </div>
        </div>

        <SpinAndWin />

        {/* Real Notification Badge */}
        <Popover content={notificationContent} trigger="click" placement="bottomRight">
          <Badge count={unreadNotifCount} size="small">
            <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} />
          </Badge>
        </Popover>

        {/* Dynamic Wishlist Badge — count from global AuthContext */}
        <Badge count={wishlistCount} size="small">
          <Button
            type="text"
            icon={<HeartOutlined style={{ fontSize: 20 }} />}
            onClick={() => requireAuth(() => navigate('/wishlist'))}
          />
        </Badge>

        {/* Dynamic Cart Badge */}
        <Badge count={cartCount} size="small">
          <Button
            type="text"
            icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
            onClick={() => requireAuth(() => navigate('/cart'))}
          />
        </Badge>

        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow={{ pointAtCenter: true }}>
            <Button
              type="primary"
              icon={<UserOutlined style={{ fontSize: 18 }} />}
              style={{
                background: isDarkMode ? 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)' : '#2E7D32',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.35)' : '#2E7D32',
                color: '#fff',
                fontWeight: 600,
                borderRadius: 20,
                boxShadow: isDarkMode ? '0 4px 14px rgba(46,125,50,0.5)' : 'none'
              }}
            >
              {user?.name ? user.name.split(' ')[0] : 'Profile'}
            </Button>
          </Dropdown>
        ) : (
          <Button
            type="default"
            icon={<UserOutlined style={{ fontSize: 18 }} />}
            onClick={() => navigate('/login')}
            style={{
              borderColor: isDarkMode ? 'rgba(255,255,255,0.35)' : '#2E7D32',
              color: isDarkMode ? '#fff' : '#2E7D32',
              fontWeight: 600,
              borderRadius: 20,
              background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'transparent'
            }}
          >
            Login
          </Button>
        )}
      </Space>
    </Header>

    {/* Delivery Location Modal */}
    <DeliveryLocationModal
      open={locationModalOpen}
      onClose={() => setLocationModalOpen(false)}
      onLocationSaved={handleLocationSaved}
    />
  </>
  );
};

export default Navbar;
