import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getInitialEmployees, updateEmployee } from "./mongoClient";
import { z } from "zod";

export const mongodbRouter = createTRPCRouter({
  getEmployees: protectedProcedure.query(async () => {
    const employees = await getInitialEmployees();
    return employees;
  }),

  updateEmployee: protectedProcedure
    .input(
      // EmployeeFromDB type
      z.object({
        employee: z.object({
          employeeId: z.string(),
          rows: z.array(z.string()),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      console.log(input.employee);
      await updateEmployee(input.employee);
    }),
});
