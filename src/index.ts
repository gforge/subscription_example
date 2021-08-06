import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import session from 'express-session';
import { execute, subscribe } from 'graphql';
import { buildContext, createOnConnect } from 'graphql-passport';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { AppPassport } from './auth';
import { db } from './db';
import { resolvers, typeDefs } from './schema';

const startServer = async () => {
  const app = express();
  const sessionMiddleware = session({ secret: 'cats', resave: false, saveUninitialized: false });
  const passportMiddleware = AppPassport.initialize();
  const passportSessionMiddleware = AppPassport.session();
  app.use(sessionMiddleware);
  app.use(passportMiddleware);
  app.use(passportSessionMiddleware);

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'include' } })],
    context: ({ req, res }) => buildContext({ req, res, db }),
  });

  const httpServer = createServer(app);
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: createOnConnect([sessionMiddleware, passportMiddleware, passportSessionMiddleware]),
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

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();
