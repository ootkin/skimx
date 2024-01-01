import express, { ErrorRequestHandler, RequestHandler } from 'express';
import { Server as HTTPServer } from 'http';
import { Router } from '../router';
import { RouterRoute } from '../router/router.types';

/**
 * Wrapper around an express instance
 */
export class Server {
	private app = express();
	private server?: HTTPServer;
	public routes: RouterRoute[] = [];

	constructor() {}

	/**
	 * Attach middlewares and handlers to the express instance
	 * @param handlers
	 */
	public use = (...handlers: (RequestHandler | ErrorRequestHandler)[]) => {
		this.app.use(...handlers);
	};

	/**
	 * Attach routers with schema to the express instance and register the routes
	 * @param routers
	 */
	public useRouters = (...routers: Router[]) => {
		routers.map((r) => this.routes.push(...r.routes));
		this.app.use(routers.map((r) => r.expressRouter));
	};

	/**
	 * Start the server on given port
	 * @param port
	 * @param callback
	 */
	public listen = (port: number | string, callback: () => void) => {
		this.server = this.app.listen(port, callback);
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
		return this.app;
	}
}
