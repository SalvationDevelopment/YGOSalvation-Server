import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/tournament-calendar.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("tournament-calendar.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
