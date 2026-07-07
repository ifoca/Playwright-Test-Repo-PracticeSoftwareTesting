import { type Locator, expect } from '@playwright/test';

export const expectNoBrokenImages = async (locator: Locator) => {
  const count = await locator.count();

  for (let i = 0; i < count; i++) {
    const isBroken = await locator
      .nth(i)
      .evaluate((img: HTMLImageElement) => img.naturalWidth === 0 || img.naturalHeight === 0);
    expect(isBroken).toBe(false);
  }
};
/*
  locator.evaluate(fn) runs a function inside the browser (DOM context), 
  not in your test (Node.js).
  - images.nth(i) - selects the element using Playwright
  - we find the DOM element identified with the playwright locator page.locator('.card img')
  and pass it to the evaluate function, so not this becomes an HTML element: <img src="..." />, a real DOM object
  - .evaluate(...) - tells Playwright to take the DOM element and run a function on it inside the browser,
  and now we have access to DOM properties, such as .naturalWidth, .alt etc.
  - then with the return statement we pass back the data to playwright test
*/
