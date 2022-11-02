import { readFile, writeFile } from 'fs/promises';
import { serialize, deserialize } from 'v8';

import BasketDB from '../../..';

export default class DB<t> {
  public readonly filepath: string;

  public data: BasketDB.Types.Core.DBSchema<t>;

  constructor(filepath: string) {
    this.filepath = filepath;

    this.data = {};
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
    return key in this.data;
  }

  public async search(key: string) {
    const keyExists = await this.keyExists(key);

    if (keyExists) {
      const v = this.data[key];
      return v;
    } else {
      return null;
    }
  }

  public async add(key: string, value: t) {
    const keyExists = await this.keyExists(key);

    if (!keyExists) {
      this.data[key] = value;

      return this.data[key];
    } else {
      return null;
    }
  }

  public async remove(key: string) {
    const keyExists = await this.keyExists(key);

    if (keyExists) {
      delete this.data[key];

      return true;
    } else {
      return null;
    }
  }
}
