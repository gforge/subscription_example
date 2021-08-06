import { AppContext, GqlSubscriptionResolvers } from '@/types';

import { appPubsub } from './appPubSub';

interface MessagePublication {
  id: number;
  entry: string;
}

export const subsciptions: GqlSubscriptionResolvers<AppContext> = {
  newMessage: {
    resolve: (message: MessagePublication, args: Record<never, unknown>, { req }: AppContext) => {
      return `${JSON.parse(message.entry).message} @ current user: ${req.user?.email}`;
    },
    subscribe: () => appPubsub.asyncIterator('newMessage'),
  },
};
