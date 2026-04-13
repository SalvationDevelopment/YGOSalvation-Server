import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/choice.component.jsx";
import { expectNamedFunctionExport } from "../component-smoke-test-utils.js";

test("choice.component.jsx exports ChoiceScreen", () => {
  expectNamedFunctionExport(Module, "ChoiceScreen");
});
