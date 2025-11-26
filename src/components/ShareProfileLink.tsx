"use client";

import { useEffect, useState } from "react";

type ShareProfileLinkProps = {
  userId: string;
  className?: string;
};

export default function ShareProfileLink({
  userId,
  className,
}: ShareProfileLinkProps) {
  const [copied, setCopied] = useState(false);
  const [profileUrl, setProfileUrl] = useState(`/members/${userId}`);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProfileUrl(`${window.location.origin}/members/${userId}`);
  }, [userId]);

  async function handleCopy() {
    const valueToCopy = profileUrl || `/members/${userId}`;
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy profile link", error);
    }
  }

  if (!userId) {
    return null;
  }

  return (
    <div className={className}>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Lien de profil public
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={profileUrl}
          className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/40 text-sm font-mono text-gray-700 dark:text-gray-200"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition"
        >
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
    </div>
  );
}

