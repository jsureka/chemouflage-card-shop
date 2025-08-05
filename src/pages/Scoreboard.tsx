import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal, Award, Calendar, Users, Target, Zap } from "lucide-react";
import { quizService } from "@/services/quiz";
import type { DailyLeaderboardResponse, DailyLeaderboardEntry } from "@/services/types";
import { useToast } from "@/hooks/use-toast";

export default function Scoreboard() {
  const [leaderboard, setLeaderboard] = useState<DailyLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadLeaderboard = async () => {
    setLoading(true);

    try {
      const response = await quizService.getDailyLeaderboard();
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      setLeaderboard(response.data!);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="h-6 w-6 flex items-center justify-center text-sm font-bold">{index + 1}</div>;
    }
  };

  const getRankBgColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 2:
        return "bg-gradient-to-r from-amber-400 to-amber-600";
      default:
        return "bg-gradient-to-r from-blue-400 to-blue-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading leaderboard...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Daily Leaderboard</h1>
          <p className="text-blue-200">Top performers in today's reaction quiz challenge</p>
          {leaderboard && (
            <div className="flex items-center justify-center mt-4">
              <Calendar className="h-4 w-4 text-blue-300 mr-2" />
              <span className="text-blue-300">
                {new Date(leaderboard.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {leaderboard && leaderboard.leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{leaderboard.leaderboard.length}</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {leaderboard.leaderboard[0]?.daily_score || 0}
                </div>
                <div className="text-sm text-muted-foreground">Highest Score</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {Math.max(...(leaderboard.leaderboard.map(entry => entry.daily_streak) || [0]))}
                </div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              Top 3 Players
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {leaderboard && leaderboard.leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.leaderboard.map((entry: DailyLeaderboardEntry, index: number) => (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-lg p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 ${getRankBgColor(index)}`}
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getRankIcon(index)}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold">{entry.user_name}</h3>
                          <div className="flex items-center space-x-4 text-sm opacity-90">
                            <span>Score: {entry.daily_score}</span>
                            <span>Streak: {entry.daily_streak}</span>
                            <span>Accuracy: {entry.accuracy_percentage}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold">{entry.daily_score}</div>
                        <div className="text-sm opacity-75">
                          {entry.correct_answers}/{entry.questions_answered}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress bar for accuracy */}
                    <div className="mt-3">
                      <div className="bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${entry.accuracy_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No scores yet today</h3>
                <p className="text-gray-500">Be the first to play and make it to the leaderboard!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How scoring works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">How Scoring Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Base Points</h4>
                <ul className="space-y-1">
                  <li>• Correct answer: 10 points</li>
                  <li>• Incorrect answer: 0 points</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Streak Bonus</h4>
                <ul className="space-y-1">
                  <li>• 3-4 streak: +1 point</li>
                  <li>• 5-9 streak: +2 points</li>
                  <li>• 10+ streak: +3 points</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Daily Challenge:</strong> Scores reset every day at midnight. 
                Compete with other players to claim the top spot on today's leaderboard!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}