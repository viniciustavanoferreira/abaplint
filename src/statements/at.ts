import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class At extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let atNew = seq(str("NEW"), Reuse.field_sub());
    let atEnd = seq(str("END OF"), Reuse.field_sub());

    let ret = seq(str("AT"), alt(str("FIRST"), str("LAST"), atNew, atEnd));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new At(tokens);
    }
    return undefined;
  }

}