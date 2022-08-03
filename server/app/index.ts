import Koa from "koa";
import { createRouter } from "../auto/routes";
import koaBody from "koa-body";
import logger from "koa-logger"
import { MainComponent } from "../../core/components/MainComponent";
import { DatabaseComponent } from "../../core/components/DatabaseComponent";
import { client } from "./databse"

const main = new MainComponent(client);
const database = new DatabaseComponent(client);

const server = new Koa();

server.use(logger());

const router = createRouter({
    mainComponent: main,
    databaseComponent: database
});

router.use(koaBody());

server.use(router.routes());
server.use(router.allowedMethods());

server.listen(8000, () => console.log("Server starting on http://localhost:8000"));