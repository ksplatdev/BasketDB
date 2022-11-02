import { v4 as uuid } from 'uuid';

import ThreadManager from '@ksplat/needlejs/dist/core/threadManager';
import Bag from './models/bag';
import DB from './models/misc/db';
import BasketDB from '..';

export default class Basket<t> {
  public readonly id: string;

  protected mainDB: DB<t>;

  public threadManager: ThreadManager;

  public bags: Bag<t>[];
  public taskTree: Record<string, BasketDB.Types.Basket.Task>;

  constructor(mainDB: string) {
    this.id = uuid();
    this.mainDB = new DB(mainDB);

    this.threadManager = new ThreadManager();

    this.bags = [];
    this.taskTree = {};
  }

  public async splinter(amount?: number) {
    if (amount) {
      for (let i = 0; i < amount; i++) {
        const bag = new Bag(this);
        this.bags.push(bag);

        // splinter tasks in case some waiting
        await this.splinterTasks();
      }
    } else {
      const bag = new Bag(this);
      this.bags.push(bag);

      // splinter tasks in case some waiting
      await this.splinterTasks();
    }
    return;
  }

  protected async splinterTasks() {
    const bagLengths = this.bags.map((b) => {
      return { id: b.id, length: b.tasks.length };
    });

    for (const key in this.taskTree) {
      const smallestBagID = bagLengths.sort((a, b) => {
        return a.length - b.length;
      })[0].id;

      const smallestBag = this.bags.find(
        (b) => b.id === smallestBagID
      ) as Bag<t>;

      if (Object.prototype.hasOwnProperty.call(this.taskTree, key)) {
        const task = this.taskTree[key];

        smallestBag.tasks.push(task);

        delete this.taskTree[key];

        await smallestBag.doTasks();

        continue;
      }
    }
  }

  protected async queueTask(
    func: BasketDB.Types.Basket.TaskFunc,
    args: unknown[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    const id = uuid();

    this.taskTree[id] = {
      id,
      func,
      args,
      onComplete,
    };

    // splinter new task(s)
    await this.splinterTasks();
  }

  public get data() {
    return this.mainDB.data;
  }

  public async search(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.search(key);
      },
      [],
      onComplete
    );
  }

  public async keyExists(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.keyExists(key);
      },
      [],
      onComplete
    );
  }

  public async fixEmpty() {
    try {
      await this.read();
    } catch (error) {
      await this.write();
    }
  }

  public async read() {
    return await this.mainDB.read();
  }

  public async write() {
    return await this.mainDB.write();
  }

  public async add(
    key: string,
    value: t,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.add(key, value);
      },
      [],
      onComplete
    );
  }

  public async remove(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      async () => {
        return await this.mainDB.remove(key);
      },
      [],
      onComplete
    );
  }
}
