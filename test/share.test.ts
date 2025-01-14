import { cloudConfig } from '../src/globalConfig/cloud';
import type Eval from '../src/models/eval';
import { stripAuthFromUrl, createShareableUrl } from '../src/share';

jest.mock('../src/logger');
jest.mock('../src/globalConfig/cloud');
jest.mock('../src/fetch', () => ({
  fetchWithProxy: jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ id: 'mock-eval-id' }),
  }),
}));

describe('stripAuthFromUrl', () => {
  it('removes username and password from URL', () => {
    const input = 'https://user:pass@example.com/path?query=value#hash';
    const expected = 'https://example.com/path?query=value#hash';
    expect(stripAuthFromUrl(input)).toBe(expected);
  });

  it('handles URLs without auth info', () => {
    const input = 'https://example.com/path?query=value#hash';
    expect(stripAuthFromUrl(input)).toBe(input);
  });

  it('handles URLs with only username', () => {
    const input = 'https://user@example.com/path';
    const expected = 'https://example.com/path';
    expect(stripAuthFromUrl(input)).toBe(expected);
  });

  it('handles URLs with special characters in auth', () => {
    const input = 'https://user%40:p@ss@example.com/path';
    const expected = 'https://example.com/path';
    expect(stripAuthFromUrl(input)).toBe(expected);
  });

  it('returns original string for invalid URLs', () => {
    const input = 'not a valid url';
    expect(stripAuthFromUrl(input)).toBe(input);
  });

  it('handles URLs with IP addresses', () => {
    const input = 'http://user:pass@192.168.1.1:8080/path';
    const expected = 'http://192.168.1.1:8080/path';
    expect(stripAuthFromUrl(input)).toBe(expected);
  });
});

describe('createShareableUrl', () => {
  it('creates correct URL for cloud config', async () => {
    jest.mocked(cloudConfig.isEnabled).mockReturnValue(true);
    jest.mocked(cloudConfig.getAppUrl).mockReturnValue('https://app.example.com');
    jest.mocked(cloudConfig.getApiHost).mockReturnValue('https://api.example.com');
    jest.mocked(cloudConfig.getApiKey).mockReturnValue('mock-api-key');

    const mockEval: Partial<Eval> = {
      config: {},
      useOldResults: jest.fn().mockReturnValue(false),
      loadResults: jest.fn().mockResolvedValue(undefined),
    };

    const result = await createShareableUrl(mockEval as Eval);

    expect(result).toBe('https://app.example.com/eval/mock-eval-id');
  });
});
