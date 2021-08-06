import { User } from '@/types';

// A poor-mans database
export const db: { messages: string[]; users: User[] } = {
  messages: [],
  users: [{ name: 'John Doe', email: 'john@doe.com', password: 'pwd123' }],
};
