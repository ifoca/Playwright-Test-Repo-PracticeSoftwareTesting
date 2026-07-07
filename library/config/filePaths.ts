import { resolve } from 'path';

export const AUTH_DIR = resolve(__dirname, '../../.auth');
export const TOKEN_FILE = resolve(AUTH_DIR, 'token.json');
export const USER_FILE = resolve(AUTH_DIR, 'user.json');
export const STORAGE_FILE = resolve(AUTH_DIR, 'storage.json');
