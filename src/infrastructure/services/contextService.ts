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

export interface AddContextResponse {
  success: boolean;
  context: Context;
  message?: string;
}

export interface GetMyContextsResponse {
  contexts: Context[];
}

export const contextService = {
  addContext: async (data: AddContextRequest): Promise<AddContextResponse> => {
    return apiClient.post<AddContextResponse>('/users/add-context', data);
  },

  getMyContexts: async (): Promise<GetMyContextsResponse> => {
    return apiClient.get<GetMyContextsResponse>('/users/my-contexts');
  },
};

