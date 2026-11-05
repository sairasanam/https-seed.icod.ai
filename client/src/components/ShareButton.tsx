import { useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title, description, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title,
      text: description || '',
      url: url || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed — fall through to clipboard
        await copyToClipboard(shareData);
      }
    } else {
      await copyToClipboard(shareData);
    }
  };

  const copyToClipboard = async (data: { title: string; text: string; url: string }) => {
    try {
      const text = `${data.title}\n${data.text}\n${data.url}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={cn('gap-1', className)}
      data-icod-id="src_components_sharebutton_tsx_66c0">
      {copied ? (
        <>
          <Check className="h-4 w-4" data-icod-id="src_components_sharebutton_tsx_2ab3" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" data-icod-id="src_components_sharebutton_tsx_b8bc" />
          Share
        </>
      )}
    </Button>
  );
}
