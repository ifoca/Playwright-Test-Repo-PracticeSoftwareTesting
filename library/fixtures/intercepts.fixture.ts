import { test as base } from '@playwright/test';
import type { Route } from '@playwright/test';

const API_URL = process.env.API_BASE_URL;

// define what properties the mock can take
export type MockOptions = {
  status?: number;
  contentType?: string;
  headers?: Record<string, string>;
};

// define a type for the intercepted and for the mocked requests
type InterceptFixtures = {
  // take a url as a parameter and returns the type of the response OR unknown
  /**
   * Captures the response from an API call
   * @param urlPattern - URL pattern to intercept (supports wildcards)
   * @returns Promise that resolves with the parsed JSON response
   *
   * @example
   * const products = await apiInterceptor.captureResponse<Product[]>('products')
   */
  captureResponse: <T = unknown>(urlPattern: string | RegExp) => Promise<T>;

  // takes a url, some data and eventually some optional extra mockOptions params for making a fake request
  /**
   * Mocks an API response with custom data
   * @param urlPattern - URL pattern to intercept
   * @param data - Mock data you want the endpoint to return
   * @param options - Optional status code, headers, etc.
   *
   * @example
   * await apiInterceptor.mockResponse('/products', mockProducts, { status: 200 });
   * await apiInterceptor.mockResponse('/login', { error: 'Unauthorized' }, { status: 401 });
   */
  mockResponse: <T = unknown>(urlPattern: string, data: T, options?: MockOptions) => Promise<void>;
};

export const test = base.extend<InterceptFixtures>({
  // captureResponse: async ({ page }, use) => {
  //   await use(async <T = unknown>(urlPattern: string): Promise<T> => {
  //     return new Promise((resolve, reject) => {
  //       page.route(API_URL + urlPattern, async (route: Route) => {
  //         try {
  //           const response = await route.fetch();
  //           const data = await response.json();
  //           await route.continue();
  //           resolve(data as T);
  //         } catch (error) {
  //           await route.continue();
  //           reject(error);
  //         }
  //       });
  //     });
  //   });
  // },

  captureResponse: async ({ page }, use) => {
    await use(async <T = unknown>(urlPattern: string | RegExp): Promise<T> => {
      const responsePromise = page.waitForResponse((response) => {
        const url = response.url();
        const urlMatches =
          typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
        return urlMatches; // && response.status() === 200 ; // no status filter — the fixture just captures, the test asserts
      });

      const response = await responsePromise;
      return response.json() as Promise<T>;
    });
  },

  mockResponse: async ({ page }, use) => {
    await use(
      async <T = unknown>(
        urlPattern: string,
        data: T,
        options: MockOptions = {},
      ): Promise<void> => {
        // If options = {}:
        // status → undefined in options → uses default = 200
        // contentType → undefined in options → uses default = 'application/json'
        // headers → undefined in options → uses default = {}

        // If options = { status: 500 }:
        // status → 500 (found in options)
        // contentType → undefined in options → uses default = 'application/json'
        // headers → undefined in options → uses default = {}
        const { status = 200, contentType = 'application/json', headers = {} } = options;

        await page.route(API_URL + urlPattern, (route: Route) => {
          route.fulfill({
            status,
            contentType,
            headers,
            body: JSON.stringify(data),
          });
        });
      },
    );
  },
});

export { expect } from '@playwright/test';
