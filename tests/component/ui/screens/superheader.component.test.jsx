import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/superheader.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("superheader.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
