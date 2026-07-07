import { writeFile, mkdir } from 'fs/promises';
import { AUTH_DIR, USER_FILE } from '@config/filePaths';
import { generateRandomString } from '@helpers/utils';
import type { APIRequestContext } from '@playwright/test';

export const registerUser = async (request: APIRequestContext) => {
  // create .auth directory if it does not exist
  await mkdir(AUTH_DIR, { recursive: true });

  // crete new credentials
  const password = generateRandomString(10);
  const email = `test+${Date.now()}@test.com`;

  const response = await request.post('/users/register', {
    data: {
      first_name: 'Great',
      last_name: 'Testing',
      dob: '1995-01-01',
      phone: '123456789',
      email: email,
      password: password,
      address: {
        street: 'My street',
        city: 'Bonn',
        state: 'NRW',
        country: 'DE',
        postal_code: '000111',
      },
    },
  });

  if (!response.ok()) {
    // Fail if the registration does not succeed
    throw new Error(
      `Registration failed with status ${response.status()}, ${await response.text()}`,
    );
  }

  const registeredUser = await response.json();

  const userData = {
    id: registeredUser.id,
    email,
    password,
    first_name: registeredUser.first_name,
    last_name: registeredUser.last_name,
  };

  await writeFile(USER_FILE, JSON.stringify(userData, null, 2));

  return {
    status: response.status(),
    registeredUser,
    credentials: { email, password },
  };
};
