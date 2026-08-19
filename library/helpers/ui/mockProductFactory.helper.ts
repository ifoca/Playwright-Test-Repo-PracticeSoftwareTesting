import type { Product } from '@app-types/api.types';

export function buildMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'default-id',
    name: 'Default Product',
    description: 'mock response',
    price: 9.99,
    is_location_offer: false,
    is_rental: false,
    in_stock: true,
    co2_rating: 'A',
    is_eco_friendly: false,
    brand: { id: 'b1', name: 'Mock Brand', slug: 'mock-brand' },
    category: {
      id: 'c1',
      parent_id: null,
      name: 'Mock Category',
      slug: 'mock-category',
      sub_categories: [],
    },
    product_image: {
      by_name: 'mock',
      by_url: 'mock',
      source_name: 'mock',
      source_url: 'mock',
      file_name: 'mock.jpg',
      title: 'mock',
      id: 'img1',
    },
    ...overrides,
  };
}
