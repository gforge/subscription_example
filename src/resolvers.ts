import { PubSub } from 'graphql-subscriptions';
import { Resolvers } from './@types/schema.types';

const pubsub = new PubSub();
// The database
const db: { messages: string[] } = { messages: [] };
interface MessagePublication {
  id: number;
  entry: string;
}

export const resolvers = {
  Query: {
    messages(): string[] {
      return db.messages;
    },
  },
  Mutation: {
    addMessage(_, { message }) {
      let entry = JSON.stringify({ id: db.messages.length, message: message });
      db.messages.push(entry);
      pubsub.publish('newMessage', { entry: entry });
      return db.messages;
    },
  },
  Subscription: {
    newMessage: {
      resolve: (message: MessagePublication) => {
        return JSON.parse(message.entry).message;
      },
      subscribe: () => pubsub.asyncIterator('newMessage'),
    },
  },
} as Resolvers;
