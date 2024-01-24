import {
  Router as ExpressRouter,
  RequestHandler,
  Response as ExpressResponse,
  Request as ExpressRequest,
  NextFunction,
} from 'express';
import {
  RouteSchema,
  RouterRoute,
  SelectSubset,
  RouteHandler,
  RequestParams,
  ResponseBody,
  RequestBody,
  RequestQuery,
} from './router.types';
import { ZodSchema } from 'zod';

/**
 * A wrapper around the express Router
 */
export class Router {
  public expressRouter = ExpressRouter();
  public routes: RouterRoute[] = [];

  constructor() {}

  /**
   * Wrap a middleware to catch the async errors
   * @param fn
   * @private
   */
  private wrapMiddleware(
    fn: (
      req: ExpressRequest,
      response: ExpressResponse,
      next: NextFunction,
    ) => Promise<void> | void,
  ) {
    return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next);
  }

  /**
   * Wrap a handler to catch the async errors
   * @param fn
   * @private
   */
  private wrapHandler<Schema extends RouteSchema>(
    fn: (
      req: ExpressRequest<
        RequestParams<Schema>,
        ResponseBody<Schema>,
        RequestBody<Schema>,
        RequestQuery<Schema>
      >,
      res: ExpressResponse<ResponseBody<Schema>>,
      next: NextFunction,
    ) => Promise<void> | void,
  ) {
    return (
      req: ExpressRequest<
        RequestParams<Schema>,
        ResponseBody<Schema>,
        RequestBody<Schema>,
        RequestQuery<Schema>
      >,
      res: ExpressResponse<ResponseBody<Schema>>,
      next: NextFunction,
    ) => Promise.resolve(fn(req, res, next)).catch(next);
  }

  /**
   * Register route for oas specification
   * @param method
   * @param path
   * @param schema
   */
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
   * Inject route
   * @param path
   * @param method
   * @param schema
   * @param middlewares
   * @param handlers
   * @private
   */
  private inject<Schema extends RouteSchema>(
    path: string,
    method: RouterRoute['method'],
    schema: Schema,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.registerRoute({ schema, path, method });
    return [
      this.validateRequest(schema),
      ...middlewares.map((m) => this.wrapMiddleware(m)),
      ...handlers.map((h) => this.wrapHandler<Schema>(h)),
    ];
  }

  /**
   * Validate the request using OAS
   * @param schema
   */
  private validateRequest = (schema: RouteSchema) => {
    return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
      const bodySchema =
        schema.body?.applicationJson || schema.body?.multipartFormData;

      const paramsSchema = schema.params;
      const querySchema = schema.query;

      if (bodySchema instanceof ZodSchema) {
        req.body = bodySchema.parse(req.body);
      }
      if (paramsSchema instanceof ZodSchema) {
        req.params = paramsSchema.parse(req.params);
      }
      if (querySchema instanceof ZodSchema) {
        req.query = querySchema.parse(req.query);
      }

      return next();
    };
  };

  /**
   * GET
   * @param path
   * @param schema
   * @param middlewares
   * @param handlers
   */
  public get<Schema extends RouteSchema>(
    path: string,
    schema: SelectSubset<Schema>,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.expressRouter.get(
      path,
      ...this.inject<Schema>(path, 'get', schema, middlewares, ...handlers),
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
  public post<Schema extends RouteSchema>(
    path: string,
    schema: SelectSubset<Schema>,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.expressRouter.post(
      path,
      ...this.inject<Schema>(path, 'post', schema, middlewares, ...handlers),
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

  public put<Schema extends RouteSchema>(
    path: string,
    schema: SelectSubset<Schema>,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.expressRouter.put(
      path,
      ...this.inject<Schema>(path, 'put', schema, middlewares, ...handlers),
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
  public patch<Schema extends RouteSchema>(
    path: string,
    schema: SelectSubset<Schema>,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.expressRouter.patch(
      path,
      ...this.inject<Schema>(path, 'patch', schema, middlewares, ...handlers),
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
  public delete<Schema extends RouteSchema>(
    path: string,
    schema: SelectSubset<Schema>,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.expressRouter.delete(
      path,
      ...this.inject<Schema>(path, 'delete', schema, middlewares, ...handlers),
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
  public options<Schema extends RouteSchema>(
    path: string,
    schema: SelectSubset<Schema>,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.expressRouter.options(
      path,
      ...this.inject<Schema>(path, 'options', schema, middlewares, ...handlers),
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
  public head<Schema extends RouteSchema>(
    path: string,
    schema: SelectSubset<Schema>,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.expressRouter.head(
      path,
      ...this.inject<Schema>(path, 'head', schema, middlewares, ...handlers),
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
  public trace<Schema extends RouteSchema>(
    path: string,
    schema: SelectSubset<Schema>,
    middlewares: RequestHandler[],
    ...handlers: RouteHandler<Schema>[]
  ) {
    this.expressRouter.trace(
      path,
      ...this.inject<Schema>(path, 'trace', schema, middlewares, ...handlers),
    );
    return this;
  }
}
