import fs from "node:fs";
import { Helper_Functions } from "./Helper_Functions.js";
import type { Token } from "#root/Type_Definitions.js";

export { Tokens_Saver };

class Tokens_Saver {
    static write_tokens_to_file_in_the_same_directory_as(tokens: Token[], pathToFile: string) {
        this.save_tokens_in_the_same_directory_as_path(tokens, pathToFile);
    }
    static convertTokensToXML(tokens: Token[]) {
        let xml = '';
        tokens.forEach(token => {
            const openingTag = `<${token.type}>`;

            token.value = this.escape_special_xml_characters(token.value);
            let value = token.value;

            const closingTag = `</${token.type}>`;
            const fullTokenXMLForm = `${openingTag} ${value} ${closingTag}${Helper_Functions.getNewline()}`;
            xml += fullTokenXMLForm;
        });
        const tokensOpeningTag = "<tokens>" + Helper_Functions.getNewline();
        const tokensClosingTag = "</tokens>" + Helper_Functions.getNewline();
        xml = `${tokensOpeningTag}${xml}${tokensClosingTag}`;
        return xml;
    }
    static escape_special_xml_characters(value: string) {
        // make sure you replace & at the beginning, otherwise you will replace the escaped forms of > < and " too which would make no sense 
        value = value.replaceAll("&", "&amp;");

        value = value.replaceAll("<", "&lt;");
        value = value.replaceAll(">", "&gt;");
        value = value.replaceAll(`"`, "&quot;");
        return value;
    }
    static escaped_to_normal(value: string) {
        // make sure you replace & at the beginning, otherwise you will replace the escaped forms of > < and " too which would make no sense 
        value = value.replaceAll("&amp;", "&");

        value = value.replaceAll("&lt;", "<");
        value = value.replaceAll("&gt;", ">");
        value = value.replaceAll(`&quot;`, `"`);
        return value;
    }

    static save_tokens_in_the_same_directory_as_path(tokens: Token[], path: string) {
        const tokensXML = this.convertTokensToXML(tokens);

        const newFilePath = path + ".tokens.xml";
        console.log(`[Tokens_Saver] Saving tokens in XML format on path ${newFilePath} `);
        fs.writeFileSync(newFilePath, tokensXML);
    }

}