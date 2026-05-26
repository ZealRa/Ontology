export interface ExampleClaim {
  subject: string;
  subjectType: string;
  predicateId: string;
  predicateLabel: string;
  object: string;
  objectType: string;
}

/**
 * Example claims for common entity types.
 * 2-3 realistic claims per type to help users understand the system.
 */
export const EXAMPLE_CLAIMS: Record<string, ExampleClaim[]> = {
  Self: [
    { subject: 'I', subjectType: 'Self', predicateId: 'trusts', predicateLabel: 'trusts', object: 'Billy', objectType: 'Person' },
    { subject: 'I', subjectType: 'Self', predicateId: 'follows', predicateLabel: 'follows', object: 'Intuition Foundation', objectType: 'Organization' },
    { subject: 'I', subjectType: 'Self', predicateId: 'expert in', predicateLabel: 'expert in', object: 'Cryptography', objectType: 'DefinedTerm' },
  ],
  Person: [
    { subject: 'Billy', subjectType: 'Person', predicateId: 'founder of', predicateLabel: 'founder of', object: 'Intuition Foundation', objectType: 'Organization' },
    { subject: 'Billy', subjectType: 'Person', predicateId: 'expert in', predicateLabel: 'expert in', object: 'Cryptography', objectType: 'DefinedTerm' },
    { subject: 'Alice Johnson', subjectType: 'Person', predicateId: 'trusts', predicateLabel: 'trusts', object: 'Bob Smith', objectType: 'Person' },
  ],
  Organization: [
    { subject: 'Intuition Foundation', subjectType: 'Organization', predicateId: 'develops', predicateLabel: 'develops', object: 'Intuition', objectType: 'SoftwareSourceCode' },
    { subject: 'Uniswap Labs', subjectType: 'Organization', predicateId: 'offers', predicateLabel: 'offers', object: 'Uniswap Protocol', objectType: 'Service' },
    { subject: 'ConsenSys', subjectType: 'Organization', predicateId: 'employs', predicateLabel: 'employs', object: 'Joseph Lubin', objectType: 'Person' },
  ],
  SoftwareSourceCode: [
    { subject: 'Uniswap v3', subjectType: 'SoftwareSourceCode', predicateId: 'created by', predicateLabel: 'created by', object: 'Uniswap Labs', objectType: 'Organization' },
    { subject: 'OpenZeppelin', subjectType: 'SoftwareSourceCode', predicateId: 'tagged with', predicateLabel: 'tagged with', object: 'Smart Contracts', objectType: 'DefinedTerm' },
    { subject: 'Hardhat', subjectType: 'SoftwareSourceCode', predicateId: 'alternative to', predicateLabel: 'alternative to', object: 'Foundry', objectType: 'SoftwareSourceCode' },
  ],
  DefinedTerm: [
    { subject: 'DeFi', subjectType: 'DefinedTerm', predicateId: 'related to', predicateLabel: 'related to', object: 'Smart Contracts', objectType: 'DefinedTerm' },
    { subject: 'Zero-Knowledge Proofs', subjectType: 'DefinedTerm', predicateId: 'sub concept of', predicateLabel: 'sub concept of', object: 'Cryptography', objectType: 'DefinedTerm' },
  ],
  Place: [
    { subject: 'ETHDenver Venue', subjectType: 'Place', predicateId: 'located in', predicateLabel: 'located in', object: 'Denver, CO', objectType: 'Place' },
  ],
  Product: [
    { subject: 'Ledger Nano X', subjectType: 'Product', predicateId: 'sold by', predicateLabel: 'sold by', object: 'Ledger', objectType: 'Organization' },
    { subject: 'MetaMask Snaps', subjectType: 'Product', predicateId: 'tagged with', predicateLabel: 'tagged with', object: 'Wallet', objectType: 'DefinedTerm' },
  ],
  Event: [
    { subject: 'ETHDenver 2024', subjectType: 'Event', predicateId: 'located in', predicateLabel: 'located in', object: 'Denver, CO', objectType: 'Place' },
    { subject: 'Devcon 7', subjectType: 'Event', predicateId: 'organized event', predicateLabel: 'organized event', object: 'Intuition Foundation', objectType: 'Organization' },
  ],
  Article: [
    { subject: 'Intuition Whitepaper', subjectType: 'Article', predicateId: 'authored by', predicateLabel: 'authored by', object: 'Billy', objectType: 'Person' },
    { subject: 'State of L2s Report', subjectType: 'Article', predicateId: 'about', predicateLabel: 'about', object: 'Layer 2 Scaling', objectType: 'DefinedTerm' },
  ],
  EthereumAccount: [
    { subject: 'intuitionbilly.eth', subjectType: 'EthereumAccount', predicateId: 'owned by', predicateLabel: 'owned by', object: 'Billy', objectType: 'Person' },
  ],
  EthereumSmartContract: [
    { subject: 'Uniswap V3 Router', subjectType: 'EthereumSmartContract', predicateId: 'deployed on', predicateLabel: 'deployed on', object: 'Intuition Mainnet', objectType: 'Thing' },
  ],
  EthereumERC20: [
    { subject: 'UNI Token', subjectType: 'EthereumERC20', predicateId: 'token of', predicateLabel: 'token of', object: 'Uniswap Labs', objectType: 'Organization' },
  ],
  WebSite: [
    { subject: 'Etherscan', subjectType: 'WebSite', predicateId: 'hosted by', predicateLabel: 'hosted by', object: 'Etherscan Inc.', objectType: 'Organization' },
  ],
  Brand: [
    { subject: 'MetaMask', subjectType: 'Brand', predicateId: 'brand of', predicateLabel: 'brand of', object: 'ConsenSys', objectType: 'Organization' },
  ],
  Service: [
    { subject: 'Alchemy API', subjectType: 'Service', predicateId: 'sold by', predicateLabel: 'sold by', object: 'Alchemy', objectType: 'Organization' },
  ],
  SoftwareApplication: [
    { subject: 'MetaMask Extension', subjectType: 'SoftwareApplication', predicateId: 'developed by', predicateLabel: 'developed by', object: 'ConsenSys', objectType: 'Organization' },
  ],
};
