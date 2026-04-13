import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/profile.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("profile.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
