import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "DELETE REPORT zfoobar.",
  "DELETE REPORT ls_foo-name.",
  "delete report lv_report state 'I'.",
];

statementType(tests, "DELETE REPORT", Statements.DeleteReport);