import { Link } from 'react-router-dom';
import { X, MapPin, Heart, ShoppingCart, Package, LogOut, Store, ShieldCheck, ChevronRight, Leaf } from 'lucide-react';
import SpinAndWin from '../SpinAndWin';

const CountDot = ({ count }) =>
  count > 0 ? (
    <span className="ml-auto min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  ) : (
    <ChevronRight size={15} className="ml-auto text-slate-400" />
  );

const MobileDrawer = ({
  open,
  onClose,
  navItems,
  location,
  user,
  isAuthenticated,
  cartCount,
  wishlistCount,
  savedLocation,
  onOpenLocationModal,
  onNavigate,
  onLogout,
}) => {
  if (!open) return null;

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const rowBase =
    'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors border';

  const navRow = (active) =>
    [
      rowBase,
      active
        ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-800/40'
        : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-900/60',
    ].join(' ');

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-[0_24px_64px_rgba(15,23,42,0.28)] flex flex-col animate-drawer-in"
      >
        {/* Sheet header */}
        <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </span>
            <span className="font-bold tracking-tight text-emerald-950 dark:text-emerald-50 text-lg">
              Bhoomi Bloom
            </span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sheet body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          {/* Location */}
          <button type="button" onClick={onOpenLocationModal} className={navRow(false)}>
            <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">
              {savedLocation ? savedLocation.area || savedLocation.city || 'Location set' : 'Deliver to…'}
            </span>
            <span className="ml-auto text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Change</span>
          </button>

          <p className="px-1.5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            Navigate
          </p>

          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={navRow(isActive(to))} onClick={onClose}>
              {Icon ? <Icon size={16} /> : <span className="w-4" />}
              {label}
            </Link>
          ))}

          {user?.role === 'seller' && (
            <Link to="/seller/dashboard" className={navRow(isActive('/seller/dashboard'))} onClick={onClose}>
              <Store size={16} />
              Seller Workspace
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className={navRow(isActive('/admin/dashboard'))} onClick={onClose}>
              <ShieldCheck size={16} />
              Admin Control Center
            </Link>
          )}

          <p className="px-1.5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            My Farm
          </p>

          <button type="button" className={navRow(false)} onClick={() => onNavigate('/wishlist')}>
            <Heart size={16} />
            Wishlist
            <CountDot count={wishlistCount} />
          </button>
          <button type="button" className={navRow(false)} onClick={() => onNavigate('/cart')}>
            <ShoppingCart size={16} />
            Cart
            <CountDot count={cartCount} />
          </button>
          <button type="button" className={navRow(false)} onClick={() => onNavigate('/orders')}>
            <Package size={16} />
            My Orders
            <ChevronRight size={15} className="ml-auto text-slate-400" />
          </button>
        </div>

        {/* Sheet footer */}
        <div className="shrink-0 px-4 py-4 border-t border-slate-200/70 dark:border-slate-800/70 space-y-3">
          <div className="[&>button]:w-full [&>button]:justify-center">
            <SpinAndWin variant="chip" />
          </div>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2.5 px-1">
                <span className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {(user?.name || 'F').charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name || 'My Account'}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all active:scale-95"
            >
              Login / Register
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
};

export default MobileDrawer;
