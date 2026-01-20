// Mock data for Pirate Parlays MVP Demo

export type Sport = 'NFL' | 'NBA' | 'EPL';
export type MatchStatus = 'Upcoming' | 'Live' | 'Final';
export type BetStatus = 'Pending' | 'Won' | 'Lost';
export type TransactionType = 'BetPlaced' | 'BetWon' | 'AdminAdjustment' | 'WithdrawalRequest';

export interface Market {
  type: 'moneyline' | 'spread' | 'overunder';
  options: {
    label: string;
    odds: number;
    value?: string;
  }[];
}

export interface Match {
  id: string;
  sport: Sport;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  markets: Market[];
}

export interface SlipSelection {
  id: string;
  matchId: string;
  matchLabel: string;
  marketType: string;
  selectionLabel: string;
  oddsDecimal: number;
  addedAt: string;
}

export interface BetLeg {
  matchId: string;
  matchLabel: string;
  marketType: string;
  selectionLabel: string;
  odds: number;
}

export interface Bet {
  betId: string;
  referenceId: string;
  type: 'Single' | 'Parlay';
  legs: BetLeg[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  status: BetStatus;
  createdAt: string;
  settledAt?: string;
  userId: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: 'Completed' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  referenceId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'BetPlaced' | 'BetSettled' | 'MatchResult' | 'Promo';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  status: 'Active' | 'Suspended';
  kycVerified: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: 'Open' | 'Pending' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  messages: {
    id: string;
    sender: 'user' | 'agent';
    message: string;
    timestamp: string;
  }[];
  assignedTo?: string;
}

// Helper functions
export const generateReferenceId = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PP-${dateStr}-${random}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Initial mock matches
export const initialMatches: Match[] = [
  // NFL Matches
  {
    id: 'nfl-1',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    homeScore: 0,
    awayScore: 0,
    markets: [
      { type: 'moneyline', options: [{ label: 'Chiefs', odds: 1.85 }, { label: 'Bills', odds: 2.05 }] },
      { type: 'spread', options: [{ label: 'Chiefs -3.5', odds: 1.91, value: '-3.5' }, { label: 'Bills +3.5', odds: 1.91, value: '+3.5' }] },
      { type: 'overunder', options: [{ label: 'Over 48.5', odds: 1.87 }, { label: 'Under 48.5', odds: 1.95 }] }
    ]
  },
  {
    id: 'nfl-2',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'San Francisco 49ers',
    awayTeam: 'Philadelphia Eagles',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'Live',
    homeScore: 14,
    awayScore: 10,
    markets: [
      { type: 'moneyline', options: [{ label: '49ers', odds: 1.65 }, { label: 'Eagles', odds: 2.35 }] },
      { type: 'spread', options: [{ label: '49ers -4.5', odds: 1.88 }, { label: 'Eagles +4.5', odds: 1.94 }] },
      { type: 'overunder', options: [{ label: 'Over 51.5', odds: 1.90 }, { label: 'Under 51.5', odds: 1.92 }] }
    ]
  },
  {
    id: 'nfl-3',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'Dallas Cowboys',
    awayTeam: 'Miami Dolphins',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    homeScore: 0,
    awayScore: 0,
    markets: [
      { type: 'moneyline', options: [{ label: 'Cowboys', odds: 2.10 }, { label: 'Dolphins', odds: 1.78 }] },
      { type: 'spread', options: [{ label: 'Cowboys +2.5', odds: 1.89 }, { label: 'Dolphins -2.5', odds: 1.93 }] },
      { type: 'overunder', options: [{ label: 'Over 52.5', odds: 1.85 }, { label: 'Under 52.5', odds: 1.97 }] }
    ]
  },
  {
    id: 'nfl-4',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'Baltimore Ravens',
    awayTeam: 'Cincinnati Bengals',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'Final',
    homeScore: 28,
    awayScore: 24,
    markets: [
      { type: 'moneyline', options: [{ label: 'Ravens', odds: 1.55 }, { label: 'Bengals', odds: 2.55 }] },
      { type: 'spread', options: [{ label: 'Ravens -6.5', odds: 1.91 }, { label: 'Bengals +6.5', odds: 1.91 }] },
      { type: 'overunder', options: [{ label: 'Over 47.5', odds: 1.88 }, { label: 'Under 47.5', odds: 1.94 }] }
    ]
  },
  // NBA Matches
  {
    id: 'nba-1',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    homeScore: 0,
    awayScore: 0,
    markets: [
      { type: 'moneyline', options: [{ label: 'Lakers', odds: 2.15 }, { label: 'Celtics', odds: 1.75 }] },
      { type: 'spread', options: [{ label: 'Lakers +4.5', odds: 1.90 }, { label: 'Celtics -4.5', odds: 1.92 }] },
      { type: 'overunder', options: [{ label: 'Over 225.5', odds: 1.91 }, { label: 'Under 225.5', odds: 1.91 }] }
    ]
  },
  {
    id: 'nba-2',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Golden State Warriors',
    awayTeam: 'Phoenix Suns',
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'Live',
    homeScore: 58,
    awayScore: 52,
    markets: [
      { type: 'moneyline', options: [{ label: 'Warriors', odds: 1.70 }, { label: 'Suns', odds: 2.20 }] },
      { type: 'spread', options: [{ label: 'Warriors -3.5', odds: 1.88 }, { label: 'Suns +3.5', odds: 1.94 }] },
      { type: 'overunder', options: [{ label: 'Over 228.5', odds: 1.87 }, { label: 'Under 228.5', odds: 1.95 }] }
    ]
  },
  {
    id: 'nba-3',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Milwaukee Bucks',
    awayTeam: 'Denver Nuggets',
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    homeScore: 0,
    awayScore: 0,
    markets: [
      { type: 'moneyline', options: [{ label: 'Bucks', odds: 1.95 }, { label: 'Nuggets', odds: 1.88 }] },
      { type: 'spread', options: [{ label: 'Bucks -1.5', odds: 1.91 }, { label: 'Nuggets +1.5', odds: 1.91 }] },
      { type: 'overunder', options: [{ label: 'Over 232.5', odds: 1.90 }, { label: 'Under 232.5', odds: 1.92 }] }
    ]
  },
  {
    id: 'nba-4',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Miami Heat',
    awayTeam: 'Brooklyn Nets',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'Final',
    homeScore: 112,
    awayScore: 105,
    markets: [
      { type: 'moneyline', options: [{ label: 'Heat', odds: 1.80 }, { label: 'Nets', odds: 2.05 }] },
      { type: 'spread', options: [{ label: 'Heat -2.5', odds: 1.89 }, { label: 'Nets +2.5', odds: 1.93 }] },
      { type: 'overunder', options: [{ label: 'Over 218.5', odds: 1.88 }, { label: 'Under 218.5', odds: 1.94 }] }
    ]
  },
  // EPL Matches
  {
    id: 'epl-1',
    sport: 'EPL',
    league: 'Premier League',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    homeScore: 0,
    awayScore: 0,
    markets: [
      { type: 'moneyline', options: [{ label: 'Man City', odds: 1.75 }, { label: 'Draw', odds: 3.80 }, { label: 'Arsenal', odds: 4.50 }] },
      { type: 'spread', options: [{ label: 'Man City -1.5', odds: 2.10 }, { label: 'Arsenal +1.5', odds: 1.78 }] },
      { type: 'overunder', options: [{ label: 'Over 2.5', odds: 1.72 }, { label: 'Under 2.5', odds: 2.15 }] }
    ]
  },
  {
    id: 'epl-2',
    sport: 'EPL',
    league: 'Premier League',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    startTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: 'Live',
    homeScore: 2,
    awayScore: 1,
    markets: [
      { type: 'moneyline', options: [{ label: 'Liverpool', odds: 1.45 }, { label: 'Draw', odds: 4.20 }, { label: 'Chelsea', odds: 7.00 }] },
      { type: 'spread', options: [{ label: 'Liverpool -1.5', odds: 1.95 }, { label: 'Chelsea +1.5', odds: 1.88 }] },
      { type: 'overunder', options: [{ label: 'Over 3.5', odds: 2.05 }, { label: 'Under 3.5', odds: 1.80 }] }
    ]
  },
  {
    id: 'epl-3',
    sport: 'EPL',
    league: 'Premier League',
    homeTeam: 'Manchester United',
    awayTeam: 'Tottenham',
    startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'Upcoming',
    homeScore: 0,
    awayScore: 0,
    markets: [
      { type: 'moneyline', options: [{ label: 'Man Utd', odds: 2.40 }, { label: 'Draw', odds: 3.50 }, { label: 'Tottenham', odds: 2.90 }] },
      { type: 'spread', options: [{ label: 'Man Utd -0.5', odds: 2.20 }, { label: 'Tottenham +0.5', odds: 1.70 }] },
      { type: 'overunder', options: [{ label: 'Over 2.5', odds: 1.85 }, { label: 'Under 2.5', odds: 1.98 }] }
    ]
  },
  {
    id: 'epl-4',
    sport: 'EPL',
    league: 'Premier League',
    homeTeam: 'Newcastle',
    awayTeam: 'Aston Villa',
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'Final',
    homeScore: 3,
    awayScore: 1,
    markets: [
      { type: 'moneyline', options: [{ label: 'Newcastle', odds: 1.90 }, { label: 'Draw', odds: 3.60 }, { label: 'Aston Villa', odds: 4.00 }] },
      { type: 'spread', options: [{ label: 'Newcastle -1.5', odds: 2.35 }, { label: 'Aston Villa +1.5', odds: 1.60 }] },
      { type: 'overunder', options: [{ label: 'Over 2.5', odds: 1.78 }, { label: 'Under 2.5', odds: 2.08 }] }
    ]
  }
];

// Initial mock users
export const initialUsers: User[] = [
  {
    id: 'user-1',
    username: 'user',
    email: 'user@demo.com',
    balance: 250,
    status: 'Active',
    kycVerified: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-2',
    username: 'jackparrot',
    email: 'jack@pirates.com',
    balance: 500,
    status: 'Active',
    kycVerified: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-3',
    username: 'seawolf',
    email: 'seawolf@ocean.com',
    balance: 125,
    status: 'Active',
    kycVerified: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-4',
    username: 'redbeard',
    email: 'redbeard@treasure.com',
    balance: 0,
    status: 'Suspended',
    kycVerified: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initial support tickets
export const initialTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    userId: 'user-2',
    subject: 'Bet not showing in history',
    status: 'Open',
    priority: 'High',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messages: [
      { id: 'm1', sender: 'user', message: 'I placed a bet on the Chiefs game but it\'s not showing in my bet history. Can you help?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'ticket-2',
    userId: 'user-3',
    subject: 'KYC verification pending',
    status: 'Pending',
    priority: 'Medium',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      { id: 'm1', sender: 'user', message: 'I submitted my documents 3 days ago but KYC is still pending.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: 'm2', sender: 'agent', message: 'Thank you for reaching out. We\'re reviewing your documents and will update you shortly.', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() }
    ],
    assignedTo: 'Agent Mike'
  },
  {
    id: 'ticket-3',
    userId: 'user-1',
    subject: 'Question about odds calculation',
    status: 'Resolved',
    priority: 'Low',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    messages: [
      { id: 'm1', sender: 'user', message: 'How are parlay odds calculated?', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
      { id: 'm2', sender: 'agent', message: 'Great question! Parlay odds are calculated by multiplying the decimal odds of each selection together.', timestamp: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString() },
      { id: 'm3', sender: 'user', message: 'That makes sense, thank you!', timestamp: new Date(Date.now() - 69 * 60 * 60 * 1000).toISOString() }
    ],
    assignedTo: 'Agent Sarah'
  }
];
