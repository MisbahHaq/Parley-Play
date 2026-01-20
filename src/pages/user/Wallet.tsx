import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  TrendingUp,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import UserLayout from '@/components/layouts/UserLayout';

type TransactionFilter = 'All' | 'Bets' | 'AdminAdjustment' | 'Requests';

export const Wallet = () => {
  const { users, session, transactions, bets, createWithdrawalRequest } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TransactionFilter>('All');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const user = users.find((u) => u.id === session?.userId);
  const userTransactions = transactions.filter((t) => t.userId === session?.userId);
  const userBets = bets.filter((b) => b.userId === session?.userId);
  const openBets = userBets.filter((b) => b.status === 'Pending');
  const settledBets = userBets.filter((b) => b.status !== 'Pending');

  const filteredTransactions = userTransactions.filter((t) => {
    if (filter === 'All') return true;
    if (filter === 'Bets') return t.type === 'BetPlaced' || t.type === 'BetWon';
    if (filter === 'AdminAdjustment') return t.type === 'AdminAdjustment';
    if (filter === 'Requests') return t.type === 'WithdrawalRequest';
    return true;
  });

  const handleWithdrawRequest = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive',
      });
      return;
    }

    const result = createWithdrawalRequest(amount);
    if (result.success) {
      toast({
        title: 'Request submitted',
        description: 'Your withdrawal request is pending admin review.',
      });
      setShowWithdraw(false);
      setWithdrawAmount('');
    } else {
      toast({
        title: 'Request failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'BetWon' || amount > 0) {
      return <ArrowDownRight className="w-4 h-4 text-success" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-destructive" />;
  };

  const getBetStatusIcon = (status: string) => {
    switch (status) {
      case 'Won':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Lost':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <UserLayout>
      <div className="space-y-4">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass gradient-border overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <WalletIcon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-3xl font-display font-bold gradient-text">
                      ${user?.balance.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowDeposit(true)}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowWithdraw(true)}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
            <TabsTrigger value="open" className="flex-1">
              Open ({openBets.length})
            </TabsTrigger>
            <TabsTrigger value="settled" className="flex-1">Settled</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4 mt-4">
            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(['All', 'Bets', 'AdminAdjustment', 'Requests'] as TransactionFilter[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={filter === f ? 'gradient-primary text-primary-foreground' : ''}
                >
                  {f === 'AdminAdjustment' ? 'Adjustments' : f}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <SkeletonLoader variant="list" count={5} />
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type, tx.amount)}
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.amount > 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="open" className="mt-4">
            {openBets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No open bets
              </div>
            ) : (
              <div className="space-y-2">
                {openBets.map((bet) => (
                  <Card key={bet.betId} className="glass">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{bet.referenceId}</span>
                        <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      {bet.legs.map((leg, idx) => (
                        <div key={idx} className="text-sm py-1">
                          <p className="text-muted-foreground truncate">{leg.matchLabel}</p>
                          <p className="font-medium">
                            {leg.selectionLabel}
                            <span className="text-accent ml-2">@ {leg.odds.toFixed(2)}</span>
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between mt-3 pt-3 border-t border-border/50">
                        <span className="text-sm">Stake: ${bet.stake.toFixed(2)}</span>
                        <span className="font-semibold text-accent">
                          To Win: ${bet.potentialPayout.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settled" className="mt-4">
            {settledBets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No settled bets
              </div>
            ) : (
              <div className="space-y-2">
                {settledBets.map((bet) => (
                  <Card key={bet.betId} className="glass">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{bet.referenceId}</span>
                        <Badge
                          variant="outline"
                          className={
                            bet.status === 'Won'
                              ? 'bg-success/20 text-success border-success/30'
                              : 'bg-destructive/20 text-destructive border-destructive/30'
                          }
                        >
                          {getBetStatusIcon(bet.status)}
                          <span className="ml-1">{bet.status}</span>
                        </Badge>
                      </div>
                      {bet.legs.map((leg, idx) => (
                        <div key={idx} className="text-sm py-1">
                          <p className="text-muted-foreground truncate">{leg.matchLabel}</p>
                          <p className="font-medium">
                            {leg.selectionLabel}
                            <span className="text-muted-foreground ml-2">@ {leg.odds.toFixed(2)}</span>
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between mt-3 pt-3 border-t border-border/50">
                        <span className="text-sm">Stake: ${bet.stake.toFixed(2)}</span>
                        <span
                          className={`font-semibold ${
                            bet.status === 'Won' ? 'text-success' : 'text-muted-foreground'
                          }`}
                        >
                          {bet.status === 'Won' ? `Won: $${bet.potentialPayout.toFixed(2)}` : 'Lost'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Deposit Modal */}
      <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>Coming Soon</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Payment Integration Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Deposits will be enabled in a future release. This is a demo app with no real-money transactions.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>Submit a withdrawal request for admin review</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-sm text-warning flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                This is a demo. Requests are for simulation only.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Available Balance</Label>
              <p className="text-2xl font-bold">${user?.balance.toFixed(2) || '0.00'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={user?.balance}
              />
            </div>

            <Button
              onClick={handleWithdrawRequest}
              className="w-full gradient-primary text-primary-foreground"
            >
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default Wallet;
