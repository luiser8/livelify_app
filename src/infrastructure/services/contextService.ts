import { apiClient } from '../api/client';

export interface Context {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddContextRequest {
  name: string;
}

export interface GetMyContextsResponse {
  contexts: Context[];
}

export const contextService = {
  // API returns the context object directly, not wrapped
  addContext: async (data: AddContextRequest): Promise<Context> => {
    return apiClient.post<Context>('/users/add-context', data);
  },

  getMyContexts: async (): Promise<GetMyContextsResponse> => {
    return apiClient.get<GetMyContextsResponse>('/users/my-contexts');
  },
};

