import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let tok = Combi.tok;
let plus = Combi.plus;
let star = Combi.star;

export class Select extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let from = seq(str("FROM"),
                   alt(Reuse.dynamic(), Reuse.database_table()),
                   opt(seq(str("AS"), Reuse.database_table())));

    let intoList = seq(tok("WParenLeft"), star(seq(Reuse.target(), str(","))), Reuse.target(), str(")"));

    let into = seq(str("INTO"),
                   opt(str("CORRESPONDING FIELDS OF")),
                   opt(str("TABLE")),
                   alt(Reuse.target(), intoList));

    let where = seq(str("WHERE"), Reuse.cond());

    let order = seq(str("ORDER BY"), alt(plus(Reuse.field()), str("PRIMARY KEY")));

    let forAll = seq(str("FOR ALL ENTRIES IN"), Reuse.source());

    let count = seq(str("COUNT"), alt(tok("ParenLeft"), tok("ParenLeftW")), str("*"), str(")"));

    let fields = alt(str("*"), count, plus(Reuse.field()));

    let join = seq(str("INNER JOIN"), Reuse.database_table(), str("ON"), plus(Reuse.cond()));

    let up = seq(str("UP TO"), Reuse.source(), str("ROWS"));

// todo, use Permutation?
    let ret = seq(str("SELECT"),
                  opt(str("SINGLE")),
                  fields,
                  opt(up),
                  opt(into),
                  from,
                  opt(join),
                  opt(into),
                  opt(forAll),
                  opt(where),
                  opt(order),
                  opt(up));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Select(tokens);
    }
    return undefined;
  }

}