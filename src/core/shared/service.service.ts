import { dbClient } from "../database";
import { AppUpdateResultModel } from "../models/app_response.model";
import { BaseModel } from "./model.model";

export class AppService<Model extends BaseModel> {
  protected name: string;
  constructor(name: string) {
    this.name = name;
  }

  // insertion
  async insert(data: Partial<Model>): Promise<Model> {
    const keys = Object.keys(data.extractForInsertion!);
    const values = Object.values(data.extractForInsertion!);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
      INSERT INTO ${this.name} ("${keys.join('", "')}")
      VALUES (${placeholders})
      RETURNING *`;

    const result = await dbClient.query(query, values);

    return result.rows[0];
  }

  // retrieval
  async read(id: string): Promise<Model> {
    const query = `
    SELECT * FROM ${this.name}
    WHERE id = $1 AND "deletedAt" IS NULL;`;

    const result = await dbClient.query(query, [id]);
    return result.rows[0];
  }

  async readByIds(ids: string[]): Promise<Model[]> {
    const query = `
      SELECT * FROM ${this.name}
      WHERE id = ANY($1) AND "deletedAt" IS NULL;`;

    const result = await dbClient.query(query, [ids]);
    return result.rows;
  }

  //update
  async update(
    id: string,
    data: Partial<Model>
  ): Promise<AppUpdateResultModel> {
    const updateData = data.extractForUpdate!;

    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    const setValues = keys
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(", ");

    const query = `
      UPDATE ${this.name}
      SET ${setValues} 
      WHERE id = $${keys.length + 1} AND "deletedAt" IS NULL;`;

    const result = await dbClient.query(query, [...values, id]);

    return {
      updateData: data.extractForUpdate,
      count: result.rowCount,
    } as AppUpdateResultModel;
  }

  async updateAndReturn(
    id: string,
    data: Partial<Model>
  ): Promise<AppUpdateResultModel<Model>> {
    const updateData: Record<string, string> = data.extractForUpdate!;

    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    const setValues = keys
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(", ");

    const query = `
      UPDATE ${this.name}
      SET ${setValues}
      WHERE id = $${keys.length + 1} AND "deletedAt" IS NULL
      RETURNING *;`;

    const result = await dbClient.query(query, [...values, id]);

    return {
      updateData: data.extractForUpdate!,
      count: result.rowCount as number,
      returning: result.rows[0],
    };
  }

  async updateByIds(
    ids: string[],
    data: Partial<Model>
  ): Promise<AppUpdateResultModel> {
    const updateData = data.extractForUpdate!;

    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    const setValues = keys
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(", ");

    const query = `
      UPDATE ${this.name}
      SET ${setValues}
      WHERE id = ANY($${keys.length + 1}) AND "deletedAt" IS NULL;`;

    const result = await dbClient.query(query, [...values, ids]);

    return {
      updateData: data.extractForUpdate!,
      count: result.rowCount || 0,
    };
  }

  // deletion
  async delete(id: string, deletedBy: string): Promise<AppUpdateResultModel> {
    const query = `
      UPDATE ${this.name}
      SET "deletedAt" = $1, "updatedBy" = $2
      WHERE id = $3 AND "deletedAt" IS NULL;`;

    const now = new Date();

    const result = await dbClient.query(query, [now, deletedBy, id]);

    return {
      updateData: { deletedAt: now, deletedBy: deletedBy },
      count: result.rowCount || 0,
    };
  }

  async deleteByIds(
    ids: string[],
    deletedBy: string
  ): Promise<AppUpdateResultModel> {
    const query = `
      UPDATE ${this.name}
      SET "deletedAt" = $1, "deletedBy" = $2
      WHERE id = ANY($3) AND "deletedAt" IS NULL;`;

    const now = new Date();

    const result = await dbClient.query(query, [now, deletedBy, ids]);

    return {
      updateData: { deletedAt: now, deletedBy: deletedBy },
      count: result.rowCount || 0,
    };
  }

  // point of no return
  async deletePermanently(id: string): Promise<AppUpdateResultModel<Model>> {
    const query = `
      DELETE FROM ${this.name}
      WHERE id = $1
      RETURNING *;`;

    const result = await dbClient.query(query, [id]);

    return {
      updateData: {},
      count: result.rowCount || 0,
      returning: result.rows[0],
    };
  }
}
