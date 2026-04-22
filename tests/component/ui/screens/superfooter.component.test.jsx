import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/superfooter.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("superfooter.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
