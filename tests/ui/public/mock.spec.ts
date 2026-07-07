import { test, expect } from '@fixtures/base.fixture';
import type { ProductsResponse, Product } from '../../../library/types/api.types';

test.describe('Test with mock data', () => {
  test('Check product page with mocked product', async ({ mockResponse, page }) => {
    const products: ProductsResponse = {
      current_page: 1,
      data: [
        {
          id: '01JFG8Q5XKZJY4BEYQ87PC2Q1Y',
          name: 'Ionut Mock',
          description: 'mock response',
          price: 9.99,
          is_location_offer: true,
          is_rental: true,
          in_stock: true,
          co2_rating: 'A',
          is_eco_friendly: true,
          brand: {
            id: 'string',
            name: 'new brand',
            slug: 'new-brand',
          },
          category: {
            id: 'string',
            parent_id: 'string',
            name: 'new category',
            slug: 'new-category',
            sub_categories: ['string'],
          },
          product_image: {
            by_name: 'string',
            by_url: 'string',
            source_name: 'string',
            source_url: 'string',
            file_name: 'string',
            title: 'string',
            id: 'string',
          },
        },
      ],
      from: 1,
      last_page: 1,
      per_page: 1,
      to: 1,
      total: 1,
    };

    await mockResponse<ProductsResponse>(
      '/products?page=1&between=price,1,100&is_rental=false',
      products,
    );

    await page.goto('/');
    await expect(page.getByText(`${products.data[0].name}`)).toBeVisible();
  });
});
