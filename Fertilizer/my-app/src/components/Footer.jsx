import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const socialLinks = [
  { icon: '𝕏', label: 'Twitter', href: '#' },
  { icon: 'in', label: 'LinkedIn', href: '#' },
  { icon: 'f', label: 'Facebook', href: '#' },
  { icon: '▶', label: 'YouTube', href: '#' },
];

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [hoveredLink, setHoveredLink] = useState(null);

  const footerLinks = {
    Shop: [
      { label: t('nav.seeds', 'Premium Seeds'), path: '/seeds' },
      { label: t('nav.machinery', 'Farm Machinery'), path: '/machinery' },
      { label: t('nav.fertilizers', 'Organic Fertilizers'), path: '/fertilizers' },
      { label: t('nav.tools', 'Hand Tools'), path: '/tools' },
      { label: t('store.marketplaceTitle', 'All Products'), path: '/products' },
    ],
    'AI & Tools': [
      { label: t('nav.ai', 'Soil Analysis'), path: '/soil-analysis' },
      { label: t('ai.stepResultTitle', 'Crop Recommendation'), path: '/soil-analysis' },
      { label: t('ai.stepWeather', 'Weather Forecast'), path: '/soil-analysis' },
    ],
    Company: [
      { label: t('nav.about', 'About Us'), path: '/about' },
      { label: t('nav.seller', 'Become a Seller'), path: '/login' },
      { label: t('nav.orders', 'My Orders & Tracking'), path: '/orders' },
      { label: t('nav.wishlist', 'My Wishlist'), path: '/wishlist' },
    ],
  };

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #060e08 0%, #0a1a0d 100%)',
      color: '#fff',
      borderTop: '1px solid rgba(46,125,50,0.2)',
    }}>
      {/* Top Section */}
      <div style={{ padding: '64px 5% 48px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>

          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #2E7D32, #4caf50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>🌱</div>
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>Bhoomi Bloom</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontSize: '0.92rem', marginBottom: 28, maxWidth: 300 }}>
              India's most intelligent agri-tech platform. Empowering farmers with AI-powered crop analysis, premium products, and a thriving community.
            </p>

            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
              {['🏆 Award 2025', '✅ Certified Organic', '🌍 Pan-India'].map((badge, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '4px 12px',
                  fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                }}>{badge}</span>
              ))}
            </div>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                    textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#2E7D32';
                    e.currentTarget.style.borderColor = '#2E7D32';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: 20, letterSpacing: 0.5 }}>
                {section}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={() => navigate(link.path)}
                      onMouseEnter={() => setHoveredLink(`${section}-${i}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: hoveredLink === `${section}-${i}` ? '#4caf50' : 'rgba(255,255,255,0.55)',
                        fontSize: '0.9rem', fontFamily: 'inherit',
                        transition: 'color 0.2s', padding: 0,
                        textAlign: 'left',
                        transform: hoveredLink === `${section}-${i}` ? 'translateX(4px)' : 'none',
                        display: 'inline-block',
                      }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 5%' }} />

      {/* Bottom Section */}
      <div style={{
        padding: '24px 5%', maxWidth: 1400, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          © {new Date().getFullYear()} Bhoomi Bloom. All rights reserved. Made with ❤️ for Indian Farmers.
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i) => (
            <button
              key={i}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', fontSize: 13,
                fontFamily: 'inherit', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
