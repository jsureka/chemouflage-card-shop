import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  quizService,
  type QuizSession,
  type QuizSessionAnswerResponse,
  type QuizSessionCompleteResponse,
  type ReactionQuestion,
} from "@/services";
import {
  CheckCircle,
  Clock,
  Loader2,
  Target,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface GameState {
  phase: "loading" | "checking" | "ready" | "completed" | "limit_reached";
  session?: QuizSession;
  currentQuestion?: ReactionQuestion;
  selectedOption?: string;
  showResult: boolean;
  lastAnswerResult?: QuizSessionAnswerResponse;
  finalResults?: QuizSessionCompleteResponse;
  startTime: number;
}

export default function QuizGameSession() {
  const [gameState, setGameState] = useState<GameState>({
    phase: "loading",
    showResult: false,
    startTime: Date.now(),
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const initializeGame = async () => {
    setGameState((prev) => ({ ...prev, phase: "loading" }));

    try {
      // Check session status first
      const statusResponse = await quizService.getQuizSessionStatus();
      if (statusResponse.error) {
        toast({
          title: "Error",
          description: statusResponse.error,
          variant: "destructive",
        });
        return;
      }

      const status = statusResponse.data!;

      // If user has completed quiz today
      if (status.has_completed_today) {
        setGameState((prev) => ({
          ...prev,
          phase: "limit_reached",
        }));
        return;
      }

      // If user has an active session, resume it
      if (status.has_active_session && status.active_session_id) {
        const questionResponse = await quizService.getSessionQuestion(
          status.active_session_id
        );

        if (questionResponse.error) {
          toast({
            title: "Error",
            description: questionResponse.error,
            variant: "destructive",
          });
          return;
        }

        setGameState((prev) => ({
          ...prev,
          phase: "ready",
          session: {
            id: status.active_session_id!,
            user_id: "",
            question_ids: [],
            current_question_index: status.current_question_index || 0,
            status: "active",
            started_at: new Date().toISOString(),
            answers: [],
          },
          currentQuestion: questionResponse.data!,
        }));
        return;
      }

      // Start new session
      const sessionResponse = await quizService.startQuizSession(10);
      if (sessionResponse.error) {
        toast({
          title: "Error",
          description: sessionResponse.error,
          variant: "destructive",
        });
        return;
      }

      const session = sessionResponse.data!;

      // Get first question
      const questionResponse = await quizService.getSessionQuestion(session.id);
      if (questionResponse.error) {
        toast({
          title: "Error",
          description: questionResponse.error,
          variant: "destructive",
        });
        return;
      }

      setGameState((prev) => ({
        ...prev,
        phase: "ready",
        session,
        currentQuestion: questionResponse.data!,
        startTime: Date.now(),
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize quiz",
        variant: "destructive",
      });
    }
  };

  const submitAnswer = async () => {
    if (
      !gameState.selectedOption ||
      !gameState.currentQuestion ||
      !gameState.session
    )
      return;

    setSubmitting(true);

    try {
      const response = await quizService.submitSessionAnswer(
        gameState.session.id,
        gameState.currentQuestion.id,
        gameState.selectedOption
      );

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      const result = response.data!;

      setGameState((prev) => ({
        ...prev,
        showResult: true,
        lastAnswerResult: result,
      }));

      // Show result toast
      toast({
        title: result.is_correct ? "Correct!" : "Incorrect",
        description: result.is_correct
          ? "Great job! Keep it up!"
          : "Don't worry, try the next one!",
        variant: result.is_correct ? "default" : "destructive",
      });

      // If session is complete, finish it
      if (result.session_complete) {
        setTimeout(() => completeSession(), 2000);
      }
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

  const nextQuestion = async () => {
    if (!gameState.session) return;

    setGameState((prev) => ({
      ...prev,
      selectedOption: undefined,
      showResult: false,
      lastAnswerResult: undefined,
    }));

    try {
      const response = await quizService.getSessionQuestion(
        gameState.session.id
      );
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      setGameState((prev) => ({
        ...prev,
        currentQuestion: response.data!,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load next question",
        variant: "destructive",
      });
    }
  };

  const completeSession = async () => {
    if (!gameState.session) return;

    try {
      const response = await quizService.completeQuizSession(
        gameState.session.id
      );
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      setGameState((prev) => ({
        ...prev,
        phase: "completed",
        finalResults: response.data!,
      }));

      toast({
        title: "Quiz Completed!",
        description: `Great job! You scored ${
          response.data!.score_earned
        } points!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete quiz",
        variant: "destructive",
      });
    }
  };

  const selectOption = (optionId: string) => {
    if (gameState.showResult) return;
    setGameState((prev) => ({ ...prev, selectedOption: optionId }));
  };

  const restartTomorrow = () => {
    setGameState({
      phase: "limit_reached",
      showResult: false,
      startTime: Date.now(),
    });
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (gameState.phase === "ready" && !gameState.showResult) {
      const interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - gameState.startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.phase, gameState.showResult, gameState.startTime]);

  // Loading state
  if (gameState.phase === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading quiz...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Daily limit reached
  if (gameState.phase === "limit_reached") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Clock className="h-6 w-6" />
                  Daily Quiz Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You've already completed your quiz for today! Come back
                  tomorrow for a new challenge.
                </p>
                <Button onClick={() => (window.location.href = "/")}>
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Quiz completed
  if (gameState.phase === "completed" && gameState.finalResults) {
    const results = gameState.finalResults;
    const accuracy = Math.round(
      (results.correct_answers / results.total_questions) * 100
    );

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Quiz Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Score Earned
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {results.score_earned}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-2xl font-bold">{accuracy}%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Correct Answers
                    </p>
                    <p className="text-2xl font-bold">
                      {results.correct_answers}/{results.total_questions}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Time Taken</p>
                    <p className="text-2xl font-bold">
                      {formatTime(results.total_time_seconds)}
                    </p>
                  </div>
                </div>

                {results.streak_achieved > 0 && (
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <Zap className="h-5 w-5" />
                    <span className="font-semibold">
                      Best Streak: {results.streak_achieved}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Daily Stats</p>
                  <div className="flex justify-center gap-4">
                    <span className="text-lg font-semibold">
                      Score: {results.daily_score}
                    </span>
                    <span className="text-lg font-semibold">
                      Streak: {results.daily_streak}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Come back tomorrow for a new quiz!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz
  if (gameState.phase === "ready" && gameState.currentQuestion) {
    const question = gameState.currentQuestion;
    const progress =
      question.question_number && question.total_questions
        ? (question.question_number / question.total_questions) * 100
        : 0;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress and Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <span className="font-semibold">
                      Question {question.question_number || 1} of{" "}
                      {question.total_questions || 10}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatTime(currentTime)}</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Question */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{question.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{question.topic_name}</Badge>
                    <Badge
                      variant="outline"
                      className={`text-white ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {question.image_url && (
                  <img
                    src={question.image_url}
                    alt="Question"
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                )}

                <div className="grid gap-3">
                  {question.options.map((option) => (
                    <Button
                      key={option.id}
                      variant={
                        gameState.showResult
                          ? option.id ===
                            gameState.lastAnswerResult?.correct_option_id
                            ? "default"
                            : option.id === gameState.selectedOption
                            ? "destructive"
                            : "outline"
                          : gameState.selectedOption === option.id
                          ? "default"
                          : "outline"
                      }
                      className={`h-auto p-4 text-left justify-start ${
                        gameState.showResult
                          ? option.id ===
                            gameState.lastAnswerResult?.correct_option_id
                            ? "bg-green-500 hover:bg-green-600"
                            : option.id === gameState.selectedOption
                            ? "bg-red-500 hover:bg-red-600"
                            : ""
                          : ""
                      }`}
                      onClick={() => selectOption(option.id)}
                      disabled={gameState.showResult || submitting}
                    >
                      <div className="flex items-center gap-3">
                        {gameState.showResult && (
                          <>
                            {option.id ===
                              gameState.lastAnswerResult?.correct_option_id && (
                              <CheckCircle className="h-5 w-5 text-white" />
                            )}
                            {option.id === gameState.selectedOption &&
                              option.id !==
                                gameState.lastAnswerResult
                                  ?.correct_option_id && (
                                <XCircle className="h-5 w-5 text-white" />
                              )}
                          </>
                        )}
                        <span className="text-sm">{option.title}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                {!gameState.showResult && (
                  <Button
                    onClick={submitAnswer}
                    disabled={!gameState.selectedOption || submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </Button>
                )}

                {gameState.showResult && gameState.lastAnswerResult && (
                  <div className="text-center space-y-3">
                    <div
                      className={`p-3 rounded-lg ${
                        gameState.lastAnswerResult.is_correct
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p
                        className={`font-semibold ${
                          gameState.lastAnswerResult.is_correct
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {gameState.lastAnswerResult.is_correct
                          ? "Correct!"
                          : "Incorrect"}
                      </p>
                    </div>

                    {!gameState.lastAnswerResult.session_complete ? (
                      <Button onClick={nextQuestion} className="w-full">
                        Next Question
                      </Button>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                          Finishing up your quiz...
                        </p>
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
