import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Sprout,
  Sparkles,
  Search,
  MapPin,
  Sun,
  Moon,
  Bell,
  ShoppingCart,
  Heart,
  Menu,
  ChevronDown,
  LogOut,
  Package,
  Store,
  ShieldCheck,
  Crown,
  CheckCircle2,
  HeadphonesIcon,
  Leaf,
  Gift,
} from "lucide-react";
import { AuthContext } from "../../App";
import { apiService } from "../../services/apiService";
import bhoomiBloomLogo from "../../assets/bhoomi_bloom_logo.jpg";
import bhoomiBloomLogoTransparent from "../../assets/bhoomi_bloom_logo_transparent.png";
import SpinAndWin from "../SpinAndWin";
import DeliveryLocationModal from "../DeliveryLocationModal";
import MobileDrawer from "./MobileDrawer";

/* ─── Design-system tokens (single source of truth) ─── */

const NAV_LINK_BASE =
  "inline-flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-lg border";

const navLinkClass = (active) =>
  [
    NAV_LINK_BASE,
    active
      ? "text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-800/40"
      : "text-slate-600 dark:text-slate-300 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-900/60",
  ].join(" ");

const ICON_BUTTON =
  "relative w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-300";

const LOCATION_PILL =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-300 hover:border-emerald-500 transition-all cursor-pointer";

const CTA_BUTTON =
  "px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all active:scale-95";

const MICRO_LINK =
  "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-emerald-100/70 dark:text-slate-400 hover:text-white dark:hover:text-emerald-400 hover:bg-white/10 dark:hover:bg-slate-800/60 transition-colors";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/crop-recommendation", label: "Crop AI", icon: Sprout },
  { to: "/bhoomi-card", label: "Bhoomi Card", icon: Sparkles },
  { to: "/seeds", label: "Seeds" },
  { to: "/machinery", label: "Machinery" },
  { to: "/irrigation", label: "Irrigation" },
  { to: "/tools", label: "Tools" },
  { to: "/fertilizers", label: "Fertilizers" },
];

/* ─── Small building blocks ─── */

const BrandMark = ({ isDarkMode }) => (
  <Link to="/" className="flex items-center gap-2.5 shrink-0">
    <img
      src={isDarkMode ? bhoomiBloomLogoTransparent : bhoomiBloomLogo}
      alt="Bhoomi Bloom Logo"
      className="h-9 w-9 rounded-full object-cover ring-1 ring-emerald-600/20 dark:ring-emerald-400/20"
    />
    <span className="font-bold tracking-tight text-emerald-950 dark:text-emerald-50 text-xl">
      Bhoomi Bloom
    </span>
  </Link>
);

const MicroUtilityBar = ({ user, navigate }) => (
  <div className="hidden lg:block bg-emerald-950 dark:bg-slate-900/80 border-b border-emerald-900/60 dark:border-slate-800/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-200/70 dark:text-slate-400">
        <Leaf size={12} className="text-emerald-400" />
        AI-powered farming guidance for every Indian farm
      </span>
      <div className="flex items-center gap-0.5">
        {user?.role === "seller" && (
          <button
            type="button"
            className={MICRO_LINK}
            onClick={() => navigate("/seller/dashboard")}
          >
            <Store size={12} /> Seller Workspace
          </button>
        )}
        {user?.role === "admin" && (
          <button
            type="button"
            className={MICRO_LINK}
            onClick={() => navigate("/admin/dashboard")}
          >
            <ShieldCheck size={12} /> Admin Control Center
          </button>
        )}
        <button
          type="button"
          className={MICRO_LINK}
          onClick={() => navigate("/orders")}
        >
          <Package size={12} /> Track Order
        </button>
        <button type="button" className={MICRO_LINK}>
          <HeadphonesIcon size={12} /> Support
        </button>
      </div>
    </div>
  </div>
);

const DesktopNav = ({ location }) => {
  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav
      aria-label="Primary"
      className="hidden lg:flex items-center gap-0.5 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/50 px-1.5 py-1"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className={navLinkClass(isActive(to))}>
          {Icon && <Icon size={16} />}
          {label}
        </Link>
      ))}
    </nav>
  );
};

const NavBadge = ({ count }) =>
  count > 0 ? (
    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

const NotificationPanel = ({ notifications, unreadCount, onMarkAsRead }) => (
  <div className="w-[340px] max-h-[400px] overflow-y-auto p-1.5">
    <div className="flex items-center justify-between px-2.5 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Notifications
      </span>
      <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
        {unreadCount} New
      </span>
    </div>
    {notifications.length === 0 ? (
      <p className="px-2.5 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        No new notifications
      </p>
    ) : (
      notifications.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onMarkAsRead(item.id)}
          className={`w-full text-left flex gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
            item.is_read
              ? "hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
              : "bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40"
          }`}
        >
          <CheckCircle2
            size={16}
            className={`mt-0.5 shrink-0 ${item.is_read ? "text-slate-400" : "text-emerald-600 dark:text-emerald-400"}`}
          />
          <span className="min-w-0">
            <span
              className={`block text-[13px] truncate ${item.is_read ? "font-medium text-slate-700 dark:text-slate-300" : "font-semibold text-slate-900 dark:text-slate-100"}`}
            >
              {item.title}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
              {item.message}
            </span>
          </span>
        </button>
      ))
    )}
  </div>
);

const UserMenuPanel = ({ user, items }) => (
  <div className="w-64 p-1.5">
    <div className="px-2.5 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
        {user?.name || "My Account"}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
        {user?.email}
      </p>
    </div>
    {items.map((item) => (
      <button
        key={item.key}
        type="button"
        onClick={item.onClick}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
          item.danger
            ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
        }`}
      >
        <item.icon
          size={16}
          className={
            item.danger ? "" : "text-emerald-600 dark:text-emerald-400"
          }
        />
        {item.label}
      </button>
    ))}
  </div>
);

/* ─── Header ─── */

const Header = ({ isDarkMode, setIsDarkMode }) => {
  const { isAuthenticated, user, logout, requireAuth, wishlistIds } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [savedLocation, setSavedLocation] = useState(() => {
    try {
      const loc = localStorage.getItem("bhoomi_delivery_location");
      return loc ? JSON.parse(loc) : null;
    } catch {
      return null;
    }
  });

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const wishlistCount = Array.isArray(wishlistIds) ? wishlistIds.length : 0;

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    Promise.all([
      apiService.getNotifications().catch(() => []),
      apiService.getCart().catch(() => ({ items: [] })),
    ])
      .then(([notifsData, cartData]) => {
        if (cancelled) return;
        setNotifications(Array.isArray(notifsData) ? notifsData : []);
        setCartCount(cartData?.items?.length || 0);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, location.pathname]);

  // When logged out, badge counts derive to zero so stale counts never linger.
  const activeNotifications = isAuthenticated ? notifications : [];
  const activeCartCount = isAuthenticated ? cartCount : 0;
  const unreadNotifCount = activeNotifications.filter((n) => !n.is_read).length;

  // Close floating panels on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target))
        setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSaved = (locData) => setSavedLocation(locData);

  const handleMarkAsRead = async (notifId) => {
    try {
      await apiService.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
      );
    } catch {
      /* silent */
    }
  };

  const userMenuItems = [
    {
      key: "myOrders",
      icon: Package,
      label: "My Orders & Live Tracking",
      onClick: () => {
        setUserMenuOpen(false);
        navigate("/orders");
      },
    },
    {
      key: "bhoomiCard",
      icon: Crown,
      label: "Bhoomi Card VIP",
      onClick: () => {
        setUserMenuOpen(false);
        navigate("/bhoomi-card");
      },
    },
    ...(user?.role === "seller"
      ? [
          {
            key: "seller",
            icon: Store,
            label: "Seller Workspace",
            onClick: () => {
              setUserMenuOpen(false);
              navigate("/seller/dashboard");
            },
          },
        ]
      : []),
    ...(user?.role === "admin"
      ? [
          {
            key: "admin",
            icon: ShieldCheck,
            label: "Admin Control Center",
            onClick: () => {
              setUserMenuOpen(false);
              navigate("/admin/dashboard");
            },
          },
        ]
      : []),
    {
      key: "cart",
      icon: ShoppingCart,
      label: "My Cart",
      onClick: () => {
        setUserMenuOpen(false);
        requireAuth(() => navigate("/cart"));
      },
    },
    {
      key: "wishlist",
      icon: Heart,
      label: "My Wishlist",
      onClick: () => {
        setUserMenuOpen(false);
        requireAuth(() => navigate("/wishlist"));
      },
    },
    {
      key: "logout",
      icon: LogOut,
      label: "Logout",
      danger: true,
      onClick: () => {
        setUserMenuOpen(false);
        logout();
      },
    },
  ];

  const panelShell =
    "absolute right-0 top-[calc(100%+8px)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.14)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] animate-menu-in origin-top-right overflow-hidden";

  return (
    <>
      <div className="sticky top-0 z-50 transition-all duration-300">
        <MicroUtilityBar user={user} navigate={navigate} />

        <header className="bg-white/85 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            {/* 1 — LEFT: brand */}
            <BrandMark isDarkMode={isDarkMode} />

            {/* 2 — CENTER: primary navigation */}
            <DesktopNav location={location} />

            {/* 3 — RIGHT: utilities & actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                aria-label="Search products"
                className={ICON_BUTTON}
                onClick={() => navigate("/products")}
              >
                <Search size={17} />
              </button>

              {/* Location selector pill */}
              <button
                type="button"
                className={`${LOCATION_PILL} hidden lg:inline-flex max-w-[168px]`}
                onClick={() => setLocationModalOpen(true)}
                title="Set your delivery location"
              >
                <MapPin
                  size={13}
                  className="shrink-0 text-emerald-600 dark:text-emerald-400"
                />
                <span className="truncate">
                  {savedLocation
                    ? savedLocation.area || savedLocation.city || "Location set"
                    : "Deliver to…"}
                </span>
              </button>

              {/* Theme toggle */}
              <button
                type="button"
                aria-label="Toggle theme"
                className={ICON_BUTTON}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  aria-label="Notifications"
                  className={ICON_BUTTON}
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setUserMenuOpen(false);
                  }}
                >
                  <Bell size={17} />
                  <NavBadge count={unreadNotifCount} />
                </button>
                {notifOpen && (
                  <div
                    className={`${panelShell} left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0`}
                  >
                    <NotificationPanel
                      notifications={activeNotifications}
                      unreadCount={unreadNotifCount}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button
                type="button"
                aria-label="Wishlist"
                className={`${ICON_BUTTON} hidden xl:inline-flex`}
                onClick={() => requireAuth(() => navigate("/wishlist"))}
              >
                <Heart size={17} />
                <NavBadge count={wishlistCount} />
              </button>

              {/* Cart */}
              <button
                type="button"
                aria-label="Cart"
                className={ICON_BUTTON}
                onClick={() => requireAuth(() => navigate("/cart"))}
              >
                <ShoppingCart size={17} />
                <NavBadge count={activeCartCount} />
              </button>

              {/* Spin & Win — luxury micro-chip */}
              <span className="hidden sm:inline-flex">
                <SpinAndWin variant="chip" />
              </span>

              {/* Primary action */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    className={`${CTA_BUTTON} inline-flex items-center gap-1.5`}
                    onClick={() => {
                      setUserMenuOpen((v) => !v);
                      setNotifOpen(false);
                    }}
                  >
                    {user?.name ? user.name.split(" ")[0] : "Profile"}
                    <ChevronDown
                      size={15}
                      className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {userMenuOpen && (
                    <div className={panelShell}>
                      <UserMenuPanel user={user} items={userMenuItems} />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className={`${CTA_BUTTON} hidden sm:inline-flex items-center gap-1.5`}
                  onClick={() => navigate("/login")}
                >
                  <Gift size={15} className="hidden lg:inline" />
                  Login
                </button>
              )}

              {/* Mobile drawer toggle */}
              <button
                type="button"
                aria-label="Open menu"
                className={`${ICON_BUTTON} lg:hidden`}
                onClick={() => setDrawerOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </header>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={NAV_ITEMS}
        location={location}
        user={user}
        isAuthenticated={isAuthenticated}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        savedLocation={savedLocation}
        onOpenLocationModal={() => {
          setDrawerOpen(false);
          setLocationModalOpen(true);
        }}
        onNavigate={(to) => {
          setDrawerOpen(false);
          requireAuth(() => navigate(to));
        }}
        onLogout={() => {
          setDrawerOpen(false);
          logout();
        }}
      />

      <DeliveryLocationModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationSaved={handleLocationSaved}
      />
    </>
  );
};

export default Header;
