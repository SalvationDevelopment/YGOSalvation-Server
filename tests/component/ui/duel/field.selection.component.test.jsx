import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/field.selection.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("field.selection.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
