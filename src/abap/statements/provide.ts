import {Statement} from "./_statement";
import {str, verNot, seq, IStatementRunnable, plus} from "../combi";
import {Field, Source, Target} from "../expressions";
import {Version} from "../../version";

export class Provide extends Statement {

  public getMatcher(): IStatementRunnable {

    const list = str("*");

    const fields = seq(str("FIELDS"),
                       list,
                       str("FROM"),
                       new Source(),
                       str("INTO"),
                       new Target(),
                       str("VALID"),
                       new Field(),
                       str("BOUNDS"),
                       new Field(),
                       str("AND"),
                       new Field());

    const ret = seq(str("PROVIDE"),
                    plus(fields),
                    str("BETWEEN"),
                    new Field(),
                    str("AND"),
                    new Field());

    return verNot(Version.Cloud, ret);
  }

}