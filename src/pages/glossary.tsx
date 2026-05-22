import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

import { portalAtomUrl, portalTripleUrl } from '../lib/intuition/portal';
import type { ProtocolSearchAtom, ProtocolSearchTriple } from '../lib/intuition/search-protocol';
import { useProtocolGlobalSearch } from '../lib/intuition/use-protocol-global-search';

type ResultFilter = 'all' | 'atoms' | 'triples';

const EXAMPLE_QUERIES = ['trust', 'follow', 'ethereum', 'Person'];

/**
 * Browse live on-chain atoms and triples via the Intuition SDK global search.
 * @see https://www.docs.intuition.systems/docs/intuition-sdk/search-guide
 */
export function GlossaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const { results, isSearching, error } = useProtocolGlobalSearch(query, true, {
    atomsLimit: 40,
    triplesLimit: 25,
  });

  const [showBroader, setShowBroader] = useState(false);

  const showAtoms = resultFilter === 'all' || resultFilter === 'atoms';
  const showTriples = resultFilter === 'all' || resultFilter === 'triples';
  const atoms = showAtoms ? results.atoms : [];
  const triples = showTriples ? results.triples : [];
  const broadAtoms = showAtoms && showBroader ? results.broadAtoms : [];
  const broadTriples = showTriples && showBroader ? results.broadTriples : [];
  const closeCount = atoms.length + triples.length;
  const broadCount = results.broadAtoms.length + results.broadTriples.length;
  const totalShown = closeCount + (showBroader ? broadCount : 0);
  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;

  useEffect(() => {
    setShowBroader(false);
  }, [trimmed]);

  const counts = useMemo(
    () => ({
      atoms: results.atoms.length + results.broadAtoms.length,
      triples: results.triples.length + results.broadTriples.length,
      all:
        results.atoms.length +
        results.triples.length +
        results.broadAtoms.length +
        results.broadTriples.length,
    }),
    [results]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <main className="px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Protocol Search</h1>
          {hasQuery && !isSearching && (
            <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded-full">
              {totalShown} results
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl">
          Search live atoms and triples on Intuition Mainnet. Exact and prefix matches are
          ranked first; buried substring hits (e.g. «zet» inside long URLs) stay in optional
          broader results.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search atoms and triples (min. 2 characters)…"
            className="focus-ring w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-8 pr-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] transition-colors focus:border-[var(--color-accent)]"
            aria-label="Search on-chain atoms and triples"
          />
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>

        {hasQuery && (
          <div className="flex items-center gap-1" role="tablist" aria-label="Filter result type">
            <FilterChip label="All" count={counts.all} active={resultFilter === 'all'} onClick={() => setResultFilter('all')} />
            <FilterChip label="Atoms" count={counts.atoms} active={resultFilter === 'atoms'} onClick={() => setResultFilter('atoms')} />
            <FilterChip label="Triples" count={counts.triples} active={resultFilter === 'triples'} onClick={() => setResultFilter('triples')} />
          </div>
        )}
      </div>

      {!hasQuery && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 space-y-4">
          <p className="text-sm text-[var(--color-text-muted)] text-center">
            Type at least 2 characters to search the protocol, or try an example:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleQueryChange(example)}
                className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasQuery && isSearching && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
          Searching Intuition…
        </div>
      )}

      {hasQuery && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      {hasQuery && !isSearching && !error && closeCount === 0 && broadCount === 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
          No atoms or triples matched «{trimmed}».
        </div>
      )}

      {hasQuery && !isSearching && !error && closeCount === 0 && broadCount > 0 && !showBroader && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center space-y-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            No close matches for «{trimmed}». {broadCount} broader results are available.
          </p>
          <button
            type="button"
            onClick={() => setShowBroader(true)}
            className="focus-ring rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          >
            Show broader matches
          </button>
        </div>
      )}

      {hasQuery && !isSearching && !error && atoms.length > 0 && (
        <ResultSection title={`Best matches — atoms (${atoms.length})`} accent>
          {atoms.map((atom) => (
            <li key={atom.termId} className="px-4 py-3">
              <AtomRow atom={atom} />
            </li>
          ))}
        </ResultSection>
      )}

      {hasQuery && !isSearching && !error && triples.length > 0 && (
        <ResultSection title={`Best matches — triples (${triples.length})`} accent>
          {triples.map((triple) => (
            <li key={triple.termId} className="px-4 py-3">
              <TripleRow triple={triple} />
            </li>
          ))}
        </ResultSection>
      )}

      {hasQuery && !isSearching && !error && results.broadened && broadCount > 0 && (
        <div className="space-y-2">
          {!showBroader ? (
            <button
              type="button"
              onClick={() => setShowBroader(true)}
              className="focus-ring w-full rounded-lg border border-dashed border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              Show {broadCount} broader matches (substring hits in long labels, etc.)
            </button>
          ) : (
            <>
              <p className="text-[10px] text-[var(--color-text-muted)] px-1">
                Broader matches — lower relevance
              </p>
              {broadAtoms.length > 0 && (
                <ResultSection title={`Atoms (${broadAtoms.length})`}>
                  {broadAtoms.map((atom) => (
                    <li key={atom.termId} className="px-4 py-3">
                      <AtomRow atom={atom} />
                    </li>
                  ))}
                </ResultSection>
              )}
              {broadTriples.length > 0 && (
                <ResultSection title={`Triples (${broadTriples.length})`}>
                  {broadTriples.map((triple) => (
                    <li key={triple.termId} className="px-4 py-3">
                      <TripleRow triple={triple} />
                    </li>
                  ))}
                </ResultSection>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}

function ResultSection({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <header className="px-4 py-2.5 border-b border-[var(--color-border)]">
        <h2
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            accent ? 'text-[var(--color-accent)]/70' : 'text-[var(--color-text-muted)]'
          }`}
        >
          {title}
        </h2>
      </header>
      <ul className="divide-y divide-[var(--color-border)]">{children}</ul>
    </section>
  );
}

function AtomRow({ atom }: { atom: ProtocolSearchAtom }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-sm font-medium text-[var(--color-text)]">{atom.label}</h3>
        {atom.atomType && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
            {atom.atomType}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
        <code className="font-mono truncate">{shortenAddress(atom.termId)}</code>
        <CopyAddressButton address={atom.termId} />
        <a
          href={portalAtomUrl(atom.termId)}
          target="_blank"
          rel="noreferrer noopener"
          className="focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          View on portal <ExternalIcon />
        </a>
      </div>
    </div>
  );
}

function TripleRow({ triple }: { triple: ProtocolSearchTriple }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-[var(--color-text)]">
        <span>{triple.subjectLabel}</span>
        <span className="text-[var(--color-accent)]"> {triple.predicateLabel} </span>
        <span>{triple.objectLabel}</span>
      </p>
      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
        <code className="font-mono truncate">{shortenAddress(triple.termId)}</code>
        <CopyAddressButton address={triple.termId} />
        <a
          href={portalTripleUrl(triple.termId)}
          target="_blank"
          rel="noreferrer noopener"
          className="focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          View on portal <ExternalIcon />
        </a>
      </div>
    </div>
  );
}

function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="focus-ring inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
      aria-label={copied ? 'Address copied' : 'Copy term id'}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`focus-ring h-7 inline-flex items-center rounded-md px-3 text-xs font-medium transition-colors ${
        active
          ? 'text-[var(--color-text)] bg-[var(--color-surface-raised)]'
          : 'text-[var(--color-text-muted)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
      }`}
    >
      {label}
      <span className="ml-1.5 text-[10px] text-[var(--color-text-muted)]">{count}</span>
    </button>
  );
}

function shortenAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
