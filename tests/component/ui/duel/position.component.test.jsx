import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/position.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("position.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
