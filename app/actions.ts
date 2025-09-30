'use server';

import { GitHubCommit } from "@/types";

export async function refreshCommits(): Promise<{ commits: GitHubCommit[]; error?: string }> {
  const token = process.env.GITHUB_TOKEN || '';
  
  if (!token) {
    return {
      commits: [],
      error: 'GitHub token not configured.'
    };
  }
  
  console.log('Refreshing commits from repo: krpzzr/git-commit-history-viewer');

  const url = "https://api.github.com/repos/krpzzr/git-commit-history-viewer/commits?sha=main&per_page=20";
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": `Bearer ${token}`
      },
      // Remove cache to get fresh data
      cache: 'no-store',
    });

    console.log('Refresh response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Refresh error response body:', errorBody);
      
      if (response.status === 401) {
        return {
          commits: [],
          error: 'GitHub authorization error.'
        };
      }
      
      return {
        commits: [],
        error: `GitHub API error: ${response.status} - ${response.statusText}`
      };
    }

    const commits = await response.json();
    console.log(`Successfully refreshed ${commits.length} commits`);
    return { commits };

  } catch (error) {
    console.error('Refresh fetch error:', error);
    return {
      commits: [],
      error: (error as Error).message
    };
  }
}
