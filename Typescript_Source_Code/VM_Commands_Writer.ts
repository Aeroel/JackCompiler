import { assert } from "node:console";
import { Helper_Functions } from "./Helper_Functions.js";
import { Symbol_Table } from "./Symbol_Table.js";
import { Tokens_To_VM_Code_Converter } from "./Tokens_To_VM_Code_Converter.js";
import type { Jack_Symbol, Segment } from "./Type_Definitions.js";

export { VM_Commands_Writer }
class VM_Commands_Writer {
    code = '';

    whileNextId = 0;
    currentWhileId = 0;

    ifNextId = 0;
    currentIfId = 0;

    validSegments: string[] = ["constant", "argument", "local", "static", "this", "that", "pointer", "temp"];
    constructor() {

    }
    getFullSubName() {
        return `${Tokens_To_VM_Code_Converter.className}.${Tokens_To_VM_Code_Converter.subName}`;
    }
    beginIf() {
        const ifId = this.ifNextId;
        this.ifNextId++;
        return ifId;
    }
    writeIfGotoElseClause(ifId: number) {
        const fullSubName = this.getFullSubName();
        this.append(`if-goto ${fullSubName}$IF_ELSE${ifId}`);
    }
    writeLabelIfEnd(ifId: number) {
        const fullSubName = this.getFullSubName();
        this.append(`label ${fullSubName}$IF_END${ifId}`);
    }
    writeJumpToIfEnd(ifId: number) {
        const fullSubName = this.getFullSubName();
        this.append(`goto ${fullSubName}$IF_END${ifId}`);
    }
    writeLabelElseClause(ifId: number) {
        const fullSubName = this.getFullSubName();
        this.append(`label ${fullSubName}$IF_ELSE${ifId}`);
    }


    beginWhile() {
        const whileId = this.whileNextId;
        this.whileNextId++;
        const fullSubName = this.getFullSubName();
        this.append(`label ${fullSubName}$WHILE_EXP${whileId}`);
        return whileId;
    }
    writeWhileExpJumpToEnd(whileId: number) {
        const fullSubName = this.getFullSubName();
        this.append(`if-goto ${fullSubName}$WHILE_END${whileId}`);
    }
    endWhile(whileId: number) {
        const fullSubName = this.getFullSubName();
        this.append(`goto ${fullSubName}$WHILE_EXP${whileId}`);
        this.append(`label ${fullSubName}$WHILE_END${whileId}`);
    }
    writePush(segment: Segment, index: Symbol_Table["table"][number]["index"]) {
        this.throwIfSegmentIsInvalid(segment);
        this.append(`push ${segment} ${index}`);
    }
    writePop(segment: Segment, index: Symbol_Table["table"][number]["index"]) {
        this.throwIfSegmentIsInvalid(segment);
        this.append(`pop ${segment} ${index}`);
    }
    throwIfSegmentIsInvalid(segment: string) {
        if (!(this.validSegments.includes(segment))) {
            throw new Error("Invalid segment " + segment);
        }
    }
    writeCall(name: string, passedParamCount: number) {
        const passedParamCount_str = String(passedParamCount);
        this.append(`call ${name} ${passedParamCount_str}`);
    }
    writeReturn() {
        this.append('return');
    }
    writeFunction(subroutineName: string, args: number) {
        const className = Tokens_To_VM_Code_Converter.className;

        this.append(`function ${className}.${subroutineName} ${args}`);
    }
    writeOp(op: string) {
        const map: Record<string, string> = {
            "*": "call Math.multiply 2",
            "/": "call Math.divide 2",
            "+": "add",
            "-": "sub",
            "<": "lt",
            ">": "gt",
            "=": "eq",
            "&": "and",
            "|": "or",

            "~": "not",
            "not": "not",
        }
        const mapped = map[op];
        if(String(mapped) === 'undefined') {
            throw new Error(`WriteOp:${mapped}: ${op}`)
        }
        this.append(`${mapped}`);

    }
    getCode() {
        return this.code;
    }
    append(additionalCode: string) {
        console.log(additionalCode);
        this.code = `${this.code}
${additionalCode}`;
    }
    newLine() {
        return Helper_Functions.getNewline();
    }
}