import express, { ErrorRequestHandler, RequestHandler } from 'express';
import {
	extendZodWithOpenApi,
	OpenApiGeneratorV3,
	OpenApiGeneratorV31,
	OpenAPIRegistry,
} from '@skimx/zod-to-openapi';
import * as z from 'zod';
import { Server as HTTPServer } from 'http';
import { OpenAPIObjectConfigV31 } from '@skimx/zod-to-openapi/dist/v3.1/openapi-generator';
import { OpenAPIObjectConfig } from '@skimx/zod-to-openapi/dist/v3.0/openapi-generator';

extendZodWithOpenApi(z);

/**
 * Wrapper around an express instance
 */
export class Server {
	private express = express();
	private server?: HTTPServer;
	private readonly openApiRegistry: OpenAPIRegistry;

	constructor() {
		this.openApiRegistry = new OpenAPIRegistry();
	}

	/**
   * Attach middlewares, handlers, routers and errors handlers to the express instance
   * @param handlers
   */
	public use = (...handlers: (RequestHandler | ErrorRequestHandler)[]) => {
		this.express.use(handlers);
	};

	/**
   * Start the server on given port
   * @param port
   * @param callback
   */
	public listen = (port: number | string, callback: () => void) => {
		this.server = this.express.listen(port, callback);
		return this.server;
	};

	/**
   * Close the server connection
   */
	public close = (callback: (err: Error | undefined) => void) => {
		return this.server?.close(callback);
	};

	/**
   * Get the express server instance
   */
	public getExpressInstance = () => {
		return this.express;
	};

	/**
   * Get the openApi registry
   */
	public getOpenApiRegistry = () => {
		return this.openApiRegistry;
	};

	/**
   * Generate OpenApi Specification v3.1.x
   */
	public generateOpenApiSpecV31 = (config: OpenAPIObjectConfigV31) => {
		return new OpenApiGeneratorV31(
			this.openApiRegistry.definitions,
		).generateDocument(config);
	};

	/**
   * Generate OpenApi Specification v3.0.x
   * @param config
   */
	public generateOpenApiSpecV3 = (config: OpenAPIObjectConfig) => {
		return new OpenApiGeneratorV3(
			this.openApiRegistry.definitions,
		).generateDocument(config);
	};
}
