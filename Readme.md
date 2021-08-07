# An ApolloServer subscription example with passport

A simple example to run a ApolloServer with subscriptions and authorization. The logic in this example contains:

- login functionality using `graphql-passport`
- message publication using subscriptions
- filtering subscriptions
- checking subscriptions for valid credentials

## Direct run

For running in any NodeJS environment you have two options:

- `npm run start` - runs `ts-node` and starts the application
- `npm run dev` - runs `ts-node-dev` and allows you to do changes in the application with automated respawns

## Docker

### Using `docker-compose`

The simplest aproach is to just run:

```bash
docker-compose up
```

### Using plain `docker`

Package also contains a Dockerfile that can be used to isolate the app. The
code is inspired by: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

Build using (use sudo if you haven't added your user to the Docker group - not
that adding may be a security issue):

```bash
docker build -t <your username>/subscription-app .
```

To run just write (the `--rm` makes it easier to clean up the container):

```bash
docker run --name subapp --rm -p 49160:4000 -d <your username>/subscription-app
```

### Extra stuff

Additional useful commands:

```bash
# Get container ID
$ docker ps

# Print app output
$ docker logs <container id or name ('subapp' if used above run)>

# Enter the container
$ docker exec -it <container id or name ('subapp' if used above run)> /bin/bash
```

## Testing

Then you can connect to it on [localhost:4000/graphql](http://localhost:4000/graphql) and run two simultaneous graphql queries in multiple tabs. **Note** Once you enter a subscription the context will never change, thus we need to first login:

```gql
mutation {
  login(email: "john@doe.com", password: "pwd123") {
    name
  }
}
```

Then in a new tab, start a subscription:

```gql
subscription {
  newMessage
}
```

The third tab should do a mutation for publishing to the subscription-tab:

```gql
mutation {
  addMessage(message: "Testing to send a subscription message")
}
```

After running the mutation you should see "Testing to send a subscription message" in the subscription tab:

```json
{
  "data": {
    "newMessage": "Testing to send a subscription message"
  }
}
```

### Tips

To test the user login functionality with multiple users you can start an _incognito_/_private_ window or an alternative browser, load up the playground and see how messages are sent between users.
