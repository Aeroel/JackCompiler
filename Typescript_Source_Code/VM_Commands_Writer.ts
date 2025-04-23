import { Helper_Functions } from "./Helper_Functions.js";

export { VM_Commands_Writer }
class VM_Commands_Writer {
    code = '';
    constructor() {

    }
    writeFunction(name: string, nLocals: number) {
        this.append(`function ${name} ${nLocals}`);
    }
    getCode() {
        return this.code
    }
    append(additionalCode: string) {
        this.code = `${this.code}  ${this.newLine()} ${additionalCode}`;
    }
    newLine() {
        return Helper_Functions.getNewline();
    }
}