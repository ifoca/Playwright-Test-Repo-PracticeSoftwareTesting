import type { APIRequestContext } from '@playwright/test';
import type { Category } from '@app-types/api.types';

export const getCategoryIdBySubCategoryName = async (
  context: APIRequestContext,
  subCategoryName: string,
) => {
  const response = await context.get(`categories/tree`);

  if (!response.ok()) {
    throw new Error(
      `Getting categories tree failed with status ${response.status()}, ${await response.text()}`,
    );
  }
  const body: Category[] = await response.json();
  const category = body.find((c) => c.sub_categories.some((s) => s.name === subCategoryName));
  if (!category) {
    throw new Error(`Sub-category not found: ${subCategoryName}`);
  }
  const subCategory = category.sub_categories.find((s) => s.name === subCategoryName)!;
  return subCategory.id;
};
