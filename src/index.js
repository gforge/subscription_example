import http from 'http';
import { ApolloServer, PubSub } from 'apollo-server-express';
import express from 'express';

const pubsub = new PubSub();

// The DB
const messages = [];

const typeDefs = `
type Query {
  messages: [String!]!
}
type Mutation {
  addMessage(message: String!): [String!]!
}
type Subscription {
  newMessage: String!
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;

const resolvers = {
  Query: {
    messages() {
      return messages;
    }
  },
  Mutation: {
    addMessage(root, { message }) {
      let entry = JSON.stringify({ id: messages.length, message: message });
      messages.push(entry);
      pubsub.publish('newMessage', { entry: entry });
      return messages;
    },
  },
  Subscription: {
    newMessage: {
      resolve: (message) => {
        return message.entry;
      },
      subscribe: () => pubsub.asyncIterator('newMessage'),
    },
  },
};

const app = express();

const PORT = 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: () => console.log('Connected to websocket'),
  },
  tracing: true,
});

server.applyMiddleware({ app })

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
})
