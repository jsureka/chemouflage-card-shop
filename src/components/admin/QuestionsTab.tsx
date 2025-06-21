import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CreateQuestionRequest,
  DifficultyLevel,
  PaginationMetadata,
  Question,
  QuestionOption,
  QuestionType,
  quizService,
  Topic,
} from "@/services";
import { productsService } from "@/services/products";
import {
  Edit,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AdminTable from "./AdminTable";

interface QuestionsTabProps {
  // No props needed for now
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  submitLabel: string;
  formData: CreateQuestionRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateQuestionRequest>>;
  topics: Topic[];
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (
    index: number,
    field: keyof QuestionOption,
    value: any
  ) => void;
  isSubmitting?: boolean;
}

interface QuestionImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
}

const QuestionImageUpload: React.FC<QuestionImageUploadProps> = ({
  value,
  onChange,
  label,
  placeholder = "Upload image",
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await productsService.uploadProductImage(file);
      if (result.error) {
        throw new Error(result.error);
      }
      onChange(result.data!.image_url);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setPreview(value || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1"
              onClick={handleRemoveImage}
              disabled={uploading}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <ImageIcon className="w-8 h-8 mb-2" />
            <p className="text-sm text-center">{placeholder}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleButtonClick}
              disabled={uploading}
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </div>
              )}
            </Button>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  formData,
  setFormData,
  topics,
  addOption,
  removeOption,
  updateOption,
  isSubmitting = false,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl">{title}</DialogTitle>
        <DialogDescription>
          {title.includes("Create")
            ? "Create a new quiz question with options and images."
            : "Edit the selected question and its properties."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Basic Question Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Question Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Topic Selection */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Select
                value={formData.topic_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, topic_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Question Text *</Label>
              <Textarea
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter your question here..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Question Image */}
            <QuestionImageUpload
              value={formData.image_url || ""}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              label="Question Image (Optional)"
              placeholder="Upload an image for this question"
            />
          </CardContent>
        </Card>

        {/* Question Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Question Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: DifficultyLevel) =>
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        Easy
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="hard">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                        Hard
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Question Type</Label>
                <Select
                  value={formData.question_type}
                  onValueChange={(value: QuestionType) => {
                    setFormData({
                      ...formData,
                      question_type: value,
                      options:
                        value === "multiple_choice"
                          ? [
                              { title: "", image_url: "", is_correct: true },
                              { title: "", image_url: "", is_correct: false },
                            ]
                          : undefined,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options (only for multiple choice) */}
        {formData.question_type === "multiple_choice" && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Answer Options</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={(formData.options?.length || 0) >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.options?.map((option, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            Option {index + 1}
                          </Label>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={option.is_correct}
                                onCheckedChange={(checked) =>
                                  updateOption(index, "is_correct", checked)
                                }
                              />
                              <Label className="text-sm text-green-600 font-medium">
                                Correct Answer
                              </Label>
                            </div>
                            {(formData.options?.length || 0) > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <Input
                          value={option.title}
                          onChange={(e) =>
                            updateOption(index, "title", e.target.value)
                          }
                          placeholder={`Enter option ${index + 1} text...`}
                          className="w-full"
                        />

                        <QuestionImageUpload
                          value={option.image_url || ""}
                          onChange={(url) =>
                            updateOption(index, "image_url", url)
                          }
                          label={`Option ${index + 1} Image (Optional)`}
                          placeholder="Upload an image for this option"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {formData.options && formData.options.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No options added yet.</p>
                    <p className="text-sm">
                      Click "Add Option" to get started.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <DialogFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {title.includes("Create") ? "Creating..." : "Updating..."}
            </div>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const QuestionsTab: React.FC<QuestionsTabProps> = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    topic_id: "",
    title: "",
    image_url: "",
    difficulty: "easy",
    question_type: "multiple_choice",
    options: [
      { title: "", image_url: "", is_correct: true },
      { title: "", image_url: "", is_correct: false },
    ],
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [
    page,
    limit,
    search,
    selectedTopicFilter,
    difficultyFilter,
    typeFilter,
    showActiveOnly,
  ]);

  const fetchTopics = async () => {
    try {
      const { data, error } = await quizService.getTopics({
        limit: 100,
        active_only: true,
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setTopics(data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch topics",
        variant: "destructive",
      });
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await quizService.getQuestions({
        page,
        limit,
        search: search || undefined,
        topic_id:
          selectedTopicFilter === "all"
            ? undefined
            : selectedTopicFilter || undefined,
        difficulty:
          difficultyFilter === "all"
            ? undefined
            : difficultyFilter || undefined,
        question_type:
          typeFilter === "all" ? undefined : typeFilter || undefined,
        active_only: showActiveOnly,
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setQuestions(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const validateForm = (): { isValid: boolean; message?: string } => {
    // Check required fields
    if (!formData.topic_id.trim()) {
      return { isValid: false, message: "Please select a topic" };
    }

    if (!formData.title.trim()) {
      return { isValid: false, message: "Please enter a question text" };
    }

    if (formData.question_type === "multiple_choice") {
      // Check if there are at least 2 options
      if (!formData.options || formData.options.length < 2) {
        return {
          isValid: false,
          message: "Multiple choice questions must have at least 2 options",
        };
      }

      // Check if all options have text
      const emptyOptions = formData.options.filter((opt) => !opt.title.trim());
      if (emptyOptions.length > 0) {
        return { isValid: false, message: "All options must have text" };
      }

      // Check exactly one correct answer
      const correctCount = formData.options.filter(
        (opt) => opt.is_correct
      ).length;
      if (correctCount !== 1) {
        return {
          isValid: false,
          message:
            "Multiple choice questions must have exactly one correct answer",
        };
      }
    }

    return { isValid: true };
  };
  const handleCreateQuestion = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up the form data based on question type
      const cleanedData = { ...formData };
      if (formData.question_type !== "multiple_choice") {
        delete cleanedData.options;
      }

      const { data, error } = await quizService.createQuestion(cleanedData);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Question created successfully",
      });

      setIsCreateModalOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = async () => {
    if (!selectedQuestion) return;

    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up the form data based on question type
      const cleanedData = { ...formData };
      if (formData.question_type !== "multiple_choice") {
        delete cleanedData.options;
      }

      const { data, error } = await quizService.updateQuestion(
        selectedQuestion.id,
        cleanedData
      );

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      setIsEditModalOpen(false);
      setSelectedQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (question: Question) => {
    if (!confirm(`Are you sure you want to delete this question?`)) {
      return;
    }

    try {
      const { error } = await quizService.deleteQuestion(question.id);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      topic_id: "",
      title: "",
      image_url: "",
      difficulty: "easy",
      question_type: "multiple_choice",
      options: [
        { title: "", image_url: "", is_correct: true },
        { title: "", image_url: "", is_correct: false },
      ],
    });
  };

  const openEditModal = (question: Question) => {
    setSelectedQuestion(question);
    setFormData({
      topic_id: question.topic_id,
      title: question.title,
      image_url: question.image_url || "",
      difficulty: question.difficulty,
      question_type: question.question_type,
      options: question.options || [
        { title: "", image_url: "", is_correct: true },
        { title: "", image_url: "", is_correct: false },
      ],
    });
    setIsEditModalOpen(true);
  };

  // Option management functions
  const addOption = () => {
    if ((formData.options?.length || 0) < 5) {
      setFormData({
        ...formData,
        options: [
          ...(formData.options || []),
          { title: "", image_url: "", is_correct: false },
        ],
      });
    }
  };

  const removeOption = (index: number) => {
    if ((formData.options?.length || 0) > 2) {
      const newOptions = formData.options?.filter((_, i) => i !== index) || [];
      setFormData({ ...formData, options: newOptions });
    }
  };

  const updateOption = (
    index: number,
    field: keyof QuestionOption,
    value: any
  ) => {
    const newOptions = [...(formData.options || [])];
    if (field === "is_correct" && value) {
      // Uncheck all other options when marking one as correct
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
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

  const getTypeColor = (type: QuestionType) => {
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

  const columns = [
    {
      key: "title",
      label: "Question",
      render: (question: Question) => (
        <div className="max-w-md">
          <div className="font-medium truncate">{question.title}</div>
          {question.topic_name && (
            <div className="text-xs text-muted-foreground mt-1">
              Topic: {question.topic_name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "question_type",
      label: "Type",
      render: (question: Question) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
            question.question_type
          )}`}
        >
          {question.question_type.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "difficulty",
      label: "Difficulty",
      render: (question: Question) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
            question.difficulty
          )}`}
        >
          {question.difficulty}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (question: Question) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            question.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {question.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "options",
      label: "Options",
      render: (question: Question) => (
        <div className="text-center">
          {question.question_type === "multiple_choice"
            ? question.options?.length || 0
            : "N/A"}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (question: Question) => (
        <div className="text-sm text-muted-foreground">
          {new Date(question.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (question: Question) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(question)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteQuestion(question)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Questions</CardTitle>
          <CardDescription>
            Manage quiz questions and their options.
          </CardDescription>
        </CardHeader>{" "}
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-2">
              <Select
                value={selectedTopicFilter}
                onValueChange={setSelectedTopicFilter}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="multiple_choice">MCQ</SelectItem>
                  <SelectItem value="short_answer">Short</SelectItem>
                  <SelectItem value="descriptive">Essay</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Label htmlFor="active-only" className="text-sm">
                  Active
                </Label>
                <Switch
                  id="active-only"
                  checked={showActiveOnly}
                  onCheckedChange={setShowActiveOnly}
                />
              </div>
            </div>

            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Question
            </Button>
          </div>{" "}
          {/* Table */}
          <AdminTable
            title="Questions"
            description="Manage quiz questions"
            data={questions}
            columns={columns}
            loading={loading}
            onRefresh={fetchQuestions}
            pagination={
              pagination
                ? {
                    currentPage: pagination.current_page,
                    pageSize: pagination.page_size,
                    totalPages: pagination.total_pages,
                    totalItems: pagination.total_items,
                    hasNextPage: pagination.has_next,
                    hasPreviousPage: pagination.has_previous,
                  }
                : undefined
            }
            onPageChange={setPage}
            onPageSizeChange={setLimit}
          />
        </CardContent>
      </Card>{" "}
      {/* Create Modal */}
      <QuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsSubmitting(false);
          resetForm();
        }}
        onSubmit={handleCreateQuestion}
        title="Create Question"
        submitLabel="Create"
        formData={formData}
        setFormData={setFormData}
        topics={topics}
        addOption={addOption}
        removeOption={removeOption}
        updateOption={updateOption}
        isSubmitting={isSubmitting}
      />
      {/* Edit Modal */}
      <QuestionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedQuestion(null);
          setIsSubmitting(false);
          resetForm();
        }}
        onSubmit={handleEditQuestion}
        title="Edit Question"
        submitLabel="Update"
        formData={formData}
        setFormData={setFormData}
        topics={topics}
        addOption={addOption}
        removeOption={removeOption}
        updateOption={updateOption}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default QuestionsTab;
