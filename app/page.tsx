'use client';

import { useState, useEffect } from 'react';
import { CommitItem } from '../components/CommitItem';
import { RefreshButton } from '../components/RefreshButton';

import { GitHubCommit } from '@/types';

async function fetchCommits(): Promise<GitHubCommit[]> {
  try {
    const response = await fetch('/api/commits', {
      cache: 'force-cache',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.commits || [];

  } catch (error) {
    console.error('Client fetch error:', error);
    throw error;
  }
}

export default function Home() {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    async function loadInitialData() {
      try {
        const initialCommits = await fetchCommits();
        setCommits(initialCommits);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage((error as Error).message);
      } finally {
        setIsInitialLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Handle refresh
  const handleRefresh = (newCommits: GitHubCommit[], error?: string) => {
    if (error) {
      setErrorMessage(error);
      setCommits([]);
    } else {
      setCommits(newCommits);
      setErrorMessage(null);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="font-sans min-h-screen p-8 sm:p-20">
        <main className="flex flex-col gap-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold tracking-[-.01em]">Commit history (main)</h1>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
              <svg 
                className="animate-spin h-4 w-4" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading commits...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <main className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-[-.01em]">Commit history (main)</h1>
          <RefreshButton onRefresh={handleRefresh} />
        </div>

        {errorMessage ? (
          <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-4 text-sm">
            Failed to load commits. {errorMessage}
          </div>
        ) : commits.length === 0 ? (
          <div className="text-sm text-black/70 dark:text-white/70">No commits found.</div>
        ) : (
          <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145] bg-black/[.02] dark:bg-white/[.03] rounded-lg border border-black/[.08] dark:border-white/[.145]">
            {commits.map((commit) => (
              <CommitItem key={commit.sha} commit={commit} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
