import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/gamelist.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("gamelist.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
