
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Edit, Mail } from 'lucide-react';

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  html_content: string;
  variables: any;
  is_active: boolean;
}

export const EmailManager = () => {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    html_content: ''
  });

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_name');
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('email_templates')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Email template updated successfully');
      setEditingTemplate(null);
    },
    onError: (error: any) => {
      toast.error('Failed to update template: ' + error.message);
    }
  });

  const startEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      subject: template.subject,
      html_content: template.html_content
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Manage email templates for notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {editingTemplate ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Editing: {editingTemplate.template_name}</h3>
              </div>
              <Input
                placeholder="Email subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
              <Textarea
                placeholder="Email HTML content (use {{variable}} for dynamic content)"
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                rows={10}
                required
              />
              <div className="text-sm text-gray-600">
                Available variables: {JSON.stringify(editingTemplate.variables, null, 2)}
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  Update Template
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingTemplate(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold capitalize">{template.template_name.replace('_', ' ')}</h3>
                        <p className="text-sm text-gray-600 mt-1">Subject: {template.subject}</p>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <div dangerouslySetInnerHTML={{ __html: template.html_content.substring(0, 100) + '...' }} />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
