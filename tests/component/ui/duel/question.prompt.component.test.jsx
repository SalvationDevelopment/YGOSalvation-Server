import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/question.prompt.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("question.prompt.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
