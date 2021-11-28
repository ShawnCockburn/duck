
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import new_project from './scripts/new_project'

yargs(hideBin(process.argv))
  .command<{ v: boolean | undefined; o: boolean | undefined }>(["duckling", "dl"], 'start a new project', (yargs) => yargs, (argv) => {
    new_project(argv._[1], argv._[2], argv.v, argv.o)
  })
  .option('open', {
    alias: 'o',
    type: 'boolean',
    description: 'Open in VScode'
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose output'
  })
  .parse()
