import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

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
    },
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

const startServer = async () => {
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    tracing: true,
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    },
  );

  // Shut down in the case of interrupt and termination signals
  // We expect to handle this more cleanly in the future. See (#5074)[https://github.com/apollographql/apollo-server/issues/5074] for reference.
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
      subscriptionServer.close();
      await server.stop();
      console.log('Server closed');
      process.exit(0);
    });
  });

  await server.start();

  server.applyMiddleware({ app });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();
