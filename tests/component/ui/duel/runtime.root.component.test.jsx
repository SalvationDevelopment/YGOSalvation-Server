import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/runtime.root.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("runtime.root.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
