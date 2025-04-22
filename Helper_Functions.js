export { Helper_Functions };
class Helper_Functions {
    static newlines = {
        linux: '\n',
        }
    static getNewline() {
       return this.newlines.linux;
    }
}