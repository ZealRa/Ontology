import { Link } from 'react-router-dom';

import { ClaimBuilder } from '../components/claim-builder';
import { OntologyClaimCallout } from '../components/ontology-claim-callout';
import { SchemaPanel } from '../components/schema-panel';
import { AtomTree } from '../components/atom-tree';
import { RelationshipGraph } from '../components/relationship-graph';
import { PredicateExplorer } from '../components/predicate-explorer';
import { ClaimHistory } from '../components/claim-history';
import { BatchBuilder } from '../components/batch-builder';
import { useClaimWorkspace } from '../lib/use-claim-workspace';
import { useIntuitionNetwork } from '../lib/wallet/intuition-network-context';
import { useOnchainOntologyMatrix } from '../lib/intuition/use-onchain-ontology-matrix';
import type { OnchainOntologySlot } from '../lib/intuition/ontology-slots';
import { ONTOLOGY_SLOT_PREDICATE_LABEL } from '../lib/intuition/ontology-vocabulary';

export function HomePage() {
  const { graphqlUrl, isStaticNetwork, networkLabel } = useIntuitionNetwork();
  const liveOntology = useOnchainOntologyMatrix(!isStaticNetwork, graphqlUrl);
  const {
    selectedTypeId,
    setSelectedTypeId,
    selectedPredicateId,
    setSelectedPredicateId,
    claimBuilderRef,
    searchQuery,
    saveClaim,
    addToBatch,
    fillFromMatrix,
  } = useClaimWorkspace();

  return (
    <main className="px-4 sm:px-6 py-8 space-y-8">
      {!isStaticNetwork && (
        <>
          <div className="space-y-3" data-tutorial-step="claim-builder">
            <OntologyClaimCallout />
            <ClaimBuilder
              ref={claimBuilderRef}
              onSubjectTypeChange={setSelectedTypeId}
              onPredicateChange={setSelectedPredicateId}
              onSave={saveClaim}
              onAddToBatch={addToBatch}
            />
            <ClaimHistory searchQuery={searchQuery} />
            <BatchBuilder searchQuery={searchQuery} />
          </div>

          <LiveOntologyPanel
            networkLabel={networkLabel}
            slots={liveOntology.slots}
            isLoading={liveOntology.isLoading}
            error={liveOntology.error}
          />
        </>
      )}

      {isStaticNetwork && (
        <>
          <StaticReferenceNotice />

          <div
            className="grid grid-cols-1 gap-2 lg:grid-cols-3"
            data-tutorial-step="entity-schema"
          >
            <SchemaPanel selectedTypeId={selectedTypeId} searchQuery={searchQuery} />
            <AtomTree
              selectedTypeId={selectedTypeId}
              onSelectType={setSelectedTypeId}
              globalSearchQuery={searchQuery}
            />
            <RelationshipGraph
              highlightTypeId={selectedTypeId}
              onSelectType={setSelectedTypeId}
              searchQuery={searchQuery}
            />
          </div>

          <div data-tutorial-step="predicate-explorer">
            <PredicateExplorer
              selectedPredicateId={selectedPredicateId}
              onSelectClaim={fillFromMatrix}
              searchQuery={searchQuery}
            />
          </div>
        </>
      )}
    </main>
  );
}

function LiveOntologyPanel({
  networkLabel,
  slots,
  isLoading,
  error,
}: {
  networkLabel: string;
  slots: OnchainOntologySlot[];
  isLoading: boolean;
  error: string | null;
}) {
  const proposalCount = slots.reduce((total, slot) => total + slot.proposals.length, 0);

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Live Ontology</h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              {networkLabel}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">
            This view is protocol-backed. Slots come from on-chain triples like
            <span className="font-mono text-[var(--color-text)]"> Person — {ONTOLOGY_SLOT_PREDICATE_LABEL} — Organization</span>,
            and proposals come from nested triples using <span className="font-mono text-[var(--color-text)]">is best usage for</span>.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/matrix"
            className="focus-ring rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-black hover:bg-[var(--color-accent-hover)]"
          >
            Open Matrix
          </Link>
          <Link
            to="/protocol"
            className="focus-ring rounded-md bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            Protocol Search
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="on-chain slots" value={isLoading ? '...' : String(slots.length)} />
        <MetricCard label="predicate proposals" value={isLoading ? '...' : String(proposalCount)} />
        <MetricCard label="source" value="live protocol" />
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {!isLoading && !error && slots.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Recent live slots
          </p>
          {slots.slice(0, 5).map((slot) => (
            <div
              key={slot.slotTermId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2"
            >
              <span className="font-mono text-sm text-[var(--color-text)]">
                {slot.subjectLabel} — {ONTOLOGY_SLOT_PREDICATE_LABEL} — {slot.objectLabel}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {slot.proposals.length} {slot.proposals.length === 1 ? 'proposal' : 'proposals'}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && slots.length === 0 && (
        <p className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-4 text-sm text-[var(--color-text-muted)]">
          No live ontology slots found on this network yet. Use the builder above to propose the first one.
        </p>
      )}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}

function StaticReferenceNotice() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        Static ontology mode shows the local TypeScript reference: schema, hierarchy, relationship graph,
        and curated predicates. Switch to Mainnet or Testnet to see protocol-backed live views.
      </p>
    </div>
  );
}
