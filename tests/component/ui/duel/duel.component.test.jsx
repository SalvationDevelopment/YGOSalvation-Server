import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/duel.component.jsx";
import { expectNamedFunctionExport } from "../component-smoke-test-utils.js";

test("duel.component.jsx exports DuelScreen", () => {
  expectNamedFunctionExport(Module, "DuelScreen");
});
