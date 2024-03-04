import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getEmployeesData, getToken } from "./utils";

export const sharePointRouter = createTRPCRouter({
  getEmployeesData: publicProcedure.query(async () => {
    const token = await getToken();
    if (!token) {
      throw new Error("Failed to get token");
    }
    return getEmployeesData(token);
  }),
});
