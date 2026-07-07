import { test, expect } from '@fixtures/base.fixture';
import { generateRandomString } from '@helpers/utils';
import type { RegisterResponse } from '@app-types/api.types';

const CUSTOMER_EMAIL = process.env.CUSTOMER_EMAIL!;

test.describe('Registration tests', () => {
  test.describe('Successful registration', () => {
    test('POST /users/register with valid credentials returns 201 with correct user data', async ({
      apiRequest,
    }) => {
      const email = `test+${Date.now()}@test.com`;
      const password = generateRandomString(10);

      const response = await apiRequest.post('/users/register', {
        data: {
          first_name: 'Great',
          last_name: 'Testing',
          dob: '1995-01-01',
          phone: '123456789',
          email: email,
          password: password,
          address: {
            street: 'My street',
            house_number: '22',
            city: 'Bonn',
            state: 'NRW',
            country: 'DE',
            postal_code: '000111',
          },
        },
      });

      const body: RegisterResponse = await response.json();

      expect(response.status()).toBe(201);
      expect(body).toHaveProperty('id');
      expect(body.first_name).toBe('Great');
      expect(body.last_name).toBe('Testing');
      expect(body.email).toBe(email);
      // Password should never be returned in the response
      expect(body).not.toHaveProperty('password');

      expect(body.id).toBeDefined();
      expect(typeof body.id).toBe('string');
      expect(body.id.length).toBeGreaterThan(0);
    });
  });

  test.describe('Registration validation messages', () => {
    test('POST /users/register` with existing email returns 409', async ({ apiRequest }) => {
      const response = await apiRequest.post('/users/register', {
        data: {
          first_name: 'Great',
          last_name: 'Testing',
          dob: '1995-01-01',
          phone: '123456789',
          email: CUSTOMER_EMAIL,
          password: generateRandomString(10),
          address: {
            street: 'My street',
            house_number: '22',
            city: 'Bonn',
            state: 'NRW',
            country: 'DE',
            postal_code: '000111',
          },
        },
      });

      const body = await response.json();
      expect(response.status()).toBe(409);
      expect(body.email).toContain('A customer with this email address already exists.');
    });

    test('POST /users/register` with missing required fields returns 422', async ({
      apiRequest,
    }) => {
      const response = await apiRequest.post('/users/register', {
        data: {
          dob: '1995-01-01',
          phone: '123456789',
          address: {
            street: 'My street',
            house_number: '22',
            city: 'Bonn',
            state: 'NRW',
            country: 'DE',
            postal_code: '000111',
          },
        },
      });

      const body = await response.json();
      expect(response.status()).toBe(422);
      expect(body.first_name).toContain('The first name field is required.');
      expect(body.last_name).toContain('The last name field is required.');
      expect(body.email).toContain('The email field is required.');
      expect(body.password).toContain('The password field is required.');
    });

    test('POST /users/register` with invalid date of birth format returns 422', async ({
      apiRequest,
    }) => {
      const email = `test+${Date.now()}@test.com`;
      const password = generateRandomString(10);
      // create unix date to US format (1/1/1970)
      const usFormattedDate = new Intl.DateTimeFormat('en-US').format(new Date(0));

      const response = await apiRequest.post('/users/register', {
        data: {
          first_name: 'Great',
          last_name: 'Testing',
          dob: usFormattedDate,
          phone: '123456789',
          email: email,
          password: password,
          address: {
            street: 'My street',
            house_number: '22',
            city: 'Bonn',
            state: 'NRW',
            country: 'DE',
            postal_code: '000111',
          },
        },
      });

      const body = await response.json();

      expect(response.status()).toBe(422);
      expect(body.dob).toContain('The dob field must match the format Y-m-d.');
    });

    test('POST /users/register` with date of birth < 18 years returns 422', async ({
      apiRequest,
    }) => {
      const email = `test+${Date.now()}@test.com`;
      const password = generateRandomString(10);
      // create current date to Swedish format (currentYear/currentMonth/currentDay)
      const svFormattedDate = new Intl.DateTimeFormat('sv-SE').format(new Date());

      const response = await apiRequest.post('/users/register', {
        data: {
          first_name: 'Great',
          last_name: 'Testing',
          dob: svFormattedDate,
          phone: '123456789',
          email: email,
          password: password,
          address: {
            street: 'My street',
            house_number: '22',
            city: 'Bonn',
            state: 'NRW',
            country: 'DE',
            postal_code: '000111',
          },
        },
      });

      const body = await response.json();

      expect(response.status()).toBe(422);
      expect(body.dob).toContain('Customer must be 18 years old.');
    });
  });
});
