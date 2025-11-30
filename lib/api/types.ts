// Machine types (Node in Headscale API)
export interface Machine {
  id: string;
  machineKey: string;
  nodeKey: string;
  discoKey: string;
  ipAddresses: string[];
  name: string;
  user: User;
  lastSeen: string | null;
  expiry: string | null;
  createdAt: string;
  registerMethod: string;
  forcedTags: string[];
  invalidTags: string[];
  validTags: string[];
  givenName: string;
  online: boolean;
  approvedRoutes?: string[];
  availableRoutes?: string[];
  subnetRoutes?: string[];
}

// User types
export interface User {
  id: string;
  name: string;
  createdAt: string;
}

// Route types
export interface Route {
  id: string;
  machine: Machine;
  prefix: string;
  advertised: boolean;
  enabled: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// PreAuthKey types
export interface PreAuthKey {
  id: string;
  user: User | string; // Can be User object or user ID string
  key: string;
  reusable: boolean;
  ephemeral: boolean;
  used: boolean;
  expiration: string | null;
  createdAt: string;
  aclTags: string[];
}

export interface CreatePreAuthKeyRequest {
  user: string;
  reusable: boolean;
  ephemeral: boolean;
  expiration: string;
  aclTags?: string[];
}

// ACL types
export interface ACL {
  hosts: Record<string, string>;
  groups: Record<string, string[]>;
  acls: Array<{
    action: string;
    src: string[];
    dst: string[];
  }>;
  tests: Array<{
    src: string;
    accept: string[];
    deny: string[];
  }>;
  autoApprovers?: Record<string, string[]>;
  ssh?: Array<{
    action: string;
    src: string[];
    dst: string[];
    users: string[];
  }>;
}

// API Response types
export interface ListMachinesResponse {
  nodes: Machine[];
}

export interface ListUsersResponse {
  users: User[];
}

export interface ListRoutesResponse {
  routes: Route[];
}

export interface ListPreAuthKeysResponse {
  preAuthKeys: PreAuthKey[];
}

// API Key types
export interface ApiKey {
  id: string;
  prefix: string;
  expiration: string | null;
  createdAt: string;
  lastSeen: string | null;
}

export interface CreateApiKeyRequest {
  expiration?: string;
}

export interface CreateApiKeyResponse {
  apiKey: string; // Full key (only shown once)
  prefix: string;
}

export interface ListApiKeysResponse {
  apiKeys: ApiKey[];
}

export interface ExpireApiKeyRequest {
  prefix: string;
}

// Health types
export interface HealthResponse {
  databaseConnectivity: boolean;
}

// Debug Node types
export interface DebugCreateNodeRequest {
  user?: string;
  key?: string;
  name?: string;
  routes?: string[];
}

export interface DebugCreateNodeResponse {
  node: Machine;
}

