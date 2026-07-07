import { test, expect } from '@fixtures/base.fixture';
import type { NewCart, Cart, CartItem, Product, ProductsResponse } from '@app-types/api.types';
import { apiLogin } from '@dataFactory/apiLogin';

test.describe('Cart API', () => {
  // Ensure sequential execution in one worker
  test.describe.configure({ mode: 'serial' });

  // Shared state across ALL test groups
  let cartId: string;
  let inStockProduct: Product;
  let outOfStockProduct: Product;

  test.beforeAll(async ({ apiRequest }) => {
    // Find products
    const productsResponse = await apiRequest.get('/products');
    const body: ProductsResponse = await productsResponse.json();
    const products = body.data;

    // Find first in stock / out of stock item from the products array
    const foundInStock = products.find((prod) => prod.in_stock === true);
    const foundOutOfStock = products.find((prod) => prod.in_stock === false);

    // Guard against undefined in stock / out of stock product
    if (!foundInStock || !foundOutOfStock) {
      throw new Error(
        'Could not find required in-stock and out-of-stock products in the catalogue',
      );
    }
    // Save for later usage
    inStockProduct = foundInStock;
    outOfStockProduct = foundOutOfStock;
  });

  test.describe('Create cart', () => {
    test('POST /carts creates a new cart and returns cart `id`', async ({ apiRequest }) => {
      const response = await apiRequest.post('/carts');
      const newCart: NewCart = await response.json();

      expect(response.status()).toBe(201);
      expect(newCart).toHaveProperty('id');
      expect(typeof newCart.id).toBe('string');
      expect(newCart.id.length).toBeGreaterThan(0);

      // Save for later usage
      cartId = newCart.id;
    });

    test('GET /carts/:id for the new cart returns an empty items list', async ({ apiRequest }) => {
      const response = await apiRequest.get(`/carts/${cartId}`);
      const cart: Cart = await response.json();

      expect(response.status()).toBe(200);
      // check the matching ids between the response and the newly created cart
      expect(cart.id).toBe(cartId);

      expect(Array.isArray(cart.cart_items)).toBe(true);
      expect(cart.cart_items.length).toBe(0);
    });
  });

  test.describe('Add and update cart item', () => {
    let quantity = 1;
    let updatedQuantity: number;

    test('POST /carts/:id with valid product and quantity adds item', async ({ apiRequest }) => {
      const addToCart = await apiRequest.post(`/carts/${cartId}`, {
        data: {
          product_id: inStockProduct.id,
          quantity: quantity,
        },
      });
      const data = await addToCart.json();

      expect(addToCart.status()).toBe(200);
      expect(data.result).toBe('item added or updated');
    });

    //     // Add a second item — verify items.length becomes 2
    // test('POST /carts/:id adding a second product increases item count', ...)

    test('PUT /carts/:id/product/quantity updates product quantity', async ({ apiRequest }) => {
      updatedQuantity = quantity + 1;
      const updateItemQuantity = await apiRequest.put(`/carts/${cartId}/product/quantity`, {
        data: {
          product_id: inStockProduct.id,
          quantity: updatedQuantity,
        },
      });
      const data = await updateItemQuantity.json();

      expect(updateItemQuantity.status()).toBe(200);
      expect(data.result).toBe('item added or updated');
    });

    test('GET /carts/:id returns all items with correct total', async ({ apiRequest }) => {
      const response = await apiRequest.get(`/carts/${cartId}`);
      const cart: Cart = await response.json();
      const cartItems = cart.cart_items;

      // Cart level
      expect(response.status()).toBe(200);
      expect(cart.id).toBe(cartId);

      // Items list
      expect(Array.isArray(cartItems)).toBe(true);
      expect(cartItems.length).toBe(1);

      // Item level
      const item: CartItem = cartItems[0];
      expect(item.product_id).toBe(inStockProduct.id);
      expect(item.cart_id).toBe(cartId);
      expect(item.quantity).toBe(updatedQuantity);

      // Nested product
      expect(item.product.id).toBe(inStockProduct.id);
      expect(item.product.name).toBe(inStockProduct.name);
      expect(item.product.price).toBe(inStockProduct.price);
      expect(typeof item.product.price).toBe('number');
      expect(item.product.in_stock).toBe(true);
    });
    // assert: item.quantity changed, other items unchanged

    test.describe('Validation messages', () => {
      test('Adding a non-existent product ID to cart returns 422', async ({ apiRequest }) => {
        const addToCart = await apiRequest.post(`/carts/${cartId}`, {
          data: {
            product_id: 'randomString',
            quantity: 1,
          },
        });
        const data = await addToCart.json();

        expect(addToCart.status()).toBe(422);
        expect(data.message).toBe('The selected product id is invalid.');
      });

      test('Adding a product with quantity 0 returns validation error', async ({ apiRequest }) => {
        const addToCart = await apiRequest.post(`/carts/${cartId}`, {
          data: {
            product_id: inStockProduct.id,
            quantity: 0,
          },
        });
        const data = await addToCart.json();

        expect(addToCart.status()).toBe(422);
        expect(data.message).toBe('The quantity field must be at least 1.');
      });

      test('Adding a product with negative quantity returns validation error', async ({
        apiRequest,
      }) => {
        const addToCart = await apiRequest.post(`/carts/${cartId}`, {
          data: {
            product_id: inStockProduct.id,
            quantity: -1,
          },
        });
        const data = await addToCart.json();

        expect(addToCart.status()).toBe(422);
        expect(data.message).toBe('The quantity field must be at least 1.');
      });

      // ❌ Users can add and checkout items which are out of stock
      // test('Adding an out-of-stock product returns expected response', async ({ apiRequest }) => {
      //   const addToCart = await apiRequest.post(`/carts/${cartId}`, {
      //     data: {
      //       product_id: outOfStockProduct.id,
      //       quantity: 1,
      //     },
      //   });
      //   const data = await addToCart.json();

      //   expect(addToCart.status()).toBe(422);
      //   expect(data.message).toBe('The item is out of stock');
      // });
    });
  });

  test.describe('Delete item and entire cart', () => {
    test('DELETE /carts/:id/product/:productId removes item', async ({ apiRequest }) => {
      const deleteProduct = await apiRequest.delete(
        `/carts/${cartId}/product/${inStockProduct.id}`,
      );
      expect(deleteProduct.status()).toBe(204);

      const cartResponse = await apiRequest.get(`/carts/${cartId}`);
      const cart: Cart = await cartResponse.json();
      const cartItems = cart.cart_items;

      // Cart level
      expect(cartResponse.status()).toBe(200);
      expect(cart.id).toBe(cartId);

      // Items list
      expect(Array.isArray(cartItems)).toBe(true);
      expect(cartItems.length).toBe(0);
    });

    test('DELETE /carts/:id deletes the entire cart', async ({ apiRequest }) => {
      const deleteCart = await apiRequest.delete(`/carts/${cartId}`);

      expect(deleteCart.status()).toBe(204);
    });

    test('GET /carts/:id with non-existent cart ID returns 404', async ({ apiRequest }) => {
      const response = await apiRequest.get(`/carts/${cartId}`);
      const data = await response.json();

      expect(response.status()).toBe(404);
      expect(data.message).toBe('Requested item not found');
    });
  });
});
