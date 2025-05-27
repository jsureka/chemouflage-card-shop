
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: number;
}

export const Notice = () => {
  const [dismissedNotices, setDismissedNotices] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('dismissedNotices');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: notices = [] } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as Notice[];
    },
  });

  const activeNotices = notices.filter(notice => !dismissedNotices.includes(notice.id));

  const dismissNotice = (noticeId: string) => {
    const newDismissed = [...dismissedNotices, noticeId];
    setDismissedNotices(newDismissed);
    localStorage.setItem('dismissedNotices', JSON.stringify(newDismissed));
  };

  if (activeNotices.length === 0) return null;

  return (
    <div className="space-y-2">
      {activeNotices.map((notice) => (
        <Alert key={notice.id} className="relative">
          <AlertDescription className="pr-8">
            <div className="font-semibold">{notice.title}</div>
            <div>{notice.content}</div>
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => dismissNotice(notice.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  );
};
