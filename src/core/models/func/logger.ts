import { writeFile } from 'fs/promises';
import chalk from 'chalk';

import BasketDB from '../../..';
import Basket from '../../basket';

export default class Logger<t extends BasketDB.Types.Core.DB.HiddenProps> {
  public readonly title: string;
  public basket: Basket<t>;

  public trace: BasketDB.Types.Misc.LogTraceItem[] = [];

  public config: BasketDB.Types.Misc.DebugConfig;

  constructor(basket: Basket<t>, config?: BasketDB.Types.Misc.DebugConfig) {
    this.title = `| Basket-${basket.name} |`;
    this.basket = basket;

    this.config = config || {
      log: false,
      warn: false,
      error: true,
    };
  }

  protected get date() {
    return (
      new Date().toLocaleDateString() +
      ' ' +
      new Date().toLocaleTimeString() +
      ' |'
    );
  }

  public debug(...msg: unknown[]) {
    if (!this.config.log) {
      return;
    }

    this.trace.push({ message: msg, type: 'debug' });

    console.log(chalk.gray.bold(this.title, this.date), chalk.gray(...msg));
  }

  public warn(...msg: unknown[]) {
    if (!this.config.warn) {
      return;
    }

    this.trace.push({ message: msg, type: 'warn' });

    console.warn(
      chalk.yellowBright.bold(this.title, this.date),
      chalk.yellowBright(...msg)
    );
  }

  public error(...msg: unknown[]) {
    if (!this.config.error) {
      return;
    }
    this.trace.push({ message: msg, type: 'error' });

    console.log(
      chalk.redBright.bold(this.title, this.date),
      chalk.redBright(...msg)
    );
  }

  public async dump(filepath: string) {
    await writeFile(filepath, JSON.stringify(this.trace, null, 2), 'utf-8');
  }
}
