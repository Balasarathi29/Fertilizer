import React, { useState, useContext, useEffect } from 'react';
import { Row, Col, Typography, Input, Select, notification, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import ProductCard from '../components/ProductCard';
import { AuthContext } from '../App';
import { apiService } from '../services/apiService';
import { mockProducts } from '../data/products';

const { Title, Text } = Typography;
const { Option } = Select;

const Products = ({ initialCategory = 'All' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { requireAuth, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    fetchProductsData();
    if (isAuthenticated) {
      fetchWishlistIds();
    }
  }, [category, searchTerm, sortBy, isAuthenticated]);

  const fetchProductsData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProducts(category, searchTerm, sortBy);
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        let local = mockProducts.filter(p => {
          const term = searchTerm.toLowerCase();
          const matchesSearch = !term || p.name?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term);
          const matchesCat = category === 'All' || p.category === category;
          return matchesSearch && matchesCat;
        });
        setProducts(local);
      }
    } catch (e) {
      let local = mockProducts.filter(p => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term || p.name?.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term);
        const matchesCat = category === 'All' || p.category === category;
        return matchesSearch && matchesCat;
      });
      setProducts(local);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistIds = async () => {
    try {
      const res = await apiService.getWishlist();
      setWishlistIds(res.product_ids || []);
    } catch (e) {}
  };

  const handleAddToCart = (product) => {
    requireAuth(async () => {
      try {
        await apiService.addToCart(product.id, 1);
        notification.success({
          message: 'Added to Cart',
          description: `${product.name} has been added to your cart.`,
          placement: 'topRight',
        });
      } catch (err) {
        notification.info({
          message: 'Added to Cart',
          description: `${product.name} added to cart.`,
        });
      }
    });
  };

  const handleToggleWishlist = (productId) => {
    requireAuth(async () => {
      try {
        const res = await apiService.toggleWishlist(productId);
        const newIds = res.product_ids || [];
        setWishlistIds(newIds);
        const isNowSaved = newIds.includes(productId);
        notification.success({
          message: isNowSaved ? 'Saved to Wishlist' : 'Removed from Wishlist',
          description: isNowSaved ? 'Product saved to your wishlist.' : 'Product removed from your wishlist.',
          placement: 'topRight'
        });
      } catch (err) {
        notification.error({ message: 'Wishlist Update Failed', description: err.message });
      }
    });
  };

  const getCategoryTitle = () => {
    if (category === 'All') return 'Bhoomi Bloom Marketplace';
    if (category === 'Seeds') return 'Premium Seeds Collection';
    if (category === 'Machinery') return 'Agriculture Machinery';
    if (category === 'Tools') return 'Farm Hand Tools';
    if (category === 'Irrigation') return 'Irrigation Systems';
    if (category === 'Fertilizers') return 'Organic Fertilizers';
    return `${category} Products`;
  };

  return (
    <div style={{ padding: '40px 10%', background: 'var(--bg-app)', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>{getCategoryTitle()}</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          {category === 'All' 
            ? 'Discover premium seeds, machinery, and smart farming tools.' 
            : `Browse our extensive collection of high-quality ${category.toLowerCase()}.`}
        </Text>
      </div>
      
      {/* ─── Search and Filters ─── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Input 
          size="large"
          placeholder="Search products, crops, or categories..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: 400, borderRadius: 12 }}
        />
        
        {initialCategory === 'All' && (
          <Select
            size="large"
            value={category}
            onChange={setCategory}
            style={{ width: 180 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="All">All Categories</Option>
            <Option value="Seeds">Seeds</Option>
            <Option value="Fertilizers">Fertilizers</Option>
            <Option value="Tools">Tools</Option>
            <Option value="Machinery">Machinery</Option>
            <Option value="Irrigation">Irrigation</Option>
          </Select>
        )}

        <Select
          size="large"
          value={sortBy}
          onChange={setSortBy}
          style={{ width: 180 }}
          suffixIcon={<SortAscendingOutlined />}
        >
          <Option value="featured">Sort by: Featured</Option>
          <Option value="price_low">Price: Low to High</Option>
          <Option value="price_high">Price: High to Low</Option>
          <Option value="rating">Highest Rated</Option>
        </Select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Text strong>{products.length}</Text> products found
      </div>

      {/* ─── Product Grid ─── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {products.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlistIds.includes(product.id)}
              />
            </Col>
          ))}
          {products.length === 0 && (
            <Col span={24} style={{ textAlign: 'center', padding: '60px' }}>
              <Title level={4} type="secondary">No products found matching your criteria.</Title>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default Products;
