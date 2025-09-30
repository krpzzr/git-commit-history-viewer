'use client';

interface SearchButtonProps {
  pending?: boolean; // controls spinner/text only
  className?: string;
  disabled?: boolean; // prevents click but does not change text/color
}

export function SearchButton({ pending = false, className = '', disabled = false }: SearchButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-md border
        transition-all duration-200 ease-in-out hover:cursor-pointer
        ${pending 
          ? 'bg-white border-black/[.08] text-black disabled:opacity-70 cursor-not-allowed' 
          : 'bg-white border-black/[.08] hover:bg-black/[.02] hover:border-black/[.12] text-black dark:bg-white/[.03] dark:border-white/[.145] dark:hover:bg-white/[.06] dark:hover:border-white/[.2] dark:text-white'
        }
        ${className}
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
          Searching...
        </>
      ) : (
        'Search'
      )}
    </button>
  );
}
