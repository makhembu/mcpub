'use client';

import { useState, useRef, useEffect } from 'react';

interface AutocompleteProps {
  defaultValue: string;
  category: string;
  transport: string;
  minStars: string;
  minScore: string;
  sort: string;
}

export function AutocompleteInput({ defaultValue, category, transport, minStars, minScore, sort }: AutocompleteProps) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleChange(val: string) {
    setValue(val);
    if (val.length < 2) { setSuggestions([]); setShow(false); return; }

    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShow(true);
      }
    } catch {}
  }

  function submit(val: string) {
    setValue(val);
    setShow(false);
    const params = new URLSearchParams();
    params.set('q', val);
    if (category) params.set('category', category);
    if (transport) params.set('transport', transport);
    if (minStars) params.set('min_stars', minStars);
    if (minScore) params.set('min_score', minScore);
    if (sort) params.set('sort', sort);
    window.location.href = `/search?${params.toString()}`;
  }

  return (
    <div ref={ref} style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          name="q"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(value); } }}
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
      {show && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 8, marginTop: 4, zIndex: 10,
          maxHeight: 200, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {suggestions.map(s => (
            <div key={s} onClick={() => submit(s)} style={{
              padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: '#374151',
              borderBottom: '1px solid #f3f4f6',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f5f3ff')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
