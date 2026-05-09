const REGISTRY_URL = process.env.REGISTRY_URL || 'https://mcpub-registry.shelflix.workers.dev';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  if (q.length < 2) return Response.json({ suggestions: [] });

  const res = await fetch(`${REGISTRY_URL}/api/suggest?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  return Response.json(data);
}
