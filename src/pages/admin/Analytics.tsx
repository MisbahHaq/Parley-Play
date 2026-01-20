import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  PieChart,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from 'recharts';
import AdminLayout from '@/components/layouts/AdminLayout';

const COLORS = ['hsl(168, 84%, 50%)', 'hsl(142, 76%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

export const Analytics = () => {
  const { bets, transactions, users, matches } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const totalBets = bets.length;
  const pendingBets = bets.filter((b) => b.status === 'Pending').length;
  const settledBets = bets.filter((b) => b.status !== 'Pending').length;
  const wonBets = bets.filter((b) => b.status === 'Won').length;
  const lostBets = bets.filter((b) => b.status === 'Lost').length;

  const totalStaked = bets.reduce((acc, b) => acc + b.stake, 0);
  const totalPaidOut = bets
    .filter((b) => b.status === 'Won')
    .reduce((acc, b) => acc + b.potentialPayout, 0);
  const netRevenue = totalStaked - totalPaidOut;

  // Chart data
  const betStatusData = [
    { name: 'Pending', value: pendingBets, color: 'hsl(38, 92%, 50%)' },
    { name: 'Won', value: wonBets, color: 'hsl(142, 76%, 45%)' },
    { name: 'Lost', value: lostBets, color: 'hsl(0, 72%, 51%)' },
  ];

  const revenueData = [
    { day: 'Mon', revenue: Math.random() * 500 + 100, bets: Math.floor(Math.random() * 20) + 5 },
    { day: 'Tue', revenue: Math.random() * 500 + 100, bets: Math.floor(Math.random() * 20) + 5 },
    { day: 'Wed', revenue: Math.random() * 500 + 100, bets: Math.floor(Math.random() * 20) + 5 },
    { day: 'Thu', revenue: Math.random() * 500 + 100, bets: Math.floor(Math.random() * 20) + 5 },
    { day: 'Fri', revenue: Math.random() * 500 + 100, bets: Math.floor(Math.random() * 20) + 5 },
    { day: 'Sat', revenue: Math.random() * 500 + 100, bets: Math.floor(Math.random() * 20) + 5 },
    { day: 'Sun', revenue: Math.random() * 500 + 100, bets: Math.floor(Math.random() * 20) + 5 },
  ];

  const sportData = [
    { sport: 'NFL', bets: bets.filter((b) => b.legs.some((l) => matches.find((m) => m.id === l.matchId)?.sport === 'NFL')).length },
    { sport: 'NBA', bets: bets.filter((b) => b.legs.some((l) => matches.find((m) => m.id === l.matchId)?.sport === 'NBA')).length },
    { sport: 'EPL', bets: bets.filter((b) => b.legs.some((l) => matches.find((m) => m.id === l.matchId)?.sport === 'EPL')).length },
  ];

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${netRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: netRevenue > 0 ? 'up' : 'down',
      trendValue: `${netRevenue > 0 ? '+' : ''}${((netRevenue / Math.max(totalStaked, 1)) * 100).toFixed(1)}%`,
    },
    {
      title: 'Total Bets',
      value: totalBets,
      icon: BarChart3,
      trend: 'up',
      trendValue: '+12%',
    },
    {
      title: 'Active Users',
      value: users.filter((u) => u.status === 'Active').length,
      icon: Users,
      trend: 'up',
      trendValue: '+3',
    },
    {
      title: 'Win Rate',
      value: `${settledBets > 0 ? ((wonBets / settledBets) * 100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      trend: wonBets > lostBets ? 'down' : 'up',
      trendValue: 'House edge',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground">Platform performance overview</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
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
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="glass">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                          <div className={`flex items-center gap-1 text-xs mt-1 ${
                            stat.trend === 'up' ? 'text-success' : 'text-destructive'
                          }`}>
                            {stat.trend === 'up' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {stat.trendValue}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(168, 84%, 50%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(168, 84%, 50%)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bet Status Distribution */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-sm">Bet Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {totalBets > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={betStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {betStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No bets data</p>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {betStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bets by Sport */}
          <Card className="glass lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Bets by Sport</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="sport" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="bets" fill="hsl(168, 84%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
