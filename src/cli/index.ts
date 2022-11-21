import chalk from 'chalk';
import clear from 'clear';
import { exit } from 'process';
import { createInterface } from 'readline';

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

function prompt(): void {
  console.log('\n\n');

  rl.question(
    chalk.white.italic.bold('Enter command: ') + chalk.gray('basket '),
    (command: string) => {
      command = command.toLowerCase();

      switch (command) {
        case 'exit':
          exit(0);
          break;

        case 'help':
          console.log(`
          BasketDB CLI Help
    
          |   Command    |    Arguments    |    Description 
    
               exit              N/A        exits the CLI tool
               clear             N/A        clears the CLI
               help              N/A        lists all uses for the CLI tool
          `);

          break;

        case 'clear':
          title();
          break;

        default:
          console.log(
            `"basket ${command}" is not a valid command, run "help" to see all available commands.`
          );
          break;
      }

      return prompt();
    }
  );
}

prompt();
