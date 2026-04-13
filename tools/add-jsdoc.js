const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const REPO_ROOT = path.resolve(__dirname, "..");

const EXCLUDED_SEGMENTS = new Set([
  "node_modules",
  ".git",
  ".next",
]);

const EXCLUDED_PREFIXES = [
  "server/ui/public/",
  "server/ocgcore/",
  "emsdk/",
];

const TARGET_EXTENSIONS = new Set([".js"]);
const ARRAY_CALLBACK_METHODS = new Set([
  "every",
  "filter",
  "find",
  "findIndex",
  "flatMap",
  "forEach",
  "map",
  "reduce",
  "some",
]);
const IGNORED_CALLEE_PROPERTIES = new Set([
  "add",
  "at",
  "catch",
  "concat",
  "endsWith",
  "every",
  "exec",
  "filter",
  "find",
  "findIndex",
  "flatMap",
  "forEach",
  "has",
  "includes",
  "join",
  "localeCompare",
  "map",
  "match",
  "pop",
  "push",
  "reduce",
  "replace",
  "set",
  "shift",
  "slice",
  "some",
  "sort",
  "splice",
  "split",
  "startsWith",
  "test",
  "then",
  "toLocaleLowerCase",
  "toLocaleUpperCase",
  "toLowerCase",
  "toString",
  "toUpperCase",
  "trim",
  "unshift",
]);
const PRIMITIVE_LIKE_PROPERTY_NAMES = new Set(["length", "size"]);
const STRING_METHODS = new Set([
  "charAt",
  "endsWith",
  "includes",
  "indexOf",
  "lastIndexOf",
  "localeCompare",
  "match",
  "padEnd",
  "padStart",
  "replace",
  "slice",
  "split",
  "startsWith",
  "substring",
  "toLowerCase",
  "toLocaleLowerCase",
  "toLocaleUpperCase",
  "toString",
  "toUpperCase",
  "trim",
]);
const ARRAY_METHODS = new Set([
  "at",
  "concat",
  "every",
  "filter",
  "find",
  "findIndex",
  "flat",
  "flatMap",
  "forEach",
  "includes",
  "indexOf",
  "join",
  "map",
  "pop",
  "push",
  "reduce",
  "reverse",
  "shift",
  "slice",
  "some",
  "sort",
  "splice",
  "unshift",
]);
const DATE_METHODS = new Set([
  "getDate",
  "getDay",
  "getFullYear",
  "getHours",
  "getMinutes",
  "getMonth",
  "getSeconds",
  "getTime",
  "toISOString",
]);
const FUNCTION_PROPERTY_NAMES = new Set([
  "bind",
  "catch",
  "close",
  "connect",
  "emit",
  "end",
  "json",
  "map",
  "off",
  "on",
  "once",
  "preventDefault",
  "push",
  "refresh",
  "replace",
  "resolve",
  "send",
  "set",
  "status",
  "subarray",
  "then",
  "trim",
  "write",
]);
const STRING_NAME_PARTS = new Set([
  "action",
  "alias",
  "attribute",
  "banlist",
  "baseurl",
  "bio",
  "channel",
  "classvalue",
  "classification",
  "code",
  "color",
  "command",
  "content",
  "cover",
  "deckname",
  "description",
  "email",
  "error",
  "excerpt",
  "eventname",
  "field",
  "format",
  "id",
  "identifier",
  "imageurl",
  "jwt",
  "label",
  "language",
  "league",
  "location",
  "message",
  "method",
  "mode",
  "name",
  "notes",
  "owner",
  "password",
  "path",
  "phase",
  "playera",
  "playerb",
  "prefix",
  "query",
  "race",
  "registrationstate",
  "region",
  "release",
  "result",
  "role",
  "room",
  "roomid",
  "roompass",
  "search",
  "session",
  "slug",
  "sound",
  "source",
  "status",
  "subject",
  "summary",
  "target",
  "text",
  "timezone",
  "traceid",
  "title",
  "token",
  "type",
  "uid",
  "url",
  "username",
  "value",
  "visibility",
  "winner",
  "zone",
]);
const NUMBER_NAME_PARTS = new Set([
  "actualscore",
  "amount",
  "at",
  "atk",
  "capacity",
  "count",
  "currentrating",
  "day",
  "def",
  "delay",
  "deckid",
  "elo",
  "elapsed",
  "expectedscore",
  "graceminutes",
  "hour",
  "index",
  "j",
  "kfactor",
  "length",
  "level",
  "limit",
  "loserid",
  "ms",
  "minute",
  "month",
  "num",
  "number",
  "offset",
  "opponentrating",
  "page",
  "pagesize",
  "place",
  "playerrating",
  "player",
  "points",
  "port",
  "ptr",
  "roundnumber",
  "rounds",
  "scale",
  "score",
  "sequence",
  "side",
  "size",
  "slot",
  "specount",
  "table",
  "tablenumber",
  "teamindex",
  "timeout",
  "turn",
  "wins",
  "winnerid",
  "year",
]);
const BOOLEAN_NAME_PARTS = new Set([
  "active",
  "aiready",
  "automatic",
  "checkedin",
  "checkinrequired",
  "enabled",
  "expectok",
  "exacttype",
  "forced",
  "isbecomingcard",
  "legacymode",
  "lean",
  "manual",
  "ownedbyme",
  "ok",
  "platformmanaged",
  "public",
  "ranked",
  "registeredbyme",
  "registrationopen",
  "rejectonerror",
  "selected",
  "service",
  "success",
  "valid",
  "visible",
]);
const ARRAY_NAME_PARTS = new Set([
  "array",
  "backgrounds",
  "cards",
  "choices",
  "clients",
  "covers",
  "decks",
  "entries",
  "entrants",
  "games",
  "links",
  "messages",
  "names",
  "pairings",
  "players",
  "results",
  "roles",
  "selections",
  "standings",
  "users",
  "zones",
]);
const OBJECT_NAME_PARTS = new Set([
  "body",
  "card",
  "client",
  "config",
  "data",
  "deck",
  "duel",
  "engine",
  "event",
  "filter",
  "game",
  "headers",
  "info",
  "logger",
  "module",
  "options",
  "packet",
  "params",
  "payload",
  "person",
  "query",
  "request",
  "response",
  "room",
  "session",
  "settings",
  "socket",
  "state",
  "store",
  "tournament",
  "user",
  "viewer",
  "ws",
  "zoneanswer",
]);
const FUNCTION_NAME_PARTS = new Set([
  "callback",
  "cb",
  "cleanup",
  "handler",
  "listener",
  "logger",
  "onclose",
  "onconnection",
  "onerror",
  "onmessage",
  "onready",
  "onrequestinput",
  "ontrace",
  "predicate",
  "rerender",
  "resolve",
  "reject",
]);

function isExcluded(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  const segments = normalized.split("/");

  if (normalized === "tools/add-jsdoc.js") {
    return true;
  }

  for (const segment of segments) {
    if (EXCLUDED_SEGMENTS.has(segment)) {
      return true;
    }
  }

  for (const prefix of EXCLUDED_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

function listTargetFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(REPO_ROOT, absolutePath);

    if (isExcluded(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...listTargetFiles(absolutePath));
      continue;
    }

    if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function hasJsdocComment(node) {
  if (!node || !Array.isArray(node.leadingComments)) {
    return false;
  }

  return node.leadingComments.some((comment) => {
    return comment.type === "CommentBlock" && comment.value.startsWith("*");
  });
}

function resolveTargetPath(pathRef) {
  const node = pathRef.node;

  if (
    (node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") &&
    pathRef.parentPath &&
    (pathRef.parentPath.isExportDefaultDeclaration() ||
      pathRef.parentPath.isExportNamedDeclaration())
  ) {
    return pathRef.parentPath;
  }

  if (
    pathRef.isVariableDeclarator() &&
    pathRef.parentPath &&
    pathRef.parentPath.isVariableDeclaration()
  ) {
    if (pathRef.parent.declarations.length === 1) {
      if (
        pathRef.parentPath.parentPath &&
        (pathRef.parentPath.parentPath.isExportDefaultDeclaration() ||
          pathRef.parentPath.parentPath.isExportNamedDeclaration())
      ) {
        return pathRef.parentPath.parentPath;
      }
      return pathRef.parentPath;
    }
  }

  return pathRef;
}

function extractFunctionName(pathRef) {
  if (pathRef.isFunctionDeclaration() || pathRef.isClassMethod() || pathRef.isObjectMethod()) {
    if (pathRef.node.id && pathRef.node.id.name) {
      return pathRef.node.id.name;
    }

    if (pathRef.node.key) {
      if (pathRef.node.key.type === "Identifier") {
        return pathRef.node.key.name;
      }

      if (pathRef.node.key.type === "StringLiteral") {
        return pathRef.node.key.value;
      }
    }
  }

  if (pathRef.isVariableDeclarator()) {
    if (pathRef.node.id.type === "Identifier") {
      return pathRef.node.id.name;
    }
  }

  return "anonymousFunction";
}

function humanizeName(name) {
  const normalized = String(name || "function")
    .replace(/^[#_]+/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  if (!normalized) {
    return "Document function behavior";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getFileContext(filePath) {
  const normalized = path
    .relative(REPO_ROOT, filePath)
    .replace(/\\/g, "/")
    .replace(/\.js$/, "");
  const parts = normalized.split("/").filter(Boolean);
  const genericParts = new Set(["index", "page", "layout", "route", "_lib"]);

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    if (!genericParts.has(part)) {
      return humanizeName(part.replace(/[\[\]]/g, ""));
    }
  }

  return humanizeName(parts[parts.length - 1] || "module");
}

function splitVerbAndObject(name) {
  const rawName = String(name || "").replace(/^[#_]+/, "");
  const match = rawName.match(
    /^(get|set|load|fetch|find|resolve|create|build|render|parse|format|normalize|validate|serialize|deserialize|hydrate|apply|update|handle|register|listen|watch|connect|disconnect|reset|toggle|open|close|cancel|drop|join|unregister|check|calculate|convert|map|filter|sort|shuffle|import|export|save|read|write|remove|delete|report|complete|start|force|merge|move|swap|reopen|assign|lock|unlock|encode|decode|prepare|collect|send|receive|store|persist|restore|sync|boot|launch|make|use|show|hide|mark|clear|compare|copy|clone|retry|queue|schedule|run|test|seed|transform|select|search|submit|request|match|wrap|trim|reduce|group|count|choose|track|monitor|publish|notify|translate|recover|resetPassword|forgotPassword|unique|without)(.+)$/,
  );

  if (!match) {
    return null;
  }

  return {
    verb: match[1],
    object: humanizeName(match[2]),
  };
}

function looksLikeComponentName(functionName) {
  return Boolean(functionName) && /^[A-Z][A-Za-z0-9]*$/.test(functionName) && functionName !== functionName.toUpperCase();
}

function getFunctionNode(pathRef) {
  if (
    pathRef.isVariableDeclarator() &&
    pathRef.node.init &&
    (pathRef.node.init.type === "ArrowFunctionExpression" ||
      pathRef.node.init.type === "FunctionExpression")
  ) {
    return pathRef.node.init;
  }

  return pathRef.node;
}

function getFunctionTraversalPath(pathRef) {
  if (pathRef.isVariableDeclarator()) {
    return pathRef.get("init");
  }

  return pathRef;
}

function isAsyncFunction(pathRef) {
  return Boolean(getFunctionNode(pathRef)?.async);
}

function isCreateElementCall(node) {
  if (!node || node.type !== "CallExpression") {
    return false;
  }

  if (
    node.callee.type === "Identifier" &&
    node.callee.name === "createElement"
  ) {
    return true;
  }

  return (
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "Identifier" &&
    node.callee.object.name === "React" &&
    getPropertyName(node.callee.property) === "createElement"
  );
}

function isRenderableExpression(node) {
  if (!node) {
    return false;
  }

  switch (node.type) {
    case "JSXElement":
    case "JSXFragment":
      return true;
    case "ParenthesizedExpression":
      return isRenderableExpression(node.expression);
    case "CallExpression":
      return isCreateElementCall(node);
    case "ConditionalExpression":
      return isRenderableExpression(node.consequent) || isRenderableExpression(node.alternate);
    case "LogicalExpression":
      return isRenderableExpression(node.left) || isRenderableExpression(node.right);
    case "SequenceExpression":
      return node.expressions.some((expression) => isRenderableExpression(expression));
    default:
      return false;
  }
}

function functionReturnsReactNode(pathRef) {
  const functionNode = getFunctionNode(pathRef);
  if (!functionNode) {
    return false;
  }

  if (
    functionNode.type === "ArrowFunctionExpression" &&
    functionNode.body.type !== "BlockStatement"
  ) {
    return isRenderableExpression(functionNode.body);
  }

  const traversalPath = getFunctionTraversalPath(pathRef);
  let returnsReactNode = false;

  traversalPath.traverse({
    Function(innerPath) {
      if (innerPath !== traversalPath) {
        innerPath.skip();
      }
    },
    ReturnStatement(returnPath) {
      if (isRenderableExpression(returnPath.node.argument)) {
        returnsReactNode = true;
        returnPath.stop();
      }
    },
  });

  return returnsReactNode;
}

function isReactComponent(pathRef, functionName, filePath) {
  if (!functionName) {
    return false;
  }

  const relativePath = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
  if (/\/app\/.*\/(page|layout)\.js$/.test(relativePath) && functionReturnsReactNode(pathRef)) {
    return true;
  }

  if (looksLikeComponentName(functionName) && functionReturnsReactNode(pathRef)) {
    return true;
  }

  return relativePath.includes("/components/") && functionReturnsReactNode(pathRef);
}

function conjugateVerb(verb) {
  if (/[^aeiou]y$/i.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }

  if (/(s|sh|ch|x|z|o)$/i.test(verb)) {
    return `${verb}es`;
  }

  return `${verb}s`;
}

function generateDescription(pathRef, filePath) {
  const functionName = extractFunctionName(pathRef);
  const context = getFileContext(filePath);
  const lowerContext = context.toLowerCase();

  if (pathRef.isClassMethod() && pathRef.node.kind === "constructor") {
    return `Initializes a new ${context} instance and prepares its internal state.`;
  }

  if (/^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)$/.test(functionName || "")) {
    return `Handles ${functionName} requests for the ${lowerContext} route.`;
  }

  if (isReactComponent(pathRef, functionName, filePath)) {
    return `Renders the ${humanizeName(functionName)} component and returns the UI used by the ${lowerContext} view.`;
  }

  if (/^(is|has|can|should)[A-Z_]/.test(functionName || "")) {
    return `Determines whether ${humanizeName(functionName).replace(/^(Is|Has|Can|Should)\s*/, "").toLowerCase()} should be treated as valid in the ${lowerContext} module.`;
  }

  if (/^on[A-Z_]/.test(functionName || "")) {
    return `Handles ${humanizeName(functionName).replace(/^On\s*/, "").toLowerCase()} events for the ${lowerContext} module.`;
  }

  const verbAndObject = splitVerbAndObject(functionName);
  if (verbAndObject) {
    if (verbAndObject.verb === "unique") {
      return `Creates unique ${verbAndObject.object.toLowerCase()} for the ${lowerContext} module.`;
    }

    if (verbAndObject.verb === "without") {
      return `Builds ${verbAndObject.object.toLowerCase()} without the excluded value for the ${lowerContext} module.`;
    }

    return `${humanizeName(conjugateVerb(verbAndObject.verb))} ${verbAndObject.object.toLowerCase()} used by the ${lowerContext} module.`;
  }

  return `Executes the ${humanizeName(functionName).toLowerCase()} helper used by the ${lowerContext} module.`;
}

function functionReturnsValue(pathRef) {
  const functionNode = getFunctionNode(pathRef);
  if (!functionNode) {
    return false;
  }

  if (functionNode.type === "ArrowFunctionExpression" && functionNode.body.type !== "BlockStatement") {
    return true;
  }

  let returnsValue = false;
  const traversalPath = getFunctionTraversalPath(pathRef);

  traversalPath.traverse({
    Function(innerPath) {
      if (innerPath !== traversalPath) {
        innerPath.skip();
      }
    },
    ReturnStatement(returnPath) {
      if (returnPath.node.argument) {
        returnsValue = true;
      }
    },
  });

  return returnsValue;
}

function getReturnInfo(pathRef, filePath) {
  const lowerContext = getFileContext(filePath).toLowerCase();
  const functionName = extractFunctionName(pathRef);
  const asyncFunction = isAsyncFunction(pathRef);

  if (pathRef.isClassMethod() && pathRef.node.kind === "constructor") {
    return {
      type: "void",
      description: "Does not return a value.",
    };
  }

  if (/^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)$/.test(functionName || "")) {
    return {
      type: asyncFunction ? "Promise<Object>" : "Object",
      description: asyncFunction
        ? `Resolves with the response generated for the ${lowerContext} route.`
        : `Returns the response generated for the ${lowerContext} route.`,
    };
  }

  if (isReactComponent(pathRef, functionName, filePath)) {
    return {
      type: asyncFunction ? "Promise<React.ReactNode>" : "React.ReactNode",
      description: asyncFunction
        ? `Resolves with the rendered UI used by the ${lowerContext} view.`
        : `Returns the rendered UI used by the ${lowerContext} view.`,
    };
  }

  if (!functionReturnsValue(pathRef)) {
    return {
      type: asyncFunction ? "Promise<void>" : "void",
      description: asyncFunction
        ? `Resolves when the ${lowerContext} operation completes.`
        : "Does not return a value.",
    };
  }

  if (/^(is|has|can|should)[A-Z_]/.test(functionName || "")) {
    const subject = humanizeName(functionName).replace(/^(Is|Has|Can|Should)\s*/, "").toLowerCase();
    return {
      type: asyncFunction ? "Promise<boolean>" : "boolean",
      description: asyncFunction
        ? `Resolves to \`true\` when ${subject} is valid in the ${lowerContext} module and \`false\` otherwise.`
        : `Returns \`true\` when ${subject} is valid in the ${lowerContext} module and \`false\` otherwise.`,
    };
  }

  const returnTypeHints = collectReturnTypeHints(pathRef);
  let resolvedType = formatTypeHints(returnTypeHints, null);
  const functionNameHint = inferFunctionNameReturnType(functionName);

  if (resolvedType === "Object" && functionNameHint) {
    resolvedType = functionNameHint;
  }

  if (!resolvedType) {
    const nameTypeHint = functionNameHint || inferNameBasedType(functionName);
    resolvedType = nameTypeHint || "*";
  }

  if (asyncFunction) {
    resolvedType = `Promise<${unwrapPromiseType(resolvedType)}>`;
  }

  return {
    type: resolvedType,
    description: asyncFunction
      ? `Resolves with the value produced by the ${lowerContext} module.`
      : `Returns the value produced by the ${lowerContext} module.`,
  };
}

function getParamInfo(param, index) {
  if (!param) {
    return { type: "*", name: `param${index}` };
  }

  switch (param.type) {
    case "Identifier":
      return { type: "*", name: param.name };
    case "AssignmentPattern":
      return getParamInfo(param.left, index);
    case "RestElement": {
      const rest = getParamInfo(param.argument, index);
      return { type: "...*", name: rest.name };
    }
    case "ObjectPattern":
      return { type: "Object", name: `param${index}` };
    case "ArrayPattern":
      return { type: "Array", name: `param${index}` };
    default:
      return { type: "*", name: `param${index}` };
  }
}

function getPropertyName(node) {
  if (!node) {
    return null;
  }

  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "StringLiteral" || node.type === "NumericLiteral") {
    return String(node.value);
  }

  return null;
}

function getMemberPathSegment(memberNode) {
  if (!memberNode) {
    return null;
  }

  if (!memberNode.computed) {
    return getPropertyName(memberNode.property);
  }

  if (memberNode.property.type === "StringLiteral") {
    return memberNode.property.value;
  }

  if (memberNode.property.type === "NumericLiteral") {
    return "[]";
  }

  if (
    memberNode.property.type === "Identifier" &&
    /^(i|idx|index|position|offset|slot)$/i.test(memberNode.property.name)
  ) {
    return "[]";
  }

  return null;
}

function joinPropertyPathSegments(segments) {
  let result = "";

  for (const segment of segments) {
    if (!segment) {
      continue;
    }

    if (!result) {
      result = segment;
      continue;
    }

    if (segment === "[]") {
      result += "[]";
      continue;
    }

    result += `.${segment}`;
  }

  return result;
}

function extractPatternPropertyPaths(pattern, prefix = "") {
  if (!pattern) {
    return [];
  }

  if (pattern.type === "ObjectPattern") {
    return pattern.properties.flatMap((property) => {
      if (property.type === "RestElement") {
        const restName = getPropertyName(property.argument);
        return restName ? [prefix ? `${prefix}.${restName}` : restName] : [];
      }

      const propertyName = getPropertyName(property.key);
      if (!propertyName) {
        return [];
      }

      const nextPrefix = prefix ? `${prefix}.${propertyName}` : propertyName;
      const nested =
        property.value && property.value !== property.key
          ? extractPatternPropertyPaths(property.value, nextPrefix)
          : [];

      return [nextPrefix, ...nested];
    });
  }

  if (pattern.type === "AssignmentPattern") {
    return extractPatternPropertyPaths(pattern.left, prefix);
  }

  if (pattern.type === "ArrayPattern") {
    return prefix ? [prefix] : [];
  }

  return [];
}

function collectPatternAliases(pattern, prefix = "") {
  if (!pattern) {
    return [];
  }

  if (pattern.type === "Identifier") {
    return prefix ? [{ localName: pattern.name, propertyPath: prefix }] : [];
  }

  if (pattern.type === "AssignmentPattern") {
    return collectPatternAliases(pattern.left, prefix);
  }

  if (pattern.type === "ObjectPattern") {
    return pattern.properties.flatMap((property) => {
      if (property.type === "RestElement") {
        return [];
      }

      const propertyName = getPropertyName(property.key);
      if (!propertyName) {
        return [];
      }

      const nextPrefix = prefix ? `${prefix}.${propertyName}` : propertyName;
      return collectPatternAliases(property.value, nextPrefix);
    });
  }

  return [];
}

function unwrapExpression(node) {
  if (!node) {
    return null;
  }

  if (node.type === "AwaitExpression") {
    return unwrapExpression(node.argument);
  }

  if (node.type === "ParenthesizedExpression") {
    return unwrapExpression(node.expression);
  }

  return node;
}

function getMemberExpressionPath(node, paramName, aliasMap = new Map()) {
  const parts = [];
  let current = node;

  while (current && (current.type === "MemberExpression" || current.type === "OptionalMemberExpression")) {
    const segment = getMemberPathSegment(current);
    if (!segment) {
      return null;
    }
    parts.unshift(segment);
    current = current.object;
  }

  if (!current || current.type !== "Identifier" || parts.length === 0) {
    return null;
  }

  let prefix = null;
  if (aliasMap.has(current.name)) {
    prefix = aliasMap.get(current.name);
  } else if (current.name === paramName) {
    prefix = "";
  }

  if (prefix === null) {
    return null;
  }

  return joinPropertyPathSegments([prefix, ...parts].filter(Boolean));
}

function resolveAliasSource(node, paramName, aliasMap) {
  const current = unwrapExpression(node);
  if (!current) {
    return null;
  }

  if (current.type === "Identifier") {
    if (aliasMap.has(current.name)) {
      return aliasMap.get(current.name);
    }

    return current.name === paramName ? "" : null;
  }

  if (current.type === "MemberExpression" || current.type === "OptionalMemberExpression") {
    return getMemberExpressionPath(current, paramName, aliasMap);
  }

  if (current.type === "LogicalExpression") {
    return resolveAliasSource(current.left, paramName, aliasMap) ?? resolveAliasSource(current.right, paramName, aliasMap);
  }

  if (current.type === "ConditionalExpression") {
    return (
      resolveAliasSource(current.consequent, paramName, aliasMap) ??
      resolveAliasSource(current.alternate, paramName, aliasMap)
    );
  }

  if (current.type === "SequenceExpression") {
    for (let index = current.expressions.length - 1; index >= 0; index -= 1) {
      const resolved = resolveAliasSource(current.expressions[index], paramName, aliasMap);
      if (resolved !== null) {
        return resolved;
      }
    }
  }

  return null;
}

function isMethodCallMember(memberPath) {
  const parentNode = memberPath.parentPath?.node;
  return Boolean(
    parentNode &&
      parentNode.type === "CallExpression" &&
      parentNode.callee === memberPath.node &&
      IGNORED_CALLEE_PROPERTIES.has(getPropertyName(memberPath.node.property)),
  );
}

function collectCallbackPropertyPaths(callbackPath, callbackParam) {
  const callbackParamInfo = getParamInfo(callbackParam, 0);
  return collectIdentifierPropertyDetails(callbackPath, callbackParam, callbackParamInfo.name).propertyPaths;
}

function addPropertyTypeHint(propertyTypeHints, propertyPath, typeHint) {
  if (!propertyPath || !typeHint) {
    return;
  }

  if (!propertyTypeHints.has(propertyPath)) {
    propertyTypeHints.set(propertyPath, new Set());
  }

  propertyTypeHints.get(propertyPath).add(typeHint);
}

function isSyntheticPropertySegment(segment) {
  if (!segment || segment === "[]" || segment === "length" || segment === "size") {
    return false;
  }

  return IGNORED_CALLEE_PROPERTIES.has(segment) ||
    ARRAY_METHODS.has(segment) ||
    DATE_METHODS.has(segment) ||
    STRING_METHODS.has(segment) ||
    FUNCTION_PROPERTY_NAMES.has(segment);
}

function shouldIgnorePropertyPath(propertyPath) {
  if (!propertyPath) {
    return true;
  }

  const segments = splitPropertyPath(propertyPath);

  if (segments.length === 0) {
    return true;
  }

  if (segments.some((segment, index) => segment === "[]" && segments[index + 1] === "[]")) {
    return true;
  }

  return isSyntheticPropertySegment(segments[segments.length - 1]);
}

function inferMemberUsageTypeHints(memberPath) {
  const hints = new Set();
  const propertyName = getMemberPathSegment(memberPath.node);

  if (propertyName === "[]") {
    addTypeHint(hints, "Object");
    return hints;
  }

  if (propertyName === "length" || propertyName === "size") {
    addTypeHint(hints, "number");
  }

  if (memberPath.parentPath?.isCallExpression() && memberPath.parentPath.node.callee === memberPath.node) {
    addTypeHint(hints, "Function");
  }

  if (memberPath.parentPath?.isCallExpression()) {
    const argumentPaths = memberPath.parentPath.get("arguments");
    const argumentIndex = argumentPaths.findIndex((argumentPath) => argumentPath.node === memberPath.node);
    addTypeHint(hints, inferArgumentContextType(memberPath.parentPath, argumentIndex));
  }

  if (
    memberPath.parentPath &&
    (memberPath.parentPath.isMemberExpression() || memberPath.parentPath.isOptionalMemberExpression()) &&
    memberPath.parentPath.node.object === memberPath.node
  ) {
    const childSegment = getMemberPathSegment(memberPath.parentPath.node);
    if (childSegment === "[]") {
      const propertyNode = memberPath.parentPath.node.property;
      if (propertyNode?.type === "NumericLiteral") {
        addTypeHint(hints, "Array");
      } else if (propertyNode?.type === "Identifier" && /^(i|idx|index|position|offset|slot)$/i.test(propertyNode.name)) {
        addTypeHint(hints, "Array");
      } else {
        addTypeHint(hints, "Object");
      }
    } else if (ARRAY_METHODS.has(childSegment)) {
      addTypeHint(hints, "Array");
    } else if (DATE_METHODS.has(childSegment)) {
      addTypeHint(hints, "Date");
    } else if (STRING_METHODS.has(childSegment)) {
      addTypeHint(hints, "string");
    } else if (childSegment === "length" || childSegment === "size") {
      addTypeHint(hints, inferPropertyNameBasedType(propertyName));
    } else {
      addTypeHint(hints, "Object");
    }
  }

  if (memberPath.parentPath?.isUnaryExpression({ operator: "typeof" })) {
    const binaryPath = memberPath.parentPath.parentPath;
    if (binaryPath?.isBinaryExpression()) {
      const otherNode =
        binaryPath.node.left === memberPath.parentPath.node ? binaryPath.node.right : binaryPath.node.left;
      const otherType = getLiteralTypeHint(otherNode);
      addTypeHint(hints, otherType === "string" && otherNode.type === "StringLiteral" ? otherNode.value : otherType);
    }
  }

  if (memberPath.parentPath?.isBinaryExpression()) {
    const operator = memberPath.parentPath.node.operator;
    if (["==", "===", "!=", "!=="].includes(operator)) {
      const otherNode =
        memberPath.parentPath.node.left === memberPath.node
          ? memberPath.parentPath.node.right
          : memberPath.parentPath.node.left;
      addTypeHint(hints, getLiteralTypeHint(otherNode));
    } else if (operator === "+") {
      const otherNode =
        memberPath.parentPath.node.left === memberPath.node
          ? memberPath.parentPath.node.right
          : memberPath.parentPath.node.left;
      addTypeHint(hints, getLiteralTypeHint(otherNode) === "string" ? "string" : "number");
    } else {
      addTypeHint(hints, "number");
    }
  }

  if (memberPath.parentPath?.isLogicalExpression()) {
    const otherNode =
      memberPath.parentPath.node.left === memberPath.node
        ? memberPath.parentPath.node.right
        : memberPath.parentPath.node.left;
    mergeTypeHints(hints, inferExpressionTypeHints(otherNode, memberPath.parentPath, new Set()));
  }

  addTypeHint(hints, inferPropertyNameBasedType(propertyName));
  return hints;
}

function collectIdentifierPropertyDetails(pathRef, param, paramName) {
  const propertyPaths = new Set();
  const propertyTypeHints = new Map();
  const aliasMap = new Map();
  const initialParam = param?.type === "AssignmentPattern" ? param.left : param;
  const traversalPath = getFunctionTraversalPath(pathRef);

  if (initialParam?.type === "Identifier") {
    aliasMap.set(initialParam.name, "");
  }

  if (initialParam?.type === "ObjectPattern") {
    extractPatternPropertyPaths(initialParam).forEach((propertyPath) => {
      propertyPaths.add(propertyPath);
    });

    collectPatternAliases(initialParam).forEach((alias) => {
      aliasMap.set(alias.localName, alias.propertyPath);
    });
  }

  traversalPath.traverse({
    MemberExpression(memberPath) {
      if (isMethodCallMember(memberPath)) {
        return;
      }

      const propertyPath = getMemberExpressionPath(memberPath.node, paramName, aliasMap);
      if (propertyPath && !shouldIgnorePropertyPath(propertyPath)) {
        propertyPaths.add(propertyPath);
        inferMemberUsageTypeHints(memberPath).forEach((typeHint) => {
          addPropertyTypeHint(propertyTypeHints, propertyPath, typeHint);
        });
      }
    },
    OptionalMemberExpression(memberPath) {
      if (isMethodCallMember(memberPath)) {
        return;
      }

      const propertyPath = getMemberExpressionPath(memberPath.node, paramName, aliasMap);
      if (propertyPath && !shouldIgnorePropertyPath(propertyPath)) {
        propertyPaths.add(propertyPath);
        inferMemberUsageTypeHints(memberPath).forEach((typeHint) => {
          addPropertyTypeHint(propertyTypeHints, propertyPath, typeHint);
        });
      }
    },
    Identifier(identifierPath) {
      if (!identifierPath.isReferencedIdentifier()) {
        return;
      }

      if (!aliasMap.has(identifierPath.node.name)) {
        return;
      }

      const propertyPath = aliasMap.get(identifierPath.node.name);
      if (!propertyPath || shouldIgnorePropertyPath(propertyPath)) {
        return;
      }

      propertyPaths.add(propertyPath);
      inferReferencePathTypeHints(identifierPath).forEach((typeHint) => {
        addPropertyTypeHint(propertyTypeHints, propertyPath, typeHint);
      });
    },
    VariableDeclarator(variablePath) {
      const sourcePath = resolveAliasSource(variablePath.node.init, paramName, aliasMap);
      if (sourcePath === null) {
        return;
      }

      if (variablePath.node.id?.type === "Identifier") {
        aliasMap.set(variablePath.node.id.name, sourcePath);
        return;
      }

      if (variablePath.node.id?.type === "ObjectPattern") {
        extractPatternPropertyPaths(variablePath.node.id, sourcePath).forEach((propertyPath) => {
          if (!shouldIgnorePropertyPath(propertyPath)) {
            propertyPaths.add(propertyPath);
          }
        });

        collectPatternAliases(variablePath.node.id, sourcePath).forEach((alias) => {
          aliasMap.set(alias.localName, alias.propertyPath);
        });
      }
    },
    CallExpression(callPath) {
      if (
        callPath.node.callee.type !== "MemberExpression" &&
        callPath.node.callee.type !== "OptionalMemberExpression"
      ) {
        return;
      }

      const methodPath = getMemberExpressionPath(callPath.node.callee, paramName, aliasMap);
      if (!methodPath) {
        return;
      }

      const methodName = methodPath.split(".").pop();
      if (!ARRAY_CALLBACK_METHODS.has(methodName)) {
        return;
      }

      const callbackPath = callPath
        .get("arguments")
        .find((argumentPath) => argumentPath.isArrowFunctionExpression() || argumentPath.isFunctionExpression());
      if (!callbackPath || callbackPath.node.params.length === 0) {
        return;
      }

      const basePath = methodPath.slice(0, -(`.${methodName}`.length));
      collectCallbackPropertyPaths(callbackPath, callbackPath.node.params[0]).forEach((propertyPath) => {
        if (!propertyPath) {
          return;
        }

        const itemPropertyPath = basePath ? `${basePath}[].${propertyPath}` : `[].${propertyPath}`;
        if (!shouldIgnorePropertyPath(itemPropertyPath)) {
          propertyPaths.add(itemPropertyPath);
        }
      });
    },
  });

  return {
    propertyPaths: [...propertyPaths].sort(),
    propertyTypeHints,
  };
}

function joinQuotedList(values) {
  const quotedValues = values.map((value) => `\`${value}\``);

  if (quotedValues.length === 0) {
    return "";
  }

  if (quotedValues.length === 1) {
    return quotedValues[0];
  }

  if (quotedValues.length === 2) {
    return `${quotedValues[0]} and ${quotedValues[1]}`;
  }

  return `${quotedValues.slice(0, -1).join(", ")}, and ${quotedValues[quotedValues.length - 1]}`;
}

function unique(values) {
  return [...new Set(values)];
}

function addTypeHint(hints, typeHint) {
  if (!typeHint) {
    return;
  }

  hints.add(typeHint);
}

function mergeTypeHints(target, source) {
  source.forEach((typeHint) => {
    addTypeHint(target, typeHint);
  });
}

function sortTypeHints(typeHints) {
  const order = new Map([
    ["string", 1],
    ["number", 2],
    ["boolean", 3],
    ["bigint", 4],
    ["symbol", 5],
    ["Function", 6],
    ["Array", 7],
    ["Object", 8],
    ["Buffer", 9],
    ["ArrayBuffer", 10],
    ["Uint8Array", 11],
    ["Error", 12],
    ["Map", 13],
    ["Set", 14],
    ["React.ReactNode", 15],
    ["Promise<*>", 16],
    ["null", 17],
    ["undefined", 18],
    ["*", 99],
  ]);

  return [...typeHints].sort((left, right) => {
    return (order.get(left) ?? 50) - (order.get(right) ?? 50) || left.localeCompare(right);
  });
}

function formatTypeHints(typeHints, fallback = "*") {
  const normalizedHints = new Set(typeHints);
  if (normalizedHints.has("Array")) {
    normalizedHints.delete("Object");
  }
  if (normalizedHints.has("Function")) {
    normalizedHints.delete("Object");
  }
  if (normalizedHints.has("Buffer")) {
    normalizedHints.delete("Object");
  }
  if (normalizedHints.has("Uint8Array")) {
    normalizedHints.delete("Object");
  }
  if (normalizedHints.has("Map")) {
    normalizedHints.delete("Object");
  }
  if (normalizedHints.has("Set")) {
    normalizedHints.delete("Object");
  }

  const filteredHints = sortTypeHints(normalizedHints).filter((typeHint) => typeHint && typeHint !== "*");

  if (filteredHints.length === 0) {
    return fallback;
  }

  if (filteredHints.length === 1) {
    return filteredHints[0];
  }

  return `(${filteredHints.join("|")})`;
}

function unwrapPromiseType(typeName) {
  const promiseMatch = String(typeName || "").match(/^Promise<(.+)>$/);
  return promiseMatch ? promiseMatch[1] : typeName;
}

function normalizeNameKey(name) {
  return String(name || "").replace(/[^A-Za-z0-9]/g, "").toLowerCase();
}

function inferNameBasedType(name) {
  const key = normalizeNameKey(name);

  if (!key) {
    return null;
  }

  if (
    FUNCTION_NAME_PARTS.has(key) ||
    /^on[A-Z_]/.test(name || "") ||
    /(callback|handler|listener|predicate|cleanup|resolver|rejecter|rerender|search|speak|logger)$/i.test(name || "") ||
    /(send|close)raw$/i.test(name || "")
  ) {
    return "Function";
  }

  if (/children$/i.test(name || "")) {
    return "React.ReactNode";
  }

  if (/^(is|has|can|should)[A-Z_]/.test(name || "") || BOOLEAN_NAME_PARTS.has(key)) {
    return "boolean";
  }

  if (
    /(createdat|updatedat|scheduledstartat|scheduledfor|startat|graceclosesat|lastmatchat|happenedat|sentat|startedat|completedat|joinedat)$/i.test(name || "") ||
    /^(date|startdate|enddate)$/i.test(name || "")
  ) {
    return "Date";
  }

  if (NUMBER_NAME_PARTS.has(key) || /(count|index|score|rating|elo|points|number|port|timeout|length|size|page|min|max)$/i.test(name || "")) {
    return "number";
  }

  if (/(pid|duelptr|handle|pduel)$/i.test(name || "")) {
    return "number";
  }

  if (/^heapu\d+$/i.test(key)) {
    return "Uint8Array";
  }

  if (/(buffer|replay)$/i.test(name || "")) {
    return "Buffer";
  }

  if (ARRAY_NAME_PARTS.has(key) || /(list|items|entries|results|cards|clients|decks|players|zones|messages)$/i.test(name || "")) {
    return "Array";
  }

  if (
    /(extra|main|side|friends|incomingfriendrequests|outgoingfriendrequests|reminderoffsets|roundsoverview|supportedformats)$/i.test(key)
  ) {
    return "Array";
  }

  if (OBJECT_NAME_PARTS.has(key) || /state(s)?$/i.test(name || "")) {
    return "Object";
  }

  if (/(settings|roomrules|metadata|payload|meta|gameconfig|duelrolemap|roomconfiguration)$/i.test(key)) {
    return "Object";
  }

  if (
    STRING_NAME_PARTS.has(key) ||
    /(url|slug|email|token|password|username|path|query|label|title|name|message|mode|type|code|session|room|owner)$/i.test(name || "") ||
    /(status|classification|subject|excerpt|transport|method|traceid|messageid|matchid|userid|leagueid|tournamentid|owneruserid|winner|round|visibility|timezone)$/i.test(key)
  ) {
    return "string";
  }

  return null;
}

function inferPropertyNameBasedType(name) {
  const key = normalizeNameKey(name);

  if (!key) {
    return null;
  }

  if (key === "length" || key === "size") {
    return "number";
  }

  if (key === "registrationstate") {
    return "string";
  }

  if (
    /(cards?\d*|targets?|players|users|decks|pairings|entries|results|zones)$/i.test(name || "") ||
    (/(options|values)$/i.test(name || "") && !/^(options|values)$/i.test(name || ""))
  ) {
    return "Array";
  }

  if (/^heapu\d+$/i.test(key)) {
    return "Uint8Array";
  }

  return inferNameBasedType(name);
}

function collectPromiseResolveTypeHints(node, scopePath, seenBindings = new Set()) {
  const hints = new Set();
  const executor = node?.arguments?.[0];

  if (
    !executor ||
    (executor.type !== "ArrowFunctionExpression" && executor.type !== "FunctionExpression") ||
    executor.params.length === 0 ||
    executor.params[0].type !== "Identifier"
  ) {
    return hints;
  }

  const resolveName = executor.params[0].name;

  function walk(currentNode) {
    if (!currentNode || typeof currentNode !== "object") {
      return;
    }

    if (Array.isArray(currentNode)) {
      currentNode.forEach((childNode) => walk(childNode));
      return;
    }

    if (
      currentNode.type === "CallExpression" &&
      currentNode.callee?.type === "Identifier" &&
      currentNode.callee.name === resolveName &&
      currentNode.arguments.length > 0
    ) {
      mergeTypeHints(hints, inferExpressionTypeHints(currentNode.arguments[0], scopePath, seenBindings));
    }

    Object.keys(currentNode).forEach((key) => {
      if (key === "loc" || key === "start" || key === "end") {
        return;
      }

      walk(currentNode[key]);
    });
  }

  walk(executor.body);

  return hints;
}

function getLiteralTypeHint(node) {
  if (!node) {
    return null;
  }

  switch (node.type) {
    case "StringLiteral":
      return "string";
    case "NumericLiteral":
      return "number";
    case "BooleanLiteral":
      return "boolean";
    case "BigIntLiteral":
      return "bigint";
    case "NullLiteral":
      return "null";
    case "RegExpLiteral":
      return "RegExp";
    default:
      return null;
  }
}

function inferCallExpressionTypeHints(node, scopePath, seenBindings) {
  const hints = new Set();

  if (!node || node.type !== "CallExpression") {
    return hints;
  }

  const callee = node.callee;

  if (callee.type === "Identifier") {
    switch (callee.name) {
      case "Boolean":
        addTypeHint(hints, "boolean");
        return hints;
      case "Number":
      case "parseInt":
      case "parseFloat":
      case "setTimeout":
        addTypeHint(hints, "number");
        return hints;
      case "String":
      case "encodeURIComponent":
      case "decodeURIComponent":
        addTypeHint(hints, "string");
        return hints;
      default:
        break;
    }
  }

  if (callee.type === "MemberExpression" || callee.type === "OptionalMemberExpression") {
    const objectName = callee.object.type === "Identifier" ? callee.object.name : null;
    const propertyName = getPropertyName(callee.property);

    if (objectName === "Math") {
      addTypeHint(hints, "number");
      return hints;
    }

    if (objectName === "JSON" && propertyName === "stringify") {
      addTypeHint(hints, "string");
      return hints;
    }

    if (objectName === "Array" && propertyName === "isArray") {
      addTypeHint(hints, "boolean");
      return hints;
    }

    if (objectName === "Object" && ["keys", "values", "entries"].includes(propertyName)) {
      addTypeHint(hints, "Array");
      return hints;
    }

    if (objectName === "Buffer" && propertyName === "from") {
      addTypeHint(hints, "Buffer");
      return hints;
    }

    if (objectName === "Promise") {
      addTypeHint(hints, "Promise<*>");
      return hints;
    }

    if (objectName === "net" && propertyName === "createServer") {
      addTypeHint(hints, "net.Server");
      return hints;
    }

    if (objectName === "JSON" && propertyName === "parse") {
      addTypeHint(hints, "Object");
      return hints;
    }

    if (propertyName === "json") {
      addTypeHint(hints, "Promise<Object>");
      return hints;
    }

    if (propertyName === "toString" || propertyName === "join") {
      addTypeHint(hints, "string");
      return hints;
    }

    if (STRING_METHODS.has(propertyName)) {
      addTypeHint(hints, "string");
      return hints;
    }

    if (ARRAY_METHODS.has(propertyName)) {
      addTypeHint(hints, propertyName === "join" ? "string" : "Array");
      return hints;
    }
  }

  return hints;
}

function inferExpressionTypeHints(node, scopePath, seenBindings = new Set()) {
  const hints = new Set();
  const current = unwrapExpression(node);

  if (!current) {
    addTypeHint(hints, "undefined");
    return hints;
  }

  addTypeHint(hints, getLiteralTypeHint(current));
  if (hints.size > 0) {
    return hints;
  }

  switch (current.type) {
    case "TemplateLiteral":
      addTypeHint(hints, "string");
      break;
    case "ObjectExpression":
      addTypeHint(hints, "Object");
      break;
    case "ArrayExpression":
      addTypeHint(hints, "Array");
      break;
    case "ArrowFunctionExpression":
    case "FunctionExpression":
      addTypeHint(hints, "Function");
      break;
    case "JSXElement":
    case "JSXFragment":
      addTypeHint(hints, "React.ReactNode");
      break;
    case "AwaitExpression": {
      const awaitedHints = inferExpressionTypeHints(current.argument, scopePath, seenBindings);
      awaitedHints.forEach((typeHint) => {
        addTypeHint(hints, unwrapPromiseType(typeHint));
      });
      break;
    }
    case "Identifier": {
      const binding = scopePath?.scope?.getBinding(current.name);
      if (binding && !seenBindings.has(binding)) {
        seenBindings.add(binding);
        if (binding.path.isVariableDeclarator() && binding.path.node.init) {
          mergeTypeHints(hints, inferExpressionTypeHints(binding.path.node.init, binding.path, seenBindings));
        }
      }
      addTypeHint(hints, inferNameBasedType(current.name));
      break;
    }
    case "UnaryExpression":
      if (current.operator === "!") {
        addTypeHint(hints, "boolean");
      } else if (current.operator === "typeof") {
        addTypeHint(hints, "string");
      } else {
        addTypeHint(hints, "number");
      }
      break;
    case "BinaryExpression":
      if (["==", "===", "!=", "!==", ">", ">=", "<", "<="].includes(current.operator)) {
        addTypeHint(hints, "boolean");
        break;
      }
      if (current.operator === "+") {
        const leftHints = inferExpressionTypeHints(current.left, scopePath, seenBindings);
        const rightHints = inferExpressionTypeHints(current.right, scopePath, seenBindings);
        if (leftHints.has("string") || rightHints.has("string")) {
          addTypeHint(hints, "string");
        } else {
          addTypeHint(hints, "number");
        }
        break;
      }
      addTypeHint(hints, "number");
      break;
    case "LogicalExpression":
    case "ConditionalExpression":
      mergeTypeHints(hints, inferExpressionTypeHints(current.left || current.consequent, scopePath, seenBindings));
      mergeTypeHints(hints, inferExpressionTypeHints(current.right || current.alternate, scopePath, seenBindings));
      break;
    case "NewExpression":
      if (current.callee.type === "Identifier") {
        if (current.callee.name === "Promise") {
          const promiseTypeHints = collectPromiseResolveTypeHints(current, scopePath, seenBindings);
          addTypeHint(hints, `Promise<${formatTypeHints(promiseTypeHints, "*")}>`);
        } else {
          addTypeHint(hints, current.callee.name);
        }
      } else {
        addTypeHint(hints, "Object");
      }
      break;
    case "CallExpression":
      mergeTypeHints(hints, inferCallExpressionTypeHints(current, scopePath, seenBindings));
      break;
    case "MemberExpression":
    case "OptionalMemberExpression": {
      const propertyName = getMemberPathSegment(current);
      if (propertyName === "[]") {
        if (current.object.type === "Identifier") {
          const binding = scopePath?.scope?.getBinding(current.object.name);
          if (binding?.path?.isVariableDeclarator() && binding.path.node.init?.type === "ObjectExpression") {
            binding.path.node.init.properties.forEach((property) => {
              if (property.type === "ObjectProperty") {
                mergeTypeHints(hints, inferExpressionTypeHints(property.value, binding.path, seenBindings));
              }
            });
            break;
          }
        }

        if (current.property?.type === "NumericLiteral") {
          addTypeHint(hints, "Array");
        } else if (current.property?.type === "Identifier" && /^(i|idx|index|position|offset|slot)$/i.test(current.property.name)) {
          addTypeHint(hints, "Array");
        } else {
          addTypeHint(hints, "Object");
        }
      } else {
        addTypeHint(hints, inferPropertyNameBasedType(propertyName));
      }
      break;
    }
    default:
      break;
  }

  return hints;
}

function inferArgumentContextType(callPath, argumentIndex) {
  const calleeNode = callPath.node.callee;

  if (calleeNode.type === "Identifier") {
    switch (calleeNode.name) {
      case "setTimeout":
        return argumentIndex === 0 ? "Function" : argumentIndex === 1 ? "number" : null;
      case "fetch":
      case "request":
        return argumentIndex === 0 ? "string" : argumentIndex === 1 ? "Object" : null;
      case "zxcvbn":
      case "encodeURIComponent":
      case "decodeURIComponent":
        return "string";
      case "Number":
      case "parseInt":
      case "parseFloat":
        return "number";
      case "String":
        return "string";
      default:
        return null;
    }
  }

  if (calleeNode.type !== "MemberExpression" && calleeNode.type !== "OptionalMemberExpression") {
    return null;
  }

  const objectName = calleeNode.object.type === "Identifier" ? calleeNode.object.name : null;
  const propertyName = getPropertyName(calleeNode.property);

  if (objectName === "Array" && propertyName === "isArray") {
    return "Array";
  }

  if (objectName === "Object" && ["assign", "freeze", "keys", "values", "entries"].includes(propertyName)) {
    return propertyName === "assign" || propertyName === "freeze" ? "Object" : "Array";
  }

  if (objectName === "JSON" && propertyName === "parse") {
    return argumentIndex === 0 ? "string" : null;
  }

  if (objectName === "Buffer" && propertyName === "from") {
    return argumentIndex === 0
      ? callPath.node.arguments[1]?.type === "StringLiteral"
        ? "string"
        : "Buffer"
      : null;
  }

  if (objectName === "path" && ["join", "resolve", "extname"].includes(propertyName)) {
    return "string";
  }

  if (propertyName === "status") {
    return argumentIndex === 0 ? "number" : null;
  }

  if (propertyName === "send" || propertyName === "json" || propertyName === "write") {
    return argumentIndex === 0 ? "Object" : null;
  }

  return null;
}

function inferReferencePathTypeHints(referencePath) {
  const hints = new Set();
  const parentPath = referencePath.parentPath;

  if (!parentPath) {
    return hints;
  }

  if (parentPath.isAwaitExpression()) {
    addTypeHint(hints, "Promise<*>");
    return hints;
  }

  if (parentPath.isCallExpression()) {
    if (parentPath.get("callee") === referencePath) {
      addTypeHint(hints, "Function");
      return hints;
    }

    const argumentPaths = parentPath.get("arguments");
    const argumentIndex = argumentPaths.findIndex((argumentPath) => argumentPath === referencePath);
    addTypeHint(hints, inferArgumentContextType(parentPath, argumentIndex));
    return hints;
  }

  if (parentPath.isUnaryExpression({ operator: "typeof" })) {
    const binaryPath = parentPath.parentPath;
    if (binaryPath?.isBinaryExpression()) {
      const otherNode = binaryPath.node.left === parentPath.node ? binaryPath.node.right : binaryPath.node.left;
      if (otherNode.type === "StringLiteral") {
        addTypeHint(hints, otherNode.value === "function" ? "Function" : otherNode.value);
      }
    }
    return hints;
  }

  if (parentPath.isMemberExpression() || parentPath.isOptionalMemberExpression()) {
    if (parentPath.node.object !== referencePath.node) {
      return hints;
    }

    const segment = getMemberPathSegment(parentPath.node);
    if (segment === "[]") {
      const propertyNode = parentPath.node.property;
      if (propertyNode?.type === "NumericLiteral") {
        addTypeHint(hints, "Array");
      } else if (propertyNode?.type === "Identifier" && /^(i|idx|index|position|offset|slot)$/i.test(propertyNode.name)) {
        addTypeHint(hints, "Array");
      } else {
        addTypeHint(hints, "Object");
      }
      return hints;
    }

    if (segment === "length" || segment === "size") {
      return hints;
    }

    if (ARRAY_METHODS.has(segment)) {
      addTypeHint(hints, "Array");
      return hints;
    }

    if (STRING_METHODS.has(segment)) {
      addTypeHint(hints, "string");
      return hints;
    }

    if (segment === "then" || segment === "catch" || segment === "finally") {
      addTypeHint(hints, "Promise<*>");
      return hints;
    }

    addTypeHint(hints, "Object");
    return hints;
  }

  if (parentPath.isBinaryExpression()) {
    const operator = parentPath.node.operator;
    if (["==", "===", "!=", "!=="].includes(operator)) {
      const otherNode = parentPath.node.left === referencePath.node ? parentPath.node.right : parentPath.node.left;
      addTypeHint(hints, getLiteralTypeHint(otherNode));
      return hints;
    }

    if (operator === "+") {
      const otherNode = parentPath.node.left === referencePath.node ? parentPath.node.right : parentPath.node.left;
      if (getLiteralTypeHint(otherNode) === "string") {
        addTypeHint(hints, "string");
        return hints;
      }
    }

    addTypeHint(hints, "number");
    return hints;
  }

  if (parentPath.isLogicalExpression()) {
    const otherNode = parentPath.node.left === referencePath.node ? parentPath.node.right : parentPath.node.left;
    mergeTypeHints(hints, inferExpressionTypeHints(otherNode, parentPath, new Set()));
    return hints;
  }

  return hints;
}

function collectReferenceTypeHints(pathRef, paramName) {
  const hints = new Set();
  const traversalPath = getFunctionTraversalPath(pathRef);
  const binding = traversalPath.scope.getBinding(paramName);

  if (!binding) {
    return hints;
  }

  binding.referencePaths.forEach((referencePath) => {
    mergeTypeHints(hints, inferReferencePathTypeHints(referencePath));
  });

  return hints;
}

function collectReturnTypeHints(pathRef) {
  const hints = new Set();
  const traversalPath = getFunctionTraversalPath(pathRef);
  const functionNode = getFunctionNode(pathRef);

  if (!functionNode) {
    return hints;
  }

  if (functionNode.type === "ArrowFunctionExpression" && functionNode.body.type !== "BlockStatement") {
    mergeTypeHints(hints, inferExpressionTypeHints(functionNode.body, traversalPath));
    return hints;
  }

  traversalPath.traverse({
    Function(innerPath) {
      if (innerPath !== traversalPath) {
        innerPath.skip();
      }
    },
    ReturnStatement(returnPath) {
      if (!returnPath.node.argument) {
        addTypeHint(hints, "undefined");
        return;
      }

      mergeTypeHints(hints, inferExpressionTypeHints(returnPath.node.argument, returnPath));
    },
  });

  return hints;
}

function inferFunctionNameReturnType(functionName) {
  const verbAndObject = splitVerbAndObject(functionName);
  if (!verbAndObject) {
    return null;
  }

  const objectName = verbAndObject.object.toLowerCase();
  const collectionLike = /(backgrounds|cards|clients|covers|decks|entries|entrants|messages|pairings|players|results|standings|users|zones)$/.test(objectName);

  if (collectionLike) {
    return "Array";
  }

  if (/(id|label|path|slug|token|url)$/.test(objectName)) {
    return "string";
  }

  if (/(score|rating|count|number|port|index|size|length)$/.test(objectName)) {
    return "number";
  }

  return null;
}

function getTopLevelPropertyNames(propertyPaths) {
  return unique(
    propertyPaths
      .filter((propertyPath) => propertyPath && !propertyPath.startsWith("[]"))
      .map((propertyPath) => propertyPath.split(".")[0]),
  );
}

function getArrayItemPropertyNames(propertyPaths) {
  return unique(
    propertyPaths
      .filter((propertyPath) => propertyPath.startsWith("[]."))
      .map((propertyPath) => propertyPath.slice(3).split(".")[0])
      .filter(Boolean),
  );
}

function describeParamScope(paramName, lowerContext, propertyPaths, kind) {
  const topLevelProperties = getTopLevelPropertyNames(propertyPaths);
  const itemProperties = getArrayItemPropertyNames(propertyPaths);

  if (kind === "request") {
    let description = `The ${paramName} request object provides the incoming data used by the ${lowerContext} route.`;
    if (topLevelProperties.length > 0) {
      description = `The ${paramName} request object provides the incoming data used by the ${lowerContext} route, including the ${joinQuotedList(topLevelProperties)} ${topLevelProperties.length === 1 ? "property" : "properties"}.`;
    }
    return description;
  }

  if (kind === "response") {
    let description = `The ${paramName} response object provides the outgoing channel used by the ${lowerContext} route.`;
    if (topLevelProperties.length > 0) {
      description = `The ${paramName} response object provides the outgoing channel used by the ${lowerContext} route, including the ${joinQuotedList(topLevelProperties)} ${topLevelProperties.length === 1 ? "property" : "properties"}.`;
    }
    return description;
  }

  if (kind === "event") {
    let description = `The ${paramName} event object provides the browser event data used by the ${lowerContext} module.`;
    if (topLevelProperties.length > 0) {
      description = `The ${paramName} event object provides the browser event data used by the ${lowerContext} module, including the ${joinQuotedList(topLevelProperties)} ${topLevelProperties.length === 1 ? "property" : "properties"}.`;
    }
    return description;
  }

  if (kind === "array") {
    const clauses = [];
    if (topLevelProperties.length > 0) {
      clauses.push(`including the ${joinQuotedList(topLevelProperties)} ${topLevelProperties.length === 1 ? "property" : "properties"}`);
    }
    if (itemProperties.length > 0) {
      clauses.push(`each item uses the ${joinQuotedList(itemProperties)} ${itemProperties.length === 1 ? "property" : "properties"}`);
    }

    if (clauses.length > 0) {
      return `The ${paramName} array supplies the ordered values used by the ${lowerContext} module, ${clauses.join(", and ")}.`;
    }

    return `The ${paramName} array supplies the ordered values used by the ${lowerContext} module.`;
  }

  if (propertyPaths.length > 0) {
    return `The ${paramName} object supplies the structured input used by the ${lowerContext} module, including the ${joinQuotedList(topLevelProperties)} ${topLevelProperties.length === 1 ? "property" : "properties"}.`;
  }

  return `The ${paramName} object supplies the structured input used by the ${lowerContext} module.`;
}

function describePropertyPath(propertyPath, lowerContext) {
  if (propertyPath.startsWith("[].")) {
    return `The \`${propertyPath}\` property describes data read from each item used by the ${lowerContext} module.`;
  }

  return `The \`${propertyPath}\` property supplies structured input used by the ${lowerContext} module.`;
}

function splitPropertyPath(propertyPath) {
  return String(propertyPath || "")
    .replace(/\[\]/g, ".[].")
    .split(".")
    .filter(Boolean);
}

function isPrimitiveResolvedType(typeName) {
  if (!typeName || typeName === "*") {
    return false;
  }

  const normalized = String(typeName).replace(/[()]/g, "");
  const members = normalized.split("|").map((member) => member.trim()).filter(Boolean);

  return members.length > 0 && members.every((member) => {
    return !["Object", "Array", "Map", "Set", "Promise<*>", "Promise<Object>", "Promise<Array>"].includes(member);
  });
}

function isAllowedPrimitiveChild(typeName, childSegment) {
  if (!childSegment) {
    return false;
  }

  if (childSegment === "length" || childSegment === "size") {
    return true;
  }

  if (String(typeName).includes("Function")) {
    return false;
  }

  if (String(typeName).includes("Uint8Array")) {
    return childSegment === "subarray";
  }

  if (String(typeName).includes("string")) {
    return STRING_METHODS.has(childSegment);
  }

  return false;
}

function prunePropertyPaths(propertyPaths, propertyTypes) {
  return propertyPaths.filter((propertyPath) => {
    const segments = splitPropertyPath(propertyPath);

    for (let index = 0; index < segments.length - 1; index += 1) {
      const ancestorPath = joinPropertyPathSegments(segments.slice(0, index + 1));
      const ancestorType = propertyTypes.get(ancestorPath);

      if (!isPrimitiveResolvedType(ancestorType)) {
        continue;
      }

      if (!isAllowedPrimitiveChild(ancestorType, segments[index + 1])) {
        return false;
      }
    }

    return true;
  });
}

function analyzeParam(param, index, pathRef, filePath) {
  const info = getParamInfo(param, index);
  const lowerContext = getFileContext(filePath).toLowerCase();
  const paramName = info.name;
  const paramNode = param?.type === "AssignmentPattern" ? param.left : param;
  const requestParam = /^(request|req)$/i.test(paramName);
  const responseParam = /^(response|res)$/i.test(paramName);
  const eventParam = /^event$/i.test(paramName);

  if (paramNode?.type === "ArrayPattern" || info.type === "Array") {
    return {
      type: "Array",
      name: paramName,
      description: `The ${paramName} array supplies the ordered values used by the ${lowerContext} module.`,
      propertyPaths: [],
      propertyTypes: new Map(),
    };
  }

  if (param.type === "RestElement" || info.type.startsWith("...")) {
    return {
      type: "...*",
      name: paramName,
      description: `The ${paramName} rest values collect the remaining inputs used by the ${lowerContext} module.`,
      propertyPaths: [],
      propertyTypes: new Map(),
    };
  }

  const propertyDetails = collectIdentifierPropertyDetails(pathRef, param, paramName);
  const propertyPaths = propertyDetails.propertyPaths;
  const topLevelProperties = getTopLevelPropertyNames(propertyPaths);
  const itemProperties = getArrayItemPropertyNames(propertyPaths);
  const directTypeHints = collectReferenceTypeHints(pathRef, paramName);
  const defaultValueHints =
    param?.type === "AssignmentPattern"
      ? inferExpressionTypeHints(param.right, getFunctionTraversalPath(pathRef))
      : new Set();
  const primitiveLikeOnly =
    propertyPaths.length > 0 &&
    itemProperties.length === 0 &&
    propertyPaths.every((propertyPath) => {
      return !propertyPath.includes(".") && PRIMITIVE_LIKE_PROPERTY_NAMES.has(propertyPath);
    });
  const propertyTypes = new Map();

  propertyPaths.forEach((propertyPath) => {
    const lastSegment = propertyPath === "[]" ? "[]" : propertyPath.split(".").pop();
    const hints = new Set(propertyDetails.propertyTypeHints.get(propertyPath) || []);
    addTypeHint(hints, inferPropertyNameBasedType(lastSegment));
    propertyTypes.set(propertyPath, formatTypeHints(hints, "*"));
  });
  const prunedPropertyPaths = prunePropertyPaths(propertyPaths, propertyTypes);

  if (propertyPaths.length > 0) {
    const inferredHints = new Set();
    mergeTypeHints(inferredHints, defaultValueHints);
    mergeTypeHints(inferredHints, directTypeHints);

    const inferredType =
      paramNode?.type === "ObjectPattern" ||
      requestParam ||
      responseParam ||
      eventParam
        ? "Object"
        : propertyPaths.some((propertyPath) => propertyPath === "[]" || propertyPath.startsWith("[]."))
          ? "Array"
          : itemProperties.length > 0
          ? "Array"
          : primitiveLikeOnly
            ? formatTypeHints(inferredHints, inferNameBasedType(paramName) || info.type)
            : topLevelProperties.length > 0
              ? "Object"
            : formatTypeHints(inferredHints, inferNameBasedType(paramName) || "Object");
    const descriptionKind = requestParam
      ? "request"
      : responseParam
        ? "response"
        : eventParam
          ? "event"
          : inferredType === "Array"
            ? "array"
            : "object";

    return {
      type: inferredType,
      name: paramName,
      description: primitiveLikeOnly
        ? `The ${paramName} value provides an input used by the ${lowerContext} module.`
        : describeParamScope(paramName, lowerContext, propertyPaths, descriptionKind),
      propertyPaths: primitiveLikeOnly ? [] : prunedPropertyPaths,
      propertyTypes,
    };
  }

  if (requestParam) {
    return {
      type: "Object",
      name: paramName,
      description: `The ${paramName} request provides the incoming data used by the ${lowerContext} route.`,
      propertyPaths: [],
      propertyTypes: new Map(),
    };
  }

  if (responseParam) {
    return {
      type: "Object",
      name: paramName,
      description: `The ${paramName} response provides the outgoing channel used by the ${lowerContext} route.`,
      propertyPaths: [],
      propertyTypes: new Map(),
    };
  }

  if (eventParam) {
    return {
      type: "Object",
      name: paramName,
      description: `The ${paramName} event provides the browser event data used by the ${lowerContext} module.`,
      propertyPaths: [],
      propertyTypes: new Map(),
    };
  }

  const typeHints = new Set();
  mergeTypeHints(typeHints, defaultValueHints);
  mergeTypeHints(typeHints, directTypeHints);
  addTypeHint(typeHints, inferNameBasedType(paramName));

  return {
    type: formatTypeHints(typeHints, info.type),
    name: paramName,
    description: `The ${paramName} value provides an input used by the ${lowerContext} module.`,
    propertyPaths: [],
    propertyTypes: new Map(),
  };
}

function buildParamTagLines(pathRef, filePath) {
  const params = getFunctionNode(pathRef)?.params || [];
  const lowerContext = getFileContext(filePath).toLowerCase();
  const tagLines = [];

  params.forEach((param, index) => {
    const paramInfo = analyzeParam(param, index, pathRef, filePath);
    tagLines.push(`@param {${paramInfo.type}} ${paramInfo.name} ${paramInfo.description}`);

    paramInfo.propertyPaths.forEach((propertyPath) => {
      if (propertyPath === "[]") {
        return;
      }

      const paramPath = propertyPath.startsWith("[].")
        ? `${paramInfo.name}${propertyPath}`
        : `${paramInfo.name}.${propertyPath}`;
      const propertyType = paramInfo.propertyTypes?.get(propertyPath) || "*";
      tagLines.push(
        `@param {${propertyType}} ${paramPath} ${describePropertyPath(propertyPath, lowerContext)}`,
      );
    });
  });

  return tagLines;
}

function buildJsdoc(pathRef, filePath, descriptionOverride) {
  const description = descriptionOverride || generateDescription(pathRef, filePath);
  const lines = ["/**", ` * ${description}`];
  const paramLines = buildParamTagLines(pathRef, filePath);

  paramLines.forEach((line) => {
    lines.push(` * ${line}`);
  });

  const returnInfo = getReturnInfo(pathRef, filePath);
  lines.push(` * @returns {${returnInfo.type}} ${returnInfo.description}`);

  lines.push(" */");
  return lines.join("\n");
}

function parseJsdocValue(commentValue) {
  const lines = commentValue.split("\n").map((line) => {
    return line.replace(/^\s*\* ?/, "");
  });
  const tagStartIndex = lines.findIndex((line) => line.startsWith("@"));
  const descriptionLines = (tagStartIndex === -1 ? lines : lines.slice(0, tagStartIndex))
    .map((line) => line.trim())
    .filter(Boolean);
  const tagLines = tagStartIndex === -1 ? [] : lines.slice(tagStartIndex).filter((line) => line.trim().length > 0);
  return {
    description: descriptionLines.join(" ").trim(),
    tagLines,
  };
}

function hasFullDescription(commentValue) {
  const parsed = parseJsdocValue(commentValue);
  if (!parsed.description) {
    return false;
  }

  const isTitleCaseOnly = /^[A-Z][A-Za-z0-9]*(?: [A-Z][A-Za-z0-9]*)+\.$/.test(parsed.description);
  const isGenericWorkflowDescription = / for the .+ workflow\.$/.test(parsed.description);

  return parsed.description.length >= 20 &&
    /[.!?]$/.test(parsed.description) &&
    !isTitleCaseOnly &&
    !isGenericWorkflowDescription;
}

function getReturnTagIndex(tagLines) {
  return tagLines.findIndex((line) => /^@returns?\b/.test(line));
}

function hasFullReturnDescription(tagLines) {
  const returnTagIndex = getReturnTagIndex(tagLines);
  if (returnTagIndex === -1) {
    return false;
  }

  const line = tagLines[returnTagIndex];
  const match = line.match(/^@returns?\s+\{[^}]+\}\s+(.+)$/);
  if (!match) {
    return false;
  }

  const description = match[1].trim();
  return description.length >= 20 && /[.!?]$/.test(description) && !/workflow\.$/.test(description);
}

function normalizeTagLines(tagLines, pathRef, filePath) {
  const normalizedTagLines = tagLines.filter((line) => !/^@returns?\b/.test(line));
  const returnInfo = getReturnInfo(pathRef, filePath);
  normalizedTagLines.push(`@returns {${returnInfo.type}} ${returnInfo.description}`);
  return normalizedTagLines;
}

function buildUpdatedJsdoc(commentValue, pathRef, filePath) {
  const parsed = parseJsdocValue(commentValue);
  const description = generateDescription(pathRef, filePath);
  const lines = ["/**", ` * ${description}`];
  const extraTagLines = parsed.tagLines.filter((line) => !/^@param\b/.test(line) && !/^@returns?\b/.test(line));

  buildParamTagLines(pathRef, filePath).forEach((line) => {
    lines.push(` * ${line}`);
  });

  normalizeTagLines(extraTagLines, pathRef, filePath).forEach((line) => {
    lines.push(` * ${line}`);
  });

  lines.push(" */");
  return lines.join("\n");
}

function getIndentation(source, position) {
  const lastNewlineIndex = source.lastIndexOf("\n", position - 1);
  const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
  const linePrefix = source.slice(lineStart, position);
  const indentationMatch = linePrefix.match(/^\s*/);
  return indentationMatch ? indentationMatch[0] : "";
}

function formatCommentBlock(comment, indentation) {
  return comment
    .split("\n")
    .map((line, index) => `${index === 0 ? "" : indentation}${line}`)
    .join("\n");
}

function parseSource(source) {
  return parser.parse(source, {
    sourceType: "unambiguous",
    ranges: true,
    plugins: [
      "jsx",
      "classProperties",
      "classPrivateProperties",
      "classPrivateMethods",
      "dynamicImport",
      "importMeta",
      "optionalChaining",
      "nullishCoalescingOperator",
      "objectRestSpread",
      "topLevelAwait",
    ],
  });
}

function collectChanges(source, ast, filePath) {
  const changes = [];
  const usedStarts = new Set();

  function maybeCollect(pathRef) {
    const targetPath = resolveTargetPath(pathRef);
    const targetNode = targetPath.node;

    if (!targetNode || typeof targetNode.start !== "number") {
      return;
    }

    const targetComment =
      Array.isArray(targetNode.leadingComments) &&
      targetNode.leadingComments.find((comment) => {
        return comment.type === "CommentBlock" && comment.value.startsWith("*");
      });
    const pathComment =
      Array.isArray(pathRef.node.leadingComments) &&
      pathRef.node.leadingComments.find((comment) => {
        return comment.type === "CommentBlock" && comment.value.startsWith("*");
      });
    const jsdocComment = targetComment || pathComment;
    const indentation = getIndentation(source, targetNode.start);

    if (jsdocComment) {
      if (usedStarts.has(jsdocComment.start)) {
        return;
      }

      const nextComment = formatCommentBlock(
        buildUpdatedJsdoc(jsdocComment.value, pathRef, filePath),
        indentation,
      );
      const currentComment = source.slice(jsdocComment.start, jsdocComment.end);

      if (currentComment !== nextComment) {
        usedStarts.add(jsdocComment.start);
        changes.push({
          type: "replace",
          start: jsdocComment.start,
          end: jsdocComment.end,
          content: nextComment,
        });
      }
      return;
    }

    if (usedStarts.has(targetNode.start)) {
      return;
    }

    usedStarts.add(targetNode.start);

    const comment =
      formatCommentBlock(buildJsdoc(pathRef, filePath, generateDescription(pathRef, filePath)), indentation) +
      `\n${indentation}`;
    changes.push({
      type: "insert",
      position: targetNode.start,
      comment,
    });
  }

  traverse(ast, {
    FunctionDeclaration(pathRef) {
      maybeCollect(pathRef);
    },
    VariableDeclarator(pathRef) {
      if (
        pathRef.node.id.type === "Identifier" &&
        pathRef.node.init &&
        (pathRef.node.init.type === "ArrowFunctionExpression" ||
          pathRef.node.init.type === "FunctionExpression")
      ) {
        maybeCollect(pathRef);
      }
    },
    ClassMethod(pathRef) {
      maybeCollect(pathRef);
    },
    ObjectMethod(pathRef) {
      maybeCollect(pathRef);
    },
  });

  return changes.sort((left, right) => {
    const leftPosition = left.type === "replace" ? left.start : left.position;
    const rightPosition = right.type === "replace" ? right.start : right.position;
    return rightPosition - leftPosition;
  });
}

function applyChanges(source, changes) {
  let updatedSource = source;

  for (const change of changes) {
    if (change.type === "replace") {
      updatedSource =
        updatedSource.slice(0, change.start) +
        change.content +
        updatedSource.slice(change.end);
      continue;
    }

    updatedSource =
      updatedSource.slice(0, change.position) +
      change.comment +
      updatedSource.slice(change.position);
  }

  return updatedSource;
}

function processFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const ast = parseSource(source);
  const changes = collectChanges(source, ast, filePath);

  return {
    changed: changes.length > 0,
    changes,
    source,
  };
}

function main() {
  const rawArgs = process.argv.slice(2);
  const checkOnly = rawArgs.includes("--check");
  const trackedOnly = rawArgs.includes("--tracked");
  const inputFiles = rawArgs.filter((arg) => arg !== "--check" && arg !== "--tracked");
  const files = inputFiles.length
    ? inputFiles.map((filePath) => path.resolve(REPO_ROOT, filePath))
    : trackedOnly
      ? childProcess
          .execFileSync("git", ["ls-files", "*.js"], { cwd: REPO_ROOT, encoding: "utf8" })
          .split(/\r?\n/)
          .filter(Boolean)
          .map((filePath) => path.resolve(REPO_ROOT, filePath))
      : listTargetFiles(REPO_ROOT);
  const updatedFiles = [];

  for (const filePath of files) {
    try {
      const result = processFile(filePath);
      if (result.changed) {
        if (!checkOnly) {
          const updatedSource = applyChanges(result.source, result.changes);
          fs.writeFileSync(filePath, updatedSource);
        }
        updatedFiles.push(path.relative(REPO_ROOT, filePath));
      }
    } catch (error) {
      console.error(`Failed to process ${path.relative(REPO_ROOT, filePath)}:`, error.message);
    }
  }

  console.log(`${checkOnly ? "Missing JSDoc in" : "Updated"} ${updatedFiles.length} files.`);
  updatedFiles.forEach((file) => {
    console.log(file);
  });
}

main();
