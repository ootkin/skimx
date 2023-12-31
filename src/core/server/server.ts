import express, { ErrorRequestHandler, RequestHandler } from 'express';
import * as z from 'zod';
import { Server as HTTPServer } from 'http';
import { createDocument, extendZodWithOpenApi } from 'zod-openapi';
import { ZodOpenApiObject } from 'zod-openapi/lib-types/create/document';

extendZodWithOpenApi(z);

/**
 * Wrapper around an express instance
 */
export class Server {
	private express = express();
	private server?: HTTPServer;

	constructor() {}

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
	public get expressInstance() {
		return this.express;
	}

	/**
   * Generate OpenApi Specification
   * @param config
   */
	public generateOpenAPISpecification = (config: ZodOpenApiObject) => {
		return createDocument(config);
	};
}
