import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, Receipt, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import UserLayout from '@/components/layouts/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const BetSlip = () => {
  const navigate = useNavigate();
  const { slip, removeFromSlip, clearSlip, placeBet, users, session } = useStore();
  const { toast } = useToast();
  const [stake, setStake] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<{ referenceId: string; payout: number } | null>(null);

  const user = users.find((u) => u.id === session?.userId);
  const totalOdds = slip.reduce((acc, s) => acc * s.oddsDecimal, 1);
  const stakeNum = parseFloat(stake) || 0;
  const potentialPayout = stakeNum * totalOdds;

  const handlePlaceBet = async () => {
    if (stakeNum <= 0) {
      toast({
        title: 'Invalid stake',
        description: 'Please enter a valid stake amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!user || stakeNum > user.balance) {
      toast({
        title: 'Insufficient balance',
        description: 'You do not have enough funds to place this bet.',
        variant: 'destructive',
      });
      return;
    }

    setIsPlacing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = placeBet(stakeNum);

    if (result.success) {
      setConfirmation({
        referenceId: result.referenceId!,
        payout: potentialPayout,
      });
      setStake('');
    } else {
      toast({
        title: 'Bet failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsPlacing(false);
  };

  if (confirmation) {
    return (
      <UserLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 glow-primary"
          >
            <Check className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h1 className="text-2xl font-display font-bold mb-2">Bet Placed! 🎉</h1>
          <p className="text-muted-foreground mb-6">Your bet has been successfully placed.</p>

          <Card className="glass w-full max-w-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reference ID</span>
                <span className="font-mono font-medium">{confirmation.referenceId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Payout</span>
                <span className="font-bold text-accent">${confirmation.payout.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmation(null);
                navigate('/user/home');
              }}
            >
              Back to Home
            </Button>
            <Link to="/user/wallet">
              <Button className="gradient-primary text-primary-foreground">
                View in Wallet
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Bet Slip
          </h1>
          {slip.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSlip}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {slip.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Your bet slip is empty</p>
            <Link to="/user/home">
              <Button variant="secondary">Browse Matches</Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Selections */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {slip.map((selection) => (
                  <motion.div
                    key={selection.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass rounded-lg p-3 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{selection.matchLabel}</p>
                      <p className="text-xs text-muted-foreground capitalize">{selection.marketType}</p>
                      <p className="text-sm text-primary font-semibold mt-1">{selection.selectionLabel}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-accent">{selection.oddsDecimal.toFixed(2)}</span>
                      <button
                        onClick={() => removeFromSlip(selection.id)}
                        className="p-1 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bet Summary */}
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {slip.length === 1 ? 'Single Bet' : `Parlay (${slip.length} legs)`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stake">Stake ($)</Label>
                  <Input
                    id="stake"
                    type="number"
                    placeholder="Enter stake"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="bg-muted/50"
                    min="0"
                    step="0.01"
                  />
                  <div className="flex gap-2">
                    {[5, 10, 25, 50].map((amount) => (
                      <Button
                        key={amount}
                        variant="secondary"
                        size="sm"
                        onClick={() => setStake(amount.toString())}
                        className="flex-1"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Odds</span>
                    <span className="font-semibold">{totalOdds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential Payout</span>
                    <span className="text-lg font-bold text-accent">
                      ${potentialPayout.toFixed(2)}
                    </span>
                  </div>
                </div>

                {user && stakeNum > user.balance && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Insufficient balance (${user.balance.toFixed(2)} available)</span>
                  </div>
                )}

                <Button
                  onClick={handlePlaceBet}
                  disabled={isPlacing || stakeNum <= 0 || (user && stakeNum > user.balance)}
                  className="w-full gradient-primary text-primary-foreground font-semibold h-12"
                >
                  {isPlacing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    'Place Bet'
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default BetSlip;
