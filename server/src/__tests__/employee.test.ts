import request from "supertest";
import express from "express";
import employeeRoutes from "../routes/employeeRoutes";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

const app = express();
app.use(express.json());
app.use("/api", employeeRoutes);

jest.setTimeout(15000);

describe("Employee API", () => {
  beforeAll(async () => {
    await prisma.employee.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/add - Creation of Employee", () => {
    beforeEach(async () => {
      await prisma.employee.deleteMany();
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    it("should create an employee and return 201 with the create employee", async () => {
      const response = await request(app).post("/api/add").send({
        firstName: "Kai",
        lastName: "Cenat",
        groupName: "Engineering",
        role: "Developer",
        expectedSalary: "5000",
        expectedDateOfDefense: "2025-12-31",
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        firstName: "Kai",
        lastName: "Cenat",
        expectedSalary: 5000,
      });

      const dbRecord = await prisma.employee.findFirst();
      expect(dbRecord?.firstName).toBe("Kai");
    });

    it("should return 400 if there are required missing fields", async () => {
      const response = await request(app).post("/api/add").send({
        firstName: "Kai",
      });

      expect(response.status).toBe(400);
      expect(await prisma.employee.count()).toBe(0);
    });

    it("should return 400 if salary is not a string", async () => {
      const response = await request(app).post("/api/add").send({
        firstName: "Kai",
        lastName: "Cenat",
        groupName: "Engineering",
        role: "Developer",
        expectedSalary: "2$%700",
        expectedDateOfDefense: "2025-12-31",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/delete/:id - Deletion of Employee", () => {
    let testEmployeeId: string;

    beforeAll(async () => {
      const newEmployee = await prisma.employee.create({
        data: {
          firstName: "Kaizen",
          lastName: "Somosera",
          groupName: "QA",
          role: "Developer",
          expectedSalary: 5000,
          expectedDateOfDefense: new Date("2025-12-31"),
        },
      });
      testEmployeeId = newEmployee.id;
    });

    afterAll(async () => {
      await prisma.employee.deleteMany();
      await prisma.$disconnect();
    });

    it("should delete an employee and return 200", async () => {
      const response = await request(app).delete(
        `/api/delete/${testEmployeeId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testEmployeeId,
        firstName: "Kaizen",
      });

      const deletedEmployee = await prisma.employee.findUnique({
        where: { id: testEmployeeId },
      });
      expect(deletedEmployee).toBeNull();
    });

    it("should return 400 for invalid format of id", async () => {
      const response = await request(app).delete("/api/delete/invalid-invalid");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid ID format",
      });
    });

    it("should return 404 for not existent employee", async () => {
      await prisma.employee.deleteMany();

      const response = await request(app).delete(
        `/api/delete/${testEmployeeId}`
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Employee not found",
      });
    });

    it("should return 500 when database connection fails", async () => {
      jest.spyOn(prisma.employee, "delete").mockImplementation(() => {
        throw new Prisma.PrismaClientKnownRequestError("Query timed out", {
          code: "P2028",
          clientVersion: "1.0",
        });
      });

      const response = await request(app).delete(
        `/api/delete/${testEmployeeId}`
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to delete employee",
      });
    });
  });

  describe("GET /api/retrieve - Get All Employees", () => {
    beforeEach(async () => {
      await prisma.employee.deleteMany();
    });
    it("POSITIVE: should return all employees", async () => {
      await prisma.employee.create({
        data: {
          firstName: "Dainz",
          lastName: "Ddemizer",
          groupName: "HR",
          role: "Project Manager",
          expectedSalary: 6000,
          expectedDateOfDefense: new Date("2025-10-15"),
        },
      });

      const response = await request(app).get("/api/retrieve");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].firstName).toBe("Dainz");
    });

    it("NEGATIVE: should return empty array when no employees exist", async () => {
      const response = await request(app).get("/api/retrieve");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("NEGATIVE: should return 500 when database fails", async () => {
      jest.spyOn(prisma.employee, "findMany").mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const response = await request(app).get("/api/retrieve");
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/update/:id - Update Employee", () => {
    let employeeId: string;

    beforeEach(async () => {
      const employee = await prisma.employee.create({
        data: {
          firstName: "DainzT",
          lastName: "TheDestroyer",
          groupName: "IT",
          role: "THE CEO",
          expectedSalary: 4000,
          expectedDateOfDefense: new Date("2025-09-01"),
        },
      });
      employeeId = employee.id;
    });

    afterEach(async () => {
      await prisma.employee.deleteMany();
    });

    it("POSITIVE: should update employee and return updated data", async () => {
      const response = await request(app)
        .put(`/api/update/${employeeId}`)
        .send({
          firstName: "THE",
          role: "BOSS",
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("THE");
      expect(response.body.role).toBe("BOSS");
    });

    it("NEGATIVE: should return 404 for non-existent employee", async () => {
      await prisma.employee.deleteMany();
      const response = await request(app)
        .put(`/api/update/${employeeId}`)
        .send({ firstName: "Dainz" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it("NEGATIVE: should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .put("/api/update/invalid-id")
        .send({ firstName: "Dainz" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});
