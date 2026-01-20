import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Match,
  Bet,
  Transaction,
  Notification,
  SlipSelection,
  User,
  SupportTicket,
  initialMatches,
  initialUsers,
  initialTickets,
  generateId,
  generateReferenceId,
} from '@/lib/mockData';

interface Session {
  username: string;
  role: 'user' | 'admin';
  userId: string;
  loginTime: string;
}

interface AppState {
  // Session
  session: Session | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // Matches
  matches: Match[];
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  settleMatchBets: (matchId: string) => void;

  // Betting Slip
  slip: SlipSelection[];
  addToSlip: (selection: Omit<SlipSelection, 'id' | 'addedAt'>) => void;
  removeFromSlip: (selectionId: string) => void;
  clearSlip: () => void;

  // Bets
  bets: Bet[];
  placeBet: (stake: number) => { success: boolean; referenceId?: string; error?: string };

  // Users (admin)
  users: User[];
  updateUserBalance: (userId: string, amount: number, reason: string) => void;
  toggleUserStatus: (userId: string) => void;

  // Transactions
  transactions: Transaction[];
  createWithdrawalRequest: (amount: number) => { success: boolean; error?: string };
  updateTransactionStatus: (transactionId: string, status: 'Approved' | 'Rejected') => void;

  // Notifications
  notifications: Notification[];
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;

  // Support Tickets
  tickets: SupportTicket[];
  updateTicketStatus: (ticketId: string, status: 'Open' | 'Pending' | 'Resolved') => void;
  assignTicket: (ticketId: string, agent: string) => void;
  addTicketMessage: (ticketId: string, message: string, sender: 'user' | 'agent') => void;

  // Live simulation
  simulateLiveUpdate: (matchId: string) => void;
}

const DEMO_CREDENTIALS = {
  user: { password: '1234u', role: 'user' as const, userId: 'user-1' },
  admin: { password: '1234a', role: 'admin' as const, userId: 'admin-1' },
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Session
      session: null,
      login: (username, password) => {
        const creds = DEMO_CREDENTIALS[username as keyof typeof DEMO_CREDENTIALS];
        if (!creds || creds.password !== password) {
          return { success: false, error: 'Invalid credentials' };
        }
        set({
          session: {
            username,
            role: creds.role,
            userId: creds.userId,
            loginTime: new Date().toISOString(),
          },
        });
        return { success: true };
      },
      logout: () => set({ session: null }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      },

      // Matches
      matches: initialMatches,
      updateMatch: (matchId, updates) => {
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === matchId ? { ...m, ...updates } : m
          ),
        }));
        if (updates.status === 'Final') {
          get().settleMatchBets(matchId);
        }
      },
      settleMatchBets: (matchId) => {
        const state = get();
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) return;

        const pendingBets = state.bets.filter(
          (b) => b.status === 'Pending' && b.legs.some((l) => l.matchId === matchId)
        );

        const updatedBets = state.bets.map((bet) => {
          if (!pendingBets.includes(bet)) return bet;

          // Simulate random win/loss for demo
          const won = Math.random() > 0.5;
          return {
            ...bet,
            status: won ? 'Won' : 'Lost',
            settledAt: new Date().toISOString(),
          } as Bet;
        });

        // Update user balances for wins and create notifications
        const notifications: Notification[] = [];
        const userBalanceUpdates: Record<string, number> = {};

        updatedBets.forEach((bet) => {
          if (bet.status === 'Won' && pendingBets.find((pb) => pb.betId === bet.betId)) {
            const originalBet = pendingBets.find((pb) => pb.betId === bet.betId);
            if (originalBet) {
              userBalanceUpdates[bet.userId] = (userBalanceUpdates[bet.userId] || 0) + bet.potentialPayout;
              notifications.push({
                id: generateId(),
                userId: bet.userId,
                type: 'BetSettled',
                title: 'Bet Won! 🎉',
                message: `Your ${bet.type} bet won $${bet.potentialPayout.toFixed(2)}!`,
                timestamp: new Date().toISOString(),
                read: false,
              });
            }
          } else if (bet.status === 'Lost' && pendingBets.find((pb) => pb.betId === bet.betId)) {
            notifications.push({
              id: generateId(),
              userId: bet.userId,
              type: 'BetSettled',
              title: 'Bet Lost',
              message: `Your ${bet.type} bet did not win. Better luck next time!`,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        });

        // Update user balances
        const updatedUsers = state.users.map((user) => {
          if (userBalanceUpdates[user.id]) {
            return {
              ...user,
              balance: user.balance + userBalanceUpdates[user.id],
            };
          }
          return user;
        });

        // Create win transactions
        const newTransactions: Transaction[] = [];
        Object.entries(userBalanceUpdates).forEach(([userId, amount]) => {
          const bet = updatedBets.find((b) => b.userId === userId && b.status === 'Won');
          if (bet) {
            newTransactions.push({
              id: generateId(),
              userId,
              type: 'BetWon',
              amount,
              description: `Bet won: ${bet.referenceId}`,
              status: 'Completed',
              createdAt: new Date().toISOString(),
              referenceId: bet.referenceId,
            });
          }
        });

        set({
          bets: updatedBets,
          users: updatedUsers,
          notifications: [...notifications, ...state.notifications],
          transactions: [...newTransactions, ...state.transactions],
        });
      },

      // Betting Slip
      slip: [],
      addToSlip: (selection) => {
        set((state) => ({
          slip: [
            ...state.slip,
            {
              ...selection,
              id: generateId(),
              addedAt: new Date().toISOString(),
            },
          ],
        }));
      },
      removeFromSlip: (selectionId) => {
        set((state) => ({
          slip: state.slip.filter((s) => s.id !== selectionId),
        }));
      },
      clearSlip: () => set({ slip: [] }),

      // Bets
      bets: [],
      placeBet: (stake) => {
        const state = get();
        const { session, slip, users } = state;
        
        if (!session || session.role !== 'user') {
          return { success: false, error: 'Not logged in' };
        }

        const user = users.find((u) => u.id === session.userId);
        if (!user || user.balance < stake) {
          return { success: false, error: 'Insufficient balance' };
        }

        if (slip.length === 0) {
          return { success: false, error: 'Slip is empty' };
        }

        const totalOdds = slip.reduce((acc, s) => acc * s.oddsDecimal, 1);
        const potentialPayout = stake * totalOdds;
        const referenceId = generateReferenceId();

        const bet: Bet = {
          betId: generateId(),
          referenceId,
          type: slip.length === 1 ? 'Single' : 'Parlay',
          legs: slip.map((s) => ({
            matchId: s.matchId,
            matchLabel: s.matchLabel,
            marketType: s.marketType,
            selectionLabel: s.selectionLabel,
            odds: s.oddsDecimal,
          })),
          stake,
          totalOdds,
          potentialPayout,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          userId: session.userId,
        };

        const transaction: Transaction = {
          id: generateId(),
          userId: session.userId,
          type: 'BetPlaced',
          amount: -stake,
          description: `Bet placed: ${referenceId}`,
          status: 'Completed',
          createdAt: new Date().toISOString(),
          referenceId,
        };

        const notification: Notification = {
          id: generateId(),
          userId: session.userId,
          type: 'BetPlaced',
          title: 'Bet Placed',
          message: `Your ${bet.type} bet of $${stake.toFixed(2)} has been placed.`,
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          bets: [bet, ...state.bets],
          transactions: [transaction, ...state.transactions],
          notifications: [notification, ...state.notifications],
          users: state.users.map((u) =>
            u.id === session.userId ? { ...u, balance: u.balance - stake } : u
          ),
          slip: [],
        }));

        return { success: true, referenceId };
      },

      // Users
      users: initialUsers,
      updateUserBalance: (userId, amount, reason) => {
        const state = get();
        const transaction: Transaction = {
          id: generateId(),
          userId,
          type: 'AdminAdjustment',
          amount,
          description: reason,
          status: 'Completed',
          createdAt: new Date().toISOString(),
        };

        set({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, balance: u.balance + amount } : u
          ),
          transactions: [transaction, ...state.transactions],
        });
      },
      toggleUserStatus: (userId) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
              : u
          ),
        }));
      },

      // Transactions
      transactions: [],
      createWithdrawalRequest: (amount) => {
        const state = get();
        const { session, users } = state;

        if (!session) {
          return { success: false, error: 'Not logged in' };
        }

        const user = users.find((u) => u.id === session.userId);
        if (!user || user.balance < amount) {
          return { success: false, error: 'Insufficient balance' };
        }

        const transaction: Transaction = {
          id: generateId(),
          userId: session.userId,
          type: 'WithdrawalRequest',
          amount: -amount,
          description: 'Withdrawal request',
          status: 'Pending',
          createdAt: new Date().toISOString(),
        };

        set({
          transactions: [transaction, ...state.transactions],
        });

        return { success: true };
      },
      updateTransactionStatus: (transactionId, status) => {
        set((state) => {
          const transaction = state.transactions.find((t) => t.id === transactionId);
          if (!transaction || transaction.type !== 'WithdrawalRequest') return state;

          let updatedUsers = state.users;
          if (status === 'Approved') {
            updatedUsers = state.users.map((u) =>
              u.id === transaction.userId
                ? { ...u, balance: u.balance + transaction.amount }
                : u
            );
          }

          return {
            transactions: state.transactions.map((t) =>
              t.id === transactionId ? { ...t, status } : t
            ),
            users: updatedUsers,
          };
        });
      },

      // Notifications
      notifications: [],
      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }));
      },
      markAllAsRead: () => {
        const state = get();
        set({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        });
      },
      addNotification: (notification) => {
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: generateId(),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        }));
      },

      // Support Tickets
      tickets: initialTickets,
      updateTicketStatus: (ticketId, status) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, status } : t
          ),
        }));
      },
      assignTicket: (ticketId, agent) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, assignedTo: agent } : t
          ),
        }));
      },
      addTicketMessage: (ticketId, message, sender) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    {
                      id: generateId(),
                      sender,
                      message,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : t
          ),
        }));
      },

      // Live simulation
      simulateLiveUpdate: (matchId) => {
        set((state) => {
          const match = state.matches.find((m) => m.id === matchId);
          if (!match || match.status !== 'Live') return state;

          const homeScoreChange = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
          const awayScoreChange = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;

          return {
            matches: state.matches.map((m) =>
              m.id === matchId
                ? {
                    ...m,
                    homeScore: m.homeScore + homeScoreChange,
                    awayScore: m.awayScore + awayScoreChange,
                  }
                : m
            ),
          };
        });
      },
    }),
    {
      name: 'pirate-parlays-storage',
      partialize: (state) => ({
        session: state.session,
        theme: state.theme,
        matches: state.matches,
        slip: state.slip,
        bets: state.bets,
        users: state.users,
        transactions: state.transactions,
        notifications: state.notifications,
        tickets: state.tickets,
      }),
    }
  )
);
