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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CreateTopicRequest,
  PaginationMetadata,
  quizService,
  Topic,
} from "@/services";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminTable from "./AdminTable";

interface TopicsTabProps {
  // No props needed for now
}

const TopicModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  formData,
  setFormData,
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  submitLabel: string;
  formData: CreateTopicRequest;
  setFormData: (data: CreateTopicRequest) => void;
  loading?: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {title.includes("Create")
            ? "Create a new topic for quiz questions."
            : "Edit the selected topic."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="col-span-3"
            placeholder="Enter topic name"
            disabled={loading}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="col-span-3"
            placeholder="Enter topic description"
            rows={3}
            disabled={loading}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="is_active" className="text-right">
            Active
          </Label>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_active: checked })
            }
            disabled={loading}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Processing..." : submitLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const TopicsTab: React.FC<TopicsTabProps> = () => {
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateTopicRequest>({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchTopics();
  }, [page, limit, search, showActiveOnly]);
  const fetchTopics = async () => {
    setLoading(true);
    try {
      console.log("Fetching topics with params:", {
        page,
        limit,
        search,
        showActiveOnly,
      });

      const { data, error } = await quizService.getTopics({
        page,
        limit,
        search: search || undefined,
        active_only: showActiveOnly,
      });

      if (error) {
        console.error("Error fetching topics:", error);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log("Topics fetched successfully:", data);
        setTopics(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Exception while fetching topics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch topics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreateTopic = async () => {
    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Topic name is required",
        variant: "destructive",
      });
      return;
    }

    setCreateLoading(true);
    try {
      console.log("Creating topic with data:", formData);

      const { data, error } = await quizService.createTopic(formData);

      if (error) {
        console.error("API error creating topic:", error);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }
      console.log("Topic created successfully:", data);

      toast({
        title: "Success",
        description: "Topic created successfully",
      });

      setIsCreateModalOpen(false);
      resetForm();

      // Reset to page 1 when creating new topics to ensure they're visible
      if (page !== 1) {
        setPage(1);
        // Let the useEffect handle the refresh when page changes
      } else {
        // If already on page 1, manually fetch immediately
        await fetchTopics();
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      toast({
        title: "Error",
        description: "Failed to create topic",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };
  const handleEditTopic = async () => {
    if (!selectedTopic) return;

    setEditLoading(true);
    try {
      const { data, error } = await quizService.updateTopic(
        selectedTopic.id,
        formData
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
        description: "Topic updated successfully",
      });

      setIsEditModalOpen(false);
      setSelectedTopic(null);
      resetForm();

      // Refresh the table immediately
      await fetchTopics();
    } catch (error) {
      console.error("Error updating topic:", error);
      toast({
        title: "Error",
        description: "Failed to update topic",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };
  const handleDeleteTopic = async (topic: Topic) => {
    if (!confirm(`Are you sure you want to delete "${topic.name}"?`)) {
      return;
    }

    try {
      const { error } = await quizService.deleteTopic(topic.id);

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
        description: "Topic deleted successfully",
      });

      // Refresh the table immediately
      await fetchTopics();
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast({
        title: "Error",
        description: "Failed to delete topic",
        variant: "destructive",
      });
    }
  };
  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      is_active: true,
    });
  };

  const openEditModal = (topic: Topic) => {
    setSelectedTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description || "",
      is_active: topic.is_active,
    });
    setIsEditModalOpen(true);
  };
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (topic: Topic) => <div className="font-medium">{topic.name}</div>,
    },
    {
      key: "description",
      label: "Description",
      render: (topic: Topic) => (
        <div className="text-sm text-muted-foreground">
          {topic.description || "No description"}
        </div>
      ),
    },
    {
      key: "question_count",
      label: "Questions",
      render: (topic: Topic) => (
        <div className="text-center">{topic.question_count}</div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (topic: Topic) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            topic.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {topic.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (topic: Topic) => (
        <div className="text-sm text-muted-foreground">
          {new Date(topic.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (topic: Topic) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(topic)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteTopic(topic)}
            disabled={topic.question_count > 0}
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
          <CardTitle>Quiz Topics</CardTitle>
          <CardDescription>
            Manage quiz topics and organize your questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="active-only">Active only</Label>
              <Switch
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
            </div>{" "}
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Topic
            </Button>
          </div>{" "}
          {/* Table */}
          <AdminTable
            title="Topics"
            description="Manage quiz topics"
            data={topics}
            columns={columns}
            loading={loading}
            onRefresh={fetchTopics}
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
      <TopicModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        onSubmit={handleCreateTopic}
        title="Create Topic"
        submitLabel="Create"
        formData={formData}
        setFormData={setFormData}
        loading={createLoading}
      />
      {/* Edit Modal */}
      <TopicModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTopic(null);
          resetForm();
        }}
        onSubmit={handleEditTopic}
        title="Edit Topic"
        submitLabel="Update"
        formData={formData}
        setFormData={setFormData}
        loading={editLoading}
      />
    </div>
  );
};

export default TopicsTab;
