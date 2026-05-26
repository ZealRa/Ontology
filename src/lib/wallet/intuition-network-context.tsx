import { API_URL_DEV, API_URL_PROD, configureClient } from '@0xintuition/graphql';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { Chain } from 'viem';

import { useLocalStorage } from '../use-local-storage';
import {
  INTUITION_MAINNET_CHAIN_ID,
  INTUITION_TESTNET_CHAIN_ID,
  type IntuitionChainId,
  intuitionMainnet,
  intuitionTestnet,
} from './intuition-chain';

export type IntuitionNetworkId = 'mainnet' | 'testnet';

type NetworkDefinition = {
  id: IntuitionNetworkId;
  label: string;
  chain: Chain;
  chainId: IntuitionChainId;
  graphqlUrl: string;
};

const NETWORKS: Record<IntuitionNetworkId, NetworkDefinition> = {
  mainnet: {
    id: 'mainnet',
    label: 'Intuition',
    chain: intuitionMainnet,
    chainId: INTUITION_MAINNET_CHAIN_ID,
    graphqlUrl: API_URL_PROD,
  },
  testnet: {
    id: 'testnet',
    label: 'Intuition Testnet',
    chain: intuitionTestnet,
    chainId: INTUITION_TESTNET_CHAIN_ID,
    graphqlUrl: API_URL_DEV,
  },
};

function isIntuitionNetworkId(value: unknown): value is IntuitionNetworkId {
  return value === 'mainnet' || value === 'testnet';
}

function resolveGraphqlUrl(network: IntuitionNetworkId): string {
  const envUrl = import.meta.env.VITE_INTUITION_GRAPHQL_URL;
  if (typeof envUrl === 'string' && envUrl.length > 0) return envUrl;
  return NETWORKS[network].graphqlUrl;
}

type IntuitionNetworkContextValue = {
  network: IntuitionNetworkId;
  setNetwork: (network: IntuitionNetworkId) => void;
  activeChain: Chain;
  chainId: IntuitionChainId;
  networkLabel: string;
  graphqlUrl: string;
};

const IntuitionNetworkContext = createContext<IntuitionNetworkContextValue | null>(null);

export function IntuitionNetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useLocalStorage<IntuitionNetworkId>(
    'ontology-intuition-network',
    'mainnet',
    { validate: isIntuitionNetworkId }
  );

  const definition = NETWORKS[network];
  const graphqlUrl = useMemo(() => resolveGraphqlUrl(network), [network]);

  useEffect(() => {
    configureClient({ apiUrl: graphqlUrl });
  }, [graphqlUrl]);

  const setNetwork = useCallback((next: IntuitionNetworkId) => {
    setNetworkState(next);
  }, [setNetworkState]);

  const value = useMemo<IntuitionNetworkContextValue>(
    () => ({
      network,
      setNetwork,
      activeChain: definition.chain,
      chainId: definition.chainId,
      networkLabel: definition.label,
      graphqlUrl,
    }),
    [network, setNetwork, definition, graphqlUrl]
  );

  return (
    <IntuitionNetworkContext.Provider value={value}>
      {children}
    </IntuitionNetworkContext.Provider>
  );
}

export function useIntuitionNetwork(): IntuitionNetworkContextValue {
  const ctx = useContext(IntuitionNetworkContext);
  if (!ctx) {
    throw new Error('useIntuitionNetwork must be used within IntuitionNetworkProvider');
  }
  return ctx;
}

export function useOptionalIntuitionNetwork(): IntuitionNetworkContextValue | null {
  return useContext(IntuitionNetworkContext);
}
