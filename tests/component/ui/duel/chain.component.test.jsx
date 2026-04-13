import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/chain.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("chain.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
