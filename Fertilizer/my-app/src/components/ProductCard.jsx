import React, { useContext } from 'react';
import { Card, Button, Typography, Tag, Rate } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { AuthContext } from '../App';

const { Title, Text } = Typography;

// ProductCard reads wishlist state from AuthContext — single global source of truth.
// Adding to cart NEVER resets the heart state.
const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist, isAuthenticated } = useContext(AuthContext);

  // Derive filled/unfilled state from global wishlist — no local useState for this
  const inWishlist = isAuthenticated && Array.isArray(wishlistIds) && wishlistIds.includes(product.id);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
    navigate('/checkout');
  };

  return (
    <Card
      hoverable
      className="bhoomi-card"
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(46, 125, 50, 0.12)',
      }}
      cover={
        <div
          style={{
            height: 200,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <img
            src={`/src/assets/${product.image}`}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              transition: 'transform 0.4s ease',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
            }}
          />
          <span
            style={{
              fontSize: 64,
              display: 'none',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {product.placeholder || '🌱'}
          </span>

          {/* Organic Tag */}
          {product.isOrganic && (
            <Tag
              color="green"
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                margin: 0,
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 11,
                zIndex: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              100% Organic
            </Tag>
          )}

          {/* Wishlist Heart Icon — driven by AuthContext.wishlistIds, never resets on cart changes */}
          <button
            onClick={handleWishlistClick}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.92)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: inWishlist ? '#D32F2F' : '#888',
              fontSize: 16,
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
              transform: inWishlist ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {inWishlist ? <HeartFilled /> : <HeartOutlined />}
          </button>
        </div>
      }
      bodyStyle={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          {product.category}
        </Text>
        <Title
          level={5}
          style={{ margin: '4px 0 6px 0', cursor: 'pointer', color: '#1B2E1E', lineHeight: 1.3 }}
          onClick={() => navigate(`/products/${product.id}`)}
        >
          {product.name}
        </Title>

        {product.description && (
          <Text type="secondary" style={{ fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 8 }}>
            {product.description}
          </Text>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Rate disabled defaultValue={product.rating} style={{ fontSize: 13, color: '#C9A227' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>({product.reviews})</Text>
        </div>
        <Title level={4} style={{ margin: 0, color: '#2E7D32', fontWeight: 800 }}>
          {formatCurrency(product.price)}
        </Title>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button
          style={{ flex: 1, borderRadius: 10, fontSize: 13 }}
          icon={<ShoppingCartOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            if (onAddToCart) onAddToCart(product);
          }}
        >
          Add
        </Button>
        <Button
          type="primary"
          style={{ flex: 1, borderRadius: 10, background: '#2E7D32', borderColor: '#2E7D32', fontSize: 13, fontWeight: 700 }}
          icon={<ThunderboltOutlined />}
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
