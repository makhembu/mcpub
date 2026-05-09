export const dynamic = 'force-dynamic';

const REGISTRY_URL = process.env.REGISTRY_URL || 'https://mcpub-registry.shelflix.workers.dev';

interface Tool {
  slug: string;
  name: string;
  shortDescription: string;
  stars: number;
  transports: string[];
  categories: string[];
  author: string;
  securityScore: number | null;
}

interface SearchResult {
  tools: Tool[];
  total: number;
  query: string;
  took: number;
}

async function searchTools(q: string): Promise<SearchResult> {
  try {
    const url = `${REGISTRY_URL}/api/search?q=${encodeURIComponent(q)}&limit=50`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { tools: [], total: 0, query: q, took: 0 };
    return res.json();
  } catch {
    return { tools: [], total: 0, query: q, took: 0 };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const result = await searchTools(q);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <a href="/" style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>
        ← Back to home
      </a>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        {q ? `Search results for "${q}"` : 'Browse All Tools'}
        <span style={{ color: '#9ca3af', fontSize: 16, fontWeight: 400, marginLeft: 8 }}>
          ({result.total} tools found in {result.took}ms)
        </span>
      </h1>

      <form action="/search" method="GET" style={{ marginBottom: 32 }}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search tools by name, category, or keywords..."
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 16,
            border: '2px solid #e5e7eb',
            borderRadius: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {result.tools.map((tool) => (
          <a
            key={tool.slug}
            href={`/tool/${tool.slug}`}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{tool.name}</h3>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>@{tool.author}</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>{tool.shortDescription}</p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 14, color: '#f59e0b' }}>⭐ {tool.stars > 0 ? tool.stars.toLocaleString() : 'New'}</span>
              {tool.securityScore !== null && (
                <span style={{
                  fontSize: 11,
                  padding: '1px 8px',
                  borderRadius: 8,
                  background: tool.securityScore >= 80 ? '#dcfce7' : tool.securityScore >= 50 ? '#fef9c3' : '#fee2e2',
                  color: tool.securityScore >= 80 ? '#166534' : tool.securityScore >= 50 ? '#854d0e' : '#991b1b',
                }}>
                  {tool.securityScore}/100
                </span>
              )}
              <span style={{ fontSize: 12, color: '#8b5cf6' }}>{tool.transports[0] || '?'}</span>
            </div>
          </a>
        ))}
      </div>

      {result.tools.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
          <p>No tools found{q ? ` for "${q}"` : ''}. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
