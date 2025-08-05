import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Zap, Target, CheckCircle, XCircle } from "lucide-react";
import { quizService } from "@/services/quiz";
import type { ReactionQuestion, QuizSubmissionResponse } from "@/services/types";
import { useToast } from "@/hooks/use-toast";

interface GameStats {
  score: number;
  streak: number;
  dailyScore: number;
  dailyStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export default function QuizGame() {
  const [question, setQuestion] = useState<ReactionQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResponse | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    streak: 0,
    dailyScore: 0,
    dailyStreak: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
  });
  const { toast } = useToast();

  const loadNewQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setShowResult(false);
    setResult(null);

    try {
      const response = await quizService.getReactionQuestion();
      
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      setQuestion(response.data!);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!selectedOption || !question) return;

    setSubmitting(true);

    try {
      const response = await quizService.submitQuizAnswer(
        question.id,
        selectedOption
      );

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      const submissionResult = response.data!;
      setResult(submissionResult);
      setShowResult(true);

      // Update game stats
      setGameStats({
        score: submissionResult.score,
        streak: submissionResult.streak,
        dailyScore: submissionResult.daily_score,
        dailyStreak: submissionResult.daily_streak,
        questionsAnswered: gameStats.questionsAnswered + 1,
        correctAnswers: gameStats.correctAnswers + (submissionResult.is_correct ? 1 : 0),
      });

      // Show success/failure message
      toast({
        title: submissionResult.is_correct ? "Correct!" : "Incorrect",
        description: submissionResult.is_correct 
          ? `Great job! Your streak is now ${submissionResult.streak}`
          : "Don't worry, try the next one!",
        variant: submissionResult.is_correct ? "default" : "destructive",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    loadNewQuestion();
  };

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const accuracy = gameStats.questionsAnswered > 0 
    ? Math.round((gameStats.correctAnswers / gameStats.questionsAnswered) * 100)
    : 0;

  if (loading && !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading question...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
              </div>
              <div className="text-2xl font-bold">{gameStats.score}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-orange-500 mr-1" />
              </div>
              <div className="text-2xl font-bold">{gameStats.streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-blue-500 mr-1" />
              </div>
              <div className="text-2xl font-bold">{gameStats.dailyScore}</div>
              <div className="text-sm text-muted-foreground">Daily Score</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <Progress value={accuracy} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Question Card */}
        {question && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Reaction Puzzle</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                  {question.topic_name && (
                    <Badge variant="outline">{question.topic_name}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">{question.title}</h3>
                {question.image_url && (
                  <img 
                    src={question.image_url} 
                    alt="Question illustration"
                    className="max-w-full h-auto rounded-lg mb-4"
                  />
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {question.options.map((option) => (
                  <Button
                    key={option.id}
                    variant={selectedOption === option.id ? "default" : "outline"}
                    className="p-4 h-auto text-left justify-start"
                    onClick={() => setSelectedOption(option.id)}
                    disabled={showResult}
                  >
                    <div>
                      <div className="font-medium">{option.title}</div>
                      {option.image_url && (
                        <img 
                          src={option.image_url} 
                          alt="Option"
                          className="mt-2 max-w-16 h-auto rounded"
                        />
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {/* Result Display */}
              {showResult && result && (
                <div className={`p-4 rounded-lg mb-4 ${
                  result.is_correct ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                }`}>
                  <div className="flex items-center mb-2">
                    {result.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-semibold ${
                      result.is_correct ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.is_correct ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <p>Score: +{result.is_correct ? (result.score - gameStats.score + (result.is_correct ? 1 : 0)) : 0} points</p>
                    <p>Streak: {result.streak}</p>
                    <p>Daily Score: {result.daily_score}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!showResult ? (
                  <Button 
                    onClick={submitAnswer}
                    disabled={!selectedOption || submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="flex-1">
                    Next Question
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Fill in the blank (____) in the chemistry question</li>
              <li>• Choose the correct answer from the options</li>
              <li>• Build your streak by answering consecutive questions correctly</li>
              <li>• Earn bonus points based on your streak length</li>
              <li>• Compete for the top spot on the daily leaderboard!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}