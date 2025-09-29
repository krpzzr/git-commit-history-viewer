import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

type GitHubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
};


async function fetchCommits(): Promise<GitHubCommit[]> {
  const token = process.env.GITHUB_TOKEN || '';
  
  console.log('Fetching commits from repo: krpzzr/git-commit-history-viewer');

  const url = "https://api.github.com/repos/krpzzr/git-commit-history-viewer/commits?sha=main&per_page=20";
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": `Bearer ${token}`
      },
      next: { revalidate: 300 },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
    }

    const commits = await response.json();
    console.log(`Successfully fetched ${commits.length} commits`);
    return commits;

  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

function formatDate(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { 
      addSuffix: true, 
      locale: enUS 
    });
  } catch {
    return iso;
  }
}

export default async function Home() {
  let commits: GitHubCommit[] = [];
  let errorMessage: string | null = null;

  try {
    commits = await fetchCommits();
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <main className="flex flex-col gap-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-[-.01em]">Commit history (main)</h1>

        {errorMessage ? (
          <div className="rounded-md border border-black/[.08] dark:border-white/[.145] p-4 text-sm">
            Failed to load commits. {errorMessage}
          </div>
        ) : commits.length === 0 ? (
          <div className="text-sm text-black/70 dark:text-white/70">No commits found.</div>
        ) : (
          <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145] bg-black/[.02] dark:bg-white/[.03] rounded-lg border border-black/[.08] dark:border-white/[.145]">
            {commits.map((c) => {
              const authorName = c.commit.author?.name ?? c.author?.login ?? "Unknown";
              const messageFirstLine = c.commit.message.split("\n")[0];
              return (
                <li key={c.sha} className="p-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {messageFirstLine}
                    </a>
                    <code className="text-xs bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded">
                      {c.sha.substring(0, 7)}
                    </code>
                  </div>
                  <div className="text-xs text-black/70 dark:text-white/70 flex items-center gap-2">
                    <span>{authorName}</span>
                    <span>•</span>
                    <span>{formatDate(c.commit.author.date)}</span>
                    {c.author?.login ? (
                      <a
                        href={c.author.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        @{c.author.login}
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
