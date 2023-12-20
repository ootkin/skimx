import { RouteConfig, ZodContentObject } from '@skimx/zod-to-openapi';
import {
	ZodMediaTypeObject,
	ZodRequestBody,
} from '@skimx/zod-to-openapi/dist/openapi-registry';
import * as z from 'zod';
import * as core from 'express-serve-static-core';

export type RouteRequest<S extends RouteConfig> = S['request'];

export type RouteRequestBody<
  S extends RouteConfig,
  R extends RouteRequest<S>,
> = R extends {
  body: ZodRequestBody;
}
  ? R['body']
  : undefined;

export type RouteRequestBodyContent<
  S extends RouteConfig,
  R extends RouteRequest<S>,
  B extends RouteRequestBody<S, R>,
> = B extends {
  content: ZodContentObject;
}
  ? B['content']
  : undefined;

export type RouteRequestBodyContentApplicationJson<
  S extends RouteConfig,
  R extends RouteRequest<S>,
  B extends RouteRequestBody<S, R>,
  C extends RouteRequestBodyContent<S, R, B>,
> = C extends { 'application/json': ZodMediaTypeObject }
  ? C['application/json']
  : undefined;

export type RouteResponseStatus<S extends RouteConfig> = keyof S['responses'];

export type RouteResponseContent<
  S extends RouteConfig,
  Status extends RouteResponseStatus<S>,
> = S['responses'][Status]['content'];

export type RouteResponseContentApplicationJson<
  S extends RouteConfig,
  Status extends RouteResponseStatus<S>,
  C extends RouteResponseContent<S, Status>,
> = C extends { 'application/json': ZodMediaTypeObject }
  ? C['application/json']
  : undefined;

export type RouteRequestParams<
  S extends RouteConfig,
  T extends RouteRequest<S>,
> = T extends { params: z.ZodType }
  ? z.infer<T['params']>
  : core.ParamsDictionary;

export type RouteRequestQuery<
  S extends RouteConfig,
  T extends RouteRequest<S>,
> = T extends { query: z.ZodType }
  ? z.infer<T['query']>
  : core.ParamsDictionary;

export type RouteResponseBody<
  Schema extends RouteConfig,
  ResponseStatus extends RouteResponseStatus<Schema>,
  ResponseContent extends RouteResponseContent<Schema, ResponseStatus>,
  Json extends RouteResponseContentApplicationJson<
    Schema,
    ResponseStatus,
    ResponseContent
  >,
> = Json extends {
  schema: z.ZodType;
}
  ? z.infer<Json['schema']>
  : unknown;

export type RouteRequestBodyContentApplicationJsonSchema<
  Schema extends RouteConfig,
  Request extends RouteRequest<Schema>,
  Body extends RouteRequestBody<Schema, Request>,
  BodyContent extends RouteRequestBodyContent<Schema, Request, Body>,
  Json extends RouteRequestBodyContentApplicationJson<
    Schema,
    Request,
    Body,
    BodyContent
  >,
> = Json extends { schema: z.ZodType } ? z.infer<Json['schema']> : unknown;
