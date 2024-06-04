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

type Accumulator = {
  newUniqueDeals: groupedDealFromDB[];
  existingUniqueDeals: groupedDealFromDB[];
};

export const checkWhichDealsNeedToBeCreatedOrUpdated = async (
  uniqueDeals: groupedDealFromDB[],
) => {
  const dealsFromMongo = await getDealsFromDB();
  if (!dealsFromMongo) await createMultipleDeals(uniqueDeals);
  // get all deals and separate them
  const { newUniqueDeals, existingUniqueDeals } =
    uniqueDeals.reduce<Accumulator>(
      (acc, uniqueDeal) => {
        if (
          dealsFromMongo?.some(
            (dealsFromMongo) => dealsFromMongo.id === uniqueDeal.id,
          )
        ) {
          acc.existingUniqueDeals.push(uniqueDeal);
        } else {
          acc.newUniqueDeals.push(uniqueDeal);
        }
        return acc;
      },
      { newUniqueDeals: [], existingUniqueDeals: [] },
    );

  // add the deals to the database
  if (newUniqueDeals.length === 1) {
    await createDeal(newUniqueDeals[0]!);
  }
  if (newUniqueDeals.length > 1) {
    await createMultipleDeals(newUniqueDeals);
  }

  // check if existing deals need to be updated and if so, update them
  await Promise.all(
    existingUniqueDeals.map(async (existingUniqueDeal) => {
      const dealFromMongo = dealsFromMongo?.find(
        (deal) => deal.id === existingUniqueDeal.id,
      );
      const shouldUpdate = !existingUniqueDeal.value.every((dealId) =>
        dealFromMongo?.value.includes(dealId),
      );

      if (dealFromMongo && shouldUpdate) {
        await updateDeal(existingUniqueDeal);
      }
    }),
  );
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
};

export const createMultipleDeals = async (
  groupedDeals: groupedDealFromDB[],
) => {
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
    const postResult = await db
      .collection("Deals")
      .updateOne({ id: groupedDeal.id }, { $set: groupedDeal });
    return postResult;
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
};

export const deleteDeal = async (id: string) => {
  const client = new MongoClient(env.DATABASE_URL);
  const db = client.db();
  try {
    await client.connect();
    const postResult = await db
      .collection("Deals")
      .deleteOne({ id: id });
    return postResult;
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
};
