import * as z from 'zod';
import * as core from 'express-serve-static-core';
import { ZodType } from '../../zod';
import { Locals, RequestHandler, Response as ExpResponse } from 'express';
import { ParsedQs } from 'qs';
import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from 'express-serve-static-core';

interface RequestContentType {
  applicationJson?: ZodType;
  multipartFormData?: ZodType;
}

interface ApplicationJson {
  applicationJson: ZodType;
}

interface MultipartFormData {
  multipartFormData: ZodType;
}

type RouteSchemaResponses = {
  [status: number]: RouteSchemaResponse;
};

interface RouteSchemaResponse {
  description: string;
  applicationJson?: ZodType;
  textPlain?: ZodType<string>;
  textHtml?: ZodType<string>;
}

export type RouteSchema = {
  summary?: string;
  operationId?: string;
  query?: ZodType;
  params?: ZodType;
  headers?: ZodType;
  body?: RequestContentType;
  responses: RouteSchemaResponses;
};

export type RequestParams<S extends RouteSchema> = S extends { params: ZodType }
  ? z.infer<S['params']>
  : core.ParamsDictionary;

export type RequestQuery<S extends RouteSchema> = S extends { query: ZodType }
  ? z.infer<S['query']>
  : core.Query;

export type RequestBody<S extends RouteSchema> = S extends {
  body: ApplicationJson;
}
  ? z.infer<S['body']['applicationJson']>
  : S extends { body: MultipartFormData }
    ? z.infer<S['body']['multipartFormData']>
    : unknown;

// export type ResponseBody<S extends RouteSchema> =
//   S['responses'][keyof S['responses']] extends ApplicationJson
//     ? z.infer<S['responses'][keyof S['responses']]['applicationJson']>
//     : S['responses'][keyof S['responses']] extends TextPlain
//       ? z.infer<S['responses'][keyof S['responses']]['textPlain']>
//       : S['responses'][keyof S['responses']] extends TextHtml
//         ? z.infer<S['responses'][keyof S['responses']]['textHtml']>
//         : unknown;

// export type ResponseBody<S extends RouteSchema> =
//   S['responses'] extends RouteSchemaResponses
//     ? S['responses'][number] extends RouteSchemaResponse
//       ? S['responses'][number] extends ApplicationJson
//         ? z.infer<S['responses'][number]['applicationJson']>
//         : S['responses'][number] extends TextPlain
//           ? z.infer<S['responses'][number]['textPlain']>
//           : S['responses'][number] extends TextHtml
//             ? z.infer<S['responses'][number]['textHtml']>
//             : { 1: string }
//       : { 2: string }
//     : { 3: string };

const zodUndefined = z.undefined();

export type ResponseBody<S extends RouteSchema> =
  S['responses'] extends RouteSchemaResponses
    ? S['responses'][keyof S['responses']] extends RouteSchemaResponse
      ? S['responses'][keyof S['responses']][
          | 'applicationJson'
          | 'textPlain'
          | 'textHtml'] extends ZodType
        ? z.infer<
            | (S['responses'][keyof S['responses']]['applicationJson'] extends ZodType
                ? S['responses'][keyof S['responses']]['applicationJson']
                : typeof zodUndefined)
            | (S['responses'][keyof S['responses']]['textPlain'] extends ZodType
                ? S['responses'][keyof S['responses']]['textPlain']
                : typeof zodUndefined)
            | (S['responses'][keyof S['responses']]['textHtml'] extends ZodType
                ? S['responses'][keyof S['responses']]['textHtml']
                : typeof zodUndefined)
          >
        : unknown
      : unknown
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

export type SelectSubset<T> = {
  [key in keyof T]: key extends keyof RouteSchema ? T[key] : never;
};

export type RouteHandler<Schema extends RouteSchema> = RequestHandler<
  RequestParams<Schema>,
  ResponseBody<Schema>,
  RequestBody<Schema>,
  RequestQuery<Schema>
>;
