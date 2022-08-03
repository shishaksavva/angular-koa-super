export const isImport = /import .* from/;

export const isLocalImport = / from ["|'][.][\w]*/;

export const isClass = /^[\s]*export[\s]*class[\s]*[\w]*[\s]*{/;

export const isConstructor = /constructor/;

export const isMethod = /^[\s]*public[\s]*async[\s]*[\w]*[(]/;

export function getMethodName(line: string) {
    const METHOD_NAME = /async[\s|\w]*/mg;

    const match = line.matchAll(METHOD_NAME);

    let res = "";

    for (const name of match) {
        res += "-" + name
    }

    return res.replace(/[-]async[\s]*/, "").trim();
}

export function getParamNames(line: string) {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;

    const fnStr = line.replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).replace(/[:]/gm, "").match(ARGUMENT_NAMES)?.filter((_, id) => id % 2 == 0);

    if(!result)
        result = [];
    return result.join(", ");
}

export function getTypeMethod(line: string) {
    return line.slice(line.lastIndexOf("):")+2).replace(/[{][\s]*$/, "").trim();
}

export function getClassName(line: string) {
    const CLASS_NAME = /class[\s|\w]*/mg;

    const match = line.matchAll(CLASS_NAME);

    let res = "";

    for (const name of match) {
        res += "-" + name
    }

    return res.replace(/[-]class[\s]*/, "").trim();
}

export function writeMethod(line: string, className: string) {
    return `    public async ${getMethodName(line)}(${line.slice(line.indexOf('(')+1, line.indexOf(')'))}): ${getTypeMethod(line)} {
        return fetch(
            "/api/${className}/${getMethodName(line)}", 
            { 
                method: "POST", 
                body: JSON.stringify({ ${getParamNames(line)} }) 
            }
        ).then(res => res.json()).catch(e => {});
    }
    `;
}
