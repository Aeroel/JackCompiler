import type { Jack_Symbol } from "./Type_Definitions.js";

export { Symbol_Table }
class Symbol_Table {
    table: Jack_Symbol[] = [];
    lastKind: Jack_Symbol["kind"] = "argument";
    lastType: Jack_Symbol["type"] = '';

    constructor() {

    }
    isSymbolInTable(name: string): boolean {
        console.log(JSON.stringify(this.table));
        
        let answer = false;
        this.table.forEach(symbol => {
            if(symbol.name === name) {
                answer = true;
            }
        })
        return answer
    }
    getSymbol(name: Jack_Symbol["name"]): Jack_Symbol {
        if(!(this.isSymbolInTable(name))) {
            throw new Error(`Symbol ${name} not found`);
        }
        let symbol: Jack_Symbol | undefined = undefined;
        this.table.forEach(sym => {
            if(sym.name === name) {
                symbol = sym;
            }
        })
        console.log(JSON.stringify({a:this.table,b:name}));
        
        if(typeof symbol === 'undefined') {
            throw new Error("hmm, must never happen");
        }
        return symbol;
    }
    newSubroutine() {
            // Clear var/arg symbols from the table
            this.table = this.table.filter(symbol => 
                symbol.kind !== "var" && symbol.kind !== "argument"
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