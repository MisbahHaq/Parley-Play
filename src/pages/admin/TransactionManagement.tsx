import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Transaction } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';

type TransactionType = 'All' | 'BetPlaced' | 'BetWon' | 'AdminAdjustment' | 'WithdrawalRequest';
type TransactionStatus = 'All' | 'Completed' | 'Pending' | 'Approved' | 'Rejected';

export const TransactionManagement = () => {
  const { transactions, updateTransactionStatus, users } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType>('All');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>('All');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const user = users.find((u) => u.id === t.userId);
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || t.type === filterType;
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingWithdrawals = transactions.filter(
    (t) => t.type === 'WithdrawalRequest' && t.status === 'Pending'
  );

  const handleApprove = (tx: Transaction) => {
    updateTransactionStatus(tx.id, 'Approved');
    toast({
      title: 'Request approved',
      description: 'The withdrawal request has been approved.',
    });
  };

  const handleReject = (tx: Transaction) => {
    updateTransactionStatus(tx.id, 'Rejected');
    toast({
      title: 'Request rejected',
      description: 'The withdrawal request has been rejected.',
    });
  };

  const getTypeIcon = (type: string, amount: number) => {
    if (type === 'BetWon' || (type === 'AdminAdjustment' && amount > 0)) {
      return <ArrowDownRight className="w-4 h-4 text-success" />;
    }
    return <ArrowUpRight className="w-4 h-4 text-destructive" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="outline" className="bg-success/20 text-success">Completed</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-warning/20 text-warning">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-success/20 text-success">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-destructive/20 text-destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Transactions
          </h1>
          <p className="text-muted-foreground">{transactions.length} total transactions</p>
        </div>

        {/* Pending Requests Alert */}
        {pendingWithdrawals.length > 0 && (
          <Card className="glass border-warning/30">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-warning" />
                <span className="font-semibold">
                  {pendingWithdrawals.length} pending withdrawal request{pendingWithdrawals.length > 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as TransactionType)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="BetPlaced">Bet Placed</SelectItem>
              <SelectItem value="BetWon">Bet Won</SelectItem>
              <SelectItem value="AdminAdjustment">Adjustment</SelectItem>
              <SelectItem value="WithdrawalRequest">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TransactionStatus)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        {isLoading ? (
          <SkeletonLoader variant="list" count={6} />
        ) : (
          <Card className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => {
                    const user = users.find((u) => u.id === tx.userId);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type, tx.amount)}
                            <div>
                              <p className="text-sm font-medium">{tx.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {tx.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user?.username || 'Unknown'}</TableCell>
                        <TableCell
                          className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-destructive'}`}
                        >
                          {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {format(new Date(tx.createdAt), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell>
                          {tx.type === 'WithdrawalRequest' && tx.status === 'Pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(tx)}
                                className="text-success hover:text-success"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReject(tx)}
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default TransactionManagement;
