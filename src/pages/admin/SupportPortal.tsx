import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  HeadphonesIcon,
  Search,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SupportTicket } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';

type TicketStatus = 'All' | 'Open' | 'Pending' | 'Resolved';

export const SupportPortal = () => {
  const { tickets, updateTicketStatus, assignTicket, addTicketMessage, users } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const user = users.find((u) => u.id === t.userId);
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const pendingCount = tickets.filter((t) => t.status === 'Pending').length;

  const handleStatusChange = (ticketId: string, status: 'Open' | 'Pending' | 'Resolved') => {
    updateTicketStatus(ticketId, status);
    toast({ title: 'Status updated', description: `Ticket status changed to ${status}` });
  };

  const handleAssign = (ticketId: string, agent: string) => {
    assignTicket(ticketId, agent);
    toast({ title: 'Ticket assigned', description: `Ticket assigned to ${agent}` });
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    addTicketMessage(selectedTicket.id, replyMessage, 'agent');
    updateTicketStatus(selectedTicket.id, 'Pending');
    setReplyMessage('');
    toast({ title: 'Reply sent', description: 'Your response has been sent to the user.' });

    // Refresh selected ticket
    setSelectedTicket(tickets.find((t) => t.id === selectedTicket.id) || null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Open</Badge>;
      case 'Pending':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pending</Badge>;
      case 'Resolved':
        return <Badge className="bg-success/20 text-success border-success/30">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="outline" className="text-destructive border-destructive/30">High</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="text-warning border-warning/30">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-muted-foreground">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <HeadphonesIcon className="w-6 h-6 text-primary" />
              Support Portal
            </h1>
            <p className="text-muted-foreground">
              {openCount} open • {pendingCount} pending
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TicketStatus)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <SkeletonLoader variant="list" count={4} />
        ) : filteredTickets.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center text-muted-foreground">
              No tickets found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const user = users.find((u) => u.id === ticket.userId);
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card
                    className="glass hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{ticket.subject}</p>
                              {getPriorityBadge(ticket.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {user?.username || 'Unknown'} • {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}
                            </p>
                            {ticket.assignedTo && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Assigned to: {ticket.assignedTo}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">{ticket.messages.length}</span>
                          </div>
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Ticket Detail Modal */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="glass-strong max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-4">
                <span className="truncate">{selectedTicket?.subject}</span>
                {selectedTicket && getStatusBadge(selectedTicket.status)}
              </DialogTitle>
            </DialogHeader>

            {selectedTicket && (
              <div className="flex-1 flex flex-col min-h-0 space-y-4">
                {/* Ticket Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">User: </span>
                    <span className="font-medium">
                      {users.find((u) => u.id === selectedTicket.userId)?.username || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority: </span>
                    <span className="font-medium">{selectedTicket.priority}</span>
                  </div>
                  {selectedTicket.assignedTo && (
                    <div>
                      <span className="text-muted-foreground">Assigned: </span>
                      <span className="font-medium">{selectedTicket.assignedTo}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(v) => {
                      handleStatusChange(selectedTicket.id, v as 'Open' | 'Pending' | 'Resolved');
                      setSelectedTicket({ ...selectedTicket, status: v as 'Open' | 'Pending' | 'Resolved' });
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedTicket.assignedTo || ''}
                    onValueChange={(v) => {
                      handleAssign(selectedTicket.id, v);
                      setSelectedTicket({ ...selectedTicket, assignedTo: v });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agent Mike">Agent Mike</SelectItem>
                      <SelectItem value="Agent Sarah">Agent Sarah</SelectItem>
                      <SelectItem value="Agent John">Agent John</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 min-h-0 border rounded-lg p-4 bg-muted/20">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.sender === 'agent'
                              ? 'bg-primary/20 text-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Reply */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim()}
                    className="gradient-primary text-primary-foreground"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default SupportPortal;
