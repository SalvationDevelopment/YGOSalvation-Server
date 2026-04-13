import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/sidedeck.component.jsx";
import { expectNamedFunctionExport } from "../component-smoke-test-utils.js";

test("sidedeck.component.jsx exports SideDeckEditScreen", () => {
  expectNamedFunctionExport(Module, "SideDeckEditScreen");
});
