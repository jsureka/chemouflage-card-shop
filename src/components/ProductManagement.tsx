
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Package, DollarSign, Tag, Archive } from 'lucide-react';

const ProductManagement = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    discount_percentage: '',
    category: '',
    stock_quantity: '',
    is_active: true,
    image_url: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      discount_percentage: '',
      category: '',
      stock_quantity: '',
      is_active: true,
      image_url: ''
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        image_url: formData.image_url || null
      };

      await createProduct(productData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating product:', error);
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
      image_url: product.image_url || ''
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
        image_url: formData.image_url || null
      };

      await updateProduct(editingProduct.id, updates);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
  };

  const ProductForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Product Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="bg-slate-700 border-teal-500/30 text-white"
            placeholder="Enter product name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger className="bg-slate-700 border-teal-500/30 text-white">
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
        <Label className="text-white">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="bg-slate-700 border-teal-500/30 text-white"
          placeholder="Enter product description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Current Price (৳)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            className="bg-slate-700 border-teal-500/30 text-white"
            placeholder="199.00"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Original Price (৳)</Label>
          <Input
            type="number"
            value={formData.original_price}
            onChange={(e) => handleInputChange('original_price', e.target.value)}
            className="bg-slate-700 border-teal-500/30 text-white"
            placeholder="299.00"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Discount (%)</Label>
          <Input
            type="number"
            value={formData.discount_percentage}
            onChange={(e) => handleInputChange('discount_percentage', e.target.value)}
            className="bg-slate-700 border-teal-500/30 text-white"
            placeholder="33"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white">Stock Quantity</Label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
            className="bg-slate-700 border-teal-500/30 text-white"
            placeholder="100"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white">Status</Label>
          <Select value={formData.is_active.toString()} onValueChange={(value) => handleInputChange('is_active', value === 'true')}>
            <SelectTrigger className="bg-slate-700 border-teal-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Image URL (Optional)</Label>
        <Input
          value={formData.image_url}
          onChange={(e) => handleInputChange('image_url', e.target.value)}
          className="bg-slate-700 border-teal-500/30 text-white"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false);
            } else {
              setIsCreateDialogOpen(false);
            }
            resetForm();
          }}
          className="text-white border-teal-500/30"
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleUpdate : handleCreate}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
        >
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-white">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Management</h2>
          <p className="text-gray-300">Manage your product catalog, pricing, and inventory</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-teal-500/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription className="text-gray-300">
                Add a new product to your catalog
              </DialogDescription>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                <Badge className={product.is_active ? 'bg-emerald-600' : 'bg-gray-600'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription className="text-gray-300 line-clamp-2">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-300">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ৳{product.price}
                </div>
                <div className="flex items-center text-gray-300">
                  <Tag className="w-4 h-4 mr-1" />
                  {product.discount_percentage}% OFF
                </div>
                <div className="flex items-center text-gray-300">
                  <Package className="w-4 h-4 mr-1" />
                  Stock: {product.stock_quantity}
                </div>
                <div className="flex items-center text-gray-300">
                  <Archive className="w-4 h-4 mr-1" />
                  {product.category}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  className="flex-1 text-white border-teal-500/30 hover:bg-teal-900/50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 text-red-400 border-red-500/30 hover:bg-red-900/50"
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
        <DialogContent className="bg-slate-800 border-teal-500/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update product information and pricing
            </DialogDescription>
          </DialogHeader>
          <ProductForm isEdit={true} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
