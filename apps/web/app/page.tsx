const REGISTRY_URL = process.env.REGISTRY_URL || 'https://registry.mcpub.dev';

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
    const url = `${REGISTRY_URL}/api/search?q=${encodeURIComponent(q)}&limit=12`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return { tools: [], total: 0, took: 0, query: q };
    return res.json();
  } catch {
    return { tools: [], total: 0, took: 0, query: q };
  }
}

export default async function HomePage() {
  const result = await searchTools('');

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: '0 0 8px' }}>⚡ MCPHub</h1>
        <p style={{ fontSize: 18, color: '#6b7280', margin: '0 0 32px' }}>
          The npm for AI Tools — One command to install, search, and secure MCP servers
        </p>
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <code style={{ fontSize: 16, background: '#e5e7eb', padding: '8px 16px', borderRadius: 8 }}>
            npx mcpub search &ldquo;database&rdquo;
          </code>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 12 }}>
            Discover MCP tools · Install in one command · Built-in security scanning
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
        Trending Tools
        <span style={{ color: '#9ca3af', fontSize: 14, fontWeight: 400, marginLeft: 8 }}>
          ({result.total} total)
        </span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {result.tools.map((tool) => (
          <a
            key={tool.slug}
            href={`/tool/${tool.slug}`}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 20,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{tool.name}</h3>
              {tool.securityScore !== null && (
                <span style={{
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: tool.securityScore >= 80 ? '#dcfce7' : tool.securityScore >= 50 ? '#fef9c3' : '#fee2e2',
                  color: tool.securityScore >= 80 ? '#166534' : tool.securityScore >= 50 ? '#854d0e' : '#991b1b',
                }}>
                  {tool.securityScore}/100
                </span>
              )}
            </div>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 12px', lineHeight: 1.4 }}>
              {tool.shortDescription}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: '#f59e0b' }}>⭐ {tool.stars > 0 ? tool.stars.toLocaleString() : 'New'}</span>
              <span style={{ color: '#9ca3af' }}>·</span>
              <span style={{ color: '#3b82f6' }}>{tool.author}</span>
              <span style={{ color: '#9ca3af' }}>·</span>
              <span style={{ color: '#8b5cf6' }}>{tool.transports[0] || '?'}</span>
            </div>
            {tool.categories.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {tool.categories.slice(0, 3).map((cat) => (
                  <span key={cat} style={{
                    fontSize: 11,
                    padding: '1px 8px',
                    borderRadius: 8,
                    background: '#f3f4f6',
                    color: '#6b7280',
                  }}>
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>

      {result.tools.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
          <p>No tools found. Try a different search or check back later.</p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 48, padding: 24, borderTop: '1px solid #e5e7eb' }}>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>
          Built with ❤️ for the MCP ecosystem · MIT License ·{' '}
          <a href="https://github.com/mcpub/mcpub" style={{ color: '#3b82f6' }}>GitHub</a>
        </p>
      </div>
    </div>
  );
}
