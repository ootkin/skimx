# Examples

The primary aim of this section is to highlight both the simplicity and the power that SkimX brings to the realm of web application development.

The goal is to provide a comprehensive overview of how SkimX operates, with a focus on its main use cases and practical examples, allowing you to grasp its capabilities and benefits effectively.

## Basic usage {#basic-usage}

First of all, create a server.

A Server instance in SkimX is essentially a wrapper around an Express server, serving as the entry point for the OpenAPI specification.

```typescript
import { Server } from 'skimx';

const server = new Server();
```

Similar to the Server, a Router in SkimX is a wrapper around an Express Router, albeit with some modifications.

```typescript
import { Router, z } from 'skimx';
import { myMiddleware } from './my-middlewares';

const router = new Router();

router.get(
  '/',
  {
    summary: 'A basic route',
    responses: {
      200: {
        description: 'A friendly message',
        applicationJson: z.object({ message: z.string() }),
      },
    },
  },
  [myMiddleware],
  (req, res) => {
    res.status(200).json({ message: 'Hello from SkimX' });
  },
);
```

The second parameter in SkimX is utilized to register and attach additional information to the OpenAPI path specification.

The third parameter consists of an array of Express middlewares, and the final one is a handler where request and response types are inferred from the OpenAPI Schema, a feature enabled by Zod.

To use the Router, it needs to be attached to the server instance as follows:

```typescript
server.useRouters(router);
```

Finally, you can configure the server to start listening for connections.

```typescript
server.listen(process.env.PORT, () => {
  console.log('Listening for new connections...');
});
```

That's all.

## Server

### Use Express middlewares

Because SkimX is built on top of Express, you have the flexibility to utilize any Express middlewares that suit your needs. This provides a wide range of options to customize and enhance your web application as required.

Third party middlewares:

```typescript
import cors from 'cors';
import helmet from 'helmet';

server.use(cors, helmet);
```

Custom middleware:

```typescript
import { Request, Response, NextFunction } from 'express';

const middleware = (req: Request, res: Response, next: NextFunction) => {
  // ... your code ...
  next();
};

server.use(middleware);
```

### Get Express Instance

If, for some reason, you need to retrieve the Express instance:

```typescript
import { Server } from 'skimx';
const app = new Server().expressInstance;
```

## Router

The Router is a pivotal component of SkimX, extending the functionality of Express Router. It takes a Schema as input, enabling the creation of the OpenAPI Specification (OAS) for the route while also performing data validation using Zod. This powerful feature ensures consistency and accuracy in your web application's API contracts and data handling.

### HTTP Verbs

A Router in SkimX exposes all the standard HTTP verbs, including GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD, and TRACE.

```typescript
import { Router } from 'skimx';

const router = new Router();

router
  .get('/')
  .post('/')
  .put('/')
  .patch('/')
  .delete('/')
  .options('/')
  .head('/')
  .trace('/');
```

### Route Schema

Every endpoint in SkimX requires a schema as input. This offers several advantages:

- **OpenAPI Specification**: It allows the automatic decoration of the endpoint with OpenAPI specifications, ensuring documentation accuracy.
- **Data Validation with Zod**: The schema serves as the basis for data validation using Zod, enhancing data integrity and security.
- **Express Request and Response Types Inference**: SkimX leverages the schema to automatically infer request and response types, simplifying development and minimizing manual type declarations.

#### Example of OpenAPI arguments

```typescript
router.get(
  '/users',
  {
    summary: 'Get Users',
    operationId: 'getUsers',
    tags: ['users'],
    security: [{ basic: [] }],
    // ...
  },
  [],
  (req, res) => {},
);
```

#### Data validation:

If you specify at least a Zod schema in the route schema, by default, SkimX will validate internally the incoming request data.

```typescript
import { z } from 'skimx';

const QuerySchema = z.object({
  name: z.string(),
});

const ParamsSchema = z.object({
  id: z.coerce.number(),
});

const HeadersSchema = z.object({
  'X-Custom-Header': z.string(),
});

const BodySchema = z.object({
  name: z.string(),
  breed: z.string(),
});

const PetSchema = z.object({
  id: z.number(),
  name: z.string(),
  breed: z.string(),
});

router
  .get(
    '/users/:id/pets',
    {
      params: ParamsSchema,
      query: QuerySchema,
      headers: HeadersSchema,
      responses: {
        200: {
          description: 'A list of pets',
          applicationJson: z.array(PetSchema),
        },
      },
    },
    [],
    (req, res) => {
      const query = req.query; // is of type QuerySchema
      const params = req.params; // is of type ParamsSchema
      res.json({
        /* ... */
      }); // res.body is of type PetSchema[]
    },
  )
  .post(
    '/users/:id/pets',
    {
      params: ParamsSchema,
      body: {
        applicationJson: BodySchema,
      },
    },
    [],
    (req, res) => {
      const body = req.body; // is of type BodySchema
    },
  );
```

**Note:** SkimX currently supports the following content types:

- `application/json`
- `text/plain`
- `text/html`
- `application/pdf`

If you have a need for additional content types, please feel free to open a pull request or issue, and we'll be happy to consider including them in future updates.

### Route middleware

Each route in SkimX is highly flexible, allowing you to include as many Express middlewares as needed to customize and enhance the route's behavior. Additionally, you can include multiple "typed inferred" handlers to suit your application's requirements.

```typescript
import { myMiddleware } from './middlewares';
import helmet from 'helmet';

router.get(
  '/',
  {
    // Schema
  },
  [helmet, myMiddleware], // untyped handler/middleware
  (req, res, next) => {
    // first type handler
    next();
  },
  (req, res) => {
    // second typed handler
    res.json({});
  },
);
```

### Error handling

In the interest of simplicity, SkimX does not include a built-in error handler. Instead, you have the flexibility to create a custom error handler and attach it as the final step in your route's handlers. This approach allows you to tailor error handling to your specific needs and maintain full control over how errors are managed in your application.

```typescript
import { Server, ZodError } from 'skimx';
import { Router } from './routers';

const server = new Server();

server.useRouters(server);

server.use((req, res, next) => {
  req.status(404).json({ message: 'Resource not found' });
});

server.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Bad request',
      errors: err.errors,
    });
  }
  return res.status(500).json({ message: 'Internal server error' });
});
```

### Decorate Schemas with zod-openapi

SkimX use [zod-openapi](https://github.com/samchungy/zod-openapi) internally to generate the specification and to extends the Zod schema using the `.openapi()` method:

```typescript
const PetSchema = z
  .object({
    name: z.string().openapi({
      description: 'The name of the pet',
      example: 'Sabo',
    }),
    breed: z.string().openapi({
      description: 'The breed of the pet',
      example: 'Keeshond',
    }),
  })
  .openapi({ ref: 'PetSchema' });
```

For more detailed information, please refer to the [zod-openapi](https://github.com/samchungy/zod-openapi) documentation. It provides comprehensive insights into the integration and usage of this amazing tool within SkimX.
