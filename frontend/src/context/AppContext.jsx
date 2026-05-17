import { useMemo } from 'react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import { AppContext } from './appContextCore';

export function AppProvider({ children }) {
  const { user } = useAuthStore();
  const { cart } = useCartStore();

  const value = useMemo(() => {
    const dashboardPath = !user
      ? '/login'
      : user.role === 'admin'
        ? '/admin'
        : user.role === 'store'
          ? '/store'
          : '/dashboard';

    return {
      cartCount: cart.item_count || 0,
      dashboardPath,
      roleLabel: user?.role ? user.role.replace('_', ' ') : 'guest',
      user,
    };
  }, [cart.item_count, user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
