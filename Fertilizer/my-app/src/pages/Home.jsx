import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Typography,
  Button,
  Row,
  Col,
  Card,
  Input,
  Badge,
  Tag,
  Rate,
  Tooltip,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  FireOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
  ShoppingCartOutlined,
  EyeOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SmileOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  TrophyOutlined,
  CheckCircleFilled,
  ArrowLeftOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  TagOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext, useDarkMode } from "../App";
import { useLanguage } from "../i18n/LanguageContext";
import { apiService } from "../services/apiService";
import { mockProducts } from "../data/products";
import { formatCurrency } from "../utils/formatters";

import BhoomiRobotMascot from "../components/BhoomiAI/BhoomiRobotMascot";
import LeafParticles from "../components/LeafParticles";
import bhoomiBloomBanner from "../assets/bhoomi_bloom_banner.jpg";
import aboutHeroImg from "../assets/about_hero.jpg";
import aboutMarketplaceImg from "../assets/about_marketplace.jpg";

const { Title, Paragraph, Text } = Typography;

// ─── Countdown Timer Hook (driven by a real ISO end-datetime) ─
const useCountdown = (endDatetimeIso = null) => {
  const computeRemaining = () => {
    if (!endDatetimeIso) return { h: 0, m: 0, s: 0, expired: true };
    const diffSec = Math.max(
      0,
      Math.floor((new Date(endDatetimeIso).getTime() - Date.now()) / 1000),
    );
    if (diffSec <= 0) return { h: 0, m: 0, s: 0, expired: true };
    return {
      h: Math.floor(diffSec / 3600),
      m: Math.floor((diffSec % 3600) / 60),
      s: diffSec % 60,
      expired: false,
    };
  };

  const [time, setTime] = useState(computeRemaining);
  useEffect(() => {
    const timer = setInterval(() => setTime(computeRemaining()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDatetimeIso]);
  return time;
};

// ─── Animated Counter Hook ─────────────────────────────────
const useAnimatedCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / (duration / 16);
          const handle = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(handle);
            } else setCount(Math.floor(start));
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [count, ref];
};

// ─── HERO SLIDES DATA ──────────────────────────────────────
const heroSlides = [
  {
    id: 1,
    tag: "🌱 Bhoomi AI Agriculture",
    headline: "Smart Farming.\nBetter Decisions. Better Growth.",
    sub: "Transforming Indian agriculture with precision soil analytics, regional micro-weather, and high-yield organic inputs.",
    cta: "Start AI Recommendation",
    ctaPath: "/soil-analysis",
    cta2: "Explore Organic Fertilizers",
    cta2Path: "/fertilizers",
    bg: "linear-gradient(135deg, rgba(10,40,,0.45) 0%, rgba(20,70,25,0.40) 60%, rgba(46,125,50,0.40) 100%)",
    accent: "#4caf50",
    image: "/src/assets/bhoomi_bloom_banner.jpg",
    position: "right center",
  },
  {
    id: 2,
    tag: "🛒 Premium Marketplace",
    headline: "Seeds, Tools &\nMachinery",
    sub: "Curated agri-products from certified sellers. Quality guaranteed, delivered to your farm.",
    cta: "Browse Products",
    ctaPath: "/products",
    cta2: "View Deals",
    cta2Path: "#deals",
    bg: "linear-gradient(135deg, rgba(10,30,50,0.34) 0%, rgba(15,55,80,0.26) 60%, rgba(25,80,110,0.22) 100%)",
    accent: "#C9A227",
    image: "/src/assets/about_marketplace.jpg",
    position: "right center",
  },
  {
    id: 3,
    tag: "🤖 Bhoomi AI",
    headline: "AI Crop Advisor\nAt Your Fingertips",
    sub: "Get intelligent crop recommendations and organic fertilizer guidance based on your soil data.",
    cta: "Try AI Analysis",
    ctaPath: "/soil-analysis",
    cta2: "Learn More",
    cta2Path: "/about",
    bg: "linear-gradient(135deg, rgba(40,10,60,0.34) 0%, rgba(70,20,90,0.26) 60%, rgba(100,30,120,0.22) 100%)",
    accent: "#a855f7",
    image: "/src/assets/about_ai_assistant.jpg",
    position: "right center",
  },
];

// ─── CATEGORIES DATA ───────────────────────────────────────
const categories = [
  {
    title: "Premium Seeds",
    path: "/seeds",
    icon: "🌱",
    count: "30+ varieties",
    color: "#dcfce7",
    border: "#86efac",
    accent: "#16a34a",
  },
  {
    title: "Farm Machinery",
    path: "/machinery",
    icon: "🚜",
    count: "16+ models",
    color: "#dbeafe",
    border: "#93c5fd",
    accent: "#2563eb",
  },
  {
    title: "Irrigation",
    path: "/irrigation",
    icon: "💧",
    count: "10+ systems",
    color: "#e0f2fe",
    border: "#7dd3fc",
    accent: "#0284c7",
  },
  {
    title: "Hand Tools",
    path: "/tools",
    icon: "⛏️",
    count: "13+ tools",
    color: "#fef3c7",
    border: "#fcd34d",
    accent: "#d97706",
  },
  {
    title: "Organic Fertilizers",
    path: "/fertilizers",
    icon: "🌿",
    count: "9+ products",
    color: "#f0fdf4",
    border: "#86efac",
    accent: "#15803d",
  },
  {
    title: "Soil & Crop AI",
    path: "/soil-analysis",
    icon: "🤖",
    count: "AI Powered",
    color: "#fdf4ff",
    border: "#d8b4fe",
    accent: "#7c3aed",
  },
];

// ─── DEAL PRODUCTS ─────────────────────────────────────────
const dealProductIds = [201, 111, 504, 308, 116, 406];

// ─── STAT COUNTER COMPONENT ────────────────────────────────
const StatCounter = ({ target, suffix, label, icon }) => {
  const isDark = useDarkMode();
  const [count, ref] = useAnimatedCounter(target);
  return (
    <div ref={ref} style={{ textAlign: "center", padding: "8px 24px" }}>
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: isDark ? "#34D399" : "#10B981",
          lineHeight: 1,
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontSize: 13,
          color: isDark ? "#94A3B8" : "#64748B",
          marginTop: 6,
          fontWeight: 500,
        }}
      >
        {icon} {label}
      </div>
    </div>
  );
};

// ─── HOME COMPONENT ────────────────────────────────────────
const Home = () => {
  const isDark = useDarkMode();
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useContext(AuthContext);
  const { t } = useLanguage();

  /* ── Mode-adaptive enterprise palette ── */
  const H = {
    sectionBg: isDark ? "var(--bg-app)" : "#FFFFFF",
    sectionAlt: isDark ? "rgba(15,23,42,0.45)" : "#FAFAFA",
    heading: isDark ? "#F8FAFC" : "#111827",
    body: isDark ? "#94A3B8" : "#64748B",
    muted: isDark ? "#64748B" : "#888888",
    cardBg: isDark ? "#131D31" : "#FFFFFF",
    cardBorder: isDark ? "rgba(255,255,255,0.08)" : "#F0F0F0",
    catCardBg: isDark
      ? "linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)"
      : "#FFFFFF",
    catCardBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
    tabBarBg: isDark ? "rgba(255,255,255,0.06)" : "#F0F0F0",
    tabInactive: isDark ? "#94A3B8" : "#666666",
    imgTile: isDark
      ? "linear-gradient(135deg, rgba(30,41,59,0.6), rgba(15,23,42,0.8))"
      : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    emerald: "#10B981",
    emeraldDeep: "#059669",
    emeraldGlow: "rgba(16,185,129,0.30)",
  };
  // Flash sale state — driven by real backend data
  const [flashSales, setFlashSales] = useState([]);
  const [activeFlashSaleEnd, setActiveFlashSaleEnd] = useState(null);

  // Countdown is now keyed to a real ISO end datetime from the API
  const countdown = useCountdown(activeFlashSaleEnd);

  const dynamicSlides = [
    {
      id: 1,
      tag: t("home.tag", "🌱 Bhoomi AI Agriculture"),
      headline: t(
        "home.heroHeadline",
        "Smart Farming.\nBetter Decisions. Better Growth.",
      ),
      sub: t(
        "home.heroSub",
        "Transforming Indian agriculture with precision soil analytics, regional micro-weather, and high-yield organic inputs.",
      ),
      cta: t("home.ctaAi", "Start AI Recommendation"),
      ctaPath: "/soil-analysis",
      cta2: t("home.ctaFert", "Explore Organic Fertilizers"),
      cta2Path: "/fertilizers",
      bg: "linear-gradient(135deg, rgba(10,40,15,0.36) 0%, rgba(20,70,25,0.28) 60%, rgba(46,125,50,0.24) 100%)",
      accent: "#4caf50",
      image: bhoomiBloomBanner,
      position: "center 35%",
    },
    {
      id: 2,
      tag: "🤖 Bhoomi AI",
      headline: "AI Crop Advisor\nAt Your Fingertips",
      sub: "Get intelligent crop recommendations and organic fertilizer guidance based on your soil data.",
      cta: "Try AI Analysis",
      ctaPath: "/soil-analysis",
      cta2: "Learn More",
      cta2Path: "/about",
      bg: "linear-gradient(135deg, rgba(10,20,35,0.34) 0%, rgba(10,20,35,0.26) 60%, rgba(10,20,35,0.22) 100%)",
      accent: "#7c3aed",
      image: aboutHeroImg,
      position: "center 15%",
    },
    {
      id: 3,
      tag: t("home.marketplaceTag", "🛒 Premium Marketplace"),
      headline: t("home.marketplaceHeadline", "Seeds, Tools &\nMachinery"),
      sub: t(
        "home.marketplaceSub",
        "Curated agri-products from certified sellers. Quality guaranteed, delivered to your farm.",
      ),
      cta: t("home.discoverProducts", "Browse Products"),
      ctaPath: "/products",
      cta2: t("home.dealsTitle", "View Deals"),
      cta2Path: "#deals",
      bg: "linear-gradient(135deg, rgba(10,30,50,0.34) 0%, rgba(15,55,80,0.26) 60%, rgba(25,80,110,0.22) 100%)",
      accent: "#C9A227",
      image: aboutMarketplaceImg,
      position: "center 5%",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState("featured");
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [slideTransitionId, setSlideTransitionId] = useState(0);

  // Auto-slide hero
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDir(1);
      setCurrentSlide((prev) => (prev + 1) % dynamicSlides.length);
      setSlideTransitionId((prev) => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, [dynamicSlides.length]);

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await apiService.getProducts();
        setProducts(Array.isArray(data) ? data : mockProducts);
      } catch {
        setProducts(mockProducts);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Fetch active flash sales from backend (stable, admin-managed)
  const loadFlashSales = useCallback(async () => {
    try {
      const data = await apiService.getActiveFlashSales();
      if (Array.isArray(data) && data.length > 0) {
        setFlashSales(data);
        // Use the earliest end_datetime as the countdown target
        const earliest = data.reduce(
          (min, s) => (s.end_datetime < min ? s.end_datetime : min),
          data[0].end_datetime,
        );
        setActiveFlashSaleEnd(earliest);
      } else {
        setFlashSales([]);
        setActiveFlashSaleEnd(null);
      }
    } catch {
      setFlashSales([]);
      setActiveFlashSaleEnd(null);
    }
  }, []);

  useEffect(() => {
    loadFlashSales();
    const syncTimer = setInterval(loadFlashSales, 10000); // 10s synchronization interval
    return () => clearInterval(syncTimer);
  }, [loadFlashSales]);

  // Re-sync when countdown reaches zero
  useEffect(() => {
    if (countdown.expired && flashSales.length > 0) {
      loadFlashSales();
    }
  }, [countdown.expired, flashSales.length, loadFlashSales]);

  const allProducts = products.length > 0 ? products : mockProducts;

  const featuredProducts = allProducts
    .filter((p) => p.rating >= 4.8)
    .slice(0, 8);
  const trendingProducts = [...allProducts]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 8);
  const newProducts = allProducts.slice(-8);
  const dealProducts = allProducts.filter((p) => dealProductIds.includes(p.id));

  // Stable deal items — discounts computed ONCE from deterministic product data.
  // API flash sales take priority; fallback uses stable integer math (no Math.random()).
  const stableDealItems = useMemo(() => {
    if (flashSales.length > 0) {
      // Use admin-curated flash sales from the backend
      return flashSales.map((sale) => ({
        id: sale.product_id,
        name: sale.product_name || `Product #${sale.product_id}`,
        category: "Flash Sale",
        price: sale.sale_price,
        originalPrice: sale.original_price || 0,
        discountPct: Math.round(sale.discount_percentage),
        placeholder: "⚡",
        image: "",
      }));
    }
    // Fallback: product-based deals with stable discounts derived from product.id
    const baseList =
      dealProducts.length > 0 ? dealProducts : mockProducts.slice(0, 6);
    return baseList.map((p) => {
      const pct = 10 + (p.id % 20); // Deterministic: same product always same %
      return {
        ...p,
        originalPrice: Math.round(p.price * (1 + pct / 100)),
        discountPct: pct,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashSales, dealProducts.length]);

  const displayProducts =
    activeTab === "featured"
      ? featuredProducts
      : activeTab === "trending"
        ? trendingProducts
        : newProducts;

  const handleAddToCart = useCallback(
    async (product) => {
      requireAuth(async () => {
        try {
          await apiService.addToCart(product.id, 1);
          message.success({
            content: `${product.name} added to cart!`,
            icon: "🛒",
          });
        } catch {
          message.error("Failed to add to cart. Please try again.");
        }
      });
    },
    [requireAuth],
  );

  const handleToggleWishlist = useCallback(
    (productId) => {
      requireAuth(async () => {
        try {
          await apiService.toggleWishlist(productId);
          setWishlist((prev) =>
            prev.includes(productId)
              ? prev.filter((id) => id !== productId)
              : [...prev, productId],
          );
        } catch {
          message.error("Failed to update wishlist.");
        }
      });
    },
    [requireAuth],
  );

  const changeSlide = (dir) => {
    setSlideDir(dir);
    setCurrentSlide(
      (prev) => (prev + dir + dynamicSlides.length) % dynamicSlides.length,
    );
    setSlideTransitionId((prev) => prev + 1);
  };

  const slide = dynamicSlides[currentSlide] || dynamicSlides[0];

  return (
    <div style={{ overflowX: "hidden" }}>
      {/* ═══════════════════════════════════════════════════
          HERO CAROUSEL
      ═══════════════════════════════════════════════════ */}
      <section
        style={{
          height: "85vh",
          minHeight: 650,
          width: "100%",
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
        }}
      >
        <LeafParticles />

        <style>{`
          @keyframes heroFadeUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Background Image Cross-fade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          {dynamicSlides.map((item, index) => (
            <img
              key={item.id}
              aria-hidden="true"
              src={item.image}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: item.position || "center 20%",
                opacity: index === currentSlide ? 1 : 0,
                pointerEvents: index === currentSlide ? "auto" : "none",
                transition: "opacity 700ms ease-in-out",
                willChange: "opacity",
                display: "block",
              }}
            />
          ))}
        </div>

        {/* Per-slide color tint — cross-fades with the images */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {dynamicSlides.map((item, index) => (
            <div
              key={item.id}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: item.bg,
                opacity: index === currentSlide ? 0.35 : 0,
                transition: "opacity 700ms ease-in-out",
              }}
            />
          ))}
        </div>

        {/* Dark gradient overlay for CTA legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 30%), linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 75%, transparent 100%)",
          }}
        />

        {/* Animated grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <style>{`
          .hero-content-wrapper {
            width: 100%;
            padding-top: 6rem;
          }

          @media (min-width: 768px) {
            .hero-content-wrapper {
              padding-top: 7rem;
            }
          }

          .hero-copy {
            max-width: 36rem;
            width: 100%;
          }
        `}</style>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            display: "flex",
            alignItems: "flex-start",
            padding: "0 8% 130px",
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <div className="hero-content-wrapper" key={slideTransitionId}>
            <div className="hero-copy">
              {/* Brand lockup: Mascot logo + Bhoomi Bloom name + slide tag */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 24,
                  animation: "heroFadeUp 700ms ease-out both",
                }}
              >
                <div className="bhoomi-robot-float">
                  <BhoomiRobotMascot size={38} state="idle" />
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(8, 20, 12, 0.6)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderRadius: 24,
                    padding: "6px 16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: 0.3,
                    }}
                  >
                    Bhoomi Bloom
                  </span>
                  <span
                    style={{
                      width: 1,
                      height: 14,
                      background: "rgba(255,255,255,0.3)",
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 0.3,
                    }}
                  >
                    {slide.tag}
                  </span>
                </div>
              </div>

              <h1
                style={{
                  color: "#fff",
                  fontSize: "clamp(1.9rem, 4vw, 3.5rem)",
                  fontWeight: 800,
                  lineHeight: 1.08,
                  marginBottom: 16,
                  letterSpacing: "-1px",
                  textShadow: "0 3px 24px rgba(0,0,0,0.45)",
                  whiteSpace: "pre-line",
                  animation: "heroFadeUp 700ms ease-out 80ms both",
                }}
              >
                {slide.headline}
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontSize: "1.05rem",
                  marginBottom: 24,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: "30rem",
                  textShadow: "0 1px 8px rgba(0,0,0,0.2)",
                  animation: "heroFadeUp 700ms ease-out 160ms both",
                }}
              >
                {slide.sub}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  animation: "heroFadeUp 700ms ease-out 240ms both",
                }}
              >
                <button
                  onClick={() =>
                    slide.ctaPath.startsWith("#")
                      ? document
                          .querySelector(slide.ctaPath)
                          ?.scrollIntoView({ behavior: "smooth" })
                      : navigate(slide.ctaPath)
                  }
                  style={{
                    height: 48,
                    padding: "0 26px",
                    fontSize: 15,
                    borderRadius: 24,
                    border: "none",
                    cursor: "pointer",
                    background: "#059669",
                    color: "#fff",
                    fontWeight: 600,
                    boxShadow: "0 8px 20px rgba(5, 150, 105, 0.45)",
                    transition: "all 0.25s ease",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#10b981";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 26px rgba(16, 185, 129, 0.55)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#059669";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(5, 150, 105, 0.45)";
                  }}
                >
                  {slide.cta} <ArrowRightOutlined />
                </button>
                <button
                  onClick={() => navigate(slide.cta2Path)}
                  style={{
                    height: 48,
                    padding: "0 26px",
                    fontSize: 15,
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    color: "#fff",
                    fontWeight: 600,
                    transition: "all 0.25s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0,0,0,0.4)";
                  }}
                >
                  {slide.cta2}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <button
          onClick={() => changeSlide(-1)}
          style={{
            position: "absolute",
            left: 24,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.20)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s ease",
            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
          }}
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.40)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.20)")
          }
        >
          <ArrowLeftOutlined />
        </button>
        <button
          onClick={() => changeSlide(1)}
          style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.20)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s ease",
            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
          }}
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.40)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "rgba(255,255,255,0.20)")
          }
        >
          <ArrowRightOutlined />
        </button>

        {/* Bottom Metrics Bar — transparent, centered at bottom center */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            padding: "0 16px 14px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1100,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px 24px",
            }}
          >
            {/* Slide dots — glass pill */}
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexShrink: 0,
                background: "rgba(8, 22, 14, 0.55)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 20,
                padding: "9px 16px",
              }}
            >
              {dynamicSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    width: i === currentSlide ? 32 : 10,
                    height: 10,
                    borderRadius: 5,
                    border: "none",
                    background:
                      i === currentSlide ? "#fff" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
            {/* Stats — solid stable chips */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 10,
                flex: 1,
                minWidth: 280,
              }}
            >
              {[
                {
                  icon: "🌾",
                  value: "1M+",
                  label: "Smart Crop Recommendations",
                },
                { icon: "🌿", value: "200+", label: "Organic Products" },
                {
                  icon: "🌤️",
                  value: "36 States",
                  label: "Weather Intelligence",
                },
                { icon: "👨‍🌾", value: "24/7", label: "Farmer Support" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    color: "#fff",
                    padding: "8px 10px",
                    minWidth: 0,
                    background: "rgba(9, 28, 16, 0.92)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
                  <div
                    style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.85)",
                      marginTop: 3,
                      lineHeight: 1.3,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CATEGORY GRID
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 5%", background: H.sectionBg }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-block",
                background: isDark
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(16,185,129,0.10)",
                color: isDark ? "#34D399" : "#059669",
                borderRadius: 20,
                padding: "4px 16px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 16,
                border: `1px solid ${isDark ? "rgba(52,211,153,0.25)" : "rgba(16,185,129,0.2)"}`,
              }}
            >
              Shop by Category
            </div>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 800,
                color: H.heading,
                marginBottom: 12,
              }}
            >
              Everything Your Farm Needs
            </h2>
            <p
              style={{
                color: H.body,
                fontSize: "1.05rem",
                maxWidth: 500,
                margin: "0 auto",
              }}
            >
              From premium seeds to AI-powered crop analysis — all in one place.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {categories.map((cat, i) => (
              <div
                key={i}
                onClick={() => navigate(cat.path)}
                style={{
                  background: H.catCardBg,
                  border: `1px solid ${hoveredCard === `cat-${i}` ? "rgba(16,185,129,0.35)" : H.catCardBorder}`,
                  borderRadius: 16,
                  padding: "32px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    hoveredCard === `cat-${i}` ? "translateY(-6px)" : "none",
                  boxShadow:
                    hoveredCard === `cat-${i}`
                      ? `0 12px 24px -8px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`
                      : `0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)`,
                  position: "relative",
                  overflow: "hidden",
                  backdropFilter: isDark ? "blur(12px)" : "none",
                }}
                onMouseEnter={() => setHoveredCard(`cat-${i}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 16,
                    margin: "0 auto 16px",
                    background: `${cat.accent}1A`,
                    border: `1px solid ${cat.accent}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    lineHeight: 1,
                  }}
                >
                  {cat.icon}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: H.heading,
                    marginBottom: 6,
                  }}
                >
                  {cat.title}
                </div>
                <div
                  style={{ fontSize: 13, color: cat.accent, fontWeight: 600 }}
                >
                  {cat.count}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: cat.accent,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    opacity: hoveredCard === `cat-${i}` ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  <ArrowRightOutlined />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FLASH DEALS / TODAY'S DEALS
      ═══════════════════════════════════════════════════ */}
      <section
        id="deals"
        style={{
          padding: "80px 5%",
          background:
            "linear-gradient(135deg, #0a1a0d 0%, #1a3a1e 50%, #0f2812 100%)",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 48,
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <FireOutlined style={{ color: "#ff6b35", fontSize: 28 }} />
                <span
                  style={{
                    color: "#ff6b35",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Flash Sale
                </span>
                <span
                  style={{
                    background: "#ff6b35",
                    color: "#fff",
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    animation: "pulse 1.5s ease-in-out infinite",
                    display: countdown.expired ? "none" : "inline",
                  }}
                >
                  LIVE
                </span>
              </div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Today's Best Deals
              </h2>
            </div>

            {/* Countdown Timer */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ClockCircleOutlined style={{ color: "#C9A227", fontSize: 20 }} />
              {countdown.expired ? (
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  No active sale
                </span>
              ) : (
                <>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 14,
                      marginRight: 8,
                    }}
                  >
                    Ends in:
                  </span>
                  {[
                    { val: String(countdown.h).padStart(2, "0"), label: "HRS" },
                    { val: String(countdown.m).padStart(2, "0"), label: "MIN" },
                    { val: String(countdown.s).padStart(2, "0"), label: "SEC" },
                  ].map((t, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && (
                        <span
                          style={{
                            color: "#C9A227",
                            fontSize: 22,
                            fontWeight: 800,
                          }}
                        >
                          :
                        </span>
                      )}
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            background: "#C9A227",
                            color: "#1a1a1a",
                            width: 52,
                            height: 52,
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            fontWeight: 900,
                            fontFamily: "monospace",
                          }}
                        >
                          {t.val}
                        </div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.5)",
                            fontSize: 10,
                            marginTop: 4,
                            fontWeight: 700,
                            letterSpacing: 1,
                          }}
                        >
                          {t.label}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Deal Product Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {stableDealItems.map((product) => {
              const discountPct = product.discountPct;
              const originalPrice = product.originalPrice;
              return (
                <div
                  key={product.id}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    transform:
                      hoveredCard === `deal-${product.id}`
                        ? "translateY(-6px)"
                        : "none",
                    boxShadow:
                      hoveredCard === `deal-${product.id}`
                        ? "0 20px 40px rgba(0,0,0,0.4)"
                        : "0 4px 16px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredCard(`deal-${product.id}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {/* Product Image Area */}
                  <div
                    style={{
                      height: 180,
                      background: "linear-gradient(135deg, #1a2e1e, #243b28)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={`/src/assets/${product.image}`}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "absolute",
                        inset: 0,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <span
                      style={{ fontSize: 56, position: "relative", zIndex: 1 }}
                    >
                      {product.placeholder}
                    </span>

                    {/* Discount badge — sleek floating pill */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "rgba(244,63,94,0.9)",
                        color: "#fff",
                        borderRadius: 9999,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        zIndex: 2,
                        boxShadow: "0 2px 8px rgba(244,63,94,0.4)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      -{discountPct}%
                    </div>

                    {/* Wishlist button */}
                    <button
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.4)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: wishlist.includes(product.id)
                          ? "#ff4d6d"
                          : "#fff",
                        fontSize: 16,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(product.id);
                      }}
                    >
                      {wishlist.includes(product.id) ? (
                        <HeartFilled />
                      ) : (
                        <HeartOutlined />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 6,
                      }}
                    >
                      {product.category}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginBottom: 10,
                        lineHeight: 1.4,
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          color: "#C9A227",
                          fontWeight: 800,
                          fontSize: "1.1rem",
                        }}
                      >
                        {formatCurrency(product.price)}
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.35)",
                          textDecoration: "line-through",
                          fontSize: "0.85rem",
                        }}
                      >
                        {formatCurrency(originalPrice)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      style={{
                        width: "100%",
                        height: 38,
                        borderRadius: 12,
                        background: "#059669",
                        border: "none",
                        cursor: "pointer",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#10B981";
                        e.target.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#059669";
                        e.target.style.transform = "none";
                      }}
                    >
                      <ShoppingCartOutlined /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={() => navigate("/products")}
              style={{
                height: 50,
                padding: "0 40px",
                borderRadius: 26,
                border: "2px solid #C9A227",
                background: "transparent",
                color: "#C9A227",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#C9A227";
                e.target.style.color = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#C9A227";
              }}
            >
              View All Deals <ArrowRightOutlined />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PRODUCT TABS — Featured / Trending / New
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 5%", background: H.sectionAlt }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Tab Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 800,
                color: H.heading,
                marginBottom: 32,
              }}
            >
              Discover Products
            </h2>
            <div
              style={{
                display: "inline-flex",
                background: H.tabBarBg,
                borderRadius: 16,
                padding: 6,
                gap: 4,
              }}
            >
              {[
                { key: "featured", label: "⭐ Featured", icon: <StarFilled /> },
                {
                  key: "trending",
                  label: "🔥 Trending",
                  icon: <FireOutlined />,
                },
                {
                  key: "new",
                  label: "✨ New Arrivals",
                  icon: <ThunderboltOutlined />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "10px 28px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    background:
                      activeTab === tab.key ? H.emerald : "transparent",
                    color: activeTab === tab.key ? "#fff" : H.tabInactive,
                    fontWeight: 700,
                    fontSize: 15,
                    transition: "all 0.25s ease",
                    fontFamily: "inherit",
                    boxShadow:
                      activeTab === tab.key
                        ? "0 4px 16px rgba(16,185,129,0.3)"
                        : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {(loadingProducts ? mockProducts.slice(0, 8) : displayProducts).map(
              (product) => (
                <div
                  key={product.id}
                  style={{
                    background: H.cardBg,
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow:
                      hoveredCard === `prod-${product.id}`
                        ? "0 20px 48px rgba(0,0,0,0.12)"
                        : "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    transform:
                      hoveredCard === `prod-${product.id}`
                        ? "translateY(-6px)"
                        : "none",
                    cursor: "pointer",
                    border: `1px solid ${H.cardBorder}`,
                  }}
                  onMouseEnter={() => setHoveredCard(`prod-${product.id}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {/* Image */}
                  <div
                    style={{
                      height: 220,
                      background: H.imgTile,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={`/src/assets/${product.image}`}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "absolute",
                        inset: 0,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <span
                      style={{ fontSize: 64, position: "relative", zIndex: 1 }}
                    >
                      {product.placeholder}
                    </span>

                    {product.isOrganic && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          background: "#10B981",
                          color: "#fff",
                          borderRadius: 9999,
                          padding: "3px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          zIndex: 2,
                          boxShadow: "0 2px 8px rgba(16,185,129,0.35)",
                        }}
                      >
                        100% Organic
                      </div>
                    )}

                    <button
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: isDark
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.85)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: wishlist.includes(product.id)
                          ? "#ff4d6d"
                          : isDark
                            ? "#94A3B8"
                            : "#999",
                        fontSize: 16,
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(product.id);
                      }}
                    >
                      {wishlist.includes(product.id) ? (
                        <HeartFilled />
                      ) : (
                        <HeartOutlined />
                      )}
                    </button>

                    {/* Quick view overlay */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.7)",
                        padding: "10px",
                        display: "flex",
                        justifyContent: "center",
                        opacity: hoveredCard === `prod-${product.id}` ? 1 : 0,
                        transition: "opacity 0.25s",
                        zIndex: 2,
                      }}
                    >
                      <button
                        style={{
                          color: "#fff",
                          background: "transparent",
                          border: "1px solid rgba(255,255,255,0.4)",
                          borderRadius: 8,
                          padding: "5px 16px",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: "inherit",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${product.id}`);
                        }}
                      >
                        <EyeOutlined /> Quick View
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "18px 20px" }}>
                    <div
                      style={{
                        color: H.muted,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 6,
                      }}
                    >
                      {product.category}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: H.heading,
                        marginBottom: 8,
                        lineHeight: 1.4,
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 14,
                      }}
                    >
                      <Rate
                        disabled
                        defaultValue={Math.floor(product.rating)}
                        allowHalf
                        style={{ fontSize: 13 }}
                      />
                      <span style={{ color: H.muted, fontSize: 12 }}>
                        ({product.reviews})
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "1.15rem",
                          color: H.emerald,
                        }}
                      >
                        {formatCurrency(product.price)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        style={{
                          height: 36,
                          padding: "0 16px",
                          borderRadius: 12,
                          background: "#059669",
                          border: "none",
                          cursor: "pointer",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 13,
                          fontFamily: "inherit",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#10B981";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#059669";
                          e.currentTarget.style.transform = "none";
                        }}
                      >
                        <ShoppingCartOutlined /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button
              onClick={() => navigate("/products")}
              style={{
                height: 52,
                padding: "0 44px",
                borderRadius: 28,
                background: "linear-gradient(135deg, #10B981, #059669)",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                fontFamily: "inherit",
                transition: "all 0.25s",
                boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 32px rgba(16,185,129,0.45)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "none";
                e.target.style.boxShadow = "0 8px 24px rgba(16,185,129,0.35)";
              }}
            >
              Browse All Products <ArrowRightOutlined />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          AI FEATURES SECTION
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            {/* Left: Image collage */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                position: "relative",
              }}
            >
              <div
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  height: 260,
                  gridColumn: "span 2",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                }}
              >
                <img
                  src="/src/assets/about_ai_assistant.jpg"
                  alt="AI Technology"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  height: 200,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src="/src/assets/about_community.jpg"
                  alt="Farmers"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  height: 200,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src="/src/assets/about_ai_tech.jpg"
                  alt="Technology"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Floating badge */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: -20,
                  zIndex: 5,
                  background: "#2E7D32",
                  color: "#fff",
                  borderRadius: 16,
                  padding: "14px 20px",
                  boxShadow: "0 12px 32px rgba(46,125,50,0.4)",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 900 }}>AI</div>
                <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>
                  Powered
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <div
                style={{
                  color: "#2E7D32",
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                Bhoomi AI Platform
              </div>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                  fontWeight: 800,
                  color: "#111",
                  marginBottom: 20,
                  lineHeight: 1.2,
                }}
              >
                Intelligent Farming Starts with Smart Data
              </h2>
              <p
                style={{
                  color: "#666",
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  marginBottom: 40,
                }}
              >
                Enter your soil parameters and location. Our AI gives you
                precise crop recommendations, organic fertilizer plans, and
                links you directly to the marketplace — all in one seamless
                workflow.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  marginBottom: 40,
                }}
              >
                {[
                  {
                    icon: "🌍",
                    title: "Location-Based Weather",
                    desc: "Real-time weather data for any Indian state or district",
                  },
                  {
                    icon: "🧪",
                    title: "Soil Parameter Analysis",
                    desc: "N, P, K, pH inputs for accurate AI prediction",
                  },
                  {
                    icon: "🌾",
                    title: "AI Crop Recommendation",
                    desc: "ML model trained on thousands of Indian farm datasets",
                  },
                  {
                    icon: "🛒",
                    title: "Marketplace Integration",
                    desc: "Recommended products added to cart in one click",
                  },
                ].map((feat, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "#f0fdf4",
                        border: "1px solid #dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {feat.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#111",
                          fontSize: "1rem",
                          marginBottom: 4,
                        }}
                      >
                        {feat.title}
                      </div>
                      <div
                        style={{
                          color: "#888",
                          fontSize: "0.9rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {feat.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/soil-analysis")}
                style={{
                  height: 54,
                  padding: "0 40px",
                  borderRadius: 28,
                  background: "linear-gradient(135deg, #2E7D32, #4caf50)",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: "inherit",
                  boxShadow: "0 8px 24px rgba(46,125,50,0.4)",
                  transition: "all 0.25s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                }}
              >
                <RobotOutlined /> Try AI Soil Analysis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "72px 5%",
          background:
            "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)",
          borderTop: "1px solid #e8f5e9",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                target: 50000,
                suffix: "+",
                label: "Happy Farmers",
                icon: "👨‍🌾",
              },
              {
                target: 200,
                suffix: "+",
                label: "Products Listed",
                icon: "📦",
              },
              {
                target: 36,
                suffix: "",
                label: "Indian States Covered",
                icon: "🗺️",
              },
              {
                target: 1000000,
                suffix: "+",
                label: "AI Analyses Done",
                icon: "🤖",
              },
              {
                target: 99,
                suffix: "%",
                label: "Customer Satisfaction",
                icon: "⭐",
              },
            ].map((stat, i) => (
              <StatCounter key={i} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY CHOOSE BHOOMI BLOOM
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 800,
                color: "#111",
                marginBottom: 12,
              }}
            >
              Why Farmers Trust Bhoomi Bloom
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "1.05rem",
                maxWidth: 540,
                margin: "0 auto",
              }}
            >
              Built specifically for Indian agriculture — combining technology,
              quality, and community.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 28,
            }}
          >
            {[
              {
                icon: <RocketOutlined style={{ fontSize: 32 }} />,
                title: "Express Delivery",
                desc: "Farm-to-door delivery across India. Track your orders in real-time.",
                color: "#dbeafe",
                iconColor: "#2563eb",
              },
              {
                icon: <SafetyCertificateOutlined style={{ fontSize: 32 }} />,
                title: "Quality Certified",
                desc: "All products undergo rigorous quality testing before listing on our platform.",
                color: "#dcfce7",
                iconColor: "#16a34a",
              },
              {
                icon: <RobotOutlined style={{ fontSize: 32 }} />,
                title: "AI-Powered Guidance",
                desc: "ML-based crop recommendation and soil analysis powered by real agricultural data.",
                color: "#fdf4ff",
                iconColor: "#7c3aed",
              },
              {
                icon: <CustomerServiceOutlined style={{ fontSize: 32 }} />,
                title: "24/7 Support",
                desc: "Our agri-experts are available round the clock to assist you with any queries.",
                color: "#fff7ed",
                iconColor: "#ea580c",
              },
              {
                icon: <GiftOutlined style={{ fontSize: 32 }} />,
                title: "Rewards & Offers",
                desc: "Earn coupons, spin to win, and enjoy exclusive deals every day.",
                color: "#fef3c7",
                iconColor: "#d97706",
              },
              {
                icon: <TeamOutlined style={{ fontSize: 32 }} />,
                title: "Farmer Community",
                desc: "Connect with 50,000+ farmers, share experiences, and learn from each other.",
                color: "#f0fdf4",
                iconColor: "#15803d",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: item.color,
                  borderRadius: 24,
                  padding: "32px 28px",
                  transition: "all 0.3s ease",
                  transform:
                    hoveredCard === `why-${i}` ? "translateY(-6px)" : "none",
                  boxShadow:
                    hoveredCard === `why-${i}`
                      ? "0 20px 40px rgba(0,0,0,0.1)"
                      : "0 2px 12px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
                onMouseEnter={() => setHoveredCard(`why-${i}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: "#fff",
                    color: item.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "#111",
                    marginBottom: 12,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 5%", background: "#fafafa" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 800,
                color: "#111",
                marginBottom: 12,
              }}
            >
              Trusted by Thousands of Farmers
            </h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
              {[...Array(5)].map((_, i) => (
                <StarFilled
                  key={i}
                  style={{ color: "#C9A227", fontSize: 20 }}
                />
              ))}
              <span
                style={{
                  marginLeft: 10,
                  color: "#666",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                4.9 / 5 from 12,000+ reviews
              </span>
            </div>
          </div>

          {/* Testimonial Carousel */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                background: "#fff",
                borderRadius: 28,
                padding: "48px 60px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
                textAlign: "center",
                position: "relative",
                border: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  fontSize: "5rem",
                  lineHeight: 1,
                  color: "#2E7D32",
                  opacity: 0.1,
                  position: "absolute",
                  top: 20,
                  left: 40,
                  fontFamily: "Georgia",
                }}
              >
                "
              </div>
              <div
                style={{
                  fontSize: "1.15rem",
                  color: "#444",
                  lineHeight: 1.9,
                  fontStyle: "italic",
                  marginBottom: 36,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                "{testimonials[testimonialIdx].text}"
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2E7D32, #4caf50)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 20,
                  }}
                >
                  {testimonials[testimonialIdx].name[0]}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 800, color: "#111" }}>
                    {testimonials[testimonialIdx].name}
                  </div>
                  <div style={{ color: "#888", fontSize: 13 }}>
                    {testimonials[testimonialIdx].role} ·{" "}
                    {testimonials[testimonialIdx].location}
                  </div>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginTop: 24,
              }}
            >
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  style={{
                    width: i === testimonialIdx ? 28 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: "none",
                    cursor: "pointer",
                    background: i === testimonialIdx ? "#2E7D32" : "#ddd",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          NEWSLETTER BANNER
      ═══════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px 5%",
          background:
            "linear-gradient(135deg, #0a1a0d 0%, #1a3a1e 40%, #0f2812 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(46,125,50,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 20 }}>🌱</div>
          <h2
            style={{
              color: "#fff",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            Join the Agriculture Revolution
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.05rem",
              marginBottom: 40,
              lineHeight: 1.7,
            }}
          >
            Subscribe for seasonal AI insights, exclusive product deals, and
            expert farming tips delivered to your inbox.
          </p>
          {subscribed ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "#2E7D32",
                color: "#fff",
                borderRadius: 16,
                padding: "16px 32px",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <CheckCircleFilled /> Thank you for subscribing! 🎉
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 12,
                maxWidth: 520,
                margin: "0 auto",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  flex: 1,
                  minWidth: 260,
                  height: 54,
                  padding: "0 24px",
                  borderRadius: 28,
                  border: "2px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "inherit",
                  backdropFilter: "blur(8px)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#C9A227")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.2)")
                }
              />
              <button
                onClick={() => {
                  if (email) {
                    setSubscribed(true);
                    message.success("Successfully subscribed!");
                  }
                }}
                style={{
                  height: 54,
                  padding: "0 32px",
                  borderRadius: 28,
                  background: "#C9A227",
                  border: "none",
                  cursor: "pointer",
                  color: "#1a1a1a",
                  fontWeight: 800,
                  fontSize: 15,
                  fontFamily: "inherit",
                  transition: "all 0.25s",
                  boxShadow: "0 8px 24px rgba(201,162,39,0.4)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#e6c96a";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#C9A227";
                  e.target.style.transform = "none";
                }}
              >
                Subscribe
              </button>
            </div>
          )}
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              marginTop: 16,
            }}
          >
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// ─── TESTIMONIALS DATA ─────────────────────────────────────
const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Organic Farmer",
    location: "Punjab",
    text: "Before Bhoomi Bloom, I struggled with pest identification and yield prediction. With their AI Assistant and premium organic fertilizers, my farm's output increased by 40% in just one season. It truly is the future of farming.",
  },
  {
    name: "Amit Singh",
    role: "Commercial Grower",
    location: "Maharashtra",
    text: "The drip irrigation kit from Bhoomi Bloom saved me 30% on water usage. The soil analysis AI recommended the perfect fertilizer combination. Exceptional quality products and brilliant AI guidance.",
  },
  {
    name: "Priya Patel",
    role: "Horticulturist",
    location: "Gujarat",
    text: "Their tomato seeds have a 100% germination rate and are highly disease resistant. The Spin & Win feature gave me a 15% coupon on my first order. I will always shop here!",
  },
  {
    name: "Suresh Reddy",
    role: "Farm Owner",
    location: "Telangana",
    text: "The AI crop recommendation was spot-on for my soil conditions. I grew paddy for the first time based on the AI suggestion and had a record harvest. Bhoomi Bloom is a game-changer.",
  },
  {
    name: "Kavitha Nair",
    role: "Greenhouse Farmer",
    location: "Kerala",
    text: "Fast delivery, genuine products, and the AI analysis is incredibly accurate. The entire platform is designed with farmers in mind. Highly recommend to every farmer in India.",
  },
];

export default Home;
