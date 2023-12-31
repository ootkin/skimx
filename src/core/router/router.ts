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
} from './router.types';
import { ZodSchema } from 'zod';

/**
 * A wrapper around the express Router
 */
export class Router {
	public expressRouter = ExpressRouter();

	constructor() {}

	/**
   * Validate the request using OAS
   * @param schema
   */
	private validateRequest = (schema: RouteSchema) => {
		return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
			const bodySchema = schema.request?.body;
			const paramSchema = schema.request?.params;
			const querySchema = schema.request?.query;

			if (bodySchema instanceof ZodSchema) {
				bodySchema.parse(req.body);
			}
			if (paramSchema instanceof ZodSchema) {
				paramSchema.parse(req.params);
			}
			if (querySchema instanceof ZodSchema) {
				querySchema.parse(req.query);
			}

			return next();
		};
	};

	/**
   * GET
   * @param path
   * @param schema
   * @param handlers
   */
	public get<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Req>,
  >(
		path: string,
		schema: Schema,
		...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
	) {
		this.expressRouter.get(path, this.validateRequest(schema), ...handlers);
		return this;
	}

	/**
   * POST
   * @param path
   * @param schema
   * @param handlers
   */
	public post<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Req>,
  >(
		path: string,
		schema: Schema,
		...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
	) {
		this.expressRouter.post(path, this.validateRequest(schema), ...handlers);
		return this;
	}

	/**
   * PUT
   * @param path
   * @param schema
   * @param handlers
   */
	public put<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Req>,
  >(
		path: string,
		schema: Schema,
		...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
	) {
		this.expressRouter.put(path, this.validateRequest(schema), ...handlers);
		return this;
	}

	/**
   * PATCH
   * @param path
   * @param schema
   * @param handlers
   */
	public patch<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Req>,
  >(
		path: string,
		schema: Schema,
		...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
	) {
		this.expressRouter.patch(path, this.validateRequest(schema), ...handlers);
		return this;
	}

	/**
   * DELETE
   * @param path
   * @param schema
   * @param handlers
   */
	public delete<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Req>,
  >(
		path: string,
		schema: Schema,
		...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
	) {
		this.expressRouter.delete(path, this.validateRequest(schema), ...handlers);
		return this;
	}

	/**
   * OPTIONS
   * @param path
   * @param schema
   * @param handlers
   */
	public options<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Req>,
  >(
		path: string,
		schema: Schema,
		...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
	) {
		this.expressRouter.options(path, this.validateRequest(schema), ...handlers);
		return this;
	}

	/**
   * HEAD
   * @param path
   * @param schema
   * @param handlers
   */
	public head<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Req>,
  >(
		path: string,
		schema: Schema,
		...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
	) {
		this.expressRouter.head(path, this.validateRequest(schema), ...handlers);
		return this;
	}

	/**
   * TRACE
   * @param path
   * @param schema
   * @param handlers
   */
	public trace<
    Schema extends RouteSchema,
    Req extends RouteRequest<Schema>,
    Params extends RequestParams<Schema, Req>,
    Query extends RequestQuery<Schema, Req>,
    ReqBody extends RequestBody<Schema, Req>,
    ResBody extends ResponseBody<Schema, Req>,
  >(
		path: string,
		schema: Schema,
		...handlers: RequestHandler<Params, ResBody, ReqBody, Query>[]
	) {
		this.expressRouter.trace(path, this.validateRequest(schema), ...handlers);
		return this;
	}
}
