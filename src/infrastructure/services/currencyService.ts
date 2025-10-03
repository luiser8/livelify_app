import { apiClient } from '../api/client';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export interface GetAllCurrenciesResponse {
  currencies: Currency[];
}

export const currencyService = {
  getAllCurrencies: async (): Promise<GetAllCurrenciesResponse> => {
    return apiClient.get<GetAllCurrenciesResponse>('/currencies/all');
  },
};

