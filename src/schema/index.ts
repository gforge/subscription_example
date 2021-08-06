import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import path from 'path';

import { AppContext, GqlResolvers } from '@/types';

import { mutations } from './mutations';
import { queries } from './queries';
import { subsciptions } from './subsciptions';

export const typeDefs = mergeTypeDefs(loadFilesSync(path.join(__dirname, './**/*.graphql')));

export const resolvers: GqlResolvers<AppContext> = {
  Query: queries,
  Mutation: mutations,
  Subscription: subsciptions,
};
