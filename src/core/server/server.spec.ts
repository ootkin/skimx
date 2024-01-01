import { Server } from './server';
import { Router } from 'express';

describe('Server', () => {
  it('should create a Server instance', () => {
    const server = new Server();
    expect(server).toBeInstanceOf(Server);
  });

  it('should create an express instance', () => {
    const server = new Server();
    expect(server.expressInstance).not.toBeFalsy();
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
});
