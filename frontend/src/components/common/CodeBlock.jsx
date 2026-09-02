import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * CodeBlock Component
 *
 * Renders code/JSON/curl snippets with internal horizontal scrolling
 * and an accessible Copy to Clipboard button.
 */
export default function CodeBlock({ code = '', language = 'bash' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'var(--surface-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        margin: '1rem 0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.375rem 0.75rem',
          borderBottom: '1px solid var(--border-muted)',
          backgroundColor: 'var(--surface)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <span className="font-mono" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code snippet"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: copied ? 'var(--brand-dark)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {copied ? (
            <>
              <Check size={13} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre
        className="font-mono"
        style={{
          padding: '0.875rem 1rem',
          margin: 0,
          overflowX: 'auto',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          color: 'var(--text-primary)',
          whiteSpace: 'pre',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
