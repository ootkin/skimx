import { Router } from './router';
import * as z from 'zod';
import { Server } from '../server';
import express from 'express';
import { ZodError } from 'zod';

describe('Router', () => {
	describe('formatPath', () => {
		it('should replace OpenApi placeholder with the express one', () => {
			const router = new Router();

			const path = '/v1/{placeholder}';
			const expectedPath = '/v1/:placeholder';

			router.use({ method: 'get', path, responses: {} });

			expect(router.router.stack[0].route.path).toBe(expectedPath);
		});

		it('should replace multiple OpenApi placeholder with the express one', () => {
			const router = new Router();

			const path = '/v1/{ph1}/{ph2}/{ph3}';
			const expectedPath = '/v1/:ph1/:ph2/:ph3';

			router.use({ method: 'get', path, responses: {} });

			expect(router.router.stack[0].route.path).toBe(expectedPath);
		});
	});

	describe('use', () => {
		it('should map to get', () => {
			const method = 'get';
			const router = new Router();
			router.use({ path: '/', method, responses: {} });
			expect(router.router.stack[0].route.stack[0].method).toBe(method);
		});

		it('should map to post', () => {
			const method = 'post';
			const router = new Router();
			router.use({ path: '/', method, responses: {} });
			expect(router.router.stack[0].route.stack[0].method).toBe(method);
		});

		it('should map to put', () => {
			const method = 'put';
			const router = new Router();
			router.use({ path: '/', method, responses: {} });
			expect(router.router.stack[0].route.stack[0].method).toBe(method);
		});

		it('should map to patch', () => {
			const method = 'patch';
			const router = new Router();
			router.use({ path: '/', method, responses: {} });
			expect(router.router.stack[0].route.stack[0].method).toBe(method);
		});

		it('should map to delete', () => {
			const method = 'delete';
			const router = new Router();
			router.use({ path: '/', method, responses: {} });
			expect(router.router.stack[0].route.stack[0].method).toBe(method);
		});

		it('should map to options', () => {
			const method = 'options';
			const router = new Router();
			router.use({ path: '/', method, responses: {} });
			expect(router.router.stack[0].route.stack[0].method).toBe(method);
		});

		it('should map to head', () => {
			const method = 'head';
			const router = new Router();
			router.use({ path: '/', method, responses: {} });
			expect(router.router.stack[0].route.stack[0].method).toBe(method);
		});

		it('should map to trace', () => {
			const method = 'trace';
			const router = new Router();
			router.use({ path: '/', method, responses: {} });
			expect(router.router.stack[0].route.stack[0].method).toBe(method);
		});
	});

	describe('validation', () => {
		it('should validate params', (done) => {
			const server = new Server();
			const router = new Router();
			router.use(
				{
					path: '/params/{id}',
					request: { params: z.object({ id: z.string() }) },
					method: 'get',
					responses: {
						200: {
							description: '',
							content: {
								'application/json': {
									schema: z.object({ id: z.string() }),
								},
							},
						},
					},
				},
				(req, res) => {
					expect(typeof req.params.id).toBe('string');
					res.json(req.params);
				},
			);

			server.use(express.json(), router.router);

			server.listen(8080, () => {
				fetch('http://localhost:8080/params/1', {
					headers: { 'Content-Type': 'application/json' },
				})
					.then((res) => res.json())
					.then((res) => {
						expect(res.id).toBe('1');
					})
					.finally(() => {
						server.close(done);
					});
			});
		});

		it('should validate query', (done) => {
			const server = new Server();
			const router = new Router().use(
				{
					path: '/query',
					request: { query: z.object({ id: z.string() }) },
					method: 'get',
					responses: {
						200: {
							description: '',
							content: {
								'application/json': {
									schema: z.object({ id: z.string() }),
								},
							},
						},
					},
				},
				(req, res) => {
					expect(typeof req.query.id).toBe('string');
					res.json(req.query);
				},
			);
			server.use(express.json(), router.router);

			server.listen(8080, () => {
				fetch('http://localhost:8080/query?id=1')
					.then((res) => res.json())
					.then((res) => {
						expect(res.id).toBe('1');
					})
					.finally(() => {
						server.close(done);
					});
			});
		});

		it('should validate body', (done) => {
			const server = new Server();
			const router = new Router().use(
				{
					path: '/body',
					request: {
						body: {
							content: {
								'application/json': { schema: z.object({ id: z.string() }) },
							},
						},
					},
					method: 'post',
					responses: {
						200: {
							description: '',
							content: {
								'application/json': {
									schema: z.object({ id: z.string() }),
								},
							},
						},
					},
				},
				(req, res) => {
					expect(typeof req.body.id).toBe('string');
					res.json(req.body);
				},
			);
			server.use(express.json(), router.router);

			server.listen(8080, () => {
				fetch('http://localhost:8080/body', {
					method: 'post',
					body: JSON.stringify({ id: '1' }),
					headers: {
						'Content-Type': 'application/json',
					},
				})
					.then((res) => res.json())
					.then((res) => {
						expect(res.id).toBe('1');
					})
					.finally(() => {
						server.close(done);
					});
			});
		});

		it('should throw an error if the body is invalid', (done) => {
			const server = new Server();
			const router = new Router();
			router.use(
				{
					method: 'post',
					path: '/body',
					request: {
						body: {
							content: {
								'application/json': { schema: z.object({ id: z.string() }) },
							},
						},
					},
					responses: {},
				},
				(req, res) => {
					res.json();
				},
			);
			server.use(express.json(), router.router, (err: unknown, req, res, _) => {
				if (err instanceof ZodError) {
					return res
						.status(400)
						.json({ message: 'bad request', errors: err.errors });
				}
				res.status(500).json({ message: 'internal server error' });
			});

			server.listen(8080, () => {
				fetch('http://localhost:8080/body', {
					method: 'post',
					body: JSON.stringify({ id: 1 }),
					headers: {
						'Content-Type': 'application/json',
					},
				})
					.then((res) => {
						expect(res.status === 400);
					})
					.finally(() => {
						server.close(done);
					});
			});
		});
	});
});
