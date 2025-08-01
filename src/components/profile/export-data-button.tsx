'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useExportDataMutation } from '@/hooks/mutations';
import { Download, Loader2 } from 'lucide-react';

interface ExportDataButtonProps {
  userId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

/**
 * Component for exporting user data
 * Handles the export process with loading states and user feedback
 */
export function ExportDataButton({
  userId,
  variant = 'ghost',
  size = 'sm',
  className = '',
  showText = false,
}: ExportDataButtonProps) {
  const { toast } = useToast();
  const exportMutation = useExportDataMutation();

  const handleExport = () => {
    exportMutation.mutate(userId, {
      onSuccess: () => {
        toast({
          title: 'Export Started',
          description: "Your data export has been queued. You'll receive an email when it's ready.",
        });
      },
      onError: (error) => {
        toast({
          title: 'Export Failed',
          description: `Unable to start data export: ${error.message}`,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={exportMutation.isPending}
      className={className}
    >
      {exportMutation.isPending ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Download className='h-4 w-4' />
      )}
      {showText && (
        <span className='ml-2'>{exportMutation.isPending ? 'Exporting...' : 'Export Data'}</span>
      )}
    </Button>
  );
}
