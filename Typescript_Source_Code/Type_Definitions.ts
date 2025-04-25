export { type Token, type Jack_Symbol, type Segment}

declare type Token = {
    type: string,
    value: string, 
    lastCharacterIndex: number
};
declare type Jack_Symbol = {
    index: number,
    name: string,
    type: string,
    kind: "static" | "field" | "var" | "arg"
}

declare type Segment = "const" | "arg" | "local" | "static" | "this" | "that" | "pointer" | "temp";