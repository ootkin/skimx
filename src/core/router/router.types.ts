import * as z from 'zod';
import * as core from 'express-serve-static-core';

export type RouteSchema = {
  summary?: string;
  contentType?: string;
  request?: {
    query?: z.ZodSchema;
    params?: z.ZodSchema;
    headers?: z.ZodSchema;
    body?: z.ZodSchema;
  };
  responses: {
    [status: number]: {
      description: string;
      schema: z.ZodSchema;
    };
  };
};

export type RouteRequest<S extends RouteSchema> = S['request'];

export type RequestParams<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { params: z.ZodSchema }
  ? z.infer<R['params']>
  : core.ParamsDictionary;

export type RequestQuery<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { query: z.ZodSchema } ? z.infer<R['query']> : core.Query;

export type RequestBody<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { body: z.ZodSchema } ? z.infer<R['body']> : unknown;

export type ResponseBody<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R[keyof R] extends { schema: z.ZodSchema }
  ? z.infer<R[keyof R]['schema']>
  : unknown;
