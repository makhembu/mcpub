-- MCP Tools Registry Schema
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  npm_package TEXT,
  py_package TEXT,
  home_url TEXT,
  author TEXT NOT NULL DEFAULT 'unknown',
  stars INTEGER NOT NULL DEFAULT 0,
  license TEXT,
  transports TEXT NOT NULL DEFAULT '[]',
  categories TEXT NOT NULL DEFAULT '[]',
  compatibility TEXT NOT NULL DEFAULT '{}',
  security_score INTEGER,
  install_command TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_updated TEXT NOT NULL DEFAULT (datetime('now')),
  embedding BLOB
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tool_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS scan_results (
  id TEXT PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  score INTEGER NOT NULL,
  severity TEXT NOT NULL,
  issues TEXT NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  scanned_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tool_slug) REFERENCES tools(slug)
);

CREATE INDEX IF NOT EXISTS idx_tools_stars ON tools(stars DESC);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(categories);
CREATE INDEX IF NOT EXISTS idx_tools_author ON tools(author);
CREATE INDEX IF NOT EXISTS idx_scan_results_score ON scan_results(score DESC);
