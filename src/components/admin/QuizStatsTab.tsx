import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { quizService, QuizStats, TopicStats } from "@/services";
import { BarChart3, BookOpen, FileQuestion, Target } from "lucide-react";
import { useEffect, useState } from "react";

interface QuizStatsTabProps {
  // No props needed for now
}

const QuizStatsTab: React.FC<QuizStatsTabProps> = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch overall quiz stats
      const { data: quizData, error: quizError } =
        await quizService.getQuizStats();
      if (quizError) {
        toast({
          title: "Error",
          description: quizError,
          variant: "destructive",
        });
        return;
      }


      if (quizData) setStats(quizData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "short_answer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "descriptive":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-foreground">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_topics || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_topics || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_questions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_questions || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Questions per Topic
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_topics && stats.total_topics > 0
                ? Math.round(
                    (stats.total_questions / stats.total_topics) * 10
                  ) / 10
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">questions per topic</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.active_topics && stats.active_topics > 0
                ? Math.round(
                    ((stats.active_questions || 0) /
                      (stats.active_topics * 10)) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              of target (10 q/topic)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Questions by Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Questions by Difficulty</CardTitle>
          <CardDescription>
            Distribution of questions across difficulty levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {stats?.questions_by_difficulty &&
              Object.entries(stats.questions_by_difficulty).map(
                ([difficulty, count]) => (
                  <div key={difficulty} className="text-center">
                    <div
                      className={`px-3 py-2 rounded-lg ${getDifficultyColor(
                        difficulty
                      )}`}
                    >
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm font-medium capitalize">
                        {difficulty}
                      </div>
                    </div>
                  </div>
                )
              )}
          </div>
        </CardContent>
      </Card>

      {/* Questions by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Questions by Type</CardTitle>
          <CardDescription>
            Distribution of questions across different types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {stats?.questions_by_type &&
              Object.entries(stats.questions_by_type).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className={`px-3 py-2 rounded-lg ${getTypeColor(type)}`}>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm font-medium">
                      {type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizStatsTab;
