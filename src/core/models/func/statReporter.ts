import { stat } from 'fs/promises';
import osu from 'node-os-utils';

import BasketDB from '../../..';
import Basket from '../../basket';
import DB from '../main/db';

export default class StatReporter<
  t extends BasketDB.Types.Core.DB.HiddenProps
> {
  protected basket: Basket<t>;
  protected db: DB<t>;

  constructor(basket: Basket<t>, db: DB<t>) {
    this.basket = basket;
    this.db = db;
  }

  public async sizeMemory() {
    return this.db.totalSize;
  }

  public async sizeOnDiskMegabytes() {
    const stats = await stat(this.basket.filepath);
    const sizeInBytes = stats.size;
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);

    return sizeInMegabytes;
  }

  public async sizeOnDiskBytes() {
    const stats = await stat(this.basket.filepath);
    const sizeInBytes = stats.size;

    return sizeInBytes;
  }

  public async birthtime() {
    const stats = await stat(this.basket.filepath);

    return stats.birthtime;
  }

  public async birthtimeMS() {
    const stats = await stat(this.basket.filepath);

    return stats.birthtimeMs;
  }

  public async lastModified() {
    const stats = await stat(this.basket.filepath);

    return stats.mtime;
  }

  public async lastModifiedMS() {
    const stats = await stat(this.basket.filepath);

    return stats.mtimeMs;
  }

  public async lastModifiedStatus() {
    const stats = await stat(this.basket.filepath);

    return stats.ctime;
  }

  public async lastModifiedStatusMS() {
    const stats = await stat(this.basket.filepath);

    return stats.ctimeMs;
  }

  public async cpuUsage() {
    return await osu.cpu.usage();
  }

  public get cpuCount() {
    return osu.cpu.count();
  }

  public async memoryFree() {
    return (await osu.mem.free()).freeMemMb;
  }

  public async memoryUsed() {
    return (await osu.mem.used()).usedMemMb;
  }

  public async memoryAvail() {
    return (await osu.mem.free()).totalMemMb;
  }
}
