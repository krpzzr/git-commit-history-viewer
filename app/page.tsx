'use client';

import React, { useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { CommitItem } from '../components/CommitItem';
import { RefreshButton } from '../components/RefreshButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { SearchButton } from '../components/SearchButton';

import { GitHubCommit } from '@/types';

type CommitsResponse = {
  commits: GitHubCommit[];
  page: number;
  per_page: number;
  hasNextPage: boolean;
};

async function fetchCommits(page = 1, perPage = 20): Promise<CommitsResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const response = await fetch(`/api/commits?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data as CommitsResponse;
}

async function searchCommits(query: string, page = 1, perPage = 20): Promise<CommitsResponse> {
  const params = new URLSearchParams({ q: query, page: String(page), per_page: String(perPage) });
  const response = await fetch(`/api/commits/search?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data as CommitsResponse;
}

export default function Home() {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchSubmitting, setIsSearchSubmitting] = useState(false);

  const PER_PAGE = 20;

  // Initial data fetch
  useEffect(() => {
    async function loadInitialData() {
      try {
        const initial = await fetchCommits(1, PER_PAGE);
        setCommits(initial.commits);
        setHasNextPage(initial.hasNextPage);
        setPage(1);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage((error as Error).message);
      } finally {
        setIsInitialLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Handle refresh: reset to page 1 and re-read pagination from API
  const handleRefresh = async (newCommits: GitHubCommit[], error?: string) => {
    if (error) {
      setErrorMessage(error);
      setCommits([]);
      setHasNextPage(false);
      setPage(1);
      return;
    }

    try {
      setQuery(''); // leave search mode
      setIsSearching(false);
      setCommits(newCommits);
      setErrorMessage(null);
      setPage(1);
      setHasNextPage(newCommits.length >= PER_PAGE);

      const fresh = await fetchCommits(1, PER_PAGE);
      setCommits(fresh.commits);
      setHasNextPage(fresh.hasNextPage);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasNextPage) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = query && isSearching
        ? await searchCommits(query, nextPage, PER_PAGE)
        : await fetchCommits(nextPage, PER_PAGE);
      setCommits(prev => [...prev, ...res.commits]);
      setHasNextPage(res.hasNextPage);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
      setErrorMessage((e as Error).message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const onSubmitSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setIsSearchSubmitting(true);
    if (!q) {
      // Exit search mode → back to regular list page 1
      try {
        const first = await fetchCommits(1, PER_PAGE);
        setCommits(first.commits);
        setHasNextPage(first.hasNextPage);
        setPage(1);
        setIsSearching(false);
        setErrorMessage(null);
      } catch (err) {
        setErrorMessage((err as Error).message);
      } finally {
        setIsSearchSubmitting(false);
      }
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchCommits(q, 1, PER_PAGE);
      setCommits(result.commits);
      setHasNextPage(result.hasNextPage);
      setPage(1);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSearchSubmitting(false);
    }
  };

  const disabledControls = isInitialLoading || isSearchSubmitting;

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <main className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="self-end"><ThemeToggle /></div>

        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row">
          <h1 className="text-2xl font-semibold tracking-[-.01em]">Commit history (main)</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-end">
            <RefreshButton onRefresh={handleRefresh} disabled={disabledControls} />
          </div>
        </div>

        <form onSubmit={onSubmitSearch} className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commits by message..."
            className="flex-1 px-3 py-2 rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-white/[.03] text-sm"
            disabled={disabledControls}
          />
          <SearchButton pending={isSearchSubmitting} disabled={disabledControls} />
        </form>

        {isInitialLoading ? (
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
        ) : errorMessage ? (
          <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-4 text-sm">
            Failed to load commits. {errorMessage}
          </div>
        ) : commits.length === 0 ? (
          <div className="text-sm text-black/70 dark:text-white/70">No commits found.</div>
        ) : (
          <div className="rounded-lg border border-black/[.08] dark:border-white/[.145] bg-black/[.02] dark:bg-white/[.03]">
            <Virtuoso
              useWindowScroll
              data={commits}
              overscan={200}
              itemContent={(index, commit) => (
                <CommitItem
                  as="div"
                  commit={commit}
                  className={`${index === 0 ? '' : 'border-t border-black/[.08] dark:border-white/[.145]'}`}
                />
              )}
              components={{
                Footer: () => (
                  hasNextPage ? (
                    <div className="flex justify-center py-3">
                      <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 ease-in-out hover:cursor-pointer ${
                          isLoadingMore
                            ? 'bg-white border-black/[.08] text-black disabled:opacity-70 cursor-not-allowed'
                            : 'bg-white border-black/[.08] hover:bg-black/[.02] hover:border-black/[.12] text-black dark:bg-white/[.03] dark:border-white/[.145] dark:hover:bg-white/[.06] dark:hover:border-white/[.2] dark:text-white'
                        }`}
                      >
                        {isLoadingMore ? 'Loading…' : 'Load more'}
                      </button>
                    </div>
                  ) : null
                ),
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
