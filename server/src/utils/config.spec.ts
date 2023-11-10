describe('config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules(); // Ensure that the module cache is cleared
  });

  it('should have the correct SERVICE_NAME', () => {
    // eslint-disable-next-line
        const config = require('./config');
    expect(config.SERVICE_NAME).toBe('orgbalance');
  });

  it('should use default values when env variables are not set', () => {
    const mockConfig = {
      BUILD_VERSION: '1',
      ENVIRONMENT: 'local',
    };

    jest.mock('./config', () => mockConfig);
    // eslint-disable-next-line
        const reloadedConfig = require('./config');
    expect(reloadedConfig).toEqual(mockConfig);
  });

  it('should use env variables when they are set', () => {
    jest.unmock('./config');

    process.env.BUILD_VERSION = '2';
    process.env.ENV = 'staging';

    jest.isolateModules(() => {
      // eslint-disable-next-line
            const reloadedConfig = require('./config');
      expect(reloadedConfig.BUILD_VERSION).toBe('2');
      expect(reloadedConfig.CONFIG_ENVIRONMENT).toBe('staging');
    });
  });
});
