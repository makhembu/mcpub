const REGISTRY_URL = process.env.REGISTRY_URL || 'https://registry.mcpub.dev';

interface Tool {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  githubUrl: string;
  npmPackage: string | null;
  pyPackage: string | null;
  homeUrl: string | null;
  author: string;
  stars: number;
  license: string | null;
  transports: string[];
  categories: string[];
  compatibility: Record<string, string>;
  securityScore: number | null;
  installCommand: string;
  createdAt: string;
  lastUpdated: string;
}

async function getTool(slug: string): Promise<Tool | null> {
  try {
    const res = await fetch(`${REGISTRY_URL}/api/tools/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function compatBadge(level: string): string {
  const map: Record<string, string> = {
    native: '✅ Native',
    adapter: '⚠️ Adapter',
    unknown: '❓ Unknown',
    none: '❌ None',
  };
  return map[level] || '—';
}

function scoreColor(score: number): string {
  if (score >= 80) return '#166534';
  if (score >= 50) return '#854d0e';
  return '#991b1b';
}

function scoreBg(score: number): string {
  if (score >= 80) return '#dcfce7';
  if (score >= 50) return '#fef9c3';
  return '#fee2e2';
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getTool(slug);

  if (!tool) {
    return (
      <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Tool Not Found</h1>
        <p style={{ color: '#6b7280' }}>No MCP server named &ldquo;{slug}&rdquo; found in the registry.</p>
        <a href="/" style={{ color: '#3b82f6' }}>← Back to home</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <a href="/" style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>
        ← Back to browse
      </a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{tool.name}</h1>
          <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: 16 }}>{tool.shortDescription}</p>
        </div>
        {tool.securityScore !== null && (
          <div style={{
            background: scoreBg(tool.securityScore),
            color: scoreColor(tool.securityScore),
            padding: '8px 16px',
            borderRadius: 12,
            textAlign: 'center',
            minWidth: 80,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{tool.securityScore}</div>
            <div style={{ fontSize: 11 }}>/100 Secure</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer"
          style={{ background: '#1f2937', color: '#fff', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>
          ⭐ GitHub · {tool.stars.toLocaleString()}
        </a>
        {tool.homeUrl && (
          <a href={tool.homeUrl} target="_blank" rel="noopener noreferrer"
            style={{ border: '1px solid #e5e7eb', color: '#374151', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>
            🌐 Website
          </a>
        )}
      </div>

      <div style={{
        background: '#f9fafb',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', color: '#6b7280' }}>Install</h3>
        <code style={{ fontSize: 15, display: 'block', background: '#1f2937', color: '#e5e7eb', padding: '12px 16px', borderRadius: 8 }}>
          {tool.installCommand || `npx mcpub install ${tool.slug}`}
        </code>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', color: '#6b7280' }}>Details</h3>
          <table style={{ width: '100%', fontSize: 14 }}>
            <tbody>
              <tr><td style={{ padding: '4px 0', color: '#9ca3af' }}>Author</td><td style={{ padding: '4px 0' }}>{tool.author}</td></tr>
              <tr><td style={{ padding: '4px 0', color: '#9ca3af' }}>License</td><td style={{ padding: '4px 0' }}>{tool.license || 'Unknown'}</td></tr>
              <tr><td style={{ padding: '4px 0', color: '#9ca3af' }}>Transports</td><td style={{ padding: '4px 0' }}>{tool.transports.join(', ')}</td></tr>
              <tr><td style={{ padding: '4px 0', color: '#9ca3af' }}>Updated</td><td style={{ padding: '4px 0' }}>{new Date(tool.lastUpdated).toLocaleDateString()}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', color: '#6b7280' }}>Compatibility</h3>
          <table style={{ width: '100%', fontSize: 14 }}>
            <tbody>
              {Object.entries(tool.compatibility).map(([framework, level]) => (
                <tr key={framework}>
                  <td style={{ padding: '4px 0', color: '#9ca3af', textTransform: 'capitalize' }}>{framework}</td>
                  <td style={{ padding: '4px 0' }}>{compatBadge(level as string)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>About</h2>
        <p style={{ color: '#374151', lineHeight: 1.7, fontSize: 15, whiteSpace: 'pre-wrap' }}>{tool.description}</p>
      </div>

      {tool.categories.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#6b7280' }}>Categories</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tool.categories.map((cat) => (
              <a
                key={cat}
                href={`/search?q=${cat}`}
                style={{
                  background: '#f3f4f6',
                  padding: '4px 12px',
                  borderRadius: 16,
                  fontSize: 13,
                  color: '#374151',
                  textDecoration: 'none',
                }}
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
