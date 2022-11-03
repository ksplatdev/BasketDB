import { readFile, writeFile } from 'fs/promises';
import { serialize, deserialize } from 'v8';

import BasketDB from '../../..';

export default class DB<t> {
  public readonly filepath: string;
  public readonly type: BasketDB.Types.Core.DBType;

  public data: BasketDB.Types.Core.DBSchema<t>;

  constructor(filepath: string, type: BasketDB.Types.Core.DBType) {
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

  public async keyExists(key: string) {
    if (this.type === 'array') {
      return (this.data as BasketDB.Types.Core.DBReturnType<t>[]).find(
        (t) => t.key === key
      )
        ? true
        : null;
    } else {
      return key in this.data || null;
    }
  }

  public async search(
    key: string
  ): Promise<BasketDB.Types.Core.DBReturnType<t> | null> {
    // read
    await this.read();

    const keyExists = await this.keyExists(key);

    if (keyExists) {
      if (this.type === 'array') {
        const v =
          (this.data as BasketDB.Types.Core.DBReturnType<t>[]).find(
            (t) => t.key === key
          ) || null;
        return v;
      } else {
        const v = (this.data as Record<string, t>)[key];
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

    const keyExists = await this.keyExists(key);

    if (keyExists) {
      if (this.type === 'array') {
        const v = (
          this.data as BasketDB.Types.Core.DBReturnType<t>[]
        ).findIndex((t) => t.key === key);
        return v;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  public async add(
    key: string,
    value: t
  ): Promise<BasketDB.Types.Core.DBReturnType<t> | null> {
    // read
    await this.read();

    const keyExists = await this.keyExists(key);

    if (!keyExists) {
      if (this.type === 'array') {
        (this.data as BasketDB.Types.Core.DBReturnType<t>[]).push({
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
        (this.data as Record<string, t>)[key] = value;

        // write
        await this.write();

        return { key, value };
      }
    } else {
      return null;
    }
  }

  public async remove(
    key: string
  ): Promise<BasketDB.Types.Core.DBReturnType<t> | null> {
    // read
    await this.read();

    const keyExists = await this.keyExists(key);

    if (keyExists) {
      if (this.type === 'array') {
        const index = (await this.searchIndex(key)) as number;

        const old = (this.data as BasketDB.Types.Core.DBReturnType<t>[])[index];

        (this.data as BasketDB.Types.Core.DBReturnType<t>[]).splice(index);

        // write
        await this.write();

        return {
          key,
          value: old.value,
        };
      } else {
        const oldValue = (this.data as Record<string, t>)[key];

        delete (this.data as Record<string, t>)[key];

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
}
