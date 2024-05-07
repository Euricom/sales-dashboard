import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import sendMail from "./mailClient";

export const mailRouter = createTRPCRouter({
    sendMail: protectedProcedure.input(z.string()).mutation(async (options) => {
        const description = options.input;
        const name = options.ctx.session.user.name;
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