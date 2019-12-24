import createTestServer from 'create-test-server';
import request, { extend, Onion, fetch } from '../src/index';

const debug = require('debug')('afx-request:test');

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('error handle', () => {
  let server;
  beforeAll(async () => {
    server = await createTestServer();
  });
  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  it('should catch fetch error and get reponse', async done => {
    server.get('/test/reject/302', (req, res) => {
      res.setHeader('access-control-allow-origin', '*');
      res.status(302);
      res.setHeader({ location: 'https://www.baidu.com' });
      res.send({ errorMsg: 'error response', errorCode: 'B000' });
    });

    const req = extend({});

    try {
      const res = await req(prefix('/test/reject/302'));
    } catch (e) {
      expect(e.message).toBe('http error');
      expect(e.type).toBe('HttpError');
      expect(e.response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
      done();
    }
  });
});
