import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, Zap, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Match, Sport } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import UserLayout from '@/components/layouts/UserLayout';

const sportFilters: (Sport | 'All' | 'Live' | 'Upcoming')[] = ['All', 'NFL', 'NBA', 'EPL', 'Live', 'Upcoming'];

const sportEmojis: Record<Sport, string> = {
  NFL: '🏈',
  NBA: '🏀',
  EPL: '⚽',
};

export const Home = () => {
  const { matches, addToSlip, slip } = useStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Sport | 'All' | 'Live' | 'Upcoming'>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredMatches = matches.filter((match) => {
    if (filter === 'All') return true;
    if (filter === 'Live') return match.status === 'Live';
    if (filter === 'Upcoming') return match.status === 'Upcoming';
    return match.sport === filter;
  });

  const handleAddToSlip = (match: Match, marketType: string, optionLabel: string, odds: number) => {
    const existingSelection = slip.find(
      (s) => s.matchId === match.id && s.marketType === marketType && s.selectionLabel === optionLabel
    );

    if (existingSelection) {
      toast({
        title: 'Already in slip',
        description: 'This selection is already in your bet slip.',
      });
      return;
    }

    addToSlip({
      matchId: match.id,
      matchLabel: `${match.awayTeam} @ ${match.homeTeam}`,
      marketType,
      selectionLabel: optionLabel,
      oddsDecimal: odds,
    });

    toast({
      title: 'Added to slip! 🎯',
      description: `${optionLabel} @ ${odds.toFixed(2)}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'Upcoming':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <UserLayout>
      <div className="space-y-4">
        {/* Sport Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {sportFilters.map((sport) => (
            <Button
              key={sport}
              variant={filter === sport ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setFilter(sport)}
              className={`shrink-0 ${
                filter === sport
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              {sport === 'Live' && <Zap className="w-3 h-3 mr-1" />}
              {sport}
            </Button>
          ))}
        </div>

        {/* Matches List */}
        {isLoading ? (
          <SkeletonLoader variant="card" count={4} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredMatches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground">No matches found</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="glass rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sportEmojis[match.sport]}</span>
                          <span className="text-xs text-muted-foreground">{match.league}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(match.status)}`}
                        >
                          {match.status === 'Live' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5 animate-pulse" />
                          )}
                          {match.status}
                        </Badge>
                      </div>

                      {/* Teams */}
                      <Link
                        to={match.status === 'Live' ? `/user/live/${match.id}` : `/user/match/${match.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">{match.awayTeam}</p>
                            <p className="text-xs text-muted-foreground">Away</p>
                          </div>

                          {match.status === 'Live' || match.status === 'Final' ? (
                            <div className="text-center">
                              <div className="flex items-center gap-3 text-2xl font-display font-bold">
                                <span>{match.awayScore}</span>
                                <span className="text-muted-foreground">-</span>
                                <span>{match.homeScore}</span>
                              </div>
                              {match.status === 'Live' && (
                                <span className="text-xs text-destructive animate-pulse">LIVE</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <Calendar className="w-4 h-4 mx-auto mb-1" />
                              <p className="text-xs">{format(new Date(match.startTime), 'MMM d')}</p>
                              <p className="text-xs">{format(new Date(match.startTime), 'h:mm a')}</p>
                            </div>
                          )}

                          <div className="space-y-1 text-right">
                            <p className="font-semibold text-sm">{match.homeTeam}</p>
                            <p className="text-xs text-muted-foreground">Home</p>
                          </div>
                        </div>
                      </Link>

                      {/* Quick Markets */}
                      {match.status !== 'Final' && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                          {match.markets[0]?.options.slice(0, 3).map((option, idx) => (
                            <Button
                              key={idx}
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAddToSlip(match, match.markets[0].type, option.label, option.odds)}
                              className="flex-1 min-w-0 bg-muted/50 hover:bg-primary/20 hover:text-primary hover:border-primary/30 border border-transparent transition-all text-xs"
                            >
                              <span className="truncate">{option.label}</span>
                              <span className="ml-1 font-bold text-accent">{option.odds.toFixed(2)}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* View Details Link */}
                      <Link
                        to={match.status === 'Live' ? `/user/live/${match.id}` : `/user/match/${match.id}`}
                        className="flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-1"
                      >
                        {match.status === 'Live' ? 'Watch Live' : 'All Markets'}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </UserLayout>
  );
};

export default Home;
