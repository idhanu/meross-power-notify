
import esbuild, { Platform } from 'esbuild';

const isWatching = process.argv[2] === 'watch';

const options = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'node' as Platform,
  target: ['node18'],
};

const build = async (isWatching = false) => {
  if (isWatching) {
    const ctx = await esbuild.context(options);

    await ctx.watch();
    // eslint-disable-next-line no-console
    console.log('Watching for changes...');
  } else {
    esbuild.build(options).catch(() => process.exit(1));
  }
};

build(isWatching);
