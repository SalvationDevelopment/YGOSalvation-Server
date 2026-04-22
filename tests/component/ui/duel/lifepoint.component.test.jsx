import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/lifepoint.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("lifepoint.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
