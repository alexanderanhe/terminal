const nav = ({ path, userTree, files }) => {
  let result = { ...userTree };
  if (path) {
    try {
      path.split("/").forEach((dir) => {
        if (dir) {
          if (typeof result[dir] === "object" && (Array.isArray(result[dir]) || !files)) {
            result = result[dir];
          } else {
            console.error(`The directory "${dir}" was not found`);
            throw new Error("error");
          }
        }
      });
    } catch (e) {
      return false;
    }
  }
  return result;
}
const navigate = (param, prefix, userTree) => {
  const back = param === ".." ? 1 : 0;
  const path = `${prefix.substring(0,prefix.length - back)}${!back ? param : ""}`;
  const pieces = path.split("/").filter((p) => p);
  const realPath = pieces.slice(0, pieces.length - back);
  const location = nav({ path: realPath.join("/"), userTree });
  if (location && !Array.isArray(location) && typeof location !== "string") {
    const newPrefix = `${realPath.join("/")}${realPath.length ? "/" : ""}`;
    //1: setPrefix(newPrefix);
    return { prefix: newPrefix, response: [] };
  }
  return { prefix, error: true, response: [`The directory "${param}" was not found`] };
};
const explore = (parameters, prefix, userTree) => {
  const location = nav({ path: prefix, userTree });
  if (location) {
    const param = (p) => [...parameters].indexOf(p) >= 0;
    const response = Object.keys(location).map((file, i) => [
      `${param("i") ? `${i}\t` : ""}`,
      `${param("l") ? `${Array.isArray(location[file]) ? "-a----" : "d-----"}\t` : ""}`,
      `${param("l") ? `${Array.isArray(location[file]) ? location[file].length : ""}\t` : ""}`,
      file
    ].join(""));
    return { prefix, response };
  }
  return { prefix, error: true }; //2: , response: [`Command "${code}" not found`] };
};
const readFile = (file, prefix, userTree) => {
  const location = nav({ path: prefix, userTree});
  if (Array.isArray(location[file]) || typeof location[file] === "string") {
    const lines = Array.isArray(location[file]) ? location[file] : [location[file]];
    return { prefix, response: lines };
  }
  const errorMessage = location[file] ? `"${file}" is not a file` : `"${file}" doesn't exist`;
  return { prefix, error: true, response: [errorMessage] };
};
const help = (param, prefix, userTree) => {
  const path = `${prefix}${param}`;
  const pieces = path.split("/").filter((p) => p);
  const realPath = pieces.slice(0, pieces.length - 1);
  const location = nav({path: realPath.join("/"), userTree});
  if (location) {
    const suggestion = Object.keys(location).filter((l) => l.search(param.split("/").slice(-1).pop()) === 0);
    if (suggestion.length === 1) {
      const params = param.split("/");
      const prePath = params.splice(0, params.length - 1).join("/");
      const prediction = suggestion.shift();
      return `${prePath}${prePath.length ? "/" : ""}${prediction}${Array.isArray(location[prediction]) || typeof location[prediction] === "string" ? "" : "/"}`;
    }
  }
};

export default function linuxBasic ({code, history, prefix, userTree}) {
  if (!code) return;
  if (code.toLowerCase().replace(/\s+/g, "") === "cmd") {
    return { type: "CONSOLESCREEN", payload: { prefix, command: code, response: [ "ls", "cat", "clear", "cd", "cmd" ] } };
  } else if (code.toLowerCase().replace(/\s+/g, "") === "clear") {
    return { type: "CLEARCONSOLESCREEN" };
  } else if (code.toLowerCase().replace(/\s+/g, "") === "reboot") {
    window.location.reload();
  } else if (/^history(\d+)*/gi.test(code)) {
    const param = code.substring(8, code.length).replace(/\s+/g, "");
    const count = param ? parseInt(param, 10) : history.length;
    return { type: "CONSOLESCREEN", payload: { prefix, command: code, response: history.reverse().slice(0, count) } };
  } else if (/^cd (\w+|\.\.|\/)*/gi.test(code)) {
    const param = code.substring(3, code.length).replace(/\s+/g, "");
    const payload = navigate(param, prefix, userTree);
    return { type: "CONSOLESCREEN", payload: {...payload, command: code} };
  } else if (/^[ls|ll](\w+|\.\.|\/)*/gi.test(code)) {
    const param = code.substring(2, code.length).replace(/\s+/g, "");
    const payload = explore(param, prefix, userTree);
    return { type: "CONSOLESCREEN", payload: {...payload, command: code} };
  } else if (/^cat (\w+|\.\.|\/)*/gi.test(code)) {
    const file = code.substring(4, code.length).replace(/\s+/g, "");
    const payload = readFile(file, prefix, userTree);
    return { type: "CONSOLESCREEN", payload: {...payload, command: code} };
  }
  return false;
}

export function linuxBasicKeyDown({ event, code, cursor, history, prefix, userTree }) {
  if (event.keyCode === 8 && cursor) {
    return { cursor: 0, code: "" };
  } else if (event.keyCode === 9 && !cursor) {
    event.preventDefault();
    if (/^cd (\w+|\/)*/gi.test(code)) {
      const param = code.substring(3, code.length).replace(/\s+/g, "");
      const suggestion = help(param, prefix, userTree);
      return { code: `cd ${suggestion}` };
    } else if (/^cat (\w+|\/)*/gi.test(code)) {
      const param = code.substring(4, code.length).replace(/\s+/g, "");
      const suggestion = help(param, prefix, userTree);
      return { code: `cat ${suggestion}` };
    }
  } else if ((event.keyCode === 9 || event.keyCode === 13) && cursor) {
    event.preventDefault();
    return {
      code: history[history.length - cursor] || "",
      cursor: 0
    };
  } else
  // arrow up/down button should select next/previous list element
  if (event.keyCode === 38) {
    return {
      code: "",
      cursor: cursor + 1 > history.length ? history.length : cursor + 1
    };
  } else if (event.keyCode === 40) {
    return {
      code: "",
      cursor: cursor - 1 < 0 ? 0 : cursor - 1
    };
  }
  return {};
}
