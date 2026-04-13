import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/tournament-detail.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("tournament-detail.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
