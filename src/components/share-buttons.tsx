import { MessageCircle, Send, Share2, ThumbsUp } from "lucide-react";

import { Button } from "./ui/button";

type ShareButtonsProps = {
  title: string;
  url: string;
  compact?: boolean;
};

export function ShareButtons({ title, url, compact = false }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const items = [
    {
      label: "Facebook",
      icon: ThumbsUp,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      icon: Send,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <Button
          key={item.label}
          variant={compact ? "secondary" : "soft"}
          size={compact ? "sm" : "default"}
          asChild
        >
          <a href={item.href} target="_blank" rel="noreferrer">
            <item.icon className="h-4 w-4" />
            {compact ? item.label : `Share this verse on ${item.label}`}
          </a>
        </Button>
      ))}
      {!compact ? (
        <Button variant="default" size="default" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <Share2 className="h-4 w-4" />
            Share this verse
          </a>
        </Button>
      ) : null}
    </div>
  );
}
