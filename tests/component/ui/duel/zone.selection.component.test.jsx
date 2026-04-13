import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/zone.selection.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("zone.selection.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
