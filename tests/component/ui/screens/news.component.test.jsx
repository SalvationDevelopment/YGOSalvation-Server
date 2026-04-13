import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/news.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("news.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
