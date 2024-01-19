import {
  createDocument,
  ZodOpenApiObject,
  ZodOpenApiPathsObject,
  ZodOpenApiResponsesObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiParameters,
} from 'zod-openapi';
import { Server } from '../core';
import { RouteSchema } from '../core/router/router.types';
import { AnyZodObject } from '../zod';

interface OpenApiObject extends Omit<ZodOpenApiObject, 'path' | 'openapi'> {}

/**
 * Translate express path into OpenApi path
 * @param path
 */
function generatePath(path: string) {
  const pattern = /:(\w+)/g;
  const replacement = '{$1}';
  // remove trailing and ensure leading slash
  return (
    (path.startsWith('/') ? '' : '/') +
    path.replace(pattern, replacement).replace(/\/$/, '')
  );
}

function generateResponses(
  routeSchema: RouteSchema,
): ZodOpenApiResponsesObject {
  const responses: ZodOpenApiResponsesObject = {};

  Object.entries(routeSchema.responses).forEach(([status, response]) => {
    const { description, ...rest } = response;
    responses[status as `${1 | 2 | 3 | 4 | 5}${string}`] = {
      description,
      content: {
        ...(rest['application/json'] && {
          'application/json': { schema: rest['application/json'] },
        }),
        ...(rest['multipart/form-data'] && {
          'multipart/form-data': { schema: rest['multipart/form-data'] },
        }),
        ...(rest['text/plain'] && {
          'text/plain': { schema: rest['text/plain'] },
        }),
        ...(rest['text/html'] && {
          'text/html': { schema: rest['text/html'] },
        }),
      },
    };
  });
  return responses;
}

function generateRequestParams(schema: RouteSchema): ZodOpenApiParameters {
  const requestParams: ZodOpenApiParameters = {};
  if (schema.request?.params) {
    requestParams.path = schema.request.params as AnyZodObject;
  }
  if (schema.request?.query) {
    requestParams.query = schema.request.query as AnyZodObject;
  }
  if (schema.request?.headers) {
    requestParams.header = schema.request.headers as AnyZodObject;
  }
  return requestParams;
}

function generateRequestBody(
  schema: RouteSchema,
): ZodOpenApiRequestBodyObject | undefined {
  if (schema.request?.body && schema.request.body['application/json']) {
    return {
      content: {
        'application/json': { schema: schema.request.body['application/json'] },
      },
    };
  }
  if (schema.request?.body && schema.request.body['multipart/form-data']) {
    return {
      content: {
        'multipart/form-data': {
          schema: schema.request.body['multipart/form-data'],
        },
      },
    };
  }
  if (schema.request?.body && schema.request.body['text/plain']) {
    return {
      content: {
        'text/plain': {
          schema: schema.request.body['text/plain'],
        },
      },
    };
  }
  if (schema.request?.body && schema.request.body['text/html']) {
    return {
      content: {
        'text/html': {
          schema: schema.request.body['text/html'],
        },
      },
    };
  }
}

function generatePaths(server: Server): ZodOpenApiPathsObject {
  const paths: ZodOpenApiPathsObject = {};
  for (const { path, schema, method } of server.routes) {
    const pathKey = generatePath(path);

    if (!(pathKey in paths)) {
      paths[pathKey] = {};
    }

    const requestParams = generateRequestParams(schema);
    const requestBody = generateRequestBody(schema);
    const responses = generateResponses(schema);

    paths[pathKey][method] = {
      ...(requestParams && { requestParams }),
      ...(requestBody && { requestBody }),
      ...(responses && { responses }),
      ...(schema.operationId && { operationId: schema.operationId }),
    };
  }
  return paths;
}

export default function generateSpec(args: {
  schema: OpenApiObject;
  server: Server;
}) {
  return createDocument({
    ...args.schema,
    openapi: '3.1.0',
    paths: generatePaths(args.server),
  });
}
