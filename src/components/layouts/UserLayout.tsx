import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Receipt, Wallet, Bell, Settings, LogOut, Skull } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { path: '/user/home', icon: Home, label: 'Home' },
  { path: '/user/slip', icon: Receipt, label: 'Slip' },
  { path: '/user/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/user/notifications', icon: Bell, label: 'Alerts' },
  { path: '/user/settings', icon: Settings, label: 'Settings' },
];

interface UserLayoutProps {
  children: ReactNode;
}

export const UserLayout = ({ children }: UserLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout, users, notifications, slip } = useStore();

  useEffect(() => {
    if (!session || session.role !== 'user') {
      navigate('/login');
    }
  }, [session, navigate]);

  if (!session || session.role !== 'user') return null;

  const user = users.find((u) => u.id === session.userId);
  const unreadCount = notifications.filter((n) => n.userId === session.userId && !n.read).length;
  const slipCount = slip.length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/user/home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Skull className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg gradient-text hidden sm:inline">
              Pirate Parlays
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/user/wallet">
              <Badge variant="secondary" className="text-sm font-semibold px-3 py-1.5 bg-accent/10 text-accent border border-accent/30">
                ${user?.balance.toFixed(2) || '0.00'}
              </Badge>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {session.username[0].toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong">
                <DropdownMenuItem className="text-muted-foreground">
                  <Badge variant="outline" className="mr-2">User</Badge>
                  {session.username}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-4">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/user/home' && location.pathname.startsWith('/user/match'));
            const Icon = item.icon;
            const showBadge = item.path === '/user/notifications' && unreadCount > 0;
            const showSlipBadge = item.path === '/user/slip' && slipCount > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {showSlipBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[10px] flex items-center justify-center text-accent-foreground">
                      {slipCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default UserLayout;
