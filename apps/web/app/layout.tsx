import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MCPHub — The npm for AI Tools</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body>
        <header style={{ borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: 20 }}>⚡ MCPHub</a>
          <span style={{ color: '#6b7280', fontSize: 14 }}>— The npm for AI Tools</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
            <a href="https://github.com/mcpub/mcpub" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>GitHub</a>
            <a href="/search" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Search</a>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
