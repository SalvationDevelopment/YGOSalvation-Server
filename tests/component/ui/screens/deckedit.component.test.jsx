import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/deckedit.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("deckedit.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
