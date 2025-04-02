import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { Router, Request, Response } from "express"; 

const router: Router = Router(); 
router.post("/add", async (req: Request, res: Response) => {
    console.log("Received request body:", req.body); 
    try {
        const { firstName, lastName, groupName, role, expectedSalary, expectedDateOfDefense } = req.body;
        console.log(req.body)

        if (!firstName || !lastName || !groupName || !role || !expectedSalary || !expectedDateOfDefense) {
            res.status(400).json({ error: "All fields are required" })
            return;
        }

        if (isNaN(Number(expectedSalary))) {
            res.status(400).json({ error: "Salary must be a valid number" });
            return;
        }

        const newEmployee = await prisma.employee.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                groupName: groupName,
                role: role,
                expectedSalary: Number(expectedSalary),
                expectedDateOfDefense: new Date(expectedDateOfDefense),
            },
        });

        res.status(201).json(newEmployee);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/retrieve", async (req: Request, res: Response) => {
    try {
        const employees = await prisma.employee.findMany();
        res.status(200).json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
    }

    try {
        const deletedEmployee = await prisma.employee.delete({
            where: { id },
        });

        res.status(200).json(deletedEmployee);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                res.status(404).json({ 
                    error: "Employee not found",
                });
                return;
            }
        }

        console.error("Error deleting employee:", error);
        res.status(500).json({ error: "Failed to delete employee" });
    }
});

router.put("/update/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log("Received ID:", id);
    const updateData = req.body;
   

    try {
        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: { ...updateData }
        })

        res.json(updatedEmployee);
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ message: "Failed to update employee" });
    }
});

export default router;



