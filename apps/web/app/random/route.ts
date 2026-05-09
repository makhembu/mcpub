import { redirect } from 'next/navigation';

const REGISTRY_URL = process.env.REGISTRY_URL || 'https://mcpub-registry.shelflix.workers.dev';

export async function GET(): Promise<Response> {
  const res = await fetch(`${REGISTRY_URL}/api/random-tool`);
  if (!res.ok) redirect('/search');
  const data = await res.json() as { slug: string };
  redirect(`/tool/${data.slug}`);
}
