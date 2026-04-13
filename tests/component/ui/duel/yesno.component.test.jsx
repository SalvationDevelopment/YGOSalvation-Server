import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/yesno.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("yesno.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
