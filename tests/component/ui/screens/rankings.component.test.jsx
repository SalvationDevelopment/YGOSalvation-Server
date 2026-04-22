import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/rankings.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("rankings.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
