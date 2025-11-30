import { apiClient, ApiError } from "./client";
import type {
  Machine,
  User,
  Route,
  PreAuthKey,
  CreatePreAuthKeyRequest,
  ACL,
  ListMachinesResponse,
  ListUsersResponse,
  ListPreAuthKeysResponse,
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ListApiKeysResponse,
  HealthResponse,
} from "./types";

// Machines endpoints (using /node in Headscale API)
export const machinesApi = {
  list: async (): Promise<Machine[]> => {
    const response = await apiClient.get<ListMachinesResponse>("/node");
    return response.data.nodes || [];
  },

  get: async (machineId: string): Promise<Machine> => {
    const response = await apiClient.get<{ node: Machine }>(`/node/${machineId}`);
    return response.data.node;
  },

  delete: async (machineId: string): Promise<void> => {
    await apiClient.delete(`/node/${machineId}`);
  },

  rename: async (machineId: string, name: string): Promise<Machine> => {
    // Swagger: POST /node/{nodeId}/rename/{newName} - newName in path
    const response = await apiClient.post<{ node: Machine }>(
      `/node/${machineId}/rename/${encodeURIComponent(name)}`
    );
    return response.data.node;
  },

  expire: async (machineId: string, expiry?: string): Promise<Machine> => {
    // Swagger: POST /node/{nodeId}/expire?expiry={date-time} (optional)
    const params = new URLSearchParams();
    if (expiry) {
      params.append("expiry", expiry);
    }
    const queryString = params.toString();
    const url = queryString
      ? `/node/${machineId}/expire?${queryString}`
      : `/node/${machineId}/expire`;
    const response = await apiClient.post<{ node: Machine }>(url);
    return response.data.node;
  },

  setTags: async (machineId: string, tags: string[]): Promise<Machine> => {
    const response = await apiClient.post<{ node: Machine }>(
      `/node/${machineId}/tags`,
      { tags }
    );
    return response.data.node;
  },

  register: async (user?: string, key?: string): Promise<Machine> => {
    const params = new URLSearchParams();
    if (user) params.append("user", user);
    if (key) params.append("key", key);
    const queryString = params.toString();
    const url = queryString ? `/node/register?${queryString}` : "/node/register";
    const response = await apiClient.post<{ node: Machine }>(url);
    return response.data.node;
  },

  move: async (machineId: string, userId: string): Promise<Machine> => {
    // Swagger: POST /node/{nodeId}/user with body {user: uint64}
    // userId should be user ID (uint64), not userName
    const response = await apiClient.post<{ node: Machine }>(
      `/node/${machineId}/user`,
      { user: userId }
    );
    return response.data.node;
  },

  setApprovedRoutes: async (
    machineId: string,
    routes: string[]
  ): Promise<Machine> => {
    // Swagger: POST /node/{nodeId}/approve_routes
    const response = await apiClient.post<{ node: Machine }>(
      `/node/${machineId}/approve_routes`,
      { routes }
    );
    return response.data.node;
  },

  backfillIPs: async (confirmed?: boolean): Promise<void> => {
    const params = new URLSearchParams();
    if (confirmed !== undefined) {
      params.append("confirmed", confirmed.toString());
    }
    const queryString = params.toString();
    const url = queryString ? `/node/backfillips?${queryString}` : "/node/backfillips";
    await apiClient.post(url);
  },
};

// Users endpoints
export const usersApi = {
  list: async (filters?: {
    id?: string;
    name?: string;
    email?: string;
  }): Promise<User[]> => {
    // Swagger: GET /user?id={uint64}&name={string}&email={string} (all optional)
    const params = new URLSearchParams();
    if (filters?.id) params.append("id", filters.id);
    if (filters?.name) params.append("name", filters.name);
    if (filters?.email) params.append("email", filters.email);
    const queryString = params.toString();
    const url = queryString ? `/user?${queryString}` : "/user";
    const response = await apiClient.get<ListUsersResponse>(url);
    return response.data.users || [];
  },

  get: async (userName: string): Promise<User> => {
    // Some Headscale deployments may not support GET /user/{name} directly
    // Fallback strategy: list all users and find by name
    const response = await apiClient.get<ListUsersResponse>("/user");
    const users = response.data.users || [];
    const user = users.find((u) => u.name === userName);
    if (!user) {
      throw new Error(`User '${userName}' not found`);
    }
    return user;
  },

  create: async (userName: string): Promise<User> => {
    const response = await apiClient.post<{ user: User }>("/user", { name: userName });
    return response.data.user;
  },

  delete: async (userId: string): Promise<void> => {
    // Swagger: DELETE /user/{id} with id as uint64
    // userId should be user ID, not userName
    await apiClient.delete(`/user/${userId}`);
  },

  rename: async (oldId: string, newName: string): Promise<User> => {
    // Swagger: POST /user/{oldId}/rename/{newName} - both in path
    // oldId should be user ID (uint64), not userName
    const response = await apiClient.post<{ user: User }>(
      `/user/${oldId}/rename/${encodeURIComponent(newName)}`
    );
    return response.data.user;
  },
};

// Routes endpoints (routes are managed through node endpoints)
// Routes are available in node.approvedRoutes, node.availableRoutes, node.subnetRoutes
export const routesApi = {
  list: async (): Promise<Route[]> => {
    // Get all nodes and extract routes from them
    const machines = await machinesApi.list();
    const routes: Route[] = [];
    machines.forEach((machine) => {
      machine.approvedRoutes?.forEach((prefix) => {
        routes.push({
          id: `${machine.id}-${prefix}`,
          machine,
          prefix,
          advertised: machine.availableRoutes?.includes(prefix) || false,
          enabled: true,
          isPrimary: false,
          createdAt: machine.createdAt,
          updatedAt: machine.createdAt,
          deletedAt: null,
        });
      });
    });
    return routes;
  },

  enable: async (routeId: string): Promise<void> => {
    // Routes are enabled through node approved routes
    const [machineId, prefix] = routeId.split("-");
    const machine = await machinesApi.get(machineId);
    const approvedRoutes = machine.approvedRoutes || [];
    if (!approvedRoutes.includes(prefix)) {
      approvedRoutes.push(prefix);
      await apiClient.post(`/node/${machineId}/approve_routes`, {
        routes: approvedRoutes,
      });
    }
  },

  disable: async (routeId: string): Promise<void> => {
    // Routes are disabled by removing from approved routes
    const [machineId, prefix] = routeId.split("-");
    const machine = await machinesApi.get(machineId);
    const approvedRoutes = (machine.approvedRoutes || []).filter(
      (r) => r !== prefix
    );
    await apiClient.post(`/node/${machineId}/approve_routes`, {
      routes: approvedRoutes,
    });
  },

  delete: async (routeId: string): Promise<void> => {
    // Same as disable
    await routesApi.disable(routeId);
  },
};

// PreAuthKeys endpoints
export const preAuthKeysApi = {
  list: async (userName: string): Promise<PreAuthKey[]> => {
    // Get user first to get user ID
    const user = await usersApi.get(userName);
    const response = await apiClient.get<ListPreAuthKeysResponse>(
      `/preauthkey?user=${user.id}`
    );
    return response.data.preAuthKeys || [];
  },

  create: async (data: CreatePreAuthKeyRequest): Promise<PreAuthKey> => {
    // Get user ID from user name
    const user = await usersApi.get(data.user);
    const response = await apiClient.post<{ preAuthKey: PreAuthKey }>("/preauthkey", {
      ...data,
      user: user.id,
    });
    return response.data.preAuthKey;
  },

  expire: async (key: string, user?: string | User): Promise<void> => {
    // Expire endpoint requires both user (ID) and key in body
    let userId: string;
    if (typeof user === "string") {
      const userObj = await usersApi.get(user);
      userId = userObj.id;
    } else if (user) {
      userId = typeof user === "object" ? user.id : user;
    } else {
      // If user not provided, try with just key (may need adjustment)
      await apiClient.post("/preauthkey/expire", { key });
      return;
    }
    await apiClient.post("/preauthkey/expire", { user: userId, key });
  },
};

// ACLs endpoints (using /policy in Headscale API)
export const aclsApi = {
  get: async (): Promise<ACL> => {
    try {
      const response = await apiClient.get<{ policy: string }>("/policy");
      // Parse policy JSON string to ACL object
      const policy = JSON.parse(response.data.policy || "{}");
      return policy as ACL;
    } catch (error) {
      // Handle 500 error when policy file is not configured
      // Error message: "reading policy from path "": open : no such file or directory"
      if (error instanceof ApiError && error.status === 500) {
        // Policy file not configured, return empty ACL
        return {} as ACL;
      }
      throw error;
    }
  },

  update: async (acl: ACL): Promise<ACL> => {
    // Swagger: PUT /policy (not POST)
    const response = await apiClient.put<{ policy: string }>("/policy", {
      policy: JSON.stringify(acl),
    });
    // Parse policy JSON string to ACL object
    const policy = JSON.parse(response.data.policy || "{}");
    return policy as ACL;
  },
};

// API Keys endpoints
export const apiKeysApi = {
  list: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get<ListApiKeysResponse>("/apikey");
    return response.data.apiKeys || [];
  },

  create: async (data?: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    // Remove undefined fields before sending
    const requestData = data
      ? Object.fromEntries(
          Object.entries(data).filter(([, value]) => value !== undefined)
        )
      : {};
    const response = await apiClient.post<CreateApiKeyResponse>("/apikey", requestData);
    return response.data;
  },

  expire: async (prefix: string): Promise<void> => {
    await apiClient.post("/apikey/expire", { prefix });
  },

  delete: async (prefix: string): Promise<void> => {
    await apiClient.delete(`/apikey/${prefix}`);
  },
};

// Health endpoints
export const healthApi = {
  get: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>("/health");
    return response.data;
  },
};

// Debug endpoints
export const debugApi = {
  createNode: async (data: {
    user?: string;
    key?: string;
    name?: string;
    routes?: string[];
  }): Promise<Machine> => {
    // Swagger: POST /debug/node
    const response = await apiClient.post<{ node: Machine }>("/debug/node", data);
    return response.data.node;
  },
};

