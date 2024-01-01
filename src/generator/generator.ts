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
import { writeFileSync } from 'fs';

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

function generateResponses(schema: RouteSchema): ZodOpenApiResponsesObject {
	const responses: ZodOpenApiResponsesObject = {};
	Object.entries(schema.responses).forEach(
		([status, { description, schema }]) => {
			responses[status as `${1 | 2 | 3 | 4 | 5}${string}`] = {
				description,
				content: {
					'application/json': { schema },
				},
			};
		},
	);
	return responses;
}

function generateRequestParams(schema: RouteSchema): ZodOpenApiParameters {
	const requestParams: ZodOpenApiParameters = {};
	if (schema.request?.params) {
		requestParams.path = schema.request.params;
	}
	if (schema.request?.query) {
		requestParams.query = schema.request.query;
	}
	if (schema.request?.headers) {
		requestParams.header = schema.request.headers;
	}
	return requestParams;
}

function generateRequestBody(
	schema: RouteSchema,
): ZodOpenApiRequestBodyObject | undefined {
	if (schema.request?.body) {
		return {
			content: { 'application/json': { schema: schema.request.body } },
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
		};
	}
	return paths;
}

export default function generateSpec(args: {
	schema: OpenApiObject;
	server: Server;
	fileName?: string;
}) {
	return createDocument({
		...args.schema,
		openapi: '3.1.0',
		paths: generatePaths(args.server),
	});
}
