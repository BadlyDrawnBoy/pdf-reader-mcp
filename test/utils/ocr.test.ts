import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { performOcr } from '../../src/utils/ocr.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('performOcr (mistral provider)', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
    delete process.env.MISTRAL_API_KEY;
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = { ...envBackup };
    vi.useRealTimers();
  });

  it('throws when MISTRAL_API_KEY is missing', async () => {
    await expect(
      performOcr('base64-image', { type: 'mistral' })
    ).rejects.toThrow('Mistral OCR provider requires MISTRAL_API_KEY.');
  });

  it('times out Mistral requests and aborts fetch', async () => {
    vi.useFakeTimers();
    process.env.MISTRAL_API_KEY = 'test-key';

    mockFetch.mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('Aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });

    const promise = performOcr('base64-image', {
      type: 'mistral',
      timeout_ms: 10,
      endpoint: 'https://api.mistral.ai/v1/chat/completions',
    });

    const assertion = expect(promise).rejects.toThrow('OCR request timed out after 10ms.');
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('returns text for successful Mistral responses', async () => {
    process.env.MISTRAL_API_KEY = 'test-key';

    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Extracted text' } }],
        }),
        { status: 200 }
      )
    );

    const result = await performOcr('base64-image', {
      type: 'mistral',
      model: 'mistral-large-2512',
    });

    expect(result).toEqual({ provider: 'mistral', text: 'Extracted text' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.mistral.ai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      })
    );
  });
});
