import { AppContext, GqlQueryResolvers } from '@/types';

import { db } from '../db';

export const queries: GqlQueryResolvers<AppContext> = {
  messages(): string[] {
    return db.messages.map((m) => m.message);
  },
};
