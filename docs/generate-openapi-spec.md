# Generate OpenAPI Specification

A critical feature of SkimX is its ability to generate the relative OpenAPI specification by traversing from the Server to the attached routers. This process ensures that the resulting OpenAPI documentation accurately represents the entire web application, including all routes and endpoints, simplifying the task of documenting your API.

Generate a specification object:

```typescript
// Retrieve the server with all the attached routers
import server from './my-server';
import { generate, write } from 'skimx/generator';

const schema = {
  schema: {
    info: {
      title: 'My Spec',
      version: '1.0.0',
    },
    // ....
  },
};

const spec = generate({ schema, server });
```

Alternatively, you can use the `write` function to generate a file (in either JSON or YAML format) in the root of your project.

```typescript
write({ server, schema, filename: 'myspec.yaml', format: 'yaml' });
```

_Note: The path specifications are generated automatically from the routers attached to the server._
