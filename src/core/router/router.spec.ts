import { Router } from './router';
import { Server } from '../server';
import z, { ZodError } from '../../zod';

describe('Router', () => {
  describe('Method mapping', () => {
    it('should map to get', () => {
      const router = new Router().get('/', { responses: {} }, []);
      expect(router.expressRouter.stack[0].route.stack[0].method).toBe('get');
    });

    it('should map to post', () => {
      const router = new Router().post('/', { responses: {} }, []);
      expect(router.expressRouter.stack[0].route.stack[0].method).toBe('post');
    });

    it('should map to put', () => {
      const router = new Router().put('/', { responses: {} }, []);
      expect(router.expressRouter.stack[0].route.stack[0].method).toBe('put');
    });

    it('should map to patch', () => {
      const router = new Router().patch('/', { responses: {} }, []);
      expect(router.expressRouter.stack[0].route.stack[0].method).toBe('patch');
    });

    it('should map to delete', () => {
      const router = new Router().delete('/', { responses: {} }, []);
      expect(router.expressRouter.stack[0].route.stack[0].method).toBe(
        'delete',
      );
    });

    it('should map to options', () => {
      const router = new Router().options('/', { responses: {} }, []);
      expect(router.expressRouter.stack[0].route.stack[0].method).toBe(
        'options',
      );
    });

    it('should map to head', () => {
      const router = new Router().head('/', { responses: {} }, []);
      expect(router.expressRouter.stack[0].route.stack[0].method).toBe('head');
    });

    it('should map to trace', () => {
      const router = new Router().trace('/', { responses: {} }, []);
      expect(router.expressRouter.stack[0].route.stack[0].method).toBe('trace');
    });

    it('should throw an error if route already exists', () => {
      const router = new Router().get('/', { responses: {} }, []);
      try {
        router.get('/', { responses: {} }, []);
        expect(true).toBe(false);
      } catch (err) {
        expect(err).toBeTruthy();
      }
    });
  });

  describe('validation', () => {
    it('should validate params', (done) => {
      const server = new Server();
      const router = new Router().get(
        '/params/:id',
        {
          request: { params: z.object({ id: z.string() }) },
          responses: {
            200: {
              description: '',
              'application/json': z.object({ id: z.string() }),
            },
          },
        },
        [],
        (req, res) => {
          expect(typeof req.params.id).toBe('string');
          res.json(req.params);
        },
      );

      server.useRouters(router);

      server.listen(8083, () => {
        fetch('http://localhost:8083/params/1', {
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
      const router = new Router().get(
        '/query',
        {
          request: { query: z.object({ id: z.string() }) },
          responses: {
            200: {
              description: '',
              'application/json': z.object({ id: z.string() }),
            },
          },
        },
        [],
        (req, res) => {
          expect(typeof req.query.id).toBe('string');
          res.json(req.query);
        },
      );
      server.useRouters(router);

      server.listen(8082, () => {
        fetch('http://localhost:8082/query?id=1')
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
      const router = new Router().post(
        '/body',
        {
          request: {
            body: { 'application/json': z.object({ id: z.string() }) },
          },
          responses: {
            200: {
              description: '',
              'application/json': z.object({}),
            },
          },
        },
        [],
        (req, res) => {
          res.json(req.body);
        },
      );

      server.useRouters(router);
      server.use((err: unknown, req, res, _) => {
        if (err instanceof ZodError) {
          return res
            .status(400)
            .json({ message: 'bad request', errors: err.errors });
        }
        return res.status(500).json({ message: 'internal server error' });
      });

      server.listen(8085, () => {
        fetch('http://localhost:8085/body', {
          method: 'post',
          body: JSON.stringify({ id: 1 }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((res) => {
            expect(res.message).toBe('bad request');
          })
          .finally(() => {
            fetch('http://localhost:8085/body', {
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
    });

    it('should transforms req.body', (done) => {
      const schema = z.object({ id: z.string().toUpperCase() });
      const server = new Server();
      const router = new Router().post(
        '/body',
        {
          request: {
            body: { 'application/json': schema },
          },
          responses: {
            200: {
              description: '',
              'application/json': schema,
            },
          },
        },
        [],
        (req, res) => {
          res.json(req.body);
        },
      );

      server.useRouters(router);

      server.listen(8086, () => {
        fetch('http://localhost:8086/body', {
          method: 'post',
          body: JSON.stringify({ id: 'lowercase' }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((res) => {
            expect(res.id).toBe('LOWERCASE');
          })
          .catch((err) => expect(err).toBeUndefined())
          .finally(() => {
            server.close(done);
          });
      });
    });
    it('should transform req.params', (done) => {
      const schema = z.object({ id: z.string().toUpperCase() });
      const server = new Server();
      const router = new Router().get(
        '/:id',
        {
          request: {
            params: schema,
          },
          responses: {
            200: {
              description: '',
              schema,
            },
          },
        },
        [],
        (req, res) => {
          res.json(req.params);
        },
      );

      server.useRouters(router);

      server.listen(8087, () => {
        fetch('http://localhost:8087/lowercase', {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((res) => {
            expect(res.id).toBe('LOWERCASE');
          })
          .catch((err) => expect(err).toBeUndefined())
          .finally(() => {
            server.close(done);
          });
      });
    });

    it('should transform req.query', (done) => {
      const schema = z.object({ id: z.string().toUpperCase() });
      const server = new Server();
      const router = new Router().get(
        '/query',
        {
          request: {
            query: schema,
          },
          responses: {
            200: {
              description: '',
              schema,
            },
          },
        },
        [],
        (req, res) => {
          res.json(req.query);
        },
      );

      server.useRouters(router);

      server.listen(8088, () => {
        fetch('http://localhost:8088/query?id=lowercase', {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((res) => {
            expect(res.id).toBe('LOWERCASE');
          })
          .catch((err) => expect(err).toBeUndefined())
          .finally(() => {
            server.close(done);
          });
      });
    });
  });
});
