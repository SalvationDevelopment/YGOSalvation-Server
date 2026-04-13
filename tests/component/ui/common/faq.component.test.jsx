import test from "node:test";
import * as Module from "../../../../server/ui/components/common/faq.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("faq.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
