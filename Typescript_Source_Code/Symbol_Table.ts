import type { Jack_Symbol } from "./Type_Definitions.js";

export { Symbol_Table }
class Symbol_Table {
    table: Jack_Symbol[] = [];
    lastKind: Jack_Symbol["kind"] = "arg";
    lastType: Jack_Symbol["type"] = '';

    constructor() {

    }
    newSubroutine() {
            // Clear var/arg symbols from the table
            this.table = this.table.filter(symbol => 
                symbol.kind !== "var" && symbol.kind !== "arg"
            );
    }
    add(name: Jack_Symbol["name"], kind?: Jack_Symbol["kind"], type?: Jack_Symbol["type"]) {
        if (kind === undefined || type === undefined) {
            kind = this.lastKind;
            type = this.lastType;
        }

        const index = this.Use_Next_Index_For_Kind(kind);
        const symbol: Jack_Symbol = { index, kind, type, name };
        this.table.push(symbol);

        this.lastKind = kind;
        this.lastType = type;
    }
    Use_Next_Index_For_Kind(kind: Jack_Symbol["kind"]) {
        const index = this.countKindEntries(kind);
        return index;
    }
    countKindEntries(kind: Jack_Symbol["kind"]): number {
        return this.table.filter(symbol => symbol.kind === kind).length;
    }

}