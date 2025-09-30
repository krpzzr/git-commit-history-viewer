'use client';

import { useFormStatus } from 'react-dom';
import { refreshCommits } from '../app/actions';

interface RefreshButtonProps {
  onRefresh: (commits: any[], error?: string) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-md border
        transition-all duration-200 ease-in-out hover:cursor-pointer
        ${pending 
          ? 'bg-white border-black/[.08] text-black' 
          : 'bg-white border-black/[.08] hover:bg-black/[.02] hover:border-black/[.12] text-black dark:bg-white/[.03] dark:border-white/[.145] dark:hover:bg-white/[.06] dark:hover:border-white/[.2] dark:text-white'
        }
        disabled:opacity-70 disabled:cursor-not-allowed
      `}
    >
      {pending ? (
        <>
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
          Refreshing...
        </>
      ) : (
        <>
          <svg 
            className="h-4 w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Refresh
        </>
      )}
    </button>
  );
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  async function handleRefresh(formData: FormData) {
    const result = await refreshCommits();
    onRefresh(result.commits, result.error);
  }

  return (
    <form action={handleRefresh}>
      <SubmitButton />
    </form>
  );
}
