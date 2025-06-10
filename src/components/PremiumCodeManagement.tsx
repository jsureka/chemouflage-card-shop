import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ModernPagination from "@/components/ui/ModernPagination";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PaginationMetadata } from "@/services";
import {
  PremiumCode,
  PremiumCodeBind,
  PremiumCodeCreate,
  PremiumCodeGenerate,
  premiumCodesService,
  PremiumCodeStats,
} from "@/services/premiumCodes";
import {
  Activity,
  BarChart3,
  Gift,
  Plus,
  RefreshCw,
  Trash2,
  User,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";

const PremiumCodeManagement = () => {
  const [codes, setCodes] = useState<PremiumCode[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [stats, setStats] = useState<PremiumCodeStats>({
    total_codes: 0,
    active_codes: 0,
    bound_codes: 0,
    unbound_codes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isBindDialogOpen, setIsBindDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PremiumCode | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [filterBoundOnly, setFilterBoundOnly] = useState(false);
  const { toast } = useToast();

  // Form states
  const [createForm, setCreateForm] = useState<PremiumCodeCreate>({
    description: "",
    is_active: true,
    usage_limit: undefined,
    expires_at: "",
  });

  const [generateForm, setGenerateForm] = useState<PremiumCodeGenerate>({
    count: 1,
    description: "",
    usage_limit: undefined,
    expires_at: "",
  });

  const [bindForm, setBindForm] = useState<PremiumCodeBind>({
    user_email: "",
  });
  useEffect(() => {
    fetchData();
  }, [currentPage, filterActiveOnly, filterBoundOnly]);

  const fetchData = async (page: number = currentPage) => {
    try {
      setLoading(true);

      // Fetch codes and stats in parallel
      const [codesResponse, statsResponse] = await Promise.all([
        premiumCodesService.getPremiumCodes(
          page,
          20,
          filterActiveOnly,
          filterBoundOnly
        ),
        premiumCodesService.getPremiumCodeStats(),
      ]);

      if (codesResponse.error) {
        throw new Error(codesResponse.error);
      }

      if (statsResponse.error) {
        throw new Error(statsResponse.error);
      }

      if (codesResponse.data) {
        setCodes(codesResponse.data.data || []);
        setPagination(codesResponse.data.pagination);
      } else {
        setCodes([]);
        setPagination(null);
      }
      setStats(statsResponse.data || stats);
    } catch (error) {
      console.error("Error fetching premium codes data:", error);
      toast({
        title: "Error",
        description: "Failed to load premium codes data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await premiumCodesService.createPremiumCode(createForm);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Premium code created successfully",
      });
      setIsCreateDialogOpen(false);
      resetCreateForm();
      await fetchData(1); // Reset to first page after creation
    } catch (error) {
      console.error("Error creating premium code:", error);
      toast({
        title: "Error",
        description: "Failed to create premium code",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    try {
      if (generateForm.count < 1 || generateForm.count > 100) {
        toast({
          title: "Error",
          description: "Count must be between 1 and 100",
          variant: "destructive",
        });
        return;
      }

      const response = await premiumCodesService.generatePremiumCodes(
        generateForm
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `Generated ${generateForm.count} premium codes successfully`,
      });
      setIsGenerateDialogOpen(false);
      resetGenerateForm();
      await fetchData(1); // Reset to first page after generation
    } catch (error) {
      console.error("Error generating premium codes:", error);
      toast({
        title: "Error",
        description: "Failed to generate premium codes",
        variant: "destructive",
      });
    }
  };

  const handleBind = async () => {
    if (!selectedCode) return;

    try {
      const response = await premiumCodesService.bindPremiumCode(
        selectedCode.id,
        bindForm
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Premium code bound to user successfully",
      });
      setIsBindDialogOpen(false);
      setSelectedCode(null);
      resetBindForm();
      await fetchData(); // Refresh current page
    } catch (error) {
      console.error("Error binding premium code:", error);
      toast({
        title: "Error",
        description: "Failed to bind premium code",
        variant: "destructive",
      });
    }
  };

  const handleUnbind = async (code: PremiumCode) => {
    try {
      const response = await premiumCodesService.unbindPremiumCode(code.id);

      if (response.error) {
        throw new Error(response.error);
      }
      toast({
        title: "Success",
        description: "Premium code unbound successfully",
      });

      await fetchData(); // Refresh current page
    } catch (error) {
      console.error("Error unbinding premium code:", error);
      toast({
        title: "Error",
        description: "Failed to unbind premium code",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (codeId: string) => {
    if (!confirm("Are you sure you want to delete this premium code?")) {
      return;
    }

    try {
      const response = await premiumCodesService.deletePremiumCode(codeId);

      if (response.error) {
        throw new Error(response.error);
      }
      toast({
        title: "Success",
        description: "Premium code deleted successfully",
      });

      await fetchData(); // Refresh current page
    } catch (error) {
      console.error("Error deleting premium code:", error);
      toast({
        title: "Error",
        description: "Failed to delete premium code",
        variant: "destructive",
      });
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      description: "",
      is_active: true,
      usage_limit: undefined,
      expires_at: "",
    });
  };

  const resetGenerateForm = () => {
    setGenerateForm({
      count: 1,
      description: "",
      usage_limit: undefined,
      expires_at: "",
    });
  };

  const resetBindForm = () => {
    setBindForm({
      user_email: "",
    });
  };
  const openBindDialog = (code: PremiumCode) => {
    setSelectedCode(code);
    setIsBindDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-foreground">Loading premium codes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Premium Code Management
          </h2>
          <p className="text-muted-foreground">
            Create, manage, and track premium access codes
          </p>
        </div>{" "}
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setFilterActiveOnly(!filterActiveOnly);
              setCurrentPage(1);
            }}
            variant={filterActiveOnly ? "default" : "outline"}
            size="sm"
          >
            Active Only
          </Button>
          <Button
            onClick={() => {
              setFilterBoundOnly(!filterBoundOnly);
              setCurrentPage(1);
            }}
            variant={filterBoundOnly ? "default" : "outline"}
            size="sm"
          >
            Bound Only
          </Button>
          <Button onClick={() => fetchData()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-background/80 backdrop-blur-lg border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Codes</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total_codes}
                </p>
              </div>
              <Gift className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-lg border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Codes</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.active_codes}
                </p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-lg border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Bound Codes</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.bound_codes}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-lg border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Available Codes</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.unbound_codes}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Single Code
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle>Create Premium Code</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a single premium access code
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">
                  Description (Optional)
                </Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="Enter code description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">
                  Usage Limit (Optional)
                </Label>
                <Input
                  type="number"
                  value={createForm.usage_limit || ""}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      usage_limit: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">
                  Expiry Date (Optional)
                </Label>
                <Input
                  type="datetime-local"
                  value={createForm.expires_at}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, expires_at: e.target.value })
                  }
                  className="bg-background border-border text-foreground"
                />
              </div>{" "}
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetCreateForm();
                  }}
                  variant="outline"
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Code</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isGenerateDialogOpen}
          onOpenChange={setIsGenerateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Bulk Codes
            </Button>
          </DialogTrigger>{" "}
          <DialogContent className="bg-background border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Premium Codes</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Generate multiple premium codes at once (max 100)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Number of Codes</Label>
                <Input
                  type="number"
                  value={generateForm.count}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      count: parseInt(e.target.value) || 1,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">
                  Description (Optional)
                </Label>
                <Textarea
                  value={generateForm.description}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="Enter description for all codes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">
                  Usage Limit (Optional)
                </Label>
                <Input
                  type="number"
                  value={generateForm.usage_limit || ""}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      usage_limit: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="bg-background border-border text-foreground"
                  placeholder="Unlimited"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">
                  Expiry Date (Optional)
                </Label>
                <Input
                  type="datetime-local"
                  value={generateForm.expires_at}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      expires_at: e.target.value,
                    })
                  }
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setIsGenerateDialogOpen(false);
                    resetGenerateForm();
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={handleGenerate}>Generate Codes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>{" "}
      {/* Premium Codes List */}
      <div className="grid gap-4">
        <Card className="bg-background/80 backdrop-blur-lg border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Premium Codes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage all premium access codes and their bindings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {codes.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No premium codes found
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Create your first premium code to get started
                  </p>
                </div>
              ) : (
                codes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-border"
                  >
                    {" "}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <code className="text-lg font-mono font-bold text-foreground bg-background/80 px-3 py-1 rounded">
                          {code.code}
                        </code>
                        <Badge
                          className={code.is_active ? "bg-primary" : "bg-muted"}
                        >
                          {code.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {code.bound_user_email && (
                          <Badge className="bg-primary">
                            Bound to {code.bound_user_email}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="text-muted-foreground">Usage:</span>{" "}
                          {code.used_count}/{code.usage_limit || "∞"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Created:
                          </span>{" "}
                          {formatDate(code.created_at)}
                        </div>
                        {code.expires_at && (
                          <div>
                            <span className="text-muted-foreground">
                              Expires:
                            </span>{" "}
                            {formatDate(code.expires_at)}
                          </div>
                        )}
                        {code.description && (
                          <div className="col-span-2 md:col-span-1">
                            <span className="text-muted-foreground">
                              Description:
                            </span>{" "}
                            {code.description}
                          </div>
                        )}
                      </div>
                    </div>{" "}
                    <div className="flex space-x-2">
                      {code.bound_user_email ? (
                        <Button
                          onClick={() => handleUnbind(code)}
                          variant="outline"
                          size="sm"
                          className="border-border"
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Unbind
                        </Button>
                      ) : (
                        <Button
                          onClick={() => openBindDialog(code)}
                          variant="outline"
                          size="sm"
                          className="border-border"
                        >
                          <User className="w-4 h-4 mr-1" />
                          Bind
                        </Button>
                      )}{" "}
                      <Button
                        onClick={() => handleDelete(code.id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>{" "}
        {/* Pagination Controls */}
        {pagination && pagination.total_pages > 1 && (
          <ModernPagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            hasNext={pagination.has_next}
            hasPrevious={pagination.has_previous}
            totalItems={pagination.total_items}
            pageSize={pagination.page_size}
            onPageChange={handlePageChange}
          />
        )}
      </div>{" "}
      {/* Bind Code Dialog */}
      <Dialog open={isBindDialogOpen} onOpenChange={setIsBindDialogOpen}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Bind Premium Code</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Bind code "{selectedCode?.code}" to a specific user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">User Email</Label>
              <Input
                type="email"
                value={bindForm.user_email}
                onChange={(e) =>
                  setBindForm({ ...bindForm, user_email: e.target.value })
                }
                className="bg-background border-border text-foreground"
                placeholder="Enter user email..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setIsBindDialogOpen(false);
                  setSelectedCode(null);
                  resetBindForm();
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleBind} disabled={!bindForm.user_email}>
                Bind Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumCodeManagement;
