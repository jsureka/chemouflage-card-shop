import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  quizService,
  type DailyLeaderboardEntry,
  type DailyLeaderboardResponse,
} from "@/services";
import {
  Award,
  Calendar,
  Loader2,
  Medal,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Scoreboard() {
  const [leaderboard, setLeaderboard] =
    useState<DailyLeaderboardResponse | null>(null);
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
        return (
          <div className="h-6 w-6 flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
        );
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
        <Header />
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md backdrop-blur-lg border-teal-500/30">
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              <span className="ml-2 text-foreground">
                Loading leaderboard...
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      <Header />
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Daily Chemistry Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Top performers in today's chemistry quiz challenge
            </p>
            {leaderboard && (
              <div className="flex items-center justify-center mt-4">
                <Calendar className="h-4 w-4 text-teal-500 mr-2" />
                <span className="text-muted-foreground">
                  {new Date(leaderboard.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {leaderboard && leaderboard.leaderboard.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="text-center bg-background/80 backdrop-blur-lg border-teal-500/30">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {leaderboard.leaderboard.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Players
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center bg-background/80 backdrop-blur-lg border-teal-500/30">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {leaderboard.leaderboard[0]?.daily_score || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Highest Score
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center bg-background/80 backdrop-blur-lg border-teal-500/30">
                <CardContent className="p-6">
                  <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {Math.max(
                      ...(leaderboard.leaderboard.map(
                        (entry) => entry.daily_streak
                      ) || [0])
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Best Streak
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Leaderboard */}
          <Card className="bg-background/80 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                Top 3 Chemistry Champions
              </CardTitle>
            </CardHeader>

            <CardContent>
              {leaderboard && leaderboard.leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.leaderboard.map(
                    (entry: DailyLeaderboardEntry, index: number) => (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-lg p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 ${getRankBgColor(
                          index
                        )}`}
                      >
                        {/* Animated background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getRankIcon(index)}
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold">
                                {entry.user_name}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm opacity-90">
                                <span>Score: {entry.daily_score}</span>
                                <span>Streak: {entry.daily_streak}</span>
                                <span>
                                  Accuracy: {entry.accuracy_percentage}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {entry.daily_score}
                            </div>
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
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No scores yet today
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to play the chemistry quiz and make it to the
                    leaderboard!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How scoring works */}
          <Card className="mt-8 bg-background/80 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center">
                <Target className="h-5 w-5 text-teal-500 mr-2" />
                How Scoring Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">
                    Base Points
                  </h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-center">
                      <span className="text-teal-500 mr-2">•</span>
                      Correct answer: 10 points
                    </li>
                    <li className="flex items-center">
                      <span className="text-teal-500 mr-2">•</span>
                      Incorrect answer: 0 points
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-foreground">
                    Streak Bonus
                  </h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-center">
                      <span className="text-teal-500 mr-2">•</span>
                      3-4 streak: +1 point
                    </li>
                    <li className="flex items-center">
                      <span className="text-teal-500 mr-2">•</span>
                      5-9 streak: +2 points
                    </li>
                    <li className="flex items-center">
                      <span className="text-teal-500 mr-2">•</span>
                      10+ streak: +3 points
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-700">
                <p className="text-sm text-teal-800 dark:text-teal-200">
                  <strong>Daily Challenge:</strong> Scores reset every day at
                  midnight. Compete with other chemistry enthusiasts to claim
                  the top spot on today's leaderboard!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
