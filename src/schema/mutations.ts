import { AppContext, GqlMutationResolvers } from '@/types';

import { db, MesssageEntry } from '../db';
import { publishNewMessage } from './publicationServices';

export const mutations: GqlMutationResolvers<AppContext> = {
  addMessage(parent, { message }, context) {
    const entry: MesssageEntry = {
      id: db.messages.length,
      message: message,
      userId: context.getUser()?.email,
    };

    db.messages.push(entry);
    publishNewMessage(entry);
    return db.messages.map((m) => m.message);
  },
  login: async (parent, { email, password }, context) => {
    // instead of email you can pass username as well
    const { user } = await context.authenticate('graphql-local', {
      email,
      password,
    });

    // only required if express-session is used
    context.login(user);

    return user;
  },
};
