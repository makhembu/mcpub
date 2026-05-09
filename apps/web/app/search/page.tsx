export const dynamic = 'force-dynamic';

import { AutocompleteInput } from './autocomplete';

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
  category?: string | null;
  transport?: string | null;
  min_stars?: number;
  min_score?: number;
  sort?: string;
}

type SortOption = 'stars' | 'name' | 'score';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function searchTools(params: URLSearchParams): Promise<SearchResult> {
  const limit = params.get('q') ? '50' : '2000';
  params.set('limit', limit);
  const url = `${REGISTRY_URL}/api/search?${params.toString()}`;
  const data = await fetchJson<SearchResult>(url);
  return data || { tools: [], total: 0, query: '', took: 0 };
}

async function fetchCategories(): Promise<string[]> {
  const data = await fetchJson<string[]>(`${REGISTRY_URL}/api/categories`);
  return data || [];
}

const TRANSPORTS = ['stdio', 'sse', 'http', 'streamable-http'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'stars', label: 'Stars' },
  { value: 'name', label: 'Name' },
  { value: 'score', label: 'Security Score' },
];

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 13,
    border: active ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
    background: active ? '#f5f3ff' : 'transparent',
    color: active ? '#6d28d9' : '#374151',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    transition: 'all .15s',
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; transport?: string; min_stars?: string; min_score?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || '';
  const category = params.category || '';
  const transport = params.transport || '';
  const minStars = params.min_stars || '';
  const minScore = params.min_score || '';
  const sort = (params.sort || 'stars') as SortOption;

  const apiParams = new URLSearchParams();
  if (q) apiParams.set('q', q);
  if (category) apiParams.set('category', category);
  if (transport) apiParams.set('transport', transport);
  if (minStars) apiParams.set('min_stars', minStars);
  if (minScore) apiParams.set('min_score', minScore);
  if (sort) apiParams.set('sort', sort);

  const [result, allCategories] = await Promise.all([
    searchTools(apiParams),
    fetchCategories(),
  ]);

  const hasFilters = !!(category || transport || minStars || minScore);

  function filterUrl(overrides: Record<string, string>): string {
    const u = new URLSearchParams();
    if (q) u.set('q', q);
    if (category && !('category' in overrides)) u.set('category', category);
    if (transport && !('transport' in overrides)) u.set('transport', transport);
    if (minStars && !('min_stars' in overrides)) u.set('min_stars', minStars);
    if (minScore && !('min_score' in overrides)) u.set('min_score', minScore);
    if (sort && !('sort' in overrides)) u.set('sort', sort);
    Object.entries(overrides).forEach(([k, v]) => { if (v) u.set(k, v); });
    return `/search?${u.toString()}`;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <a href="/" style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>
        ← Back to home
      </a>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        {q ? `Search results for "${q}"` : 'Browse All Tools'}
        <span style={{ color: '#9ca3af', fontSize: 16, fontWeight: 400, marginLeft: 8 }}>
          ({result.total} tools in {result.took}ms)
        </span>
      </h1>

      {/* Search bar */}
      <form action="/search" method="GET" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="transport" value={transport} />
          <input type="hidden" name="min_stars" value={minStars} />
          <input type="hidden" name="min_score" value={minScore} />
          <input type="hidden" name="sort" value={sort} />
          <AutocompleteInput
            defaultValue={q}
            category={category}
            transport={transport}
            minStars={minStars}
            minScore={minScore}
            sort={sort}
          />
          <button type="submit" style={{
            padding: '12px 24px',
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Search
          </button>
          <a href="/random" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '12px 16px', background: '#f3f4f6', color: '#374151',
            border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600,
            cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
          }} title="Random tool">
            🎲
          </a>
        </div>
      </form>

      {/* Filters */}
      <div style={{ marginBottom: 28 }}>
        {/* Category pills */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Category
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allCategories.sort().map((cat) => (
              <a key={cat} href={filterUrl({ category: category === cat ? '' : cat })} style={pillStyle(category === cat)}>
                {cat}
              </a>
            ))}
          </div>
        </div>

        {/* Transport & Sort row */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transport
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TRANSPORTS.map((t) => (
                <a key={t} href={filterUrl({ transport: transport === t ? '' : t })} style={pillStyle(transport === t)}>
                  {t}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sort by
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {SORT_OPTIONS.map((opt) => (
                <a key={opt.value} href={filterUrl({ sort: opt.value })} style={pillStyle(sort === opt.value)}>
                  {opt.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stars & Score sliders */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>Min Stars:</label>
            {[0, 100, 1000, 10000].map((n) => (
              <a key={n} href={filterUrl({ min_stars: String(n) })} style={{
                ...pillStyle(String(minStars) === String(n)),
                fontSize: 12,
                padding: '4px 10px',
              }}>
                {n >= 1000 ? `${n / 1000}k` : n}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>Min Score:</label>
            {[0, 50, 70, 90].map((n) => (
              <a key={n} href={filterUrl({ min_score: String(n) })} style={{
                ...pillStyle(String(minScore) === String(n)),
                fontSize: 12,
                padding: '4px 10px',
              }}>
                {n}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Score distribution */}
      {result.tools.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, color: '#6b7280' }}>
          <span style={{ fontWeight: 600 }}>Security:</span>
          {['high', 'medium', 'low', 'none'].map(level => {
            const count = result.tools.filter(t =>
              level === 'high' ? (t.securityScore !== null && t.securityScore >= 80) :
              level === 'medium' ? (t.securityScore !== null && t.securityScore >= 50 && t.securityScore < 80) :
              level === 'low' ? (t.securityScore !== null && t.securityScore < 50) :
              t.securityScore === null
            ).length;
            const pct = Math.round((count / result.tools.length) * 100);
            const label = level === 'high' ? '✅ Safe' : level === 'medium' ? '⚠️ Mixed' : level === 'low' ? '🔴 Risky' : '⚪ Unscanned';
            const color = level === 'high' ? '#166534' : level === 'medium' ? '#854d0e' : level === 'low' ? '#991b1b' : '#9ca3af';
            const bg = level === 'high' ? '#dcfce7' : level === 'medium' ? '#fef9c3' : level === 'low' ? '#fee2e2' : '#f3f4f6';
            return (
              <span key={level} style={{ padding: '2px 8px', borderRadius: 8, background: bg, color }}>
                {label} {count} ({pct}%)
              </span>
            );
          })}
        </div>
      )}

      {/* Active filters display */}
      {hasFilters && (
        <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Active filters:</span>
          {category && (
            <a href={filterUrl({ category: '' })} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 12px', borderRadius: 16, fontSize: 13,
              background: '#f5f3ff', color: '#6d28d9', textDecoration: 'none',
            }}>
              category:{category} ×
            </a>
          )}
          {transport && (
            <a href={filterUrl({ transport: '' })} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 12px', borderRadius: 16, fontSize: 13,
              background: '#f5f3ff', color: '#6d28d9', textDecoration: 'none',
            }}>
              transport:{transport} ×
            </a>
          )}
          <a href="/search" style={{
            padding: '4px 12px', borderRadius: 16, fontSize: 13,
            background: '#fee2e2', color: '#991b1b', textDecoration: 'none',
          }}>
            Clear all
          </a>
        </div>
      )}

      {/* Tool results */}
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
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{tool.name}</h3>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>@{tool.author}</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 6px' }}>{tool.shortDescription}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {tool.categories.slice(0, 3).map((cat) => (
                  <span key={cat} style={{
                    background: '#f3f4f6',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 11,
                    color: '#6b7280',
                  }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 16, flexShrink: 0 }}>
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
          <p>No tools found{q ? ` for "${q}"` : ''}. Try different filters or search term.</p>
        </div>
      )}
    </div>
  );
}
