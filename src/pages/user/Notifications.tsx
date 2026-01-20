import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Bell,
  Receipt,
  Trophy,
  Gift,
  CheckCheck,
  Filter,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import UserLayout from '@/components/layouts/UserLayout';

type NotificationFilter = 'All' | 'Bets' | 'Results' | 'Promo';

const typeIcons: Record<string, any> = {
  BetPlaced: Receipt,
  BetSettled: Trophy,
  MatchResult: Trophy,
  Promo: Gift,
};

const typeColors: Record<string, string> = {
  BetPlaced: 'text-primary',
  BetSettled: 'text-success',
  MatchResult: 'text-warning',
  Promo: 'text-info',
};

export const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, session } = useStore();
  const [filter, setFilter] = useState<NotificationFilter>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const userNotifications = notifications.filter((n) => n.userId === session?.userId);
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const filteredNotifications = userNotifications.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Bets') return n.type === 'BetPlaced';
    if (filter === 'Results') return n.type === 'BetSettled' || n.type === 'MatchResult';
    if (filter === 'Promo') return n.type === 'Promo';
    return true;
  });

  return (
    <UserLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(['All', 'Bets', 'Results', 'Promo'] as NotificationFilter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'gradient-primary text-primary-foreground' : ''}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <SkeletonLoader variant="list" count={5} />
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No notifications</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification, idx) => {
              const Icon = typeIcons[notification.type] || Bell;
              const colorClass = typeColors[notification.type] || 'text-foreground';

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => markAsRead(notification.id)}
                  className={`glass rounded-lg p-4 cursor-pointer transition-all ${
                    notification.read
                      ? 'opacity-60'
                      : 'border-l-2 border-l-primary hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0 ${colorClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Notifications;
