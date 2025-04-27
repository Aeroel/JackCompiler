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
        this.append(`push ${segment} ${index}`);
    }
    writeCall(name: string) {
        this.append(`call ${name}`);
    }
    writeFunction(subroutineName: string, args: number) {
        const className =  Tokens_To_VM_Code_Converter.className;

        this.append(`function ${className}.${subroutineName} ${args}`);
    }
    getCode() {
        return this.code;
    }
    append(additionalCode: string) {
        console.log(additionalCode);
        this.code = `${this.code}  ${this.newLine()} ${additionalCode}`;
    }
    newLine() {
        return Helper_Functions.getNewline();
    }
}