import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getEmployeesData, getToken, sortEmployeesData } from "./azureClient";

export const sharePointRouter = createTRPCRouter({
  getEmployeesData: protectedProcedure.query(async () => {
    const token = await getToken();
    if (!token) {
      throw new Error("Failed to get token");
    }
    const employeeData = await getEmployeesData(token);
    //console.log(employeeData?.value);
    if (!employeeData) {
      throw new Error("Failed to get employee data");
    }

    const data = sortEmployeesData(employeeData);
    //console.log(data);
    return data;
  }),
});
