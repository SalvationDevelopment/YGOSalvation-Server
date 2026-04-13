import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/credits.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("credits.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
