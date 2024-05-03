import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import sendMail from "./mailClient";

export const mailRouter = createTRPCRouter({
    sendMail: protectedProcedure.input(z.object({name: z.string(), description: z.string()})).mutation(async (options) => {
        const {name, description} = options.input;
        if (!name || !description) {
            throw new Error("Name and description are required");
        }
        try {
            sendMail(name, description);
            return Promise.resolve({data: "Mail sent"});
        } catch (error) {
            console.error("Error in sendMail:", error);
        }
    })
});