import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createEmployee, getInitialEmployees } from "./mongoClient";
import { z } from "zod";

export const mongodbRouter = createTRPCRouter({
  getEmployees: protectedProcedure.query(async () => {
    const employees = await getInitialEmployees();
    return employees;
  }),

  createEmployee: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const newEmployee = await createEmployee({
        employeeId: input.id,
        rows: ["0"],
      });
      return newEmployee;
    }),
});
