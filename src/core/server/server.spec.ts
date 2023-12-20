import { Server } from './server';
import { OpenAPIRegistry } from '@skimx/zod-to-openapi';
import { Router } from 'express';

describe('Server', () => {
	it('should create a Server instance', () => {
		const server = new Server();
		expect(server).toBeInstanceOf(Server);
	});

	it('should create an express instance', () => {
		const server = new Server();
		expect(server.getExpressInstance()).not.toBeFalsy();
	});

	it('should create an OpenAPI registry', () => {
		const server = new Server();
		expect(server.getOpenApiRegistry()).toBeInstanceOf(OpenAPIRegistry);
	});

	it('should listen on a specified port', (done) => {
		const server = new Server();
		const httpServer = server.listen(8080, () => {
			expect(httpServer.listening).toBe(true);
			server.close(done);
		});
	});

	it('should close the connection', (done) => {
		const server = new Server();
		const httpServer = server.listen(8080, () => {
			server.close((err) => {
				expect(httpServer.listening).toBe(false);
				done();
			});
		});
	});

	it('should bind stuff with use', (done) => {
		const server = new Server();

		const router = Router().get('/health', (req, res) => {
			res.send('healthy');
		});

		server.use(router);

		server.listen(8080, () => {
			fetch('http://localhost:8080/health')
				.then((res) => res.text())
				.then((res) => {
					expect(res).toBe('healthy');
					server.close(done);
				});
		});
	});

	it('should generate OpenApi (v3.1) config', () => {
		const server = new Server();
		const doc = server.generateOpenApiSpecV31({
			info: {
				title: 'Skeemex',
				version: '0.0.0',
			},
			openapi: '3.1.0',
			security: [],
			servers: [{ url: 'http://skimx.com' }],
			tags: [{ name: 'skimx' }],
		});
		expect(doc.info.title).toBe('Skeemex');
		expect(doc.info.version).toBe('0.0.0');
		expect(doc.openapi).toBe('3.1.0');
		expect(doc.servers).not.toBe(undefined);
		expect(doc.tags).not.toBe(undefined);
	});

	it('should generate OpenApi (v3.0) config', () => {
		const server = new Server();
		const doc = server.generateOpenApiSpecV3({
			info: {
				title: 'Skeemex',
				version: '0.0.0',
			},
			openapi: '3.0.0',
			security: [],
			servers: [{ url: 'http://skimx.com' }],
			tags: [{ name: 'skimx' }],
		});
		expect(doc.info.title).toBe('Skeemex');
		expect(doc.info.version).toBe('0.0.0');
		expect(doc.openapi).toBe('3.0.0');
		expect(doc.servers).not.toBe(undefined);
		expect(doc.tags).not.toBe(undefined);
	});
});
