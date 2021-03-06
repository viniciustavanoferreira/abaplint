import {AbstractObject} from "./_abstract_object";
import {ABAPFile} from "../files";
import {Lexer} from "../abap/lexer";
import {StatementParser} from "../abap/statement_parser";
import {StructureParser} from "../abap/structure_parser";
import {Version} from "../version";
import {Registry} from "../registry";
import {Define} from "../abap/statements";
import {TokenNode, StatementNode} from "../abap/nodes/";
import {Token} from "../abap/tokens/_token";
import {Unknown, MacroCall} from "../abap/statements/_statement";
import {Issue} from "../issue";
import {Identifier, Pragma} from "../abap/tokens";

export abstract class ABAPObject extends AbstractObject {
  private parsed: ABAPFile[];
  private old: Issue[];

  public constructor(name: string) {
    super(name);
    this.parsed = [];
  }

  private shouldParse(): boolean {
  // todo, this does not handle changing of version + macros
    if (this.parsed.length > 0 && this.isDirty() === false) {
      return false;
    } else {
      return true;
    }
  }

  public parseFirstPass(ver: Version, reg: Registry) {
    if (this.shouldParse() === false) {
      return;
    }
    this.parsed = [];

    this.files.forEach((f) => {
      if (/.*\.abap$/.test(f.getFilename())) {
        const tokens = Lexer.run(f);
        const statements = StatementParser.run(tokens, ver);
        this.parsed.push(new ABAPFile(f, tokens, statements));
      }
    });

    this.parsed.forEach((f) => {
      f.getStatements().forEach((s) => {
        if (s.get() instanceof Define) {
// todo, will this break if first token is a pragma?
          reg.addMacro(s.getTokens()[1].getStr());
        }
      });
    });
  }

  public parseSecondPass(reg: Registry): Issue[] {
    if (this.shouldParse() === false) {
      return this.old;
    }

    for (const f of this.parsed) {
      const statements: StatementNode[] = [];

      for (const s of f.getStatements()) {
        let name: string | undefined = undefined;

        if (s.get() instanceof Unknown) {
          for (const i of s.getTokens()) {
            if (i instanceof Identifier) {
              name = i.getStr();
              break;
            } else if (i instanceof Pragma) {
              continue;
            } else {
              break;
            }
          }
        }

        if (name && reg.isMacro(name)) {
          statements.push(new StatementNode(new MacroCall()).setChildren(this.tokensToNodes(s.getTokens())));
        } else {
          statements.push(s);
        }
      }

      f.setStatements(statements);
    }

    let ret: Issue[] = [];
    for (const f of this.parsed) {
      const result = StructureParser.run(f);
      f.setStructure(result.node);
      ret = ret.concat(result.issues);
    }

    this.dirty = false;
    this.old = ret;

    return ret;
  }

  public getABAPFiles(): ABAPFile[] {
    return this.parsed;
  }

  private tokensToNodes(tokens: Token[]): TokenNode[] {
    const ret: TokenNode[] = [];
    tokens.forEach((t) => {ret.push(new TokenNode(t)); });
    return ret;
  }

}