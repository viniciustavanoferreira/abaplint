import {statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/statements/";
import {Version} from "../../../src/version";

const tests = [
  "WAIT UP TO 1 SECONDS.",
  "WAIT UNTIL foo >= bar.",
  "WAIT UNTIL foo >= bar UP TO 1 SECONDS.",
  "WAIT FOR MESSAGING CHANNELS UNTIL foobar = abap_true UP TO 10 SECONDS.",
  "WAIT FOR ASYNCHRONOUS TASKS UNTIL mv_tasks_running < mv_max_tasks.",
];

statementType(tests, "WAIT", Statements.Wait);

const versions = [
  {abap: "WAIT FOR PUSH CHANNELS UNTIL ms_message IS NOT INITIAL UP TO iv_timeout SECONDS.", ver: Version.v750},
];

statementVersion(versions, "WAIT", Statements.Wait);