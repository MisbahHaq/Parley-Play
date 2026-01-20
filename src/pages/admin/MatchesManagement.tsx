import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Calendar,
  Search,
  Edit,
  Zap,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Match, Sport, MatchStatus } from '@/lib/mockData';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';

export const MatchesManagement = () => {
  const { matches, updateMatch } = useStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState<Sport | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<MatchStatus | 'All'>('All');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editedMatch, setEditedMatch] = useState<Partial<Match>>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      m.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.awayTeam.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = filterSport === 'All' || m.sport === filterSport;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesSport && matchesStatus;
  });

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setEditedMatch({
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      markets: JSON.parse(JSON.stringify(match.markets)),
    });
  };

  const handleSaveMatch = () => {
    if (!selectedMatch) return;

    updateMatch(selectedMatch.id, editedMatch);
    toast({
      title: 'Match updated',
      description: `${selectedMatch.awayTeam} @ ${selectedMatch.homeTeam} has been updated.`,
    });

    if (editedMatch.status === 'Final' && selectedMatch.status !== 'Final') {
      toast({
        title: 'Bets settled',
        description: 'Related bets have been automatically settled.',
      });
    }

    setSelectedMatch(null);
    setEditedMatch({});
  };

  const handleImportOdds = () => {
    if (!selectedMatch || !editedMatch.markets) return;

    const updatedMarkets = editedMatch.markets.map((market) => ({
      ...market,
      options: market.options.map((opt) => ({
        ...opt,
        odds: parseFloat((1.5 + Math.random() * 1.5).toFixed(2)),
      })),
    }));

    setEditedMatch({ ...editedMatch, markets: updatedMarkets });
    toast({
      title: 'Odds refreshed',
      description: 'New odds have been imported (simulated).',
    });
  };

  const getStatusIcon = (status: MatchStatus) => {
    switch (status) {
      case 'Live':
        return <Zap className="w-4 h-4 text-destructive" />;
      case 'Final':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Matches & Odds
          </h1>
          <p className="text-muted-foreground">{matches.length} total matches</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
          <Select value={filterSport} onValueChange={(v) => setFilterSport(v as Sport | 'All')}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Sports</SelectItem>
              <SelectItem value="NFL">NFL</SelectItem>
              <SelectItem value="NBA">NBA</SelectItem>
              <SelectItem value="EPL">EPL</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as MatchStatus | 'All')}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Live">Live</SelectItem>
              <SelectItem value="Final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Matches List */}
        {isLoading ? (
          <SkeletonLoader variant="card" count={4} />
        ) : (
          <div className="grid gap-4">
            {filteredMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="glass hover:border-primary/30 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(match.status)}
                          <Badge variant="outline" className="text-xs">
                            {match.sport}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {match.awayTeam} @ {match.homeTeam}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(match.startTime), 'MMM d, h:mm a')} • {match.league}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {match.status !== 'Upcoming' && (
                          <div className="text-center">
                            <p className="text-lg font-display font-bold">
                              {match.awayScore} - {match.homeScore}
                            </p>
                          </div>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            match.status === 'Live'
                              ? 'bg-destructive/20 text-destructive'
                              : match.status === 'Final'
                              ? 'bg-success/20 text-success'
                              : 'bg-primary/20 text-primary'
                          }
                        >
                          {match.status}
                        </Badge>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditMatch(match)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Match Modal */}
        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="glass-strong max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Match</DialogTitle>
              <DialogDescription>
                {selectedMatch?.awayTeam} @ {selectedMatch?.homeTeam}
              </DialogDescription>
            </DialogHeader>
            {selectedMatch && (
              <div className="space-y-6 py-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label>Match Status</Label>
                  <Select
                    value={editedMatch.status}
                    onValueChange={(v) => setEditedMatch({ ...editedMatch, status: v as MatchStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Live">Live</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                  {editedMatch.status === 'Final' && selectedMatch.status !== 'Final' && (
                    <p className="text-xs text-warning">
                      ⚠️ Setting to Final will settle all pending bets
                    </p>
                  )}
                </div>

                {/* Scores */}
                {(editedMatch.status === 'Live' || editedMatch.status === 'Final') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{selectedMatch.awayTeam} Score</Label>
                      <Input
                        type="number"
                        value={editedMatch.awayScore}
                        onChange={(e) =>
                          setEditedMatch({ ...editedMatch, awayScore: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{selectedMatch.homeTeam} Score</Label>
                      <Input
                        type="number"
                        value={editedMatch.homeScore}
                        onChange={(e) =>
                          setEditedMatch({ ...editedMatch, homeScore: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Markets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Markets & Odds</Label>
                    <Button variant="ghost" size="sm" onClick={handleImportOdds}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Import Odds
                    </Button>
                  </div>

                  {editedMatch.markets?.map((market, mIdx) => (
                    <Card key={mIdx} className="bg-muted/30">
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm capitalize">{market.type}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 space-y-2">
                        {market.options.map((option, oIdx) => (
                          <div key={oIdx} className="flex items-center justify-between gap-2">
                            <span className="text-sm flex-1">{option.label}</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={option.odds}
                              onChange={(e) => {
                                const newMarkets = [...(editedMatch.markets || [])];
                                newMarkets[mIdx].options[oIdx].odds = parseFloat(e.target.value) || 1;
                                setEditedMatch({ ...editedMatch, markets: newMarkets });
                              }}
                              className="w-20"
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  onClick={handleSaveMatch}
                  className="w-full gradient-primary text-primary-foreground"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MatchesManagement;
