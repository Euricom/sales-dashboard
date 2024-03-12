import { expect, test } from "@playwright/test";
import type { CompanyResponse, DealPhaseResponse, DealResponse, UserResponse } from "~/server/api/routers/teamleader/types";

test.describe("Teamleader API tests", () => {
    test("get deals data", async ({ page }) => {
        const authFile = "playwright/.auth/user.json"; 
        const storageState = await page.context().storageState({ path: authFile });
        
        const access_token_cookie = storageState.cookies.find((cookie) => cookie.name === 'access_token');
        const response = await fetch('https://api.focus.teamleader.eu/deals.list', {
            headers: {
                Authorization: `Bearer ${access_token_cookie?.value}`,
        }});
        //console.log(response);
        expect(response.status).toBe(200);
        const data: DealResponse = await response.json() as DealResponse;
        expect(data).toHaveProperty('data');
        expect(data.data).toBeInstanceOf(Array);
    });

    test("get users data", async ({ page }) => {
        const authFile = "playwright/.auth/user.json"; 
        const storageState = await page.context().storageState({ path: authFile });
        
        const access_token_cookie = storageState.cookies.find((cookie) => cookie.name === 'access_token');
        const response = await fetch('https://api.focus.teamleader.eu/users.list', {
            headers: {
                Authorization: `Bearer ${access_token_cookie?.value}`,
        }});
        //console.log(response);
        expect(response.status).toBe(200);
        const data: UserResponse = await response.json() as UserResponse;
        expect(data).toHaveProperty('data');
        expect(data.data).toBeInstanceOf(Array);
    });

    test("get specific company data", async ({ page }) => {
        const authFile = "playwright/.auth/user.json"; 
        const storageState = await page.context().storageState({ path: authFile });
        
        const access_token_cookie = storageState.cookies.find((cookie) => cookie.name === 'access_token');
        const response = await fetch('https://api.focus.teamleader.eu/companies.list', {
            method: "POST",    
            headers: {
                Authorization: `Bearer ${access_token_cookie?.value}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                filter: {
                  ids: [
                    "e654d05e-2c79-097c-a064-e3803cd75d14"
                  ]
                },
              }),
        });
        //console.log(response);
        expect(response.status).toBe(200);
        const data: CompanyResponse = await response.json() as CompanyResponse;
        expect(data).toHaveProperty('data');
        expect(data.data).toBeInstanceOf(Array);
    });

    test("get deal phases data", async ({ page }) => {
        const authFile = "playwright/.auth/user.json"; 
        const storageState = await page.context().storageState({ path: authFile });
        
        const access_token_cookie = storageState.cookies.find((cookie) => cookie.name === 'access_token');
        const response = await fetch('https://api.focus.teamleader.eu/dealPhases.list', {
            headers: {
                Authorization: `Bearer ${access_token_cookie?.value}`,
        }});
        //console.log(response);
        expect(response.status).toBe(200);
        const data: DealPhaseResponse = await response.json() as DealPhaseResponse;
        expect(data).toHaveProperty('data');
        expect(data.data).toBeInstanceOf(Array);
    });
});

