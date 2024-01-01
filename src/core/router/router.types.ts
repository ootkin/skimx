import * as z from 'zod';
import * as core from 'express-serve-static-core';
import { ZodType } from '../../zod';

export type RouteSchema = {
  summary?: string;
  contentType?: string;
  request?: {
    query?: ZodType;
    params?: ZodType;
    headers?: ZodType;
    body?: ZodType;
  };
  responses: {
    [status: `${1 | 2 | 3 | 4 | 5}${string}`]: {
      description: string;
      schema: ZodType;
    };
  };
};

export type RouteRequest<S extends RouteSchema> = S['request'];
export type RouteResponses<S extends RouteSchema> = S['responses'];

export type RequestParams<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { params: ZodType }
  ? z.infer<R['params']>
  : core.ParamsDictionary;

export type RequestQuery<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { query: ZodType } ? z.infer<R['query']> : core.Query;

export type RequestBody<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { body: ZodType } ? z.infer<R['body']> : unknown;

export type ResponseBody<
  S extends RouteSchema,
  R extends RouteResponses<S>,
> = R[keyof R] extends { schema: ZodType }
  ? z.infer<R[keyof R]['schema']>
  : unknown;

export type RouterRoute = {
  schema: RouteSchema;
  path: string;
  method:
    | 'get'
    | 'put'
    | 'post'
    | 'delete'
    | 'options'
    | 'head'
    | 'patch'
    | 'trace';
};
