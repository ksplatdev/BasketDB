import chalk from 'chalk';
import { join } from 'path';
import { cwd } from 'process';
import BasketDB from '../..';
import Basket from '../../core/basket';

interface ProjectSchema {
  name: string;
  filepath: string;
  type: BasketDB.Types.Core.DB.Type;
  splinterNum: number;
  config: BasketDB.Types.Basket.Config | undefined;
}

export default class Project {
  public db: Basket<ProjectSchema>;

  public basketArray: Basket<unknown>[];
  public selectedBasket: Basket<unknown> | undefined;

  constructor() {
    this.db = new Basket(
      'basketdb-cli-project',
      join(cwd(), './basketdb-cli-project.basket'),
      'array',
      {
        trashmanCollectionIntervalInSeconds: 10,
      }
    );

    this.basketArray = [];
    this.selectedBasket = undefined;
  }

  public async init() {
    console.log(
      chalk.gray.italic(
        `LOG: basket project init: initializing/loading Basket CLI Project \n`
      )
    );

    await this.db.splinter(3);
    await this.db.init();

    // populate basketArray
    await this.db.read();
    await this.db.each(async (item) => {
      const basket = new Basket<unknown>(
        item.key,
        item.value.filepath,
        item.value.type,
        item.value.config
      );

      await basket.splinter(item.value.splinterNum);
      await basket.init();

      this.basketArray.push(basket);

      console.log(
        chalk.greenBright(
          `SUCCESS: basket project init: loaded previously connected Basket "${item.key}" to BasketDB CLI Project \n`
        )
      );
    });

    console.log(
      chalk.gray.italic(
        `LOG: basket project init: finished initializing/loading Basket CLI Project \n`
      )
    );
  }

  public async connect(preArgs: string[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args: ProjectSchema = {
      name: preArgs[0],
      filepath: preArgs[1],
      type: preArgs[2] as BasketDB.Types.Core.DB.Type,
      splinterNum: Number(preArgs[3]),
      config: undefined,
    };

    // join config
    preArgs.splice(0, 4);
    const confArgs = preArgs.join(' ');
    try {
      args.config = JSON.parse(confArgs);
    } catch (error) {
      console.warn('WARN: basket connect: invalid or no config passed.', error);
    }

    try {
      const basket = new Basket<unknown>(
        args.name,
        args.filepath,
        args.type,
        args.config
      );

      await basket.splinter(args.splinterNum);
      await basket.init();

      await this.db.add(args.name, args, async () => {
        this.basketArray.push(basket);

        console.log(
          chalk.greenBright(
            `SUCCESS: basket connect: connected and saved Basket "${args.name}" to BasketDB CLI Project`
          )
        );
      });
    } catch (error) {
      console.error(
        chalk.red(
          'ERROR: basket connect: failed to connect basket (failed on creation of Basket class, possible cause: invalid or missing args)'
        )
      );
    }
  }

  public async disconnect(preArgs: string[]) {
    const name = preArgs[0];

    await this.db.searchAndRemoveInstantly(name, async () => {
      console.log(
        chalk.greenBright(
          `SUCCESS: basket disconnect: disconnected and removed Basket "${name}" from BasketDB CLI Project`
        )
      );
    });
  }

  public async list() {
    await this.db.read();
    console.log(
      chalk.greenBright(
        'SUCCESS: basket list: retrieved list of Baskets connected to the BasketDB CLI Project'
      )
    );

    if (Array.isArray(this.db.data)) {
      const keys = this.db.data.map((v) => {
        return { name: v.key, filepath: v.value.filepath };
      });

      console.log(chalk.grey.italic(JSON.stringify(keys, null, 2)));
    }
  }

  public async select(preArgs: string[]) {
    const name = preArgs[0];

    const f = this.basketArray.find((v) => v.name === name);

    if (f) {
      this.selectedBasket = f;

      console.log(
        chalk.greenBright(
          `SUCCESS: basket select: selected connected Basket "${name}"`
        )
      );
    } else {
      console.error(
        chalk.red(
          `ERROR: basket select: failed to select basket "${name}" (make sure the Basket is connected with the right name)`
        )
      );
    }
  }
}
