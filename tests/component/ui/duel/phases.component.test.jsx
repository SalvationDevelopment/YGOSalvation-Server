import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/phases.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("phases.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
