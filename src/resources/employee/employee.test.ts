import request, { Response } from "supertest";
import { faker } from "@faker-js/faker";
import { app, destroyServer } from "../..";
import { ErrorTypeEnum, JobTitleEnum } from "../../core/enums";

class Generate {
  static number = (min: number, max: number) => faker.number.int({ min, max });

  static id = {
    valid: () => faker.string.uuid(),
    invalid: () => faker.string.alpha(10),
  };

  static ids = {
    valid: (count = 3) =>
      Array.from({ length: count }, () => Generate.id.valid()),
    invalid: (count = 3) =>
      Array.from({ length: count }, () => Generate.id.invalid()),
  };

  static employee = {
    empty: () => ({}),

    forInsert: {
      many: (count = 24) =>
        Array.from({ length: count }, () =>
          Generate.employee.forInsert.single()
        ),
      single: () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        middleName: faker.person.firstName(),
        email: faker.internet.email(),
        phone: `+2547${faker.string.numeric(8)}`,
        address: faker.location.streetAddress(),
        jobTitle: faker.helpers.objectValue(JobTitleEnum),
      }),
      incomplete: () => ({
        firstName: faker.person.firstName(),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        jobTitle: faker.helpers.objectValue(JobTitleEnum),
      }),
    },

    forUpdate: {
      valid: () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: `+2547${faker.string.numeric(8)}`,
      }),
      invalid: () => ({
        firstName: faker.string.alpha(1),
        lastName: faker.string.alpha(1),
      }),
    },
  };
}

const route = "/api/v1/employees";
const [min, max] = [Generate.number(2, 8), Generate.number(24, 36)];
const dummyData = Generate.employee.forInsert.many(Generate.number(min, max));
const insertedIds: string[] = [];

class BuildCommonTests {
  static checker = {
    id: {
      missing: (res: Response) => {
        expect(res.status).toBe(400);
        expect(res.body.errors[0].type).toBe("missingField");
      },
      invalid: (res: Response) => {
        expect(res.status).toBe(400);
        expect(res.body.errors[0].type).toBe("invalidDataType");
      },
      nonExisting: (res: Response) => {
        expect(res.status).toBe(404);
        expect(res.body.errors[0].type).toBe("recordNotFound");
      },
    },
    body: {
      invalid: (res: Response, error: string) => {
        expect(res.status).toBe(400);
        expect(res.body.errors[0].type).toBe(error);
      },
      empty: (res: Response) => {
        expect(res.status).toBe(400);
        expect(res.body.errors[0].type).toBe("missingField");
      },
    },
  };

  static idOrIds = {
    missing: {
      query: { id: undefined },

      testDesc: `${route} request.query={id: undefined} => (400, missingField)`,
      test(method: "get" | "patch" | "delete", route: string, data?: any) {
        it(`${method.toUpperCase()}: ${this.testDesc}`, async () => {
          const response =
            method === "get"
              ? await request(app)[method](route)
              : await request(app)[method](route).send(data);

          BuildCommonTests.checker.id.missing(response);
        });
      },
    },

    invalid: {
      query: { id: Generate.id.invalid(), ids: Generate.ids.invalid() },

      testDesc: `${route} request.query={id: invalid, ids: [invalids]} => (400, invalidDataType)`,
      test(method: "get" | "patch" | "delete", route: string, data?: any) {
        it(`${method.toUpperCase()}: ${this.testDesc}`, async () => {
          const response =
            method === "get"
              ? await request(app)[method](route).query(this.query)
              : await request(app)[method](route).query(this.query).send(data);

          BuildCommonTests.checker.id.invalid(response);
        });
      },
    },

    noneExisting: {
      query: { id: Generate.id.valid(), ids: Generate.ids.valid() },

      testDesc: `${route} request.query={id: noneExisting, ids: [noneExisting]} => (404, recordNotFound)`,
      test(method: "get" | "patch" | "delete", route: string, data?: any) {
        it(`${method.toUpperCase()}: ${this.testDesc}`, async () => {
          const response =
            method === "get"
              ? await request(app)[method](route).query(this.query)
              : await request(app)[method](route).query(this.query).send(data);

          BuildCommonTests.checker.id.nonExisting(response);
        });
      },
    },
  };

  static body = {
    empty: {
      testDesc: `${route} request.body={empty} => (400, missingField)`,
      test(method: "post" | "patch", route: string, id?: string) {
        it(`${method.toUpperCase()}: ${this.testDesc}`, async () => {
          const response = await request(app)[method](route).query({ id });

          BuildCommonTests.checker.body.empty(response);
        });
      },
    },

    invalid: {
      query: { id: Generate.id.valid(), ids: Generate.ids.valid() },

      testDesc: `${route} request.body={invalid} => (400, `,
      test(method: "post" | "patch", route: string, data: any, error: string) {
        it(`${method.toUpperCase()}: ${this.testDesc} ${error})`, async () => {
          const response = await request(app)
            [method](route)
            .query(this.query)
            .send(data);

          BuildCommonTests.checker.body.invalid(response, error);
        });
      },
    },
  };
}

describe("POST /api/employees", () => {
  it("POST: /api/employees body: {...} => (201, insert)", async () => {
    for await (const data of dummyData) {
      const response = await request(app)
        .post(route)
        .send(data)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();

      if (response.body.data.id) insertedIds.push(response.body.data.id);
    }
  });

  BuildCommonTests.body.empty.test("post", route);

  it("POST: /api/v1/employees body: {incomplete data} => (400, missingField)", async () => {
    const data = {
      phone: `+2547${faker.string.numeric(8)}`, // Ethiopian format
      address: faker.location.streetAddress(),
      jobTitle: faker.helpers.objectValue(JobTitleEnum),
    };

    const response = await request(app)
      .post(route)
      .send(data)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.errors[0].type).toBe("missingField");
  });

  it("POST: /api/v1/employees body: {duplicate {phone or email}} =>(409, uniqueConstraintViolation)", async () => {
    const data = dummyData[0];

    const response = await request(app)
      .post(route)
      .send(data)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(409); // Expect HTTP 400 Bad Request
    expect(response.body.errors[0].type).toBe("uniqueConstraintViolation");
  });

  it("POST: /api/v1/employees/ids body: {ids=[...]} => (200, [employees])", async () => {
    const response = await request(app)
      .post(`${route}/ids`)
      .query({ ids: insertedIds });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it("POST: /api/v1/employees/bulk should respond with (501, serviceUnavailable))", async () => {
    const response = await request(app).post(`${route}/bulk`);

    expect(response.status).toBe(501);
    expect(response.body.errors[0].type).toBe("serviceUnavailable");
  });
});

describe("GET /api/employees", () => {
  it("GET: /api/v1/employees query: {id: ...} => (200, employee)", async () => {
    const response = await request(app)
      .get(route)
      .query({ id: insertedIds[0] });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBeDefined();
  });

  BuildCommonTests.idOrIds.missing.test("get", route);
  BuildCommonTests.idOrIds.invalid.test("get", route);
  BuildCommonTests.idOrIds.noneExisting.test("get", route);

  it("GET: /api/v1/employees/ids query: {ids: [...]} => (200, [employees])", async () => {
    const response = await request(app)
      .get(`${route}/ids`)
      .query({ ids: insertedIds });

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it("GET: /api/v1/employees/ids query: {ids: ...} => (200, [employee])", async () => {
    const response = await request(app)
      .get(`${route}/ids`)
      .query({ ids: insertedIds[1] });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toEqual(1);
  });

  BuildCommonTests.idOrIds.missing.test("get", `${route}/ids`);
  BuildCommonTests.idOrIds.invalid.test("get", `${route}/ids`);
  BuildCommonTests.idOrIds.noneExisting.test("get", `${route}/ids`);
});

describe("PATCH /api/employees", () => {
  it(`PATCH: /api/va/employees body: {...}, query: {id: ...} => (200, updateEmployee)`, async () => {
    const data = {
      firstName: "updatedFirstName",
      lastName: "updatedLastName",
    };

    const response = await request(app)
      .patch(route)
      .send(data)
      .query({ id: insertedIds[0] });

    const updatedEmployee = await request(app)
      .get(route)
      .query({ id: insertedIds[0] });

    expect(response.status).toBe(200);
    expect(response.body.data.count).toEqual(1);

    expect(updatedEmployee.body.data.firstName).toBe(data.firstName);
    expect(updatedEmployee.body.data.lastName).toBe(data.lastName);
  });

  BuildCommonTests.idOrIds.missing.test("patch", route);
  BuildCommonTests.idOrIds.invalid.test("patch", route);
  BuildCommonTests.idOrIds.noneExisting.test(
    "patch",
    route,
    Generate.employee.forUpdate.valid()
  );

  BuildCommonTests.body.empty.test("patch", route);
  BuildCommonTests.body.invalid.test(
    "patch",
    route,
    Generate.employee.forUpdate.invalid(),
    ErrorTypeEnum.ValueTooShort
  );

  it("PATCH: /api/va/employees/returning body: {...}, query: {id: ...} => (200, updatedEmployee)", async () => {
    const data = {
      firstName: "returningUpdatedFirstName",
      lastName: "returningUpdatedLastName",
    };

    const response = await request(app)
      .patch(`${route}/returning`)
      .send(data)
      .query({ id: insertedIds[0] });

    expect(response.status).toBe(200);
    expect(response.body.data.returning.firstName).toBe(data.firstName);
    expect(response.body.data.returning.lastName).toBe(data.lastName);
  });

  BuildCommonTests.idOrIds.missing.test("patch", `${route}/returning`);
  BuildCommonTests.idOrIds.invalid.test("patch", `${route}/returning`);
  BuildCommonTests.idOrIds.noneExisting.test(
    "patch",
    `${route}/returning`,
    Generate.employee.forUpdate.valid()
  );

  BuildCommonTests.body.empty.test("patch", `${route}/returning`);
  BuildCommonTests.body.invalid.test(
    "patch",
    `${route}/returning`,
    Generate.employee.forUpdate.invalid(),
    ErrorTypeEnum.ValueTooShort
  );

  it("PATCH: /api/va/employees/ids body: {...}, query: {ids: [...]} => (200, updateInfo)", async () => {
    const data = {
      firstName: "updatedFirstName",
      lastName: "updatedLastName",
    };

    const response = await request(app)
      .patch(`${route}/ids`)
      .send(data)
      .query({ ids: insertedIds.slice(0, min) });

    expect(response.status).toBe(200);
    expect(response.body.data.count).toEqual(min);
  });

  BuildCommonTests.idOrIds.missing.test("patch", `${route}/ids`);
  BuildCommonTests.idOrIds.invalid.test("patch", `${route}/ids`);
  BuildCommonTests.idOrIds.noneExisting.test(
    "patch",
    `${route}/ids`,
    Generate.employee.forUpdate.valid()
  );

  BuildCommonTests.body.empty.test("patch", `${route}/ids`);
  BuildCommonTests.body.invalid.test(
    "patch",
    `${route}/ids`,
    Generate.employee.forUpdate.invalid(),
    ErrorTypeEnum.ValueTooShort
  );
});

describe("DELETE /api/employees", () => {
  it("should delete an employee by id", async () => {
    const response = await request(app)
      .delete(route)
      .query({ id: insertedIds[0] });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.count).toEqual(1);
  });

  BuildCommonTests.idOrIds.missing.test("delete", route);
  BuildCommonTests.idOrIds.invalid.test("delete", route);
  BuildCommonTests.idOrIds.noneExisting.test("delete", route);

  it("should delete multiple employees by ids", async () => {
    const response = await request(app)
      .delete(`${route}/ids`)
      .query({ ids: insertedIds.slice(0, min) });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.count).toEqual(min - 1);
  });

  BuildCommonTests.idOrIds.missing.test("delete", `${route}/ids`);
  BuildCommonTests.idOrIds.invalid.test("delete", `${route}/ids`);
  BuildCommonTests.idOrIds.noneExisting.test("delete", `${route}/ids`);

  it("should permanently delete an employee by id", async () => {
    const response = await request(app)
      .delete(`${route}/permanently`)
      .query({ id: insertedIds[0] });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data.count).toEqual(1);
  });

  BuildCommonTests.idOrIds.missing.test("delete", `${route}/permanently`);
  BuildCommonTests.idOrIds.invalid.test("delete", `${route}/permanently`);
  BuildCommonTests.idOrIds.noneExisting.test("delete", `${route}/permanently`);

  it("should purge all employees inserted for the test", async () => {
    for (const id of insertedIds.slice(1)) {
      const response = await request(app)
        .delete(`${route}/permanently`)
        .query({ id });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data.count).toEqual(1);
    }

    const response = await request(app)
      .get(`${route}/ids`)
      .query({ ids: insertedIds });

    expect(response.status).toBe(404);
  });
});

afterAll(async () => destroyServer());
