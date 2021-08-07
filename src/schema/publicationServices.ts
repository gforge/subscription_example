import { PubSub } from 'graphql-subscriptions';

import { MesssageEntry } from '../db';

const appPubsub = new PubSub();

const NEW_MESSAGE = 'NEW_MESSAGE';
export const publishNewMessage = (message: MesssageEntry) => appPubsub.publish(NEW_MESSAGE, message);
export const subscribeToNewMessages = () => appPubsub.asyncIterator<MesssageEntry>(NEW_MESSAGE);
