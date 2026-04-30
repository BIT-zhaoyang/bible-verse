type ShareButtonsProps = {
  title: string;
  url: string;
};

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const items = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          Share on {item.label}
        </a>
      ))}
    </div>
  );
}
