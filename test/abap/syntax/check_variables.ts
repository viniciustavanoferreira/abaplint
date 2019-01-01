import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import {Registry} from "../../../src/registry";
import {CheckVariablesLogic} from "../../../src/abap/syntax/check_variables";
import {Issue} from "../../../src/issue";

function runMulti(objects: {filename: string, abap: string}[]): Issue[] {
  const reg = new Registry();
  for (const obj of objects) {
    const file = new MemoryFile(obj.filename, obj.abap);
    reg.addFile(file).parse();
  }
  return new CheckVariablesLogic().run(reg.getABAPFiles()[0], reg);
}

function runClass(abap: string): Issue[] {
  const file = new MemoryFile("zcl_foobar.clas.abap", abap);
  const reg = new Registry().addFile(file).parse();
  return new CheckVariablesLogic().run(reg.getABAPFiles()[0], reg);
}

function runProgram(abap: string): Issue[] {
  const file = new MemoryFile("zfoobar.prog.abap", abap);
  const reg = new Registry().addFile(file).parse();
  return new CheckVariablesLogic().run(reg.getABAPFiles()[0], reg);
}

describe("Check Variables", () => {

  it("parser error, class", () => {
    const issues = runClass("asdf sdfs");
    expect(issues.length).to.equals(0);
  });

  it("parser error, program", () => {
    const issues = runProgram("asdf sdfs");
    expect(issues.length).to.equals(0);
  });

  it("program, variable foobar not found", () => {
    const abap = "WRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("program, foobar found", () => {
    const abap = "DATA foobar.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, constant", () => {
    const abap = "CONSTANTS foobar TYPE c VALUE 'B'.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, constant, begin", () => {
    const abap =
      "CONSTANTS: BEGIN OF c_mode,\n" +
      "             create TYPE i VALUE 1,\n" +
      "           END OF c_mode.\n" +
      "WRITE c_mode-create.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });
/*
  it("program, constant, begin, error", () => {
    const abap =
      "CONSTANTS: BEGIN OF c_mode,\n" +
      "             create TYPE i VALUE 1,\n" +
      "           END OF c_mode.\n" +
      "WRITE create.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });
*/
  it("program, foobar found, typed", () => {
    const abap = "DATA foobar TYPE c LENGTH 1.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, inline definition", () => {
    const abap = "DATA(foobar) = 2.\nWRITE foobar.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, variable foobar not found, target", () => {
    const abap = "foobar = 2.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("program, foobar found, target", () => {
    const abap = "DATA foobar.\nfoobar = 2.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, abap_true", () => {
    const abap = "WRITE abap_true.\nWRITE ABAP_TRUE.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, sy field", () => {
    const abap = "WRITE sy-uname.\nWRITE SY-UNAME.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, TABLES", () => {
    const abap = "TABLES zmoo.\nWRITE zmoo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, LOOP AT SCREEN", () => {
    const abap = "LOOP AT SCREEN.\nENDLOOP.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, parameter", () => {
    const abap = "PARAMETERS: p_moo TYPE i.\nWRITE p_moo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

/*
  it("program, sy field, unknown field", () => {
    const abap = "WRITE sy-fooboo.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
  });
*/
  it("program, different scope", () => {
    const abap = "FORM foobar1.\n" +
      "  DATA moo.\n" +
      "ENDFORM.\n" +
      "FORM foobar2.\n" +
      "  WRITE moo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"moo\" not found");
  });

  it("program, global scope", () => {
    const abap = "DATA moo.\n" +
      "FORM foo.\n" +
      "  WRITE moo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("program, FORM parameter", () => {
    const abap = "FORM foo USING boo.\n" +
      "WRITE boo.\n" +
      "ENDFORM.\n";
    const issues = runProgram(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, simple, no errors", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, variable foobar not found", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equal("\"foobar\" not found");
  });

  it("class, foobar, local variable", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    DATA foobar.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, importing variable", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS hello IMPORTING foobar TYPE c.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, method not found, must push scope", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(2);
  });

  it("class, attribute", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    DATA foobar TYPE c.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, constant", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CONSTANTS foobar TYPE c VALUE 'B'.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, me, method call", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PRIVATE SECTION.\n" +
      "    METHODS hello.\n" +
      "    METHODS world.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    me->world( ).\n" +
      "  ENDMETHOD.\n" +
      "  METHOD world.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class, me", () => {
    const abap =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PRIVATE SECTION.\n" +
      "    DATA foobar TYPE i.\n" +
      "    METHODS hello.\n" +
      "    METHODS world.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    me->world( ).\n" +
      "  ENDMETHOD.\n" +
      "  METHOD world.\n" +
      "    WRITE me->foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.";
    const issues = runClass(abap);
    expect(issues.length).to.equals(0);
  });

  it("class implementing interface", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC FINAL CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    INTERFACES zif_foobar .\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_FOOBAR IMPLEMENTATION.\n" +
      "  METHOD zif_foobar~method1.\n" +
      "    WRITE foo.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const intf =
      "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDINTERFACE.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", abap: clas},
      {filename: "zif_foobar.intf.abap", abap: intf}]);
    expect(issues.length).to.equals(0);
  });
/*
  it("attribute from super class", () => {
    const clas =
      "CLASS zcl_foobar DEFINITION PUBLIC INHERITING FROM zcl_super FINAL CREATE PUBLIC.\n" +
      "  PRIVATE SECTION.\n" +
      "    METHODS hello.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_foobar IMPLEMENTATION.\n" +
      "  METHOD hello.\n" +
      "    WRITE foobar.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS.\n";
    const sup =
      "CLASS zcl_super DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "  PROTECTED SECTION.\n" +
      "    DATA foobar TYPE i .\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const issues = runMulti([
      {filename: "zcl_foobar.clas.abap", abap: clas},
      {filename: "zcl_super.clas.abap", abap: sup}]);
    expect(issues.length).to.equals(0);
  });
*/
// todo, static method cannot access instance attributes
// todo, can a private method acces protected attributes?
// todo, write protected fields

});