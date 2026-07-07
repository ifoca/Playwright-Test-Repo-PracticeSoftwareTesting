import { test, expect } from '@fixtures/base.fixture';
import { APIResponse } from '@playwright/test';
import type { ProductsResponse, Product } from '@app-types/api.types';

// Shared response object — populated once and reused across tests
let productsResponse: APIResponse;
let body: ProductsResponse;
let product: Product;

test.describe('GET /products', () => {
  test.beforeEach(async ({ apiRequest }) => {
    productsResponse = await apiRequest.get('/products');
    body = await productsResponse.json();
  });

  // pagination contract
  test('GET /products returns 200 with paginated envelope (current_page, data[])', async () => {
    expect(productsResponse.status()).toBe(200);
    expect(body.current_page).toBe(1);
    expect(body.per_page).toBe(9);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('data array contains at least one product', async () => {
    expect(body.data.length).toBeGreaterThan(0);
  });

  // product contract
  test('Each product has `id`, `name`, `description`, `price`, `in_stock`, `category`, `brand`', async () => {
    for (const product of body.data) {
      // checks that no id is empty
      expect(typeof product.id).toBe('string');
      expect(product.id.length).toBeGreaterThan(0);

      // checks that no name is empty
      expect(typeof product.name).toBe('string');
      expect(product.name.length).toBeGreaterThan(0);

      expect(typeof product.description).toBe('string');

      // check that every price is > 0
      expect(typeof product.price).toBe('number');
      expect(product.price).toBeGreaterThan(0);

      expect(product.category).toBeTruthy();
      expect(typeof product.category).toBe('object');

      expect(product.brand).toBeTruthy();
      expect(typeof product.brand).toBe('object');

      expect(typeof product.is_location_offer).toBe('boolean');
      expect(typeof product.is_rental).toBe('boolean');
      expect(typeof product.in_stock).toBe('boolean');
      expect(typeof product.is_eco_friendly).toBe('boolean');
      expect(typeof product.co2_rating).toBe('string');
    }
  });

  test('Each product `category` has `id`, `name`, `slug`', async () => {
    for (const product of body.data) {
      expect(product.category).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        slug: expect.any(String),
      });
    }
  });

  test('Each product `brand` has `id`, `name`', async () => {
    for (const product of body.data) {
      expect(product.brand).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    }
  });
});

test.describe('GET products/:id', async () => {
  test('GET /products/:id returns full product detail for a valid ID', async ({ apiRequest }) => {
    productsResponse = await apiRequest.get('/products');
    body = await productsResponse.json();
    const productId: String = body.data[0].id;

    const response = await apiRequest.get(`/products/${productId}`);
    product = await response.json();

    console.log(product);
    expect(response.status()).toBe(200);
    // checks that no id is empty
    expect(product.id).toBe(productId);

    // checks that no name is empty
    expect(typeof product.name).toBe('string');
    expect(product.name.length).toBeGreaterThan(0);

    expect(typeof product.description).toBe('string');

    // check that every price is > 0
    expect(typeof product.price).toBe('number');
    expect(product.price).toBeGreaterThan(0);

    expect(product.category).toBeTruthy();
    expect(typeof product.category).toBe('object');

    expect(product.brand).toBeTruthy();
    expect(typeof product.brand).toBe('object');

    expect(typeof product.is_location_offer).toBe('boolean');
    expect(typeof product.is_rental).toBe('boolean');
    expect(typeof product.in_stock).toBe('boolean');
    expect(typeof product.is_eco_friendly).toBe('boolean');
    expect(typeof product.co2_rating).toBe('string');
  });

  test('GET /products/:id returns 404 for a non-existent ID ', async ({ apiRequest }) => {
    const response = await apiRequest.get('/products/nonexistent');
    const data = await response.json();

    expect(response.status()).toBe(404);
    expect(data.message).toBe('Requested item not found');
  });
});

test.describe('GET products/search?q=name', async () => {
  test('GET /products/search?q=hammer` returns only matching products', async ({ apiRequest }) => {
    const searchedName = 'hammer';
    const response = await apiRequest.get(`/products/search?q=${searchedName}`);
    body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.length).toBeGreaterThan(0);

    for (const prod of body.data) {
      // transform all the strings to lower case
      expect(prod.name.toLocaleLowerCase()).toContain(searchedName);
    }
  });
  test('GET /products/search?q=nonexistent returns empty `data[]`, not an error', async ({
    apiRequest,
  }) => {
    const searchedName = 'nonexistent';
    const response = await apiRequest.get(`/products/search?q=${searchedName}`);
    body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.length).toBe(0);
    expect(body.total).toBe(0);
  });

  test('Search with special characters (`<script>`, `%`) returns 200, no 500', async ({
    apiRequest,
  }) => {
    const specialQueries = ['%', '<script>alert(1)</script>', "'", '&', '🔧'];
    for (const query of specialQueries) {
      const response = await apiRequest.get('/products/search', {
        params: { q: query },
      });

      // The core assertion: never a 500
      expect(response.status()).not.toBe(500);

      // It should be a valid response either way
      expect([200, 400, 422]).toContain(response.status());

      const text = await response.text();
      expect(text).not.toContain('<script>');

      if (response.status() === 200) {
        body = await response.json();
        expect(Array.isArray(body.data)).toBe(true);
      }
    }
  });
});
