import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Users,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { User } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export const UserManagement = () => {
  const { users, toggleUserStatus, updateUserBalance } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (user: User) => {
    toggleUserStatus(user.id);
    toast({
      title: user.status === 'Active' ? 'User suspended' : 'User reactivated',
      description: `${user.username} has been ${user.status === 'Active' ? 'suspended' : 'reactivated'}.`,
    });
  };

  const handleAdjustBalance = () => {
    if (!selectedUser) return;

    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount === 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!adjustReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for the adjustment.',
        variant: 'destructive',
      });
      return;
    }

    updateUserBalance(selectedUser.id, amount, adjustReason);
    toast({
      title: 'Balance adjusted',
      description: `${selectedUser.username}'s balance has been adjusted by $${amount.toFixed(2)}.`,
    });
    setShowAdjustModal(false);
    setAdjustAmount('');
    setAdjustReason('');
    setSelectedUser(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground">{users.length} total users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>

        {/* Users Table */}
        {isLoading ? (
          <SkeletonLoader variant="list" count={4} />
        ) : (
          <Card className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {user.username[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === 'Active'
                              ? 'bg-success/20 text-success border-success/30'
                              : 'bg-destructive/20 text-destructive border-destructive/30'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">${user.balance.toFixed(2)}</TableCell>
                      <TableCell>
                        {user.kycVerified ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-warning" />
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAdjustModal(true);
                            }}
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(user)}
                            className={user.status === 'Active' ? 'text-destructive' : 'text-success'}
                          >
                            {user.status === 'Active' ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* User Details Modal */}
        <Dialog open={!!selectedUser && !showAdjustModal} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="glass-strong">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary">
                      {selectedUser.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedUser.username}</p>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="font-semibold">${selectedUser.balance.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold">{selectedUser.status}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">KYC Verified</p>
                    <p className="font-semibold">{selectedUser.kycVerified ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-semibold">{format(new Date(selectedUser.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowAdjustModal(true);
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Adjust Balance
                  </Button>
                  <Button
                    variant={selectedUser.status === 'Active' ? 'destructive' : 'default'}
                    className="flex-1"
                    onClick={() => {
                      handleToggleStatus(selectedUser);
                      setSelectedUser(null);
                    }}
                  >
                    {selectedUser.status === 'Active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Adjust Balance Modal */}
        <Dialog open={showAdjustModal} onOpenChange={() => { setShowAdjustModal(false); setSelectedUser(null); }}>
          <DialogContent className="glass-strong">
            <DialogHeader>
              <DialogTitle>Adjust Balance</DialogTitle>
              <DialogDescription>
                Adjust {selectedUser?.username}'s balance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-xl font-semibold">${selectedUser?.balance.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <Label>Amount (use negative for deductions)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 50 or -25"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  placeholder="Enter reason for adjustment"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>

              <Button
                onClick={handleAdjustBalance}
                className="w-full gradient-primary text-primary-foreground"
              >
                Apply Adjustment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
