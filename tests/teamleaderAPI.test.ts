import { expect, test } from "@playwright/test";
import type { dataObject } from "~/server/api/routers/teamleader/types";

test.describe("Teamleader API tests", () => {
    test("get all deals data alongside the linked companies and users", async ({ page }) => {
        const authFile = "playwright/.auth/user.json"; 
        const storageState = await page.context().storageState({ path: authFile });
        
        const access_token_cookie = storageState.cookies.find((cookie) => cookie.name === 'access_token');
        const response = await fetch('https://api.focus.teamleader.eu/deals.list', {
            method: "POST",    
            headers: {
                Authorization: `Bearer ${access_token_cookie?.value}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                filter: {
                  phase_id: "7c711ed5-1d69-012b-a341-4c1ed1f057cb",
                },
                page: {
                  size: 20,
                },
                include: "lead.customer,responsible_user",
              }),
        });
        expect(response.status).toBe(200);
        const data: dataObject = await response.json() as dataObject;
        // check if data is present
        expect(data).toHaveProperty('data');
        expect(data.data).toBeInstanceOf(Array);
        // check if included is present
        expect(data).toHaveProperty('included');
        // check if included has company and user
        expect(data.included).toHaveProperty('company');
        expect(data.included.company).toBeInstanceOf(Array);

        expect(data.included).toHaveProperty('user');
        expect(data.included.user).toBeInstanceOf(Array);
    });
});

