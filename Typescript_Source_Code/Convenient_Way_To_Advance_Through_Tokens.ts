import type { Token } from "#root/Type_Definitions.js";

export {Convenient_Way_To_Advance_Through_Tokens}

class Convenient_Way_To_Advance_Through_Tokens {
    tokens;
    currentIndex;
    currentToken;
    nextToken;
    previousToken;
    constructor(tokens: Token[]) {
        if (!(tokens.length > 0)) {
            throw new Error("[Convenient_Way_To_Advance_Through_Tokens] Constructor expects some tokens, but no tokens, why????");
        }
        this.tokens = tokens;
        this.currentIndex = 0;
        this.currentToken = this.tokens[this.currentIndex];
        this.nextToken = this.tokens[this.currentIndex + 1];
        this.previousToken = this.tokens[this.currentIndex - 1];
    }
    advance() {
        this.currentIndex++;
        this.currentToken = this.tokens[this.currentIndex];
        this.nextToken = this.tokens[this.currentIndex + 1];
        this.previousToken = this.tokens[this.currentIndex - 1];
    }
    tokenType() {
        return this.currentToken.type;
    }
    tokenValue() {
        return this.currentToken.value;
    }
    nextTokenType() {
        return this.nextToken.type;
    }
    nextTokenValue() {
        return this.nextToken.value;
    }
    previousTokenValue() {
        return this.previousToken.value;
    }
    previousTokenType() {
        return this.previousToken.type;
    }
    triggerGenericTypeMismatchErrorIfNeeded(expected: string, got: string) {
        if (expected === got) {
            return;
        }
        const val = this.tokenValue();
        throw new Error(`[Convenient_Way_To_Advance_Through_Tokens] mismatch of types. Getting token  of type ${expected}'s value: expected type ${expected}, got ${got} with value "${val}". Next token value: "${this.nextTokenValue()}", previous token value: "${this.previousTokenValue()}"`);
    }
    keywordValue() {
        this.triggerGenericTypeMismatchErrorIfNeeded("keyword", this.tokenType());
        return this.tokenValue();
    }
    symbolValue() {
        this.triggerGenericTypeMismatchErrorIfNeeded("symbol", this.tokenType());
        return this.tokenValue();
    }
    identifierValue() {
        this.triggerGenericTypeMismatchErrorIfNeeded("identifier", this.tokenType());
        return this.tokenValue();
    }
    integerValue() {
        this.triggerGenericTypeMismatchErrorIfNeeded("integerConstant", this.tokenType());
        return this.tokenValue();
    }
    stringValue() {
        this.triggerGenericTypeMismatchErrorIfNeeded("stringConstant", this.tokenType());
        return this.tokenValue();
    }
}