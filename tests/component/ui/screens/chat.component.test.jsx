import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/chat.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("chat.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
