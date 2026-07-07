import { test, expect } from '@fixtures/base.fixture';
import type { ProductsResponse } from '@app-types/api.types';
import { buildMockProduct } from '@helpers/ui/mockProductFactory';

test.describe('Homepage UI tests', () => {
  test.beforeEach(async ({ homepage }) => {
    await homepage.gotoHomepage();
    await homepage.expectCardsNotToHaveCount(0);
  });

  test('Product card shows name, price, and image ', async ({ homepage }) => {
    await homepage.expectEveryCardContentToBeComplete();
  });

  test.describe('Homepage filter tests', () => {
    test('Filtering by category shows only products in that category', async ({
      homepage,
      captureResponse,
    }) => {
      const screwdriver = 'Screwdriver';
      const [productsPromise] = await Promise.all([
        captureResponse<ProductsResponse>(/\/products\?.*by_category=/),
        await homepage.applyFilterLabel(screwdriver),
      ]);

      const apiProducts = productsPromise.data;
      await homepage.expectCardsToHaveCount(apiProducts.length);

      for (const prod of apiProducts) {
        expect(prod.category?.name).toBe(screwdriver);
      }
      await homepage.expectEachCardNameToContainText(screwdriver);
    });

    test('Filtering by eco-friendly shows only eco-rated products', async ({
      homepage,
      captureResponse,
    }) => {
      const ecoFriendly = 'Show only eco-friendly products';

      const [productsPromise] = await Promise.all([
        captureResponse<ProductsResponse>(/\/products\?.*&eco_friendly=true/),
        await homepage.applyFilterLabel(ecoFriendly),
      ]);

      const apiProducts = productsPromise.data;
      await homepage.expectCardsToHaveCount(apiProducts.length);

      for (const prod of apiProducts) {
        expect(prod.is_eco_friendly).toBe(true);
      }

      await homepage.expectEveryCardToHaveEcoBadge();
    });
  });

  test.describe('Homepage sorting tests', () => {
    test('Sort by price descending changes list order correctly', async ({
      homepage,
      captureResponse,
    }) => {
      const descendingPrice = 'Price (High - Low)';

      const [productsPromise] = await Promise.all([
        captureResponse<ProductsResponse>(
          //   '/products?page=0&sort=price,desc&between=price,1,100&is_rental=false', // full url as string
          /\/products\?.*&sort=price,desc/, // matching url pattern as regex
        ),
        await homepage.selectSorting(descendingPrice),
      ]);

      const apiProducts = productsPromise.data;
      const prices = apiProducts.map((product) => product.price);

      await expect(homepage.productCard.first().getByTestId('product-price')).toHaveText(
        `$${prices[0].toFixed(2)}`,
      );

      // check that the API correctly sorted the prices
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }

      const uiPrices = await homepage.getDisplayedPrices();
      expect(uiPrices).toEqual(prices);
    });
    test('Sort by price ascending changes list order correctly', async ({
      homepage,
      captureResponse,
    }) => {
      const ascendingPrice = 'Price (Low - High)';

      const [productsPromise] = await Promise.all([
        captureResponse<ProductsResponse>(/\/products?.*sort=price,asc/),
        await homepage.selectSorting(ascendingPrice),
      ]);

      const apiProducts = productsPromise.data;
      const prices = apiProducts.map((product) => product.price);

      await expect(homepage.productCard.first().getByTestId('product-price')).toHaveText(
        `$${prices[0].toFixed(2)}`,
      );

      // check that the API correctly sorted the prices
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }

      const uiPrices = await homepage.getDisplayedPrices();
      expect(uiPrices).toEqual(prices);
    });
  });

  test.describe('Homepage product search tests', () => {
    test('Search returns matching products', async ({ homepage, captureResponse }) => {
      const searchParam = 'drill';

      const [productsPromise] = await Promise.all([
        captureResponse<ProductsResponse>(`/products/search?q=${searchParam}`),
        await homepage.searchProductsByName(searchParam),
      ]);
      const apiProducts = productsPromise;

      await expect(homepage.productCard).toHaveCount(apiProducts.data.length);
      await homepage.expectSearchResultsCount(
        `${apiProducts.data.length} products found for '${searchParam}'`,
      );
      await homepage.expectEachCardNameToContainText(searchParam);
    });

    test('Search with no matches shows empty state, not an error ', async ({
      homepage,
      captureResponse,
    }) => {
      const searchParam = 'blablabla';

      const [productsPromise] = await Promise.all([
        captureResponse<ProductsResponse>(`/products/search?q=${searchParam}`),
        await homepage.searchProductsByName(searchParam),
      ]);

      const apiProducts = productsPromise;
      await expect(homepage.productCard).toHaveCount(apiProducts.data.length);
      await homepage.expectSearchResultsCount(
        `${apiProducts.data.length} products found for '${searchParam}'`,
      );
      if (apiProducts.data.length === 0) {
        await expect(homepage.noResults).toBeVisible();
        await expect(homepage.noResults).toHaveText('There are no products found.');
      }
    });
  });
});

test.describe('Out of stock test', () => {
  test('Out-of-stock product shows "Out of stock" badge', async ({ homepage, captureResponse }) => {
    const [productsPromise] = await Promise.all([
      captureResponse<ProductsResponse>('/products'),
      await homepage.gotoHomepage(),
    ]);

    const apiProducts = productsPromise.data;
    await homepage.expectCardsToHaveCount(apiProducts.length);

    /* Version 1: 
        Playwright's .filter({ has: ... }) is designed for finding a locator that contains a specific 
        child element. This is the idiomatic Playwright way and doesn't rely on index ordering at all.
    */
    // creates a new array of items which are not in stock
    // const outOfStockProducts = apiProducts.filter((prod) => prod.in_stock === false);

    // for (const prod of outOfStockProducts) {
    //   // creates a new array of 1 item / card locators who have a matching text
    //   const matchingCard = homepage.productCard.filter({
    //     has: homepage.page.getByTestId('product-name').filter({ hasText: prod.name }),
    //   });
    //   await expect(matchingCard.getByTestId('out-of-stock')).toBeVisible();
    // }

    /* Version 2
        Use an index for the items in the api response and compare it with the nth(index) locators in the UI
    */

    // map with index gives you both the product and its position, filter keeps only out-of-stock ones,
    // then the final map returns a new array just with the indexes e.g. [3, 4].
    const outOfStockIndices = apiProducts
      .map((prod, index) => ({ prod, index })) // creates a new array with an object with 2 properties: prod and index
      .filter(({ prod }) => prod.in_stock === false) // creates a new array with the product not being in stock
      .map(({ index }) => index); // creates a final array with the index of that filtered product

    const cards = await homepage.productCard.all();

    for (const i of outOfStockIndices) {
      await expect(cards[i].getByTestId('out-of-stock')).toBeVisible();
    }
  });
});

test.describe('Test with mock data', () => {
  test('Check product page with mocked product', async ({ mockResponse, homepage }) => {
    const products: ProductsResponse = {
      current_page: 1,
      data: [buildMockProduct()],
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

    await homepage.gotoHomepage();
    await expect(homepage.productCard.first()).toBeVisible();
    await expect(homepage.productCard.first()).toContainText(`${products.data[0].name}`);
    await expect(homepage.productCard.first()).toContainText(`${products.data[0].price}`);
  });

  test('Out-of-stock badge renders when API returns in_stock: false', async ({
    mockResponse,
    homepage,
  }) => {
    // const products: ProductsResponse = {
    //   current_page: 1,
    //   data: [
    //     buildMockProduct({ id: '1', name: 'In Stock Item', in_stock: false }),
    //     buildMockProduct({ id: '2', name: 'Out of Stock Item', in_stock: false }),
    //   ],
    //   from: 1,
    //   last_page: 1,
    //   per_page: 9,
    //   to: 2,
    //   total: 2,
    // };

    const products: ProductsResponse = {
      current_page: 1,
      data: [
        buildMockProduct({ id: '1', name: 'In Stock Item', in_stock: false }),
        buildMockProduct({ id: '2', name: 'Out of Stock Item', in_stock: true }),
      ],
      from: 1,
      last_page: 1,
      per_page: 9,
      to: 9,
      total: 2,
    };

    await mockResponse<ProductsResponse>(
      '/products?page=1&between=price,1,100&is_rental=false',
      products,
    );
    await homepage.gotoHomepage();
    await expect(homepage.productCard.first()).toBeVisible();

    const cards = await homepage.getAllCards();

    await expect(cards[0].getByTestId('out-of-stock')).toBeVisible();
    await expect(cards[1].getByTestId('out-of-stock')).not.toBeVisible();
  });

  test('Eco-friendly badge renders when API returns is_eco_friendly: true', async ({
    homepage,
    mockResponse,
  }) => {
    const products: ProductsResponse = {
      current_page: 1,
      data: [
        buildMockProduct({ id: '1', name: 'Regular Item', is_eco_friendly: false }),
        buildMockProduct({ id: '2', name: 'Eco Item', is_eco_friendly: true }),
      ],
      from: 1,
      last_page: 1,
      per_page: 9,
      to: 9,
      total: 2,
    };

    await mockResponse<ProductsResponse>(
      '/products?page=1&between=price,1,100&is_rental=false',
      products,
    );
    await homepage.gotoHomepage();
    await expect(homepage.productCard.first()).toBeVisible();

    const cards = await homepage.getAllCards();

    await expect(cards[0].getByTestId('eco-badge')).not.toBeVisible();
    await expect(cards[1].getByTestId('eco-badge')).toBeVisible();
  });

  test('Empty catalogue state renders correctly when API returns data: []', async ({
    homepage,
    mockResponse,
  }) => {
    const products: ProductsResponse = {
      current_page: 1,
      data: [],
      from: 1,
      last_page: 1,
      per_page: 9,
      to: 9,
      total: 2,
    };

    await mockResponse<ProductsResponse>(
      '/products?page=1&between=price,1,100&is_rental=false',
      products,
    );
    await homepage.gotoHomepage();
    await expect(homepage.noResults).toBeVisible();
    await expect(homepage.noResults).toHaveText('There are no products found.');
  });

  // the page keeps hanging when there is a 500 error, no error message displayed in the UI
  test.skip('Product list shows error/fallback UI when API returns 500 ', async ({
    homepage,
    mockResponse,
  }) => {
    const products: ProductsResponse = {
      current_page: 1,
      data: [buildMockProduct()],
      from: 1,
      last_page: 1,
      per_page: 1,
      to: 1,
      total: 1,
    };

    await mockResponse('/products?page=1&between=price,1,100&is_rental=false', products, {
      status: 500,
    });
    await homepage.gotoHomepage();
    await expect(homepage.sortingDropdown).toBeVisible();
    // await expect(homepage.noResults).toBeVisible();
    // await expect(homepage.noResults).toHaveText('There are no products found.');
  });
});

test.describe('Redirect to product details test', () => {
  test('Clicking on a product opens correct product details page', async ({
    page,
    homepage,
    captureResponse,
  }) => {
    const [productsPromise] = await Promise.all([
      captureResponse<ProductsResponse>('/products'),
      await homepage.gotoHomepage(),
    ]);

    const clickedItem = productsPromise.data[0];
    await homepage.productCard.first().click();
    await expect(page).toHaveURL(`/product/${clickedItem.id}`);
    await expect(page.getByTestId('product-name')).toHaveText(`${clickedItem.name}`, {
      ignoreCase: true,
    });
  });
});
