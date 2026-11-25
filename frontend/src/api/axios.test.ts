import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import api from './axios';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

describe('Axios Interceptor', () => {
  let mockApi: MockAdapter;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockApi = new MockAdapter(api);
    mockAxios = new MockAdapter(axios); // Because the interceptor uses a fresh axios.post call!
    localStorage.clear();

    // We also need to mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '/' },
      writable: true
    });
  });

  afterEach(() => {
    mockApi.restore();
    mockAxios.restore();
  });

  it('triggers /api/token/refresh/ on 401 response and retries', async () => {
    localStorage.setItem('refresh_token', 'fake-refresh-token');

    // The interceptor makes a fresh axios.post to api.defaults.baseURL + '/token/refresh/'
    const refreshUrl = `${api.defaults.baseURL}/token/refresh/`;
    mockAxios.onPost(refreshUrl).reply(200, { access: 'new-access-token', refresh: 'new-refresh-token' });

    // For the api instance, the first call fails with 401, the retry succeeds
    mockApi.onGet('/protected-data').replyOnce(401);
    mockApi.onGet('/protected-data').reply(200, { data: 'success' });

    const response = await api.get('/protected-data');

    expect(response.status).toBe(200);
    expect(response.data.data).toBe('success');
    expect(localStorage.getItem('access_token')).toBe('new-access-token');
  });
});
