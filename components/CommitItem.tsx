'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

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
      return formatDistanceToNow(new Date(iso), { addSuffix: true });
    } catch {
      return iso;
    }
  };

  const authorName = commit.commit.author?.name ?? commit.author?.login ?? "Unknown";
  const messageFirstLine = commit.commit.message.split("\n")[0];

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
        <span>{authorName}</span>
        <span>•</span>
        <span>{formatDate(commit.commit.author.date)}</span>
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
