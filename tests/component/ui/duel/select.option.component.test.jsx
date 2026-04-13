import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/select.option.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("select.option.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
