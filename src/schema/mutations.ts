import { AppContext, GqlMutationResolvers } from '@/types';

import { db } from '../db';
import { appPubsub } from './appPubSub';

export const mutations: GqlMutationResolvers<AppContext> = {
  addMessage(parent, { message }) {
    const entry = JSON.stringify({ id: db.messages.length, message: message });
    db.messages.push(entry);
    appPubsub.publish('newMessage', { entry: entry });
    return db.messages;
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
