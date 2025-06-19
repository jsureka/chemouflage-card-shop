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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { useProducts } from "@/contexts/ProductsContext";
import { useToast } from "@/hooks/use-toast";
import {
  Archive,
  DollarSign,
  Edit,
  Package,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

// Move ProductForm outside to prevent recreation on every render
interface ProductFormProps {
  formData: {
    name: string;
    description: string;
    price: string;
    original_price: string;
    discount_percentage: string;
    category: string;
    stock_quantity: string;
    is_active: boolean;
    image_url: string;
  };
  isEdit?: boolean;
  onInputChange: (field: string, value: any) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const ProductForm = React.memo<ProductFormProps>(
  ({ formData, isEdit = false, onInputChange, onCancel, onSubmit }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Product Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="Enter product name"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => onInputChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Physical">Physical</SelectItem>
              <SelectItem value="Bundle">Bundle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Enter product description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Current Price (৳)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => onInputChange("price", e.target.value)}
            placeholder="199.00"
          />
        </div>
        <div className="space-y-2">
          <Label>Original Price (৳)</Label>
          <Input
            type="number"
            value={formData.original_price}
            onChange={(e) => onInputChange("original_price", e.target.value)}
            placeholder="299.00"
          />
        </div>
        <div className="space-y-2">
          <Label>Discount (%)</Label>
          <Input
            type="number"
            value={formData.discount_percentage}
            onChange={(e) =>
              onInputChange("discount_percentage", e.target.value)
            }
            placeholder="33"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Stock Quantity</Label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => onInputChange("stock_quantity", e.target.value)}
            placeholder="100"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.is_active.toString()}
            onValueChange={(value) =>
              onInputChange("is_active", value === "true")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>      </div>

      <ImageUpload
        onImageUpload={(imageUrl) => onInputChange("image_url", imageUrl)}
        currentImageUrl={formData.image_url}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  )
);

const ProductManagement = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } =
    useProducts();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    discount_percentage: "",
    category: "",
    stock_quantity: "",
    is_active: true,
    image_url: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      original_price: "",
      discount_percentage: "",
      category: "",
      stock_quantity: "",
      is_active: true,
      image_url: "",
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: parseFloat(formData.original_price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        category: formData.category,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        image_url: formData.image_url || null,
      };

      await createProduct(productData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      original_price: product.original_price.toString(),
      discount_percentage: product.discount_percentage.toString(),
      category: product.category,
      stock_quantity: product.stock_quantity.toString(),
      is_active: product.is_active,
      image_url: product.image_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: parseFloat(formData.original_price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        category: formData.category,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        image_url: formData.image_url || null,
      };

      await updateProduct(editingProduct.id, updates);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };
  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId);
    }
  };

  if (loading) {
    return <div className="text-white">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Product Management
          </h2>
          <p className="text-muted-foreground">
            Manage your product catalog, pricing, and inventory
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="border-primary/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your catalog
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              formData={formData}
              onInputChange={handleInputChange}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
              onSubmit={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">        {products.map((product) => (
          <Card key={product.id} className="backdrop-blur-lg border-primary/30">
            {product.image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {product.description}
              </CardDescription>
            </CardHeader>{" "}
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-1" />৳{product.price}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Tag className="w-4 h-4 mr-1" />
                  {product.discount_percentage}% OFF
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Package className="w-4 h-4 mr-1" />
                  Stock: {product.stock_quantity}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Archive className="w-4 h-4 mr-1" />
                  {product.category}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="text-red-500 border-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-primary/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information and pricing
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            isEdit={true}
            formData={formData}
            onInputChange={handleInputChange}
            onCancel={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}
            onSubmit={handleUpdate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
