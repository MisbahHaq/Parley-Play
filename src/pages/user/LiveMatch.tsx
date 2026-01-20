import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Clock, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import UserLayout from '@/components/layouts/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const liveEvents = [
  'Timeout called',
  'Team scores!',
  'Foul committed',
  'Substitution made',
  'Shot on target',
  'Corner kick awarded',
  'Free throw attempt',
  'Turnover',
];

export const LiveMatch = () => {
  const { id } = useParams<{ id: string }>();
  const { matches, simulateLiveUpdate, bets, session } = useStore();
  const [events, setEvents] = useState<{ time: string; text: string }[]>([]);

  const match = matches.find((m) => m.id === id);
  const userBets = bets.filter(
    (b) => b.userId === session?.userId && b.legs.some((l) => l.matchId === id) && b.status === 'Pending'
  );

  useEffect(() => {
    if (!match || match.status !== 'Live') return;

    const interval = setInterval(() => {
      simulateLiveUpdate(id!);

      // Random live event
      if (Math.random() > 0.5) {
        const randomEvent = liveEvents[Math.floor(Math.random() * liveEvents.length)];
        const team = Math.random() > 0.5 ? match.homeTeam : match.awayTeam;
        setEvents((prev) => [
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `${team}: ${randomEvent}`,
          },
          ...prev.slice(0, 9),
        ]);
      }
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [match, id, simulateLiveUpdate]);

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

  return (
    <UserLayout>
      <div className="space-y-4">
        {/* Back Button */}
        <Link
          to="/user/home"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Live Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 relative overflow-hidden"
        >
          {/* Live Pulse Effect */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-destructive/20 text-destructive border-destructive/30">
              <span className="w-2 h-2 rounded-full bg-destructive mr-2 animate-pulse" />
              LIVE
            </Badge>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-4">{match.league}</p>

            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-2xl font-display font-bold">{match.awayTeam.slice(0, 2)}</span>
                </div>
                <p className="font-semibold text-sm">{match.awayTeam}</p>
              </div>

              <motion.div
                key={`${match.awayScore}-${match.homeScore}`}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-4xl font-display font-bold gradient-text">
                  {match.awayScore} - {match.homeScore}
                </div>
              </motion.div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2 mx-auto">
                  <span className="text-2xl font-display font-bold">{match.homeTeam.slice(0, 2)}</span>
                </div>
                <p className="font-semibold text-sm">{match.homeTeam}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Live - In Progress</span>
            </div>
          </div>
        </motion.div>

        {/* Live Feed */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              Live Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Waiting for updates...
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.map((event, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-xs text-muted-foreground font-mono">{event.time}</span>
                    <span className="text-sm">{event.text}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Bets on This Match */}
        {userBets.length > 0 && (
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Your Bets on This Match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userBets.map((bet) => (
                <div
                  key={bet.betId}
                  className="p-3 rounded-lg bg-muted/30 border border-primary/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{bet.referenceId}</span>
                    <Badge variant="outline" className="text-xs">
                      {bet.status}
                    </Badge>
                  </div>
                  {bet.legs
                    .filter((l) => l.matchId === id)
                    .map((leg, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-muted-foreground">{leg.marketType}: </span>
                        <span className="font-medium">{leg.selectionLabel}</span>
                        <span className="text-accent ml-2">@ {leg.odds.toFixed(2)}</span>
                      </div>
                    ))}
                  <div className="flex justify-between mt-2 pt-2 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Stake: ${bet.stake.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-accent">
                      Potential: ${bet.potentialPayout.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* View All Markets */}
        <Link to={`/user/match/${id}`}>
          <Card className="glass hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="py-4 text-center">
              <span className="text-primary text-sm font-medium">View All Markets →</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </UserLayout>
  );
};

export default LiveMatch;
