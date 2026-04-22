import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/field.reveal.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("field.reveal.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
