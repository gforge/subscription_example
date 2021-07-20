# An ApolloServer example

The simplest possible example to run a ApolloServer with subscriptions.

## Docker

### Using `docker-compose`

The simplest aproach is to just run:

```bash
docker-compose up
```

### Basic run

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

Then you can connect to it on [localhost:4000/graphql](http://localhost:4000/graphql) and run two simultaneous graphql queries in two tabs. The firs one should be the subscription:

```gql
subscription {
  newMessage
}
```

The second one should be the mutation for publishing to the subscription:


```gql
mutation {
  addMessage(message: "Testing to send a subscription message")
}
```

After running the mutation you should see "Testing to send a subscription message" in the subscription tab:

```json
{
  "data": {
    "newMessage": "{\"id\":0,\"message\":\"Testing to send a subscription message\"}"
  }
}
```
