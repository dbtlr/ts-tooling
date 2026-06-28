const run = (args: readonly string[]): string => `hello, ${args[0] ?? 'world'}`;

const isMain = process.argv[1]?.endsWith('cli.ts') ?? false;
if (isMain) {
  process.stdout.write(`${run(process.argv.slice(2))}\n`);
}

export { run };
