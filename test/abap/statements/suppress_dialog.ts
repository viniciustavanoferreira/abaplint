import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "SUPPRESS DIALOG.",
];

statementType(tests, "SUPPRESS DIALOG", Statements.SuppressDialog);