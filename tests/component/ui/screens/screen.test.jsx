import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/screen.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("screen.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
