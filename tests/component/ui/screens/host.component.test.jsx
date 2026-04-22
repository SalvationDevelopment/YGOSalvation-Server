import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/host.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("host.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
