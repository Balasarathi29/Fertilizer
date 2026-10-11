const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {
  // ─── AUTHENTICATION ───
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed. Please check your credentials.');
    }
    return data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Registration failed. Please check your details.');
    }
    return data;
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  },

  updateProfile: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update profile');
    return data;
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: isActive })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update user status');
    return data;
  },

  // ─── PRODUCTS ───
  getProducts: async (category = null, search = null, sort = null) => {
    let url = `${API_BASE_URL}/products?`;
    if (category && category !== 'All') url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `q=${encodeURIComponent(search)}&`;
    if (sort) url += `sort=${encodeURIComponent(sort)}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  },

  getProductById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Product not found');
    return await response.json();
  },

  createProduct: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to create product');
    return data;
  },

  updateProduct: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update product');
    return data;
  },

  deleteProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to delete product');
    return data;
  },

  // ─── CART & WISHLIST ───
  getCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return { items: [] };
    return await response.json();
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, quantity })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to add item to cart');
    return data;
  },

  removeFromCart: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/cart/remove`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    return await response.json();
  },

  updateCartQuantity: async (productId, quantity) => {
    const safeQty = Math.max(1, parseInt(quantity) || 1); // Never allow below 1
    const response = await fetch(`${API_BASE_URL}/cart/update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, quantity: safeQty })
    });
    return await response.json();
  },

  getWishlist: async () => {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return { product_ids: [], products: [] };
    return await response.json();
  },

  addToWishlist: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to add to wishlist');
    return data;
  },

  removeFromWishlist: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/remove`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to remove from wishlist');
    return data;
  },

  toggleWishlist: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    return await response.json();
  },

  // ─── BHOOMI CARD ENDPOINTS ───
  getBhoomiCardStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/bhoomi-card/status`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch Bhoomi Card status');
    return await response.json();
  },

  purchaseBhoomiCard: async () => {
    const response = await fetch(`${API_BASE_URL}/bhoomi-card/purchase`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to purchase Bhoomi Card');
    return data;
  },

  getAdminBhoomiCardConfig: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/bhoomi-card/config`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch Bhoomi Card config');
    return await response.json();
  },

  updateAdminBhoomiCardConfig: async (configPayload) => {
    const response = await fetch(`${API_BASE_URL}/admin/bhoomi-card/config`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(configPayload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update Bhoomi Card config');
    return data;
  },

  getAdminBhoomiCardCustomers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/bhoomi-card/customers`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch customer cards');
    return await response.json();
  },

  updateCustomerCardStatus: async (cardId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/bhoomi-card/customers/${cardId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update card status');
    return data;
  },

  // ─── AI & WEATHER ENDPOINTS ───
  getWeather: async (state, district) => {
    const response = await fetch(`${API_BASE_URL}/weather/forecast?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
    if (!response.ok) throw new Error('Failed to fetch weather forecast');
    return await response.json();
  },

  recommendCrop: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/ai/crop/recommend`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Crop recommendation failed');
    return data;
  },

  getCropHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/crop/history`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
  },

  getSoilHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/ai/soil/history`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
  },

  // ─── SPIN & WIN REWARDS ───
  getSpinWheelStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/spin-wheel/status`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch Spin Wheel status');
    return await response.json();
  },

  spinWheel: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/spin-wheel/spin`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to spin wheel');
    return data;
  },

  adminTestSpin: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/spin-wheel/admin-test-spin`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Admin test spin failed');
    return data;
  },

  getAdminSpinConfig: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/admin/spin-wheel/config`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch Spin Wheel config');
    return await response.json();
  },

  updateAdminSpinConfig: async (configPayload) => {
    const response = await fetch(`${API_BASE_URL}/rewards/admin/spin-wheel/config`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(configPayload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update Spin Wheel config');
    return data;
  },

  getAdminSpinRewards: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/admin/spin-wheel/rewards`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch rewards');
    return await response.json();
  },

  createAdminSpinReward: async (rewardPayload) => {
    const response = await fetch(`${API_BASE_URL}/rewards/admin/spin-wheel/rewards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rewardPayload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to create reward');
    return data;
  },

  updateAdminSpinReward: async (rewardId, rewardPayload) => {
    const response = await fetch(`${API_BASE_URL}/rewards/admin/spin-wheel/rewards/${rewardId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(rewardPayload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update reward');
    return data;
  },

  deleteAdminSpinReward: async (rewardId) => {
    const response = await fetch(`${API_BASE_URL}/rewards/admin/spin-wheel/rewards/${rewardId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to delete reward');
    return data;
  },

  getAdminSpinStats: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/admin/spin-wheel/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch Spin Wheel stats');
    return await response.json();
  },

  applyCoupon: async (code, subtotal) => {
    const response = await fetch(`${API_BASE_URL}/rewards/apply-coupon`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, subtotal })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to apply coupon');
    return data;
  },

  getMyCoupons: async () => {
    const response = await fetch(`${API_BASE_URL}/rewards/my-coupons`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch coupons');
    return await response.json();
  },

  // ─── ORDERS ───
  createOrder: async (orderPayload) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Order placement failed');
    return data;
  },

  getOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  },

  updateOrderStatus: async (orderId, orderStatus, paymentStatus = null) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ order_status: orderStatus, payment_status: paymentStatus })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update order status');
    return data;
  },

  trackOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(orderId)}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Order tracking information unavailable');
    return data;
  },

  cancelOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to cancel order');
    return data;
  },

  // ─── REAL NOTIFICATIONS ───
  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    return await response.json();
  },

  markNotificationRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  sendAnnouncement: async (title, message) => {
    const response = await fetch(`${API_BASE_URL}/notifications/announcement`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, message })
    });
    return await response.json();
  },

  // ─── SELLER ENDPOINTS ───
  getSellerStats: async () => {
    const response = await fetch(`${API_BASE_URL}/seller/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch seller stats');
    return await response.json();
  },

  // ─── DASHBOARD & ANALYTICS ───
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return await response.json();
  },

  getSalesAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/sales`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch sales analytics');
    return await response.json();
  },

  getReportExport: async (reportType) => {
    const response = await fetch(`${API_BASE_URL}/reports/export?report_type=${reportType}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to generate report export');
    return await response.json();
  }
};
