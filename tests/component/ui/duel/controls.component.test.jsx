import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/controls.component.jsx";
import { expectNamedFunctionExport } from "../component-smoke-test-utils.js";

test("controls.component.jsx exports ControlButtons", () => {
  expectNamedFunctionExport(Module, "ControlButtons");
});
