import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/login.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("login.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
