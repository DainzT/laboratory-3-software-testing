import request from "supertest";
import express from "express";
import employeeRoutes from "../routes/employeeRoutes"
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

const app = express();
app.use(express.json());
app.use('/api', employeeRoutes);

describe("POST /add - Creation of Employee", () => {

    beforeEach(async () => {
        await prisma.employee.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should create an employee and return 201 with the create employee", async () => {
        const response = await request(app)
            .post("/api/add")
            .send({
                firstName: "Kai",
                lastName: "Cenat",
                groupName: "Engineering",
                role: "Developer",
                expectedSalary: "5000",
                expectedDateOfDefense: "2025-12-31"
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            firstName: "Kai",
            lastName: "Cenat",
            expectedSalary: 5000
        });

        const dbRecord = await prisma.employee.findFirst();
        expect(dbRecord?.firstName).toBe("Kai");
    }, 10000)

    it("should return 400 if there are required missing fields", async () => {
        const response = await request(app)
            .post("/api/add")
            .send({
                firstName: "Kai"
            });

        expect(response.status).toBe(400);
        expect(await prisma.employee.count()).toBe(0);
    }, 10000)

    it("should return 400 if salary is not a string", async () => {
        const response = await request(app)
            .post("/api/add")
            .send({
                firstName: "Kai",
                lastName: "Cenat",
                groupName: "Engineering",
                role: "Developer",
                expectedSalary: "2$%700",
                expectedDateOfDefense: "2025-12-31"
            });

        expect(response.status).toBe(400);
    })
})

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
                expectedDateOfDefense: new Date("2025-12-31")
            }
        });
        testEmployeeId = newEmployee.id;
    });

    afterAll(async () => {
        await prisma.employee.deleteMany();
        await prisma.$disconnect();
    });

    it("should delete an employee and return 200", async () => {
        const response = await request(app)
            .delete(`/api/delete/${testEmployeeId}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: testEmployeeId,
            firstName: "Kaizen"
        });

        const deletedEmployee = await prisma.employee.findUnique({
            where: { id: testEmployeeId }
        });
        expect(deletedEmployee).toBeNull();
    }, 10000);

    it("should return 400 for invalid format of id", async () => {
        const response = await request(app)
            .delete("/api/delete/invalid-invalid");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Invalid ID format"
        });
    }, 10000);

    it("should return 404 for not existent employee", async () => {
        await prisma.employee.deleteMany();

        const response = await request(app)
            .delete(`/api/delete/${testEmployeeId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: "Employee not found"
        });
    }, 10000)

    it("should return 500 when database connection fails", async () => {
        jest.spyOn(prisma.employee, 'delete').mockImplementation(() => {
            throw new Prisma.PrismaClientKnownRequestError(
                "Query timed out",
                { code: "P2028", clientVersion: "1.0" }
            );
        });

        const response = await request(app)
            .delete(`/api/delete/${testEmployeeId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: "Failed to delete employee",
        });
    }, 10000)
});