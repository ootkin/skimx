import {
	Router as ExpressRouter,
	RequestHandler,
	Response,
	Request,
	NextFunction,
} from 'express';
import { OpenAPIRegistry, RouteConfig } from '@skimx/zod-to-openapi';
import {
	RouteResponseStatus,
	RouteRequest,
	RouteRequestBody,
	RouteRequestBodyContent,
	RouteRequestBodyContentApplicationJson,
	RouteResponseContent,
	RouteResponseContentApplicationJson,
	RouteRequestParams,
	RouteResponseBody,
	RouteRequestBodyContentApplicationJsonSchema,
	RouteRequestQuery,
} from './router.types';
import { ZodSchema } from 'zod';

/**
 * A wrapper around the express Router
 */
export class Router {
	public router = ExpressRouter();

	constructor(private readonly openAPIRegistry?: OpenAPIRegistry) {}

	/**
   * Validate the request using OAS
   * @param schema
   */
	private validateRequest = (schema: RouteConfig) => {
		return (req: Request, res: Response, next: NextFunction) => {
			const bodySchema =
        schema.request?.body?.content['application/json'].schema;
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
   * Validate the response using OAS
   * @param schema
   */
	private validateResponse = (schema: RouteConfig) => {
		return (req: Request, res: Response, next: NextFunction) => {
			const response = schema.responses[res.statusCode.toString()].content;
			if (!response || !response['application/json'].schema) {
				return next();
			}
			const responseSchema = response['application/json'].schema;
			if (responseSchema instanceof ZodSchema) {
				responseSchema.parse(req.body);
			}

			return next();
		};
	};

	/**
   * Transform openApi path to express path
   * @param path
   */
	public formatPath = (path: string) => {
		return path.replace(/{(.*?)}/g, ':$1');
	};

	/**
   * Wrapper around express router use
   * @param schema
   * @param handlers
   */
	public use<
    Schema extends RouteConfig,
    Request extends RouteRequest<Schema>,
    Body extends RouteRequestBody<Schema, Request>,
    BodyContent extends RouteRequestBodyContent<Schema, Request, Body>,
    BodyJson extends RouteRequestBodyContentApplicationJson<
      Schema,
      Request,
      Body,
      BodyContent
    >,
    ResponseStatus extends RouteResponseStatus<Schema>,
    ResponseContent extends RouteResponseContent<Schema, ResponseStatus>,
    ResponseContentJson extends RouteResponseContentApplicationJson<
      Schema,
      ResponseStatus,
      ResponseContent
    >,
    Params extends RouteRequestParams<Schema, Request>,
    Query extends RouteRequestQuery<Schema, Request>,
    ResponseBody extends RouteResponseBody<
      Schema,
      ResponseStatus,
      ResponseContent,
      ResponseContentJson
    >,
    RequestBody extends RouteRequestBodyContentApplicationJsonSchema<
      Schema,
      Request,
      Body,
      BodyContent,
      BodyJson
    >,
  >(
		schema: Schema,
		...handlers: RequestHandler<Params, ResponseBody, RequestBody, Query>[]
	) {
		/**
     * Format path
     */
		schema.path = this.formatPath(schema.path);

		/**
     * Register path schema
     */
		this.openAPIRegistry?.registerPath(schema);

		/**
     * Map methods
     */
		if (schema.method === 'get') {
			this.router.get(schema.path, this.validateRequest(schema), ...handlers);
		}
		if (schema.method === 'post') {
			this.router.post(schema.path, this.validateRequest(schema), ...handlers);
		}
		if (schema.method === 'put') {
			this.router.put(schema.path, this.validateRequest(schema), ...handlers);
		}
		if (schema.method === 'patch') {
			this.router.patch(schema.path, this.validateRequest(schema), ...handlers);
		}
		if (schema.method === 'delete') {
			this.router.delete(
				schema.path,
				this.validateRequest(schema),
				...handlers,
			);
		}
		if (schema.method === 'options') {
			this.router.options(
				schema.path,
				this.validateRequest(schema),
				...handlers,
			);
		}
		if (schema.method === 'head') {
			this.router.head(schema.path, this.validateRequest(schema), ...handlers);
		}
		if (schema.method === 'trace') {
			this.router.trace(schema.path, this.validateRequest(schema), ...handlers);
		}

		return this;
	}
}
