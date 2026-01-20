import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  HeadphonesIcon,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import AdminLayout from '@/components/layouts/AdminLayout';

export const Dashboard = () => {
  const { users, bets, transactions, tickets, matches } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const activeBets = bets.filter((b) => b.status === 'Pending').length;
  const totalRevenue = transactions
    .filter((t) => t.type === 'BetPlaced')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const pendingRequests = transactions.filter(
    (t) => t.type === 'WithdrawalRequest' && t.status === 'Pending'
  ).length;
  const openTickets = tickets.filter((t) => t.status === 'Open').length;
  const liveMatches = matches.filter((m) => m.status === 'Live').length;

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Bets',
      value: activeBets,
      icon: Activity,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Revenue (Demo)',
      value: `$${totalRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: CreditCard,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  const quickLinks = [
    { title: 'User Management', description: 'View and manage users', icon: Users, path: '/admin/users' },
    { title: 'Matches & Odds', description: 'Manage matches and markets', icon: Calendar, path: '/admin/matches' },
    { title: 'Transactions', description: 'View transaction requests', icon: CreditCard, path: '/admin/transactions' },
    { title: 'Analytics', description: 'View reports and charts', icon: BarChart3, path: '/admin/analytics' },
    { title: 'Support Portal', description: `${openTickets} open tickets`, icon: HeadphonesIcon, path: '/admin/support' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-4">
                <SkeletonLoader variant="text" count={2} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="glass hover:border-primary/30 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Live Status */}
        {liveMatches > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="glass border-warning/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                  <span className="font-semibold">{liveMatches} Live Match{liveMatches > 1 ? 'es' : ''}</span>
                  <span className="text-muted-foreground">currently in progress</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-display font-bold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  <Link to={link.path}>
                    <Card className="glass hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group">
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{link.title}</p>
                            <p className="text-xs text-muted-foreground">{link.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-display font-bold mb-4">Recent Bets</h2>
          <Card className="glass">
            <CardContent className="py-4">
              {bets.slice(0, 5).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No bets yet</p>
              ) : (
                <div className="space-y-3">
                  {bets.slice(0, 5).map((bet) => (
                    <div
                      key={bet.betId}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-mono">{bet.referenceId}</p>
                        <p className="text-xs text-muted-foreground">
                          {bet.type} • {bet.legs.length} leg{bet.legs.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${bet.stake.toFixed(2)}</p>
                        <span
                          className={`text-xs ${
                            bet.status === 'Pending'
                              ? 'text-warning'
                              : bet.status === 'Won'
                              ? 'text-success'
                              : 'text-destructive'
                          }`}
                        >
                          {bet.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
