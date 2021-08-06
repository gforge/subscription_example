import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { resolvers } from './resolvers';
import path from 'path';

const typeDefs = mergeTypeDefs(loadFilesSync(path.join(__dirname, './**/*.graphql')));

const app = express();

const PORT = 4000;

const startServer = async () => {
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
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
