import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = process.env.GITHUB_TOKEN || '';
  
  if (!token) {
    return NextResponse.json(
      { error: 'GitHub token not configured.' },
      { status: 401 }
    );
  }
  
  console.log('API: Fetching commits from repo: krpzzr/git-commit-history-viewer');

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));

  const url = `https://api.github.com/repos/krpzzr/git-commit-history-viewer/commits?sha=main&per_page=${perPage}&page=${page}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": `Bearer ${token}`
      },
      // Cache GitHub response briefly and tag it for revalidation
      next: { revalidate: 300, tags: ['commits'] },
    });

    console.log('API: Response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API: Error response body:', errorBody);
      
      // Специальная обработка для ошибок авторизации
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'GitHub authorization error.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `GitHub API error: ${response.status} - ${response.statusText}` },
        { status: response.status }
      );
    }

    const link = response.headers.get('link') || '';
    const hasNextPage = /<([^>]+)>; rel="next"/.test(link);

    const commits = await response.json();
    console.log(`API: Successfully fetched ${commits.length} commits (page ${page})`);
    return NextResponse.json(
      { commits, page, per_page: perPage, hasNextPage },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (error) {
    console.error('API: Fetch error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
