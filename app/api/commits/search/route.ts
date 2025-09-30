import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = process.env.GITHUB_TOKEN || '';

  if (!token) {
    return NextResponse.json(
      { error: 'GitHub token not configured.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get('q') || '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20', 10)));

  if (!rawQuery) {
    return NextResponse.json({ commits: [], page, per_page: perPage, hasNextPage: false });
  }

  // Fallback for very short queries (e.g., "UI") since GitHub Search API may ignore short tokens
  if (rawQuery.length < 3) {
    try {
      const listUrl = `https://api.github.com/repos/krpzzr/git-commit-history-viewer/commits?sha=main&per_page=${perPage}&page=${page}`;
      const listRes = await fetch(listUrl, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Authorization': `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      });
      if (listRes.ok) {
        const commits = await listRes.json();
        const lowered = rawQuery.toLowerCase();
        const filtered = commits.filter((c: any) => c.commit?.message?.toLowerCase().includes(lowered));
        const hasNextPage = filtered.length === perPage; // best-effort
        return NextResponse.json({ commits: filtered, page, per_page: perPage, hasNextPage }, { headers: { 'Cache-Control': 'no-store' } });
      }
    } catch {}
    // if fallback fails, continue to Search API (likely returns empty)
  }

  // Phrase search if there are spaces
  const term = /\s/.test(rawQuery) ? `"${rawQuery.replace(/\"/g, '')}"` : rawQuery;
  const q = `repo:krpzzr/git-commit-history-viewer ${term}`;
  const url = `https://api.github.com/search/commits?q=${encodeURIComponent(q)}&per_page=${perPage}&page=${page}&sort=committer-date&order=desc`;

  try {
    const response = await fetch(url, {
      headers: {
        // Commit search requires the text-match/cloak preview media type in some API versions
        'Accept': 'application/vnd.github.text-match+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Search API error:', response.status, errorBody);
      // Fallback: fetch recent commits and filter client-side (best-effort)
      if (response.status === 422 || response.status === 415 || response.status === 403) {
        const listUrl = `https://api.github.com/repos/krpzzr/git-commit-history-viewer/commits?sha=main&per_page=${perPage}&page=${page}`;
        const listRes = await fetch(listUrl, {
          headers: {
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Authorization': `Bearer ${token}`,
          },
          next: { revalidate: 0 },
        });
        if (listRes.ok) {
          const commits = await listRes.json();
          const lowered = rawQuery.toLowerCase();
          const filtered = commits.filter((c: any) => c.commit?.message?.toLowerCase().includes(lowered));
          const hasNextPage = filtered.length === perPage; // best-effort
          return NextResponse.json({ commits: filtered, page, per_page: perPage, hasNextPage }, { headers: { 'Cache-Control': 'no-store' } });
        }
      }
      return NextResponse.json(
        { error: `GitHub Search API error: ${response.status} - ${response.statusText}` },
        { status: response.status }
      );
    }

    const link = response.headers.get('link') || '';
    const hasNextPage = /<([^>]+)>; rel="next"/.test(link);

    const json = await response.json();
    const items = Array.isArray(json.items) ? json.items : [];

    const commits = items.map((it: any) => ({
      sha: it.sha,
      html_url: it.html_url,
      commit: {
        message: it.commit?.message || '',
        author: {
          name: it.commit?.author?.name || it.author?.login || 'Unknown',
          email: it.commit?.author?.email || '',
          date: it.commit?.author?.date || new Date().toISOString(),
        },
      },
      author: it.author
        ? {
            login: it.author.login,
            avatar_url: it.author.avatar_url,
            html_url: it.author.html_url,
          }
        : null,
    }));

    return NextResponse.json(
      { commits, page, per_page: perPage, hasNextPage },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Search fetch error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
