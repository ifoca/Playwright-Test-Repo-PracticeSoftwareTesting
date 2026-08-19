export const generateRandomString = (length: number): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let randomString = '';
  // Make sure the string has at least 1 special character and 1 number
  randomString += specials[Math.floor(Math.random() * specials.length)];
  randomString += numbers[Math.floor(Math.random() * numbers.length)];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }
  return randomString;
};
