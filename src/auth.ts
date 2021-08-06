import { GraphQLLocalStrategy } from 'graphql-passport';
import passport from 'passport';

import { db } from './db';
import { User } from './types';

// Using your own `new Passport()` is currently no supported by graph-ql-passport
export const AppPassport = passport;

type CallbackFn<T> = (err?: Error | null, ret?: T) => void;

const verifyFn = (email: unknown, password: unknown, done: CallbackFn<User>): void => {
  const matchingUser = db.users.find((user) => email === user.email && password === user.password);
  const error = matchingUser ? null : new Error('no matching user');
  done(error, matchingUser);
};

AppPassport.use('graphql-local', new GraphQLLocalStrategy(verifyFn));

AppPassport.serializeUser((user: User, done: CallbackFn<string>): void => {
  done(null, user.email);
});

AppPassport.deserializeUser((id: string, done: CallbackFn<User>): void => {
  const matchingUser = db.users.find((u) => u.email === id);
  done(null, matchingUser);
});
