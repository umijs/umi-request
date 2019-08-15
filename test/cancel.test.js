import createTestServer from 'create-test-server';
import request, { extend } from '../src/index';

var Cancel = request.Cancel;
var CancelToken = request.CancelToken;

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('cancel', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  describe('when called before sending request', () => {
    it('rejects Promise with a Cancel object', done => {
      expect.assertions(2);
      server.get('/a', (req, res) => {
        setTimeout(() => {
          writeData('ok', res);
        }, 1000);
      });
      var source = CancelToken.source();
      source.cancel('Operation has been canceled.');
      request
        .get(`${server.url}/a`, {
          cancelToken: source.token,
        })
        .catch(function(thrown) {
          expect(thrown).toEqual(jasmine.any(Cancel));
          expect(thrown.message).toBe('Operation has been canceled.');
          done();
        });
    });
  });

  describe('when called after request has been sent', () => {
    it('rejects Promise with a Cancel object', done => {
      expect.assertions(1);
      server.get('/cancel/a', (req, res) => {
        setTimeout(() => {
          writeData('ok', res);
        }, 3000);
      });
      var source = CancelToken.source();
      request
        .get(`${server.url}/cancel/a`, {
          cancelToken: source.token,
        })
        .catch(err => {
          expect(err).toBeInstanceOf(Cancel);
          done();
        });
      setTimeout(() => {
        source.cancel();
      }, 1000);
    });
  });

  describe('when called after response has been received', () => {
    it('does not cause unhandled rejection', done => {
      server.get('/cancel/b', (req, res) => {
        setTimeout(() => {
          writeData('ok', res);
        }, 1000);
      });
      var source = CancelToken.source();
      request
        .get(`${server.url}/cancel/b`, {
          cancelToken: source.token,
        })
        .then(function() {
          window.addEventListener('unhandledrejection', () => {
            done.fail('Unhandled rejection.');
          });
          source.cancel();
          setTimeout(done, 100);
        });
    });
  });
});
