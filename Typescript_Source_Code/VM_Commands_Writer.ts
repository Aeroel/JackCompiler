import { assert } from "node:console";
import { Helper_Functions } from "./Helper_Functions.js";
import type { Symbol_Table } from "./Symbol_Table.js";
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
    beginIf() {
        this.currentIfId = this.ifNextId;
        this.ifNextId++;
    }
    writeIfGotoElseClause() {
        this.append(`if-goto IF_ELSE${this.currentIfId}`);
    }
    writeLabelIfEnd() {
        this.append(`label IF_END${this.currentIfId}`);
    }
    writeJumpToIfEnd() {
        this.append(`goto IF_END${this.currentIfId}`);
    }
    writeLabelElseClause() {
        this.append(`label IF_ELSE${this.currentIfId}`);
    }


    beginWhile() {
        this.currentWhileId = this.whileNextId;
        this.whileNextId++;
        this.append(`label WHILE_EXP${this.currentWhileId}`);
    }
    writeWhileExpJumpToEnd() {
        this.append(`if-goto WHILE_END${this.currentWhileId}`);
    }
    endWhile() {
        this.append(`goto WHILE_EXP${this.currentWhileId}`);
        this.append(`label WHILE_END${this.currentWhileId}`);
    }
    writePush(segment: Segment, index: Symbol_Table["table"][number]["index"]) {
        let segment_real = segment;
        if ((segment as Jack_Symbol["kind"]) === 'var') {
            segment_real = 'local';
        }
        this.throwIfSegmentIsInvalid(segment_real);
        this.append(`push ${segment_real} ${index}`);
    }
    writePop(segment: Segment, index: Symbol_Table["table"][number]["index"]) {
        let segment_real = segment;
        if ((segment as Jack_Symbol["kind"]) === 'var') {
            segment_real = 'local';
        }
        this.throwIfSegmentIsInvalid(segment_real);
        this.append(`pop ${segment_real} ${index}`);
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

            "+": "add",
            "<": "lt",
            ">": "gt",

            "~": "not",
            "not": "not",
        }
        const mapped = map[op];
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