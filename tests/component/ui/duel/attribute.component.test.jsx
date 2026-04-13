import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/attribute.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("attribute.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
