
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ProductSettings {
  id: string;
  product_name: string;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  delivery_charge: number;
  is_active: boolean;
}

export const ProductManager = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    current_price: 0,
    original_price: 0,
    discount_percentage: 0,
    delivery_charge: 0
  });

  const queryClient = useQueryClient();

  const { data: productSettings } = useQuery({
    queryKey: ['product-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_settings')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as ProductSettings;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!productSettings) return;
      
      const { error } = await supabase
        .from('product_settings')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', productSettings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-settings'] });
      toast.success('Product settings updated successfully');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update product settings: ' + error.message);
    }
  });

  const startEdit = () => {
    if (productSettings) {
      setFormData({
        product_name: productSettings.product_name,
        current_price: productSettings.current_price,
        original_price: productSettings.original_price,
        discount_percentage: productSettings.discount_percentage,
        delivery_charge: productSettings.delivery_charge
      });
      setIsEditing(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!productSettings) {
    return <div>Loading product settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Settings</CardTitle>
          <CardDescription>Manage product pricing and delivery charges</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <p className="text-lg">{productSettings.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Current Price</label>
                  <p className="text-lg font-bold text-green-600">৳{productSettings.current_price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Original Price</label>
                  <p className="text-lg line-through text-gray-500">৳{productSettings.original_price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Discount</label>
                  <p className="text-lg text-red-600">{productSettings.discount_percentage}% OFF</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Delivery Charge</label>
                  <p className="text-lg">৳{productSettings.delivery_charge}</p>
                </div>
              </div>
              <Button onClick={startEdit}>Edit Product Settings</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Product name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Current price"
                  value={formData.current_price}
                  onChange={(e) => setFormData({ ...formData, current_price: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Original price"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Discount percentage"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                  required
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Delivery charge"
                  value={formData.delivery_charge}
                  onChange={(e) => setFormData({ ...formData, delivery_charge: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  Update Settings
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
