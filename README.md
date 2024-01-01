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
import { Server } from 'skimx/core';

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
import { Server, Router } from 'skimx/core';

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

```ts
import { Router } from 'skimx/core';
import z from 'skimx/zod';

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
				schema: z.array(TodoSchema),
			},
		},
	},
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

#### `.get()`

Attach an endpoint with GET method to the router

```ts
import { Router } from 'skimx/core';
import z from 'skimx/zod';

const router = new Router();

const TodoSchema = z.object({
	id: z.number(),
	description: z.string(),
});

router.get(
	'/v1/todos/:param',
	{
		request: {
			// Specify the schema for req.params
			params: z.object({ param: z.string() }),
			// Specify the schema for req.query
			query: z.object({ name: z.string() }),
			// Specify the schema for req.headers
			headers: z.object({ Authorization: z.string() }),
		},
		responses: {
			200: {
				description: 'A list of todos',
				schema: z.array(TodoSchema),
			},
		},
	},
	(req, res, next) => {
		/* your code here */
	},
);
```

#### `.post()`

Attach an endpoint with POST method to the router

```ts
import { Router } from 'skimx/core';
import z from 'skimx/zod';

const router = new Router();

const TodoSchema = z.object({
	id: z.number(),
	description: z.string(),
});

router.post(
	'/v1/todos/',
	{
		request: {
			// Specify the schema for req.params
			body: TodoSchema,
		},
		responses: {
			201: {
				description: 'The created todo',
				schema: TodoSchema,
			},
		},
	},
	(req, res, next) => {
		/* your code here */
	},
);
```

SkimX supports all the methods that express supports (get, post, put, patch, delete, options, head, trace).

### `generateSpec`

Generate OpenAPI specification.

```ts
import { Server, Router } from 'skimx/core';
import generateSpec from 'skimx/generator';
import z from 'skimx/zod';
import { writeFileSync } from 'fs';

const server = new Server();

const router = new Router();

const TodoSchema = z.object({
	id: z.number().openapi({ description: 'todo id', example: 1 }),
	description: z
		.string()
		.openapi({ description: 'todo description', example: 'My first todo' }),
});

router.get(
	'/v1/pets',
	{
		request: {
			query: z.object({ name: z.string() }),
		},
		responses: {
			200: {
				description: 'A list of todos',
				schema: z.array(TodoSchema),
			},
		},
	},
	(req, res) => {
		/* your code*/
	},
);

server.useRouters(router);

const spec = generateSpec({
	schema: {
		info: {
			title: 'my spec',
			version: '1.0.0',
		},
	},
	server,
});

writeFileSync('spec.json', JSON.stringify(spec, null, 2));
```

The code above generates a `spec.json` file in the root of the project:

```json
{
	"info": {
		"title": "my spec",
		"version": "1.0.0"
	},
	"openapi": "3.1.0",
	"paths": {
		"/v1/pets": {
			"get": {
				"parameters": [
					{
						"in": "query",
						"name": "name",
						"schema": {
							"type": "string"
						},
						"required": true
					}
				],
				"responses": {
					"200": {
						"description": "A list of todos",
						"content": {
							"application/json": {
								"schema": {
									"type": "array",
									"items": {
										"type": "object",
										"properties": {
											"id": {
												"type": "number",
												"description": "todo id",
												"example": 1
											},
											"description": {
												"type": "string",
												"description": "todo description",
												"example": "My first todo"
											}
										},
										"required": ["id", "description"]
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
```

The Zod `.openapi()` extension is used to attach information to Zod schema using [zod-openapi](https://github.com/samchungy/zod-openapi) library.

## Caveats

- Right now SkimX supports only OpenAPI version 3.1.0
- Right now SkimX supports only 'application/json' as content type

## Contributing

Contributions to SkimX are welcome! Whether it's bug reports, feature requests, or code contributions, please feel free to make your input.

## License

SkimX is licensed under the MIT License.

## Support

If you have any questions or encounter issues with SkimX, please open an issue on the GitHub repository. Our team will be happy to assist you.
