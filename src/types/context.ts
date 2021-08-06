import { PassportContext } from 'graphql-passport';

import { User } from './User';

export type AppContext = PassportContext<User, { email: string; password: string }>;
