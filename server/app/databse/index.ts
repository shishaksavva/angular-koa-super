import { Client } from "pg";

export const client = new Client({
    connectionString: "postgres://ynnncygg:BcsXjPP__3spSN7K99JrlNrQQelFR-Ca@dumbo.db.elephantsql.com/ynnncygg"
});

client.connect();

export { Client } from "pg";
