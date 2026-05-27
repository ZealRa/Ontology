import { Link } from 'react-router-dom';

import { portalAtomUrl, portalTripleUrl } from '../lib/intuition/portal';
import { useProtocolGlobalSearch } from '../lib/intuition/use-protocol-global-search';
import type { ProtocolSearchAtom, ProtocolSearchTriple } from '../lib/intuition/search-protocol';

type ProtocolSearchResultsProps = {
  query: string;
};

export function ProtocolSearchResults({ query }: ProtocolSearchResultsProps) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= 2;
  const { results, isSearching, error } = useProtocolGlobalSearch(query, enabled, {
    atomsLimit: 8,
    triplesLimit: 6,
  });

  if (!enabled) return null;

  const closeTotal = results.atoms.length + results.triples.length;
  const broadTotal = results.broadAtoms.length + results.broadTriples.length;

  return (
    <div
      className="mx-4 sm:mx-6 -mt-2 mb-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden"
      role="region"
      aria-label="On-chain search results"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--color-border)]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          On-chain (Intuition)
        </span>
        <Link
          to={`/protocol?q=${encodeURIComponent(trimmed)}`}
          className="text-[10px] text-[var(--color-accent)] hover:underline"
        >
          Open in Protocol search
        </Link>
      </div>

      {isSearching && (
        <p className="px-3 py-2 text-xs text-[var(--color-text-muted)]">Searching protocol…</p>
      )}

      {error && (
        <p className="px-3 py-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {!isSearching && !error && closeTotal === 0 && broadTotal === 0 && (
        <p className="px-3 py-2 text-xs text-[var(--color-text-muted)]">
          No atoms or triples matched «{trimmed}».
        </p>
      )}

      {!isSearching && !error && results.atoms.length > 0 && (
        <section className="px-3 py-2 border-b border-[var(--color-border)]">
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mb-1">
            Best matches — atoms ({results.atoms.length})
          </p>
          <ul className="space-y-0.5">
            {results.atoms.map((atom) => (
              <AtomResultRow key={atom.termId} atom={atom} />
            ))}
          </ul>
        </section>
      )}

      {!isSearching && !error && results.triples.length > 0 && (
        <section className="px-3 py-2 border-b border-[var(--color-border)]">
          <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mb-1">
            Best matches — triples ({results.triples.length})
          </p>
          <ul className="space-y-0.5">
            {results.triples.map((triple) => (
              <TripleResultRow key={triple.termId} triple={triple} />
            ))}
          </ul>
        </section>
      )}

      {!isSearching && !error && results.broadened && broadTotal > 0 && (
        <p className="px-3 py-2 text-[10px] text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
          +{broadTotal} broader matches on Protocol search
        </p>
      )}
    </div>
  );
}

function AtomResultRow({ atom }: { atom: ProtocolSearchAtom }) {
  return (
    <li>
      <a
        href={portalAtomUrl(atom.termId)}
        target="_blank"
        rel="noreferrer noopener"
        className="focus-ring flex items-center justify-between gap-2 rounded px-1.5 py-1 text-xs hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <span className="text-[var(--color-text)] truncate">{atom.label}</span>
        {atom.atomType && (
          <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">{atom.atomType}</span>
        )}
      </a>
    </li>
  );
}

function TripleResultRow({ triple }: { triple: ProtocolSearchTriple }) {
  return (
    <li>
      <a
        href={portalTripleUrl(triple.termId)}
        target="_blank"
        rel="noreferrer noopener"
        className="focus-ring block rounded px-1.5 py-1 text-xs hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <span className="text-[var(--color-text)]">
          <span>{triple.subjectLabel}</span>
          <span className="text-[var(--color-accent)]"> {triple.predicateLabel} </span>
          <span>{triple.objectLabel}</span>
        </span>
      </a>
    </li>
  );
}
