import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getAllEmployeeData } from "./azureClient";

export const sharePointRouter = createTRPCRouter({
  getEmployeesData: protectedProcedure.query(async () => {
    const employeeData = await getAllEmployeeData();
    return employeeData;
  }),

});


