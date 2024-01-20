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
import { AnyZodObject } from 'zod';
import { writeFileSync } from 'fs';
import yaml from 'yaml';

interface Options {
  schema: Omit<ZodOpenApiObject, 'path' | 'openapi'>;
  server: Server;
}

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
        ...(rest.applicationJson && {
          'application/json': { schema: rest.applicationJson },
        }),
        ...(rest.textPlain && {
          'text/plain': { schema: rest.textPlain },
        }),
        ...(rest.textHtml && {
          'text/html': { schema: rest.textHtml },
        }),
      },
    };
  });
  return responses;
}

function generateRequestParams(schema: RouteSchema): ZodOpenApiParameters {
  const requestParams: ZodOpenApiParameters = {};
  if (schema?.params) {
    requestParams.path = schema.params as AnyZodObject;
  }
  if (schema?.query) {
    requestParams.query = schema.query as AnyZodObject;
  }
  if (schema?.headers) {
    requestParams.header = schema.headers as AnyZodObject;
  }
  return requestParams;
}

function generateRequestBody(
  schema: RouteSchema,
): ZodOpenApiRequestBodyObject | undefined {
  if (schema?.body && schema.body.applicationJson) {
    return {
      content: {
        'application/json': { schema: schema.body.applicationJson },
      },
    };
  }
  if (schema?.body && schema.body.multipartFormData) {
    return {
      content: {
        'multipart/form-data': {
          schema: schema.body.multipartFormData,
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

    delete schema.body;
    delete schema.query;
    delete schema.params;
    delete schema.headers;
    schema.responses = [];

    paths[pathKey][method] = {
      ...schema,
      ...(requestParams && { requestParams }),
      ...(requestBody && { requestBody }),
      ...(responses && { responses }),
    };
  }
  return paths;
}

export function generate(options: Options) {
  return createDocument({
    ...options.schema,
    openapi: '3.1.0',
    paths: generatePaths(options.server),
  });
}

export function write(
  options: Options & { filename: string; format: 'json' | 'yaml' },
) {
  const { filename, format, ...rest } = options;
  const spec = generate(rest);

  const content =
    format === 'json'
      ? JSON.stringify(spec, null, 2)
      : yaml.stringify(spec, null, 2);

  writeFileSync(filename, content);
}
