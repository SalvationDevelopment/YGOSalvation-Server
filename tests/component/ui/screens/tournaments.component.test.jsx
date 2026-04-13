import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/tournaments.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("tournaments.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
