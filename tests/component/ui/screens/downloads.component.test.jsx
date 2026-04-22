import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/downloads.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("downloads.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
