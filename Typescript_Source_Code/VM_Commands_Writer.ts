import { Helper_Functions } from "./Helper_Functions.js";
import type { Symbol_Table } from "./Symbol_Table.js";
import { Tokens_To_VM_Code_Converter } from "./Tokens_To_VM_Code_Converter.js";
import type { Segment } from "./Type_Definitions.js";

export { VM_Commands_Writer }
class VM_Commands_Writer {
    code = '';
    constructor() {

    }
    writePush(segment: Segment, index: Symbol_Table["table"][number]["index"]) {
        const map: Record<string, string> = {
            "const": "constant"
        };
        const segmentMapped = map[segment];
        this.append(`push ${segmentMapped} ${index}`);
    }
    writeCall(name: string, passedParamCount: number) {
        const passedParamCount_str = String(passedParamCount);
        this.append(`call ${name} ${passedParamCount_str}`);
    }
    writeReturn() {
        this.append('return');
    }
    writeFunction(subroutineName: string, args: number) {
        const className =  Tokens_To_VM_Code_Converter.className;

        this.append(`function ${className}.${subroutineName} ${args}`);
    }
    writeOp(op: string) {
        const map: Record<string, string> = {
            "*": "call Math.multiply 2",
            "+": "add",
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