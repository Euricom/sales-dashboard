import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getInitialEmployees, updateEmployee } from "./mongoEmployeeClient";
import { z } from "zod";
import { updateDeal } from "./mongoDealsClient";

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
          dealIds: z.array(z.string()),
        }),
        newRowId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await updateEmployee(input.employee, input.newRowId ?? undefined);
    }),

  // updateDeals: protectedProcedure
  //   .input(
  //     z.array(
  //       z.object({
  //         id: z.string(),
  //         value: z.array(z.string()),
  //       }),
  //     ),
  //   )
  //   .mutation(async ({ input }) => {
  //     await checkWhichDealsNeedToBeCreated(input);
  //   }),

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
