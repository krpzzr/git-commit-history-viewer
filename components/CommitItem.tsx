'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';

import { GitHubCommit } from '@/types';

type RootElementTag = 'li' | 'div';

interface CommitItemProps {
  commit: GitHubCommit;
  className?: string;
  style?: React.CSSProperties;
  as?: RootElementTag;
}

export function CommitItem({ commit, className, style, as = 'li' }: CommitItemProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (iso: string): string => {
    try {
      return formatDistanceToNowStrict(new Date(iso), {
        addSuffix: true,
        roundingMethod: 'floor',
      });
    } catch {
      return iso;
    }
  };

  const authorName = commit.commit.author?.name ?? commit.author?.login ?? "Unknown";
  const avatarUrl = commit.author?.avatar_url ?? undefined;
  const messageFirstLine = commit.commit.message.split("\n")[0];

  // Prefer committer date if available (closer to GitHub UI), fallback to author date
  const displayIso = (commit as any)?.commit?.committer?.date || commit.commit.author.date;

  const Element = as as any;

  return (
    <Element className={`p-4 flex flex-col gap-1 ${className ?? ''}`.trim()} style={style}>
      <div className="flex items-center justify-between gap-3">
        <a
          href={commit.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          {messageFirstLine}
        </a>
        <code className="text-xs bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded">
          {commit.sha.substring(0, 7)}
        </code>
      </div>
      <div className="text-xs text-black/70 dark:text-white/70 flex items-center gap-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={commit.author?.login || authorName}
            className="h-4 w-4 rounded-full border border-black/[.08] dark:border-white/[.145]"
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <span>{authorName}</span>
        <span>•</span>
        <span>{formatDate(displayIso)}</span>
        {commit.author?.login ? (
          <a
            href={commit.author.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            @{commit.author.login}
          </a>
        ) : null}
      </div>
    </Element>
  );
}
