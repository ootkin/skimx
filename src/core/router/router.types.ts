import * as z from 'zod';
import * as core from 'express-serve-static-core';
import { ZodType } from '../../zod';

interface ContentType {
  'application/json'?: ZodType<unknown>;
  'multipart/form-data'?: ZodType<unknown>;
  'text/plain'?: ZodType<string>;
  'text/html'?: ZodType<string>;
}

interface ApplicationJson {
  'application/json': ZodType<unknown>;
}

interface MultipartFormData {
  'multipart/form-data': ZodType<unknown>;
}

interface TextPlain {
  'text/plain': ZodType<string>;
}

interface TextHtml {
  'text/html': ZodType<string>;
}

interface Response extends ContentType {
  description: string;
}

export type RouteSchema = {
  summary?: string;
  operationId?: string;
  request?: {
    query?: ZodType<unknown>;
    params?: ZodType<unknown>;
    headers?: ZodType<unknown>;
    body?: ContentType;
  };
  responses: {
    [status: number]: Response;
  };
};

export type RouteRequest<S extends RouteSchema> = S['request'];
export type RouteResponses<S extends RouteSchema> = S['responses'];

export type RequestParams<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { params: ZodType<unknown> }
  ? z.infer<R['params']>
  : core.ParamsDictionary;

export type RequestQuery<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { query: ZodType<unknown> } ? z.infer<R['query']> : core.Query;

export type RequestBody<
  S extends RouteSchema,
  R extends RouteRequest<S>,
> = R extends { body: ApplicationJson }
  ? z.infer<R['body']['application/json']>
  : R extends { body: MultipartFormData }
    ? z.infer<R['body']['multipart/form-data']>
    : R extends { body: TextPlain }
      ? z.infer<R['body']['text/plain']>
      : R extends { body: TextHtml }
        ? z.infer<R['body']['text/html']>
        : unknown;

export type ResponseBody<
  S extends RouteSchema,
  R extends RouteResponses<S>,
> = R[keyof R] extends ApplicationJson
  ? z.infer<R[keyof R]['application/json']>
  : R[keyof R] extends MultipartFormData
    ? z.infer<R[keyof R]['multipart/form-data']>
    : R[keyof R] extends TextPlain
      ? z.infer<R[keyof R]['text/plain']>
      : R[keyof R] extends TextHtml
        ? z.infer<R[keyof R]['text/html']>
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
