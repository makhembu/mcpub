'use client';

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); }}
      style={{
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        padding: '4px 12px',
        fontSize: 13,
        cursor: 'pointer',
        color: '#374151',
      }}
    >
      Copy
    </button>
  );
}
