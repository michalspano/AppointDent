// Function to generate a unique email address for each virtual user
export function generateUniqueEmail (): string {
  const timestamp: number = Date.now();
  const randomString: string = Math.random().toString(36).substring(7); // Generate a random string
  return `test${timestamp}_${randomString}@example.com`;
}

export interface User {
  email: string
  cookies: any
}

export const host: string = 'http://localhost:3000/api/v1';
