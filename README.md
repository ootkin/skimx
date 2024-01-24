# SkimX

A Typescript library that use [express](https://github.com/expressjs/express) and [zod](https://github.com/colinhacks/zod) schemas to create web application and generate OpenAPI specification.

## Install

Install via npm:

```shell
npm install skimx
```

## Usage

### `Server`

Creates a Server that wraps an express instance

```ts
import { Server } from 'skimx';

const server = new Server();
```

#### `.use()`

Attach middlewares and/or handlers to the express instance.

```ts
server.use(cors(), helmet());
```

You can also specify a custom error handler. For example:

```ts
import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(error.message);
  return res.status(500).json({ message: error.message });
};

server.use(errorHandler); // make sure that is is the last handler
```

#### `.useRouters()`

Attach a `Router` instance to the server.

```ts
import { Server, Router } from 'skimx';

const server = new Server();
const router1 = new Router();
const router2 = new Router();

server.useRouters(router1, router2);
```

#### `.listen()`

Start the server on the given port.

```ts
server.listen(3000, () => {
  console.log('server is listening on port 3000');
});
```

#### `.close()`

Stops the server from accepting new connections and keeps existing connections.

```ts
server.close((error) => {
  if (error) {
    console.log(error.message);
  }
});
```

### `Router`

Creates a Router that extends an express router with a schema.

_Info_: The Zod `.openapi()` extension is used to attach information to Zod schema using [zod-openapi](https://github.com/samchungy/zod-openapi) library.

```ts
import { Router, z } from 'skimx';

const router = new Router();

const TodoSchema = z.object({
  id: z.number(),
  description: z.string(),
});

router.get(
  '/v1/todos',
  {
    responses: {
      200: {
        description: 'A list of todos',
        applicationJson: z.array(TodoSchema),
      },
    },
  },
  [], // middlewares
  async (req, res, next) => {
    const todos = await fetchTodos();
    res.status(200).json(todos);
  },
);
```

The schema is an object that is used to:

- infer `req.params`, `req.query` and `req.body` types using Zod (`z.infer`)
- validates an incoming request using Zod schemas
- generates an OpenAPI specification for each route

#### Route middlewares and handlers

Sometimes a middleware (for example for a third party package) expects as input a request that needs to satisfy
the `Request` express type.

If a route specify a request schema that does not satisfy the `Request` type, the typescript compiler gives you an error.

That's why a route can take as input an array of middlewares, where they don't need an inferred request type from the specified schema.

In this case, you have the flexibility to define handlers that needs to satisfy the `Request` object inside the middlewares array or you can specify them down below:

```ts
router.post(
  '/',
  {
    // req.query type is inferred from this property
    // req.query.id is a number
    query: z.object({ id: z.coerce.number() }),
  },
  // express cors middleware does not expect that req.query args are numbers
  [cors()],
  // multiple handlers that expect req.query.id to be a number
  (req, res, next) => {
    console.log(req.query);
    next();
  },
  (req, res, next) => {
    res.json({});
  },
);
```

#### `.get()`

Attach an endpoint with GET method to the router

```ts
import { Router, z } from 'skimx';

const router = new Router();

const TodoSchema = z.object({
  id: z.number(),
  description: z.string(),
});

router.get(
  '/v1/todos/:param',
  {
    // Specify the schema for req.params
    params: z.object({ param: z.string() }),
    // Specify the schema for req.query
    query: z.object({ name: z.string() }),
    // Specify the schema for req.headers
    headers: z.object({ Authorization: z.string() }),
    // Specify the schema for response
    responses: {
      200: {
        description: 'A list of todos',
        applicationJson: z.array(TodoSchema),
      },
    },
  },
  [], // middlewares
  (req, res, next) => {
    /* your code here */
  },
);
```

#### `.post()`

Attach an endpoint with POST method to the router

```ts
import { Router, z } from 'skimx';

const router = new Router();

const TodoSchema = z.object({
  id: z.number(),
  description: z.string(),
});

router.post(
  '/v1/todos/',
  {
    // Specify the schema for req.params
    body: {
      applicationJson: TodoSchema,
    },
    responses: {
      201: {
        description: 'The created todo',
        applicationJson: TodoSchema,
      },
    },
  },
  [], // middlewares
  (req, res, next) => {
    /* your code here */
  },
);
```

### `generate`

Generate OpenAPI specification.

```ts
import { Server, generate } from 'skimx';

const server = new Server();

const schema = {
  info: {
    title: 'my spec',
    version: '1.0.0',
  },
};

// .....

// Returns an object
const spec = generateSpec({ schema, server });
```

### `write`

Generate and write the specification to a file:

```ts
import { Server, write } from 'skimx';

const server = new Server();

const schema = {
  info: {
    title: 'my spec',
    version: '1.0.0',
  },
};

// .....

// Writes a file to the root of the project
write({ schema, server, filename: 'openapi.yaml', format: 'yaml' });
```

## Caveats

- Right now SkimX supports only OpenAPI version 3.1.0

## Contributing

Contributions to SkimX are welcome! Whether it's bug reports, feature requests, or code contributions, please feel free to make your input.

## License

SkimX is licensed under the MIT License.

## Support

If you have any questions or encounter issues with SkimX, please open an issue on the GitHub repository. Our team will be happy to assist you.
