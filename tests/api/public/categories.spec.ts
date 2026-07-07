import { test, expect } from '@fixtures/base.fixture';
import type { Category } from '@app-types/api.types';

test.describe('GET categories', () => {
  test('GET /categories/tree` returns category hierarchy', async ({ apiRequest }) => {
    const response = await apiRequest.get('/categories/tree');
    const categories: Category[] = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);

    for (const category of categories) {
      // Top-level category shape
      expect(typeof category.id).toBe('string');
      expect(category.id.length).toBeGreaterThan(0);
      expect(typeof category.name).toBe('string');
      expect(category.name.length).toBeGreaterThan(0);
      expect(typeof category.slug).toBe('string');
      expect(category.slug.length).toBeGreaterThan(0);
      expect(category.parent_id).toBeNull(); // top-level categories have no parent
      expect(Array.isArray(category.sub_categories)).toBe(true);
      expect(category.sub_categories.length).toBeGreaterThan(0);

      // Sub-categories
      for (const sub of category.sub_categories) {
        expect(typeof sub.id).toBe('string');
        expect(sub.id.length).toBeGreaterThan(0);
        expect(typeof sub.name).toBe('string');
        expect(sub.name.length).toBeGreaterThan(0);
        expect(typeof sub.slug).toBe('string');
        expect(sub.slug.length).toBeGreaterThan(0);
        expect(sub.parent_id).toBe(category.id); // sub's parent_id matches its parent
        expect(Array.isArray(sub.sub_categories)).toBe(true);
      }
    }
  });
});

// id: string;
//   parent_id?: string;
//   name: string;
//   slug: string;
//   sub_categories?: string[];
