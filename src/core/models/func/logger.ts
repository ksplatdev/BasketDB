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

    const str = (chalk.gray.bold(this.title, this.date), chalk.gray(...msg));

    this.trace.push({ message: str, type: 'debug' });

    console.log(str);
  }

  public warn(...msg: unknown[]) {
    if (!this.config.warn) {
      return;
    }

    const str =
      (chalk.yellowBright.bold(this.title, this.date),
      chalk.yellowBright(...msg));

    this.trace.push({ message: str, type: 'warn' });

    console.warn(str);
  }

  public error(...msg: unknown[]) {
    if (!this.config.error) {
      return;
    }

    const str =
      (chalk.redBright.bold(this.title, this.date), chalk.redBright(...msg));

    this.trace.push({ message: str, type: 'error' });

    console.log(str);
  }

  public async dump(filepath: string) {
    await writeFile(filepath, JSON.stringify(this.trace, null, 2), 'utf-8');
  }
}
