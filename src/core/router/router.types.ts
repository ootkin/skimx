import * as z from 'zod';
import * as core from 'express-serve-static-core';
import { ZodType } from '../../zod';

interface ResponseContentType {
  applicationJson?: ZodType<unknown>;
  textPlain?: ZodType<string>;
  textHtml?: ZodType<string>;
}

interface RequestContentType {
  applicationJson?: ZodType<unknown>;
  multipartFormData?: ZodType<unknown>;
}

interface ApplicationJson {
  applicationJson: ZodType<unknown>;
}

interface MultipartFormData {
  multipartFormData: ZodType<unknown>;
}

interface TextPlain {
  textPlain: ZodType<string>;
}

interface TextHtml {
  textHtml: ZodType<string>;
}

interface Response extends ResponseContentType {
  description: string;
}

export type RouteSchema = {
  summary?: string;
  operationId?: string;
  request?: {
    query?: ZodType<unknown>;
    params?: ZodType<unknown>;
    headers?: ZodType<unknown>;
    body?: RequestContentType;
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
  ? z.infer<R['body']['applicationJson']>
  : R extends { body: MultipartFormData }
    ? z.infer<R['body']['multipartFormData']>
    : unknown;

export type ResponseBody<
  S extends RouteSchema,
  R extends RouteResponses<S>,
> = R[keyof R] extends ApplicationJson
  ? z.infer<R[keyof R]['applicationJson']>
  : R[keyof R] extends TextPlain
    ? z.infer<R[keyof R]['textPlain']>
    : R[keyof R] extends TextHtml
      ? z.infer<R[keyof R]['textHtml']>
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

export type StrictSchema<T extends RouteSchema> = {
  [K in keyof T]: K extends keyof RouteSchema ? T[K] : never;
};
