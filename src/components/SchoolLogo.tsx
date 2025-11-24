"use client";

interface SchoolLogoProps {
  name: string;
  url: string;
  logo: string;
}

export function SchoolLogo({ name, url, logo }: SchoolLogoProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group shrink-0 w-56 h-32 bg-white dark:bg-[#112a60]/50 rounded-3xl flex items-center justify-center p-8 border-2 border-gray-100 dark:border-[#a5dce2]/10 hover:border-[#f67a19] hover:shadow-xl hover:shadow-[#f67a19]/10 transition-all duration-300 hover:-translate-y-1"
    >
      <img 
        src={logo} 
        alt={name}
        className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
        onError={(e) => {
          // Fallback if image doesn't exist
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="text-center"><div class="text-5xl mb-2">🎓</div><p class="text-xs font-bold text-[#112a60] dark:text-white">${name}</p></div>`;
          }
        }}
      />
    </a>
  );
}
