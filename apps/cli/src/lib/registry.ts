import Conf from 'conf';
import type { RegistryConfig } from '@mcpub/shared';

const config = new Conf<RegistryConfig>({
  projectName: 'mcpub',
  defaults: {
    registryUrl: 'https://registry.mcpub.dev',
    cacheDir: '~/.mcpub/cache'
  }
});

export async function getRegistryUrl(): Promise<string> {
  return config.get('registryUrl');
}

export async function setRegistryUrl(url: string): Promise<void> {
  config.set('registryUrl', url);
}
