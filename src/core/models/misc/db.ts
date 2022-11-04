import { readFile, writeFile } from 'fs/promises';
import { serialize, deserialize } from 'v8';

import BasketDB from '../../..';

export default class DB<t extends BasketDB.Types.Core.DB.HiddenProps> {
  public readonly filepath: string;
  public readonly type: BasketDB.Types.Core.DB.Type;

  public data: BasketDB.Types.Core.DB.Schema<t>;

  constructor(filepath: string, type: BasketDB.Types.Core.DB.Type) {
    this.filepath = filepath;
    this.type = type;

    if (type === 'array') {
      this.data = [];
    } else {
      this.data = {};
    }
  }

  public async write() {
    const string = serialize(this.data);
    await writeFile(this.filepath, string);
  }

  public async read() {
    const buffer = await readFile(this.filepath);
    this.data = deserialize(buffer);
  }

  public async keyExistsMemory(key: string) {
    if (Array.isArray(this.data)) {
      return this.data.find((t) => t.key === key) ? true : null;
    } else {
      const exists = key in this.data;
      return exists || null;
    }
  }

  public async keyMarkedForRemoval(key: string) {
    if (Array.isArray(this.data)) {
      const markedForRemoval = this.data.find(
        (t) => t.key === key
      )?.___markedForRemoval;

      return markedForRemoval || null;
    } else {
      const markedForRemoval = this.data[key]?.___markedForRemoval;

      return markedForRemoval || null;
    }
  }

  public async add(
    key: string,
    value: t
  ): Promise<BasketDB.Types.Core.DB.ReturnType<t> | null> {
    // read
    await this.read();

    const keyExistsMemory = await this.keyExistsMemory(key);

    if (!keyExistsMemory) {
      if (Array.isArray(this.data)) {
        this.data.push({
          key,
          value,
        });

        // write
        await this.write();

        return {
          key,
          value,
        };
      } else {
        this.data[key] = value;

        // write
        await this.write();

        return { key, value };
      }
    } else {
      return null;
    }
  }

  public async addMany(
    items: BasketDB.Types.Core.DB.Combo<t>[]
  ): Promise<BasketDB.Types.Core.DB.ReturnType<t>[] | null> {
    const results: BasketDB.Types.Core.DB.ReturnType<t>[] = [];

    for await (const item of items) {
      const res = await this.add(item.key, item.value);
      results.push(res as BasketDB.Types.Core.DB.ReturnType<t>);
    }

    return results;
  }

  public async search(
    key: string
  ): Promise<BasketDB.Types.Core.DB.ReturnType<t> | null> {
    // read
    await this.read();

    const keyExistsMemory = await this.keyExistsMemory(key);
    const keyMarkedForRemoval = await this.keyMarkedForRemoval(key);

    if (keyExistsMemory && !keyMarkedForRemoval) {
      if (Array.isArray(this.data)) {
        const v = this.data.find((t) => t.key === key) || null;
        return v;
      } else {
        const v = this.data[key];
        return {
          key: key,
          value: v,
        };
      }
    } else {
      return null;
    }
  }

  public async searchIndex(key: string): Promise<number | null> {
    // read
    await this.read();

    const keyExistsMemory = await this.keyExistsMemory(key);
    const keyMarkedForRemoval = await this.keyMarkedForRemoval(key);

    if (keyExistsMemory && !keyMarkedForRemoval) {
      if (Array.isArray(this.data)) {
        const v = (
          this.data as BasketDB.Types.Core.DB.ReturnType<t>[]
        ).findIndex((t) => t.key === key);
        return v;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  public async rename(
    oldKey: string,
    newKey: string
  ): Promise<BasketDB.Types.Core.DB.ReturnType<t> | null> {
    // read
    await this.read();

    const oldKeyExistsMemory = await this.keyExistsMemory(oldKey);
    const newKeyExistsMemory = await this.keyExistsMemory(newKey);
    const oldKeyMarkedForRemoval = await this.keyMarkedForRemoval(oldKey);

    if (oldKeyExistsMemory && !newKeyExistsMemory && !oldKeyMarkedForRemoval) {
      if (Array.isArray(this.data)) {
        const index = await this.searchIndex(oldKey);

        if (index) {
          this.data[index].key = newKey;

          // write
          await this.write();

          return { key: newKey, value: this.data[index].value };
        } else {
          return null;
        }
      } else {
        const renamed = delete Object.assign(this.data, {
          [newKey]: this.data[oldKey],
        })[oldKey];

        // write
        await this.write();

        return renamed ? { key: newKey, value: this.data[newKey] } : null;
      }
    } else {
      return null;
    }
  }

  public async modify(
    key: string,
    value: t
  ): Promise<BasketDB.Types.Core.DB.ReturnType<t> | null> {
    // read
    await this.read();

    const keyExistsMemory = await this.keyExistsMemory(key);
    const keyMarkedForRemoval = await this.keyMarkedForRemoval(key);

    if (keyExistsMemory && !keyMarkedForRemoval) {
      if (Array.isArray(this.data)) {
        const index = await this.searchIndex(key);

        if (index) {
          this.data[index] = { key, value };

          // write
          await this.write();

          return { key, value };
        } else {
          return null;
        }
      } else {
        this.data[key] = value;

        // write
        await this.write();

        return { key, value };
      }
    } else {
      return null;
    }
  }

  public async modifyMany(
    items: BasketDB.Types.Core.DB.Combo<t>[]
  ): Promise<BasketDB.Types.Core.DB.ReturnType<t>[] | null> {
    const results: BasketDB.Types.Core.DB.ReturnType<t>[] = [];

    for await (const item of items) {
      const res = await this.modify(item.key, item.value);
      results.push(res as BasketDB.Types.Core.DB.ReturnType<t>);
    }

    if (results.find((v) => v === null)) {
      return null;
    } else {
      return results;
    }
  }

  public async removeInstantly(
    key: string
  ): Promise<BasketDB.Types.Core.DB.ReturnType<t> | null> {
    // read
    await this.read();

    const keyExistsMemory = await this.keyExistsMemory(key);

    if (keyExistsMemory) {
      if (Array.isArray(this.data)) {
        const index = (await this.searchIndex(key)) as number;

        const old = this.data[index];

        this.data.splice(index);

        // write
        await this.write();

        return {
          key,
          value: old.value,
        };
      } else {
        const oldValue = this.data[key];

        delete this.data[key];

        // write
        await this.write();

        return {
          key,
          value: oldValue,
        };
      }
    } else {
      return null;
    }
  }

  public async removeManyInstantly(
    keys: string[]
  ): Promise<BasketDB.Types.Core.DB.ReturnType<t>[] | null> {
    const results: BasketDB.Types.Core.DB.ReturnType<t>[] = [];

    for await (const key of keys) {
      const res = await this.removeInstantly(key);
      results.push(res as BasketDB.Types.Core.DB.ReturnType<t>);
    }

    if (results.find((v) => v === null)) {
      return null;
    } else {
      return results;
    }
  }
}
