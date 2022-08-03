import { mkdir, readdir, readFile, writeFile } from "fs/promises"
import path from "path"
import * as tmp from "./templates";

const START_PATH = path.resolve(__dirname, "..", "..", "core");

class Route {
    constructor(
        public params: string,
        public className: string,
        public methodName: string,
        public classPath: string,
    ) {        
        this.classPath = "../../core/" + classPath.slice(3).replace(/\\/g, "/").replace(".ts", "");
    }

    get fieldName() {
        return this.className[0].toLowerCase() + this.className.slice(1);
    }
}

const routes: Route[] = [];

export async function rewriteDir(dirPath: string = START_PATH) {
    const dir = await readdir(dirPath);

    try {
        await readdir(dirPath.replace("core", "core-client"));
    } catch (e) {
        mkdir(dirPath.replace("core", "core-client"))
    }

    for (const file of dir) {
        if (file.endsWith(".ts")) {
            await rewriteFile(path.resolve(dirPath, file))
        } else {
            await rewriteDir(path.resolve(dirPath, file));
        }
    }
}

async function rewriteFile(filePath: string) {
    const text = (await readFile(filePath)).toString();

    let result = "";
    let className: string | null = null;

    for (const line of text.split("\n")) {
        if (tmp.isImport.test(line) &&  !tmp.isLocalImport.test(line)) {
            continue;
        } else if (tmp.isClass.test(line)) {
            className = tmp.getClassName(line);
            result += line + "\n";
        } else if (tmp.isMethod.test(line)) {
            result += tmp.writeMethod(line, className as string);
            
            routes.push(new Route(
                tmp.getParamNames(line),
                className as string,
                tmp.getMethodName(line),
                (path.resolve("..", "..", "core", filePath.replace(START_PATH, "")))
            ));
            continue;
        }

        if (!className) {
            result += line + "\n";
        }
    }

    result += "}";
    await writeFile(filePath.replace("core", "core-client"), result);
    
}

function generateRoutes() {
    const classes = Array
        .from(new Set(routes.map(r => r.className)))
        .map(className => ({ className, fieldName: className[0].toLowerCase() + className.slice(1) }));

    writeFile(path.resolve(__dirname, "..", "auto", "routes.ts"), 
`import Router from "koa-router";
import koaBody from "koa-body";
${classes.map((clazz) => `import  { ${clazz.className} } from "${routes.find(r => r.className === clazz.className)?.classPath}";`).join("\n")}

export type Dependensies = {
${classes.map((clazz) => `   ${clazz.fieldName}: ${clazz.className};`).join("\n")}
};

export function createRouter({
${classes.map((clazz) => `   ${clazz.fieldName},`).join("\n")}
}: Dependensies) {

    const router = new Router();
    router.use(koaBody());

    ${routes.map((route) => 
    `router.post("/${route.className}/${route.methodName}", async ctx => {
        const { ${route.params} } = JSON.parse(ctx.request.body) || {};
        ctx.body = await ${route.fieldName}.${route.methodName}(${route.params});
    });
    
    `).join("")}

    return router;
}
`)
}

(async () => {
    await rewriteDir();
    await generateRoutes();
})();