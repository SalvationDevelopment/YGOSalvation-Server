import test from "node:test";
import * as Module from "../../../../server/ui/components/common/card.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("card.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
