export { Config };
class Config {
    static whatOSDoYouUse = "windows";
    static new_line_type = '';
    static set_new_line_type(type: string) {
        this.new_line_type = type;
    }
}