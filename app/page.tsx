import { CommitItem } from '../components/CommitItem';
import { GitHubCommit } from '@/types';


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
            {commits.map((commit) => (
              <CommitItem key={commit.sha} commit={commit} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
