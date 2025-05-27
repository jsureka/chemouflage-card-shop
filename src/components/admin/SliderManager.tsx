
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface SliderImage {
  id: string;
  title: string;
  image_url: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

export const SliderManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingImage, setEditingImage] = useState<SliderImage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    description: '',
    order_index: 0,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: images = [] } = useQuery({
    queryKey: ['admin-slider-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as SliderImage[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('slider_images')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slider-images'] });
      queryClient.invalidateQueries({ queryKey: ['slider-images'] });
      toast.success('Slider image created successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to create slider image: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('slider_images')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slider-images'] });
      queryClient.invalidateQueries({ queryKey: ['slider-images'] });
      toast.success('Slider image updated successfully');
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to update slider image: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('slider_images')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slider-images'] });
      queryClient.invalidateQueries({ queryKey: ['slider-images'] });
      toast.success('Slider image deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete slider image: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({ title: '', image_url: '', description: '', order_index: 0, is_active: true });
    setIsCreating(false);
    setEditingImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingImage) {
      updateMutation.mutate({ id: editingImage.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (image: SliderImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      image_url: image.image_url,
      description: image.description,
      order_index: image.order_index,
      is_active: image.is_active
    });
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Slider Images</CardTitle>
          <CardDescription>Update the hero slider images on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsCreating(true)} className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Slider Image
          </Button>

          {isCreating && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
              <Input
                placeholder="Image title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                required
              />
              <Textarea
                placeholder="Image description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Order index"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingImage ? 'Update' : 'Create'} Image
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id}>
                <CardContent className="pt-4">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold">{image.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{image.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Order: {image.order_index}</span>
                    <span className={image.is_active ? 'text-green-600' : 'text-red-600'}>
                      {image.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(image)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
