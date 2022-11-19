import { v4 as uuid } from 'uuid';

import Bag from './models/bag';
import DB from './models/main/db';
import BasketDB from '..';
import Trashman from './models/func/trashMan';
import { deserialize, serialize } from 'v8';
import { access, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import Logger from './models/func/logger';
import InternalBag from './models/internalBag';
import { exit } from 'process';
import StatReporter from './models/func/statReporter';
import { F_OK } from 'constants';

export default class Basket<t> {
  public readonly id: string;
  public readonly name: string;
  public readonly filepath: string;
  public readonly config: BasketDB.Types.Basket.Config;

  protected mainDB: DB<t>;
  public trashman: Trashman<t>;

  public internalBag: InternalBag<t>;
  public bags: Bag<t>[];
  public taskTree: Record<string, BasketDB.Types.Basket.Task>;

  public logger: Logger<t>;
  public statReporter: StatReporter<t>;

  constructor(
    name: string,
    filepath: string,
    type: BasketDB.Types.Core.DB.Type,
    config?: BasketDB.Types.Basket.Config
  ) {
    this.id = uuid();
    this.name = name;
    this.filepath = filepath;
    this.config = config || {};

    this.mainDB = new DB<t>(this.filepath, type, this);
    this.trashman = new Trashman<t>(this, this.mainDB);

    this.internalBag = new InternalBag<t>(
      this,
      this.mainDB,
      `basket-${name}-internal-bag`
    );
    this.bags = [];
    this.taskTree = {};

    if (config?.debug) {
      config.debug.warn = config.debug.warn || false;
      config.debug.error = config.debug.error || true;
    }

    this.logger = new Logger(this, config?.debug);
    this.statReporter = new StatReporter(this, this.mainDB);
  }

  public async init() {
    // check filepath exists
    try {
      await access(this.filepath, F_OK);

      // exists
      await this.fillEmpty();
    } catch (error) {
      // does not exist
      await this.fillEmpty();
    }
  }

  public async splinter(amount?: number) {
    if (amount) {
      for (let i = 0; i < amount; i++) {
        const bag = new Bag<t>(this, this.mainDB);
        const num = this.bags.push(bag);

        // debug
        this.logger.debug(`Splintered/Created Bag #${num}`);

        // splinter tasks in case some waiting
        await this.splinterTasks();
      }
    } else {
      const bag = new Bag<t>(this, this.mainDB);
      const num = this.bags.push(bag);

      // debug
      this.logger.debug(`Splintered/Created Bag #${num}`);

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

        // debug
        // check if task is a Trashman check task so that console will not be flooded
        if (!task.isTrashmanTask) {
          this.logger.debug(
            `Splintered/Added task "${task.name}" "${task.id}" into Bag "${smallestBag.id}"`
          );
        }

        await smallestBag.doTasks();

        continue;
      }
    }
  }

  public async queueTask(
    name: string,
    func: BasketDB.Types.Basket.TaskFunc,
    args: unknown[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc,
    isTrashmanTask?: boolean
  ) {
    try {
      // sync before read in case of an error for Dump
      // call internalBag.update to sync oldRepel and current DB
      await this.internalBag.sync(this.data);

      const id = uuid();

      this.taskTree[id] = {
        id,
        name,
        func,
        args,
        onComplete,
        isTrashmanTask: isTrashmanTask || false,
      };

      // splinter new task(s)
      await this.splinterTasks();
    } catch (error) {
      await this.dump(
        `FAILED TO QUEUE TASK OF "${name}", POSSIBLE CAUSE: INVALID DATA`
      );
      throw `FAILED TO QUEUE TASK OF "${name}", POSSIBLE CAUSE: INVALID DATA`;
    }
  }

  public async queueInternalTask(
    name: string,
    func: BasketDB.Types.Basket.TaskFunc,
    args: unknown[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc,
    isTrashmanTask?: boolean
  ) {
    try {
      const id = uuid();

      const task = {
        id,
        name,
        func,
        args,
        onComplete,
        isTrashmanTask: isTrashmanTask || false,
      };

      // push task to internal bag
      this.internalBag.tasks.push(task);

      // do tasks
      await this.internalBag.doTasks();
    } catch (error) {
      await this.dump(
        `FAILED TO QUEUE INTERNAL TASK OF "${name}", POSSIBLE CAUSE: INVALID DATA`
      );
      throw `FAILED TO QUEUE INTERNAL TASK OF "${name}", POSSIBLE CAUSE: INVALID DATA`;
    }
  }

  public get data() {
    return this.mainDB.data;
  }

  public async read(ignoreDump?: boolean) {
    await this.mainDB.read(ignoreDump);

    // debug
    this.logger.debug(`Basket Read DB Call`);
  }

  public async write() {
    await this.mainDB.write();

    // debug
    this.logger.debug(`Basket Write DB Call`);
  }

  public async backup(filepath: string) {
    await this.read();
    const string = serialize(this.mainDB.data);
    await writeFile(filepath, string);

    // debug
    this.logger.debug(`Backed up into filepath "${filepath}"`);
  }

  public async restore(filepath: string) {
    const buffer = await readFile(filepath);
    this.mainDB.data = deserialize(buffer);
    await this.write();

    // debug
    this.logger.debug(`Restored from filepath "${filepath}"`);
  }

  public async dump(msg: string) {
    // dump repel DB
    const string = serialize(this.internalBag.oldRepel.data);

    const filepath = join(
      this.config?.dumpPath || __dirname,
      `./basket-${this.name}-internal-bag-dump.basket`
    );

    await writeFile(filepath, string);

    // dump Logger trace
    const logFilepath = join(
      this.config?.dumpPath || __dirname,
      `./basket-${this.name}-log-trace.json`
    );

    this.logger.error('*DUMP* *CHECK LOG TRACE*', ' | ', msg, ' | ', filepath);

    await this.logger.dump(logFilepath);

    exit(1);
  }

  public async keyExistsMemory(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'keyExistsMemory',
      async () => {
        return await this.mainDB.keyExistsMemory(key);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "keyExistsMemory": KEY: "${key}".`);
  }

  public async fillEmpty() {
    try {
      await this.read(true); // do not dump
    } catch (error) {
      await this.write();
    }
  }

  public async add(
    key: string,
    value: t,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'add',
      async () => {
        return await this.mainDB.add(key, value);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "add": KEY: "${key}", VALUE: "${value}".`);
  }

  public async addMany(
    items: BasketDB.Types.Core.DB.Combo<t>[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'addMany',
      async () => {
        return await this.mainDB.addMany(items);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "addMany": ITEMS: `, items);
  }

  public async search(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'search',
      async () => {
        return await this.mainDB.search(key);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "search": KEY: "${key}".`);
  }

  public async searchMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'searchMany',
      async () => {
        return await this.mainDB.searchMany(keys);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "searchMany": KEYS:`, keys);
  }

  public async searchAndModify(
    key: string,
    value: t,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'searchAndModify',
      async () => {
        return await this.mainDB.searchAndModify(key, value);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(
      `Queued task "searchAndModify": KEY: "${key}", VALUE: "${value}".`
    );
  }

  public async searchAndModifyMany(
    items: BasketDB.Types.Core.DB.Combo<t>[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'searchAndModifyMany',
      async () => {
        return await this.mainDB.searchAndModifyMany(items);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "searchAndModifyMany": ITEMS: `, items);
  }

  public async searchAndRemove(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'searchAndRemove',
      async () => {
        return await this.mainDB.searchAndRemove(key, onComplete);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "searchAndRemove": KEY: "${key}".`);
  }

  public async searchAndRemoveMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'searchAndRemoveMany',
      async () => {
        return await this.mainDB.searchAndRemoveMany(keys, onComplete);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "searchAndRemoveMany": KEYS: `, keys);
  }

  public async searchAndRemoveInstantly(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'searchAndRemoveInstantly',
      async () => {
        return await this.mainDB.searchAndRemoveInstantly(key);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "searchAndRemoveInstantly": KEY: "${key}".`);
  }

  public async searchAndRemoveInstantlyMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'searchAndRemoveInstantlyMany',
      async () => {
        return await this.mainDB.searchAndRemoveInstantlyMany(keys);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(
      `Queued task "searchAndRemoveInstantlyMany": KEYS: `,
      keys
    );
  }

  public async searchIndex(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'searchIndex',
      async () => {
        return await this.mainDB.searchIndex(key);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "searchIndex": KEY: "${key}".`);
  }

  public async rename(
    oldKey: string,
    newKey: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'rename',
      async () => {
        return await this.mainDB.rename(oldKey, newKey);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(
      `Queued task "rename": OLDKEY: "${oldKey}", NEWKEY: "${newKey}".`
    );
  }

  public async modify(
    key: string,
    value: t,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'modify',
      async () => {
        return await this.mainDB.modify(key, value);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(
      `Queued task "modify": KEY: "${key}", VALUE: "${value}".`
    );
  }

  public async modifyMany(
    items: BasketDB.Types.Core.DB.Combo<t>[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'modifyMany',
      async () => {
        return await this.mainDB.modifyMany(items);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "modifyMany": ITEMS: `, items);
  }

  public async remove(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.mainDB.remove(key, onComplete);

    // debug
    this.logger.debug(`Called mainDB.remove(): KEY: "${key}".`);
  }

  public async removeMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    this.mainDB.removeMany(keys, onComplete);

    // debug
    this.logger.debug(`Called mainDB.removeMany(): KEYS: `, keys);
  }

  public async removeInstantly(
    key: string,
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'removeInstantly',
      async () => {
        return await this.mainDB.removeInstantly(key);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "removeInstantly": KEY: "${key}".`);
  }

  public async removeInstantlyMany(
    keys: string[],
    onComplete: BasketDB.Types.Basket.TaskCompleteFunc
  ) {
    await this.queueTask(
      'removeInstantlyMany',
      async () => {
        return await this.mainDB.removeInstantlyMany(keys);
      },
      [],
      onComplete
    );

    // debug
    this.logger.debug(`Queued task "removeInstantlyMany": KEYS: `, keys);
  }

  public async close() {
    await this.trashman.close();

    // debug
    this.logger.debug(`Closed Basket.trashman.`);
  }
}
