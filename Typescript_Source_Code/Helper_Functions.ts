export { Helper_Functions };
class Helper_Functions {
    static newlines = {
        linux: '\n',
        }
    static getNewline() {
       return this.newlines.linux;
    }
    static assert(value: boolean, msg: string) {
        if(!value) {
            throw new Error(msg);
        }
    }
}