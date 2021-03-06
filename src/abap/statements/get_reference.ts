import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class GetReference extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("GET REFERENCE OF"),
                    new Source(),
                    str("INTO"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}