import {
  Router as ExpressRouter,
  RequestHandler,
  Response as ExpressResponse,
  Request as ExpressRequest,
  NextFunction,
} from 'express';
import {
  RouteRequest,
  RequestBody,
  RequestParams,
  RequestQuery,
  RouteSchema,
  ResponseBody,
  RouterRoute,
  RouteResponses,
} from './router.types';
import { ZodSchema, z, ZodType } from 'zod';

/**
 * A wrapper around the express Router
 */
export class Router {
  public expressRouter = ExpressRouter();
  public routes: RouterRoute[] = [];

  constructor() {}

  /**
   * Validate the request using OAS
   * @param schema
   */
  private validateRequest = (schema: RouteSchema) => {
    return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
      const bodySchema =
        schema.request?.body?.applicationJson ||
        schema.request?.body?.multipartFormData;

      const paramsSchema = schema.request?.params;
      const querySchema = schema.request?.query;

      if (bodySchema instanceof ZodSchema) {
        req.body = bodySchema.parse(req.body);
      }
      if (paramsSchema instanceof ZodSchema) {
        // @ts-expect-error we are use that the parsing is an object
        req.params = paramsSchema.parse(req.params);
      }
      if (querySchema instanceof ZodSchema) {
        // @ts-expect-error we are use that the parsing is an object
        req.query = querySchema.parse(req.query);
      }

      return next();
    };
  };

  private registerRoute = ({ method, path, schema }: RouterRoute) => {
    const exists = this.routes.find(
      (r) => r.method === method && r.path === path,
    );
    if (exists) {
      throw new Error(`${method} method already exists for path ${path}`);
    }
    this.routes.push({ method, path, schema });
  };

  /**
   * GET
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public get<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Res extends RouteResponses<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Res>,
  >(
    path: string,
    schema: Pick<Schema, keyof RouteSchema>,
    middlewares: RequestHandler[],
    ...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
  ) {
    this.registerRoute({ schema, path, method: 'get' });
    this.expressRouter.get(
      path,
      this.validateRequest(schema),
      ...middlewares,
      ...handlers,
    );

    return this;
  }

  /**
   * POST
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public post<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Res extends RouteResponses<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Res>,
  >(
    path: string,
    schema: Schema,
    middlewares: RequestHandler[],
    ...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
  ) {
    this.registerRoute({ schema, path, method: 'post' });
    this.expressRouter.post(
      path,
      this.validateRequest(schema),
      ...middlewares,
      ...handlers,
    );
    return this;
  }

  /**
   * PUT
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public put<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Res extends RouteResponses<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Res>,
  >(
    path: string,
    schema: Schema,
    middlewares: RequestHandler[],
    ...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
  ) {
    this.registerRoute({ schema, path, method: 'put' });
    this.expressRouter.put(
      path,
      this.validateRequest(schema),
      ...middlewares,
      ...handlers,
    );
    return this;
  }

  /**
   * PATCH
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public patch<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Res extends RouteResponses<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Res>,
  >(
    path: string,
    schema: Schema,
    middlewares: RequestHandler[],
    ...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
  ) {
    this.registerRoute({ schema, path, method: 'patch' });
    this.expressRouter.patch(
      path,
      this.validateRequest(schema),
      ...middlewares,
      ...handlers,
    );
    return this;
  }

  /**
   * DELETE
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public delete<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Res extends RouteResponses<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Res>,
  >(
    path: string,
    schema: Schema,
    middlewares: RequestHandler[],
    ...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
  ) {
    this.registerRoute({ schema, path, method: 'delete' });
    this.expressRouter.delete(
      path,
      this.validateRequest(schema),
      ...middlewares,
      ...handlers,
    );
    return this;
  }

  /**
   * OPTIONS
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public options<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Res extends RouteResponses<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Res>,
  >(
    path: string,
    schema: Schema,
    middlewares: RequestHandler[],
    ...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
  ) {
    this.registerRoute({ schema, path, method: 'options' });
    this.expressRouter.options(
      path,
      this.validateRequest(schema),
      ...middlewares,
      ...handlers,
    );
    return this;
  }

  /**
   * HEAD
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public head<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Res extends RouteResponses<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Res>,
  >(
    path: string,
    schema: Schema,
    middlewares: RequestHandler[],
    ...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
  ) {
    this.registerRoute({ schema, path, method: 'head' });
    this.expressRouter.head(
      path,
      this.validateRequest(schema),
      ...middlewares,
      ...handlers,
    );
    return this;
  }

  /**
   * TRACE
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public trace<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Res extends RouteResponses<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Res>,
  >(
    path: string,
    schema: Schema,
    middlewares: RequestHandler[],
    ...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
  ) {
    this.registerRoute({ schema, path, method: 'trace' });

    this.expressRouter.trace(
      path,
      this.validateRequest(schema),
      ...middlewares,
      ...handlers,
    );
    return this;
  }
}
