import { ForbiddenError } from 'apollo-server-express';
import { withFilter } from 'graphql-subscriptions';

import { AppContext, GqlSubscriptionResolvers } from '@/types';

import { MesssageEntry } from '../db';
import { subscribeToNewMessages } from './publicationServices';

const subscribeIfLoggedIn =
  <Ret>(subscriptionFn: () => AsyncIterator<Ret>) =>
  (parent: unknown, args: unknown, context: AppContext) => {
    if (!context.req.user) throw new ForbiddenError('Must be logged in');

    return subscriptionFn();
  };

export const subsciptions: GqlSubscriptionResolvers<AppContext> = {
  newMessage: {
    resolve: (message: MesssageEntry, args: Record<never, unknown>, { req }: AppContext) => {
      return `${message.message} from ${message.userId} -> current user: ${req.user?.email}`;
    },
    subscribe: subscribeIfLoggedIn<MesssageEntry>(subscribeToNewMessages),
  },
  personalMessage: {
    resolve: (message: MesssageEntry, args: Record<never, unknown>, { req }: AppContext) => {
      return `${message.message} from ${message.userId} -> current user: ${req.user?.email}`;
    },
    subscribe: withFilter(
      subscribeIfLoggedIn<MesssageEntry>(subscribeToNewMessages),
      (message: MesssageEntry, variables, { req }) => {
        return message.userId === req.user?.email;
      },
    ),
  },
};
