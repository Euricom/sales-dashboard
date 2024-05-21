import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { getMissingEmployeeData } from "./sharepointService";
import { getToken } from "./azureClient";

export const sharePointRouter = createTRPCRouter({
    getMissingEmployeeData: protectedProcedure.input(z.array(z.string())).mutation(async (options) => {
        const accessToken = await getToken();
        const employeeEmails = options.input;
        try {
            if (!accessToken) {
                throw new Error("Access token not found");
            }
            const employees = await getMissingEmployeeData(accessToken, employeeEmails);
            if (!employees) {
                throw new Error("Failed to get employee data");
            }
            return employees;


        } catch (error) {
            console.error("Error in getMissingEmployeeData:", error);
        }
    }),



}); 