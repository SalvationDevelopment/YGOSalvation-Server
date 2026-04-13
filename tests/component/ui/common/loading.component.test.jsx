import test from "node:test";
import * as Module from "../../../../server/ui/components/common/loading.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("loading.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
