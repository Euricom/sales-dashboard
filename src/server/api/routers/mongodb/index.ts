import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getInitialEmployees, updateEmployee } from "./mongoEmployeeClient";
import { z } from "zod";
import { updateDeal } from "./mongoDealsClient";
import type { Employee } from "~/lib/types";

export const mongodbRouter = createTRPCRouter({
  getEmployees: protectedProcedure.query(async () => {
    const employees = await getInitialEmployees();

    // Filter out the employees that exist in the database but are not in the sharepoint list
    const filteredEmployees = (employees as Employee[]).filter((employee) => {
      return employee.fields !== undefined;
    });
    return filteredEmployees;
  }),

  updateEmployee: protectedProcedure
    .input(
      // EmployeeFromDB type
      z.object({
        employee: z.object({
          employeeId: z.string(),
          rows: z.array(z.string()),
          deals: z.array(z.object({
            dealId: z.string(),
            datum: z.date().nullable(),
          })),
          
        }),
        newRowId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await updateEmployee(input.employee, input.newRowId ?? undefined);
    }),

  updateDeal: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        value: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      await updateDeal(input);
    }),
});
