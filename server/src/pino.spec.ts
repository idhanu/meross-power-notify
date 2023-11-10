describe('Logger', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logs: unknown[];
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logs = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logSpy = jest.spyOn(process.stdout, 'write').mockImplementation((chunk: unknown) => {
      if (typeof chunk === 'string') {
        logs.push(JSON.parse(chunk));
      }
      return true;
    });
  });

  afterEach(() => {
    // Clean up the spy after each test
    logSpy.mockRestore();
    jest.resetModules(); // Ensure mocks are reset after each test
  });

  it('should add span_id and trace_id to logs when span is active', () => {
    jest.doMock('dd-trace', () => ({
      scope: () => ({
        active: () => ({
          context: () => ({
            toTraceId: () => 'mockedTraceId',
            toSpanId: () => 'mockedSpanId',
          }),
        }),
      }),
    }));

    // eslint-disable-next-line
    const logger = require('./pino').default;
    logger.level = 'info';

    logger.info('Test log with span');

    expect(logs).toHaveLength(1);
    expect(logs[0]).toHaveProperty('msg', 'Test log with span');
    expect(logs[0]).toHaveProperty('span_id', 'mockedSpanId');
    expect(logs[0]).toHaveProperty('trace_id', 'mockedTraceId');
    logger.level = 'silent';
  });

  it('should not log span_id and trace_id when span is not active', () => {
    jest.doMock('dd-trace', () => ({
      scope: () => ({
        active: () => null,
      }),
    }));

    // eslint-disable-next-line
    const logger = require('./pino').default;
    logger.level = 'info';

    logger.info('Test log without active span');

    expect(logs).toHaveLength(1);
    expect(logs[0]).toHaveProperty('msg', 'Test log without active span');
    expect(logs[0]).not.toHaveProperty('span_id');
    expect(logs[0]).not.toHaveProperty('trace_id');
    logger.level = 'silent';
  });
});
