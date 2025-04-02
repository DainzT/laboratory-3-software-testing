import request from "supertest";
import express from "express";
import employeeRoutes from "../routes/employeeRoutes"
import prisma from "../lib/prisma";

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