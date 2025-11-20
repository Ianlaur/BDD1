"use client";

interface WebsiteLinkProps {
  href: string;
  className?: string;
  title?: string;
}

export function WebsiteLink({ href, className, title }: WebsiteLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={className}
      title={title}
    >
      🔗
    </a>
  );
}
