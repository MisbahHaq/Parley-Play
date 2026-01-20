import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Plus, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UserLayout from '@/components/layouts/UserLayout';

const marketLabels: Record<string, string> = {
  moneyline: 'Moneyline',
  spread: 'Point Spread',
  overunder: 'Total Points',
};

export const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { matches, addToSlip, slip } = useStore();
  const { toast } = useToast();

  const match = matches.find((m) => m.id === id);

  if (!match) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Match not found</p>
          <Link to="/user/home" className="text-primary hover:underline mt-2 inline-block">
            Back to Home
          </Link>
        </div>
      </UserLayout>
    );
  }

  const isInSlip = (marketType: string, optionLabel: string) => {
    return slip.some(
      (s) => s.matchId === match.id && s.marketType === marketType && s.selectionLabel === optionLabel
    );
  };

  const handleAddToSlip = (marketType: string, optionLabel: string, odds: number) => {
    if (isInSlip(marketType, optionLabel)) {
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

  return (
    <UserLayout>
      <div className="space-y-4 pb-20">
        {/* Back Button */}
        <Link
          to="/user/home"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Match Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 text-center"
        >
          <Badge variant="outline" className="mb-4">
            {match.league}
          </Badge>

          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl font-display font-bold">{match.awayTeam.slice(0, 2)}</span>
              </div>
              <p className="font-semibold text-sm">{match.awayTeam}</p>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>

            <div className="text-center px-4">
              {match.status === 'Live' || match.status === 'Final' ? (
                <div className="text-3xl font-display font-bold">
                  {match.awayScore} - {match.homeScore}
                </div>
              ) : (
                <div className="text-2xl font-display text-muted-foreground">VS</div>
              )}
              <Badge
                variant="outline"
                className={`mt-2 ${
                  match.status === 'Live'
                    ? 'bg-destructive/20 text-destructive'
                    : match.status === 'Upcoming'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {match.status}
              </Badge>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl font-display font-bold">{match.homeTeam.slice(0, 2)}</span>
              </div>
              <p className="font-semibold text-sm">{match.homeTeam}</p>
              <p className="text-xs text-muted-foreground">Home</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(match.startTime), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{format(new Date(match.startTime), 'h:mm a')}</span>
            </div>
          </div>
        </motion.div>

        {/* Markets */}
        {match.status !== 'Final' && (
          <div className="space-y-4">
            <h2 className="text-lg font-display font-bold">Markets</h2>

            {match.markets.map((market, marketIdx) => (
              <motion.div
                key={market.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: marketIdx * 0.1 }}
                className="glass rounded-xl p-4"
              >
                <h3 className="font-semibold mb-3">{marketLabels[market.type] || market.type}</h3>
                <div className="space-y-2">
                  {market.options.map((option, idx) => {
                    const inSlip = isInSlip(market.type, option.label);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAddToSlip(market.type, option.label, option.odds)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          inSlip
                            ? 'bg-primary/20 border-primary/50 text-primary'
                            : 'bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{option.label}</span>
                          {option.value && (
                            <span className="text-xs text-muted-foreground">({option.value})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accent">{option.odds.toFixed(2)}</span>
                          {inSlip ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Plus className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Sticky CTA */}
        {slip.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-20 left-4 right-4 md:bottom-4 z-40"
          >
            <Link to="/user/slip">
              <Button className="w-full gradient-primary text-primary-foreground font-semibold h-12 glow-primary">
                Go to Bet Slip ({slip.length} selection{slip.length > 1 ? 's' : ''})
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </UserLayout>
  );
};

export default MatchDetails;
