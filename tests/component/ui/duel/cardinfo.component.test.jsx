import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/cardinfo.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("cardinfo.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
