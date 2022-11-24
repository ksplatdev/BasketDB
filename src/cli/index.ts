import chalk from 'chalk';
import clear from 'clear';
import { exit } from 'process';
import { createInterface } from 'readline';
import Project from './core/project';

const rl = createInterface(process.stdin, process.stdout);

function title() {
  clear(true);
  console.log(
    chalk.hex('#ff6224').bold(`
######                                    ######  ######  
#     #   ##    ####  #    # ###### ##### #     # #     # 
#     #  #  #  #      #   #  #        #   #     # #     # 
######  #    #  ####  ####   #####    #   #     # ######  
#     # ######      # #  #   #        #   #     # #     # 
#     # #    # #    # #   #  #        #   #     # #     # 
######  #    #  ####  #    # ######   #   ######  ######  
                                                      
MIT LICENSE | BLEART EMINI
  `)
  );
}
title();

let initialized = false;
const project = new Project();

// FIX CTRL C ONLY STOPPING READLINE AND NOT WHOLE PROCESS
process.on('SIGINT', () => {
  console.log(chalk.italic('SIGINT received, exiting...'));
  exit(0);
});

function makeArgs(command: string, line: string) {
  line.replace(command, '');
  const args = line
    .split(' ')
    .filter((v) => v)
    .filter((v) => v !== command); // remove empty and command
  return args;
}

async function prompt(): Promise<void> {
  console.log('\n\n');

  if (!initialized) {
    initialized = true;
    await project.init();
  }

  rl.on('SIGINT', () => process.emit('SIGINT'));

  rl.question(
    chalk.white.italic.bold('Enter command: ') + chalk.gray('basket '),
    async (line: string) => {
      if (line.includes('exit')) {
        exit(0);
      } else if (line.includes('clear')) {
        title();
      } else if (line.includes('help')) {
        console.log(`
          BasketDB CLI Help
    
          |   Command    |                       Arguments                       |    Description 
    
              exit                         N/A                                    exits the CLI tool
              clear                        N/A                                    clears the CLI
              help                         N/A                                    lists all uses for the CLI tool
              connect       <name> <filepath> <type> <splinterNum> <config>       adds a Basket to the CLI Project
              disconnect                  <name>                                  removes a Basket from the CLI Project
              list                         N/A                                    lists all connected Baskets
              select                      <name>                                  selects a connected Basket to run all commands against
              run              <basketCommand> <argsArray>                        runs a command against the used Basket
          `);
      } else if (line.includes('connect') && !line.includes('disconnect')) {
        await project.connect(makeArgs('connect', line));
      } else if (line.includes('disconnect')) {
        await project.disconnect(makeArgs('disconnect', line));
      } else if (line.includes('list')) {
        await project.list();
      } else if (line.includes('select')) {
        //
      } else if (line.includes('run')) {
        //
      } else if (line === '') {
        console.log(
          'Please enter a command or type "exit" to exit the CLI tool.'
        );
      } else {
        console.log(
          `"basket ${line}" is not a valid command, run "help" to see all available commands.`
        );
      }

      return prompt();
    }
  );
}

prompt();
