import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/extracontrols.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("extracontrols.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
