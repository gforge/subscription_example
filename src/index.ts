import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import session from 'express-session';
import { execute, ExecutionArgs, subscribe } from 'graphql';
import { buildContext } from 'graphql-passport';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import ws from 'ws';

import { AppPassport } from './auth';
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

  const PORT = 4000;
  const subscriptionEndpoint = `ws://localhost:${PORT}/subscriptions`;
  const gqlServer = graphqlHTTP({
    schema,
    graphiql: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      subscriptionEndpoint,
      websocketClient: 'v1',
    },
    customExecuteFn: ({ contextValue: req, ...rest }: ExecutionArgs) =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      execute({ ...rest, contextValue: buildContext({ req, res: {} }) }),
  });
  app.use('/graphql', gqlServer);

  const httpServer = createServer(app);

  const wsServer = new ws.Server({
    server: httpServer,
    path: '/subscriptions',
  });

  httpServer.listen(PORT, () => {
    useServer(
      {
        schema,
        execute,
        subscribe,
      },
      wsServer,
    );

    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
};

startServer();
