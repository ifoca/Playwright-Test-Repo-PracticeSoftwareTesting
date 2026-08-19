import { test as base } from '@playwright/test';
import type { Route } from '@playwright/test';
import type { BodyMatcher } from '@helpers/reqBodyMatcher.helper';

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
   * @param bodyMatcher - matching the expected body with the body of the intercepted request
   * @returns Promise that resolves with the parsed JSON response
   *
   * @example
   * const products = await apiInterceptor.captureResponse<Product[]>('products')
   */
  captureResponse: <T = unknown>(
    urlPattern: string | RegExp,
    bodyMatcher?: BodyMatcher,
  ) => Promise<T>;

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
  captureResponse: async ({ page }, use) => {
    await use(
      async <T = unknown>(urlPattern: string | RegExp, bodyMatcher?: BodyMatcher): Promise<T> => {
        const responsePromise = page.waitForResponse((response) => {
          const url = response.url();
          const urlMatches =
            typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);

          if (!urlMatches) return false;

          // Only consider XHR/fetch API requests
          const resourceType = response.request().resourceType();
          if (resourceType !== 'xhr' && resourceType !== 'fetch') return false;

          if (!bodyMatcher) return true;

          // Check the request body for the QUERY method
          const requestBody = response.request().postData();
          if (!requestBody) return false;

          try {
            const parsed = JSON.parse(requestBody);
            return bodyMatcher(parsed);
          } catch {
            return false;
          }
        });

        const response = await responsePromise;
        return response.json() as Promise<T>;
      },
    );
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
