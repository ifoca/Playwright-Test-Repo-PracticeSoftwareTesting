import { expect, type Locator, type Page } from '@playwright/test';
import { expectNoBrokenImages } from '@helpers/ui/image.helper';

export class Homepage {
  public readonly page: Page;
  public readonly productsGrid: Locator;
  public readonly productCard: Locator;
  public readonly productPrice: Locator;
  public readonly sortingDropdown: Locator;
  public readonly searchQueryInput: Locator;
  public readonly searchButton: Locator;
  public readonly searchResultCount: Locator;
  public readonly noResults: Locator;
  public readonly maxPriceRange: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productsGrid = page.locator('.col-md-9');
    this.productCard = page.locator('.card');
    this.sortingDropdown = page.getByTestId('sort');
    this.searchQueryInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.searchResultCount = page.getByTestId('search-result-count');
    this.noResults = page.getByTestId('no-results');
    // gets the price within the card locator
    this.productPrice = page.getByTestId('product-price');
    this.maxPriceRange = page.locator('.ngx-slider-pointer-max');
  }

  async gotoHomepage() {
    await this.page.goto('/');
  }

  async applyFilterLabel(labelName: string) {
    await this.page.getByLabel(labelName).check();
  }

  async selectSorting(sortingName: string) {
    await this.sortingDropdown.selectOption({ label: sortingName });
  }

  async getDisplayedPrices(): Promise<number[]> {
    const prices: number[] = [];

    const allCards = await this.getAllCards();
    // const count = await this.getCardsCount();

    for (let i = 0; i < allCards.length; i++) {
      const text = await this.productPrice.nth(i).textContent();

      prices.push(Number(text?.replace('$', '').trim()));
    }
    return prices;
  }

  async getAllCards(): Promise<Locator[]> {
    // all() does not wait for locators, it returns the current DOM directly
    return await this.productCard.all();
  }

  get productCards() {
    return this.page.locator('.card');
  }

  // performs one immediate count and does not retry if the DOM is still updating
  async getCardsCount(): Promise<number> {
    return await this.productCard.count();
  }

  /*
  This method is not the most effective one because we are pressing the arrow left
  key multiple times, until we reach the desired number. This means that we are 
  making a request to the endpoint with every key press
  */
  async setMaxPriceRange(target: number) {
    await this.maxPriceRange.focus();

    let current = Number(await this.maxPriceRange.getAttribute('aria-valuenow'));
    while (current > target) {
      await this.maxPriceRange.press('ArrowLeft');
      current = Number(await this.maxPriceRange.getAttribute('aria-valuenow'));
    }
  }

  async searchProductsByName(query: string) {
    await this.searchQueryInput.fill(query);
    await this.searchButton.click();
  }

  // ! if DOM is still updating, test will fail because the initial count is returned
  // async expectProductCount(expected: number) {
  //   const count = await this.getProductCardsCount();
  //   expect(count).toEqual(expected);
  // }

  async expectCardsToHaveCount(expected: number) {
    await expect(this.productCard).toHaveCount(expected);
  }

  async expectCardsNotToHaveCount(expected: number) {
    await expect(this.productCard).not.toHaveCount(expected);
  }

  async expectNoCardHasBrokenImages() {
    await expectNoBrokenImages(this.productCard);
  }

  async expectEveryCardToHavePrice() {
    const cards = await this.getAllCards();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      await expect(card.getByTestId('product-price')).toBeVisible();
    }
  }

  async expectEveryCardToHaveImage() {
    const cards = await this.getAllCards();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      await expect(card.locator('.card-img-wrapper')).toBeVisible();
    }
  }

  // similar loop, but by checking the count
  async expectEveryCardToHaveName() {
    const cardsCount = await this.getCardsCount();

    for (let i = 0; i < cardsCount; i++) {
      await expect(this.productCard.nth(i).getByTestId('product-name')).toBeVisible();
    }
  }

  async expectEveryCardContentToBeComplete() {
    const cards = await this.getAllCards();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      await expect(card.getByTestId('product-price')).toBeVisible();
      await expect(card.getByTestId('product-name')).toBeVisible();
      await expect(card.locator('.card-img-wrapper')).toBeVisible();
    }
  }

  async expectEachCardNameToContainText(text: string) {
    const cards = await this.getAllCards();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const name = card.getByTestId('product-name');
      await expect(name).toContainText(text, { ignoreCase: true });
    }
  }

  async expectSearchResultsCount(text: string) {
    expect(this.searchResultCount).toHaveText(text, { ignoreCase: true });
  }

  // async expectEachCardNameToContainText(text: string) {
  //   const count = await this.productCard.count();
  //   expect(count).toBeGreaterThan(0);

  //   for (let i = 0; i < count; i++) {
  //     await expect(this.productCard.nth(i).getByTestId('product-name')).toContainText(text, {
  //       ignoreCase: true,
  //     });
  //   }
  // }

  async expectEveryCardToHaveEcoBadge() {
    const cards = await this.getAllCards();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const ecoBadge = card.getByTestId('eco-badge');
      await expect(ecoBadge).toBeVisible();
      await expect(ecoBadge).toContainText('ECO');
    }
  }
}
