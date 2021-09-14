import createTestServer from 'create-test-server';
import request from '../../src/index';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('test abortController', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  const prefix = (api) => `${server.url}${api}`;

  jest.useFakeTimers();

  it('test request abort', () => {
    expect.assertions(2);
    server.get('/test/abort1', (req, res) => {
      setTimeout(() => {
        writeData(req.query, res);
      }, 2000);
    });

    const controller = new AbortController();
    const { signal } = controller;
    setTimeout(() => {
      controller.abort();
    }, 500);
    expect(signal.aborted).toBe(false);
    jest.runAllTimers();
    expect(signal.aborted).toBe(true);
  });
});
