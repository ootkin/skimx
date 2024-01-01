import * as z from 'zod';
import * as core from 'express-serve-static-core';
import { AnyZodObject } from '../../zod';

export type RouteSchema = {
  summary?: string;
  contentType?: string;
  request?: {
    query?: AnyZodObject;
    params?: AnyZodObject;
    headers?: AnyZodObject;
    body?: AnyZodObject;
  };
  responses: {
    [status: `${1 | 2 | 3 | 4 | 5}${string}`]: {
      description: string;
      schema: AnyZodObject;
    };
  };
};

export type RouteRequest<S extends RouteSchema> = S['request'];

export type RequestParams<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { params: AnyZodObject }
  ? z.infer<R['params']>
  : core.ParamsDictionary;

export type RequestQuery<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { query: AnyZodObject } ? z.infer<R['query']> : core.Query;

export type RequestBody<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { body: AnyZodObject } ? z.infer<R['body']> : unknown;

export type ResponseBody<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R[keyof R] extends { schema: AnyZodObject }
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
