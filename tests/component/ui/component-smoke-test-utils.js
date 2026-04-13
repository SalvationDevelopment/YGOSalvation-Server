import assert from "node:assert/strict";

export function expectDefaultComponentExport(moduleNamespace) {
  assert.ok(moduleNamespace);
  assert.equal(typeof moduleNamespace.default, "function");
}

export function expectNamedFunctionExport(moduleNamespace, exportName) {
  assert.ok(moduleNamespace);
  assert.equal(typeof moduleNamespace[exportName], "function");
}
