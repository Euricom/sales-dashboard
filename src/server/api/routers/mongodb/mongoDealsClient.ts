import { env } from "~/env";
import { MongoClient } from "mongodb";
import { type groupedDealFromDB } from "~/lib/types";

export const getDealsFromDB = async () => {
    const client = new MongoClient(env.DATABASE_URL);
    const db = client.db();
    try {
        await client.connect();
    
        const deals = await db
        .collection<groupedDealFromDB>("Deals")
        .find({})
        .toArray();
        return deals;
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
};

export const checkWhichDealsNeedToBeCreated = async (deals: groupedDealFromDB[]) => {
    const exisitingDeals = await getDealsFromDB();
    if (!exisitingDeals) return "No deals found in the database.";
    const newDeals = deals.filter((deal) => {
        return !exisitingDeals.some((existingDeal) => existingDeal.id === deal.id);
    });

    if (newDeals.length === 1) {
        const deal = newDeals[0];
        if (deal) {
            await createDeal(deal);
        }
    }
    if (newDeals.length > 1) {
        await createMultipleDeals(newDeals);
    }
};
  
  export const createDeal = async (groupedDeal: groupedDealFromDB) => {
    const client = new MongoClient(env.DATABASE_URL);
    const db = client.db();
    try {
      await client.connect();
      const postResult = await db.collection("Deals").insertOne(groupedDeal);
      return postResult;
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  }
  
  export const createMultipleDeals = async (groupedDeals: groupedDealFromDB[]) => {
    const client = new MongoClient(env.DATABASE_URL);
    const db = client.db();
    try {
      await client.connect();
      const postResult = await db.collection("Deals").insertMany(groupedDeals);
      return postResult;
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  };

  export const updateDeal = async (groupedDeal: groupedDealFromDB) => {
    const client = new MongoClient(env.DATABASE_URL);
    const db = client.db();
    try {
      await client.connect();
      const postResult = await db.collection("Deals").updateOne({id: groupedDeal.id}, {$set: groupedDeal});
      return postResult;
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  }