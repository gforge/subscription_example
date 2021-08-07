import { User } from '@/types';

export interface MesssageEntry {
  id: number;
  message: string;
  userId?: string;
}

// A poor-mans database
export const db: { messages: MesssageEntry[]; users: User[] } = {
  messages: [],
  users: [
    { name: 'John Doe', email: 'john@doe.com', password: 'pwd123' },
    { name: 'Peter Pan', email: 'peter@pan.com', password: 'pwd321' },
  ],
};
