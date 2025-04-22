export { Comment_Remover };

import fs from "node:fs";
import path from "node:path";

class Comment_Remover {
    // props used by some functions
    static fileContents;
    static atCharIndexInFileContents;
    static inSingleLineComment;
    static inMultiLineComment;
    static there_are_more_characters_to_process;

    static get_code_without_comments_from_file_at_path_and_save_to_a_new_file_in_the_same_directory(filePath) {
        const fileContents = this.getContentsFromFileAtPath(filePath);
        const codeWithoutComments = this.removeCommentsIfAny(fileContents);
        return this.save_code_without_comments_to_file_path_based_on_original_path(codeWithoutComments, filePath);

    }
    static save_code_without_comments_to_file_path_based_on_original_path(code, origPath) {
        const newFilePath = origPath + ".comments_removed";
        console.log(`[Comment_Remover] Writing code without comments to ${newFilePath}`);

        fs.writeFileSync(newFilePath, code);
        return newFilePath;
    }
    static getContentsFromFileAtPath(filePath) {
        console.log(`[Comment_Remover] Reading code from file at path ${filePath}`);
        return fs.readFileSync(filePath, 'utf8');
    }
    static removeCommentsIfAny(code) {
        console.log(`[Comment_Remover] Removing comments from the code`);

        let codeOnly = '';

        this.fileContents = code;
        this.inSingleLineComment = false;
        this.inMultiLineComment = false;

        this.atCharIndexInFileContents = 0;

        this.there_are_more_characters_to_process = Boolean(this.atCharIndexInFileContents < this.fileContents.length);
        while (this.there_are_more_characters_to_process) {
            const currentCharacter = this.fileContents[this.atCharIndexInFileContents];
            const nextCharacter = this.fileContents[this.atCharIndexInFileContents + 1];

            const currentlyInAComment = (this.inSingleLineComment || this.inMultiLineComment);

            if (currentlyInAComment) {
                this.determine_if_current_character_is_where_this_particular_comment_ends();
                this.prepare_for_next_character();
                continue;
            }

            this.inSingleLineComment = (currentCharacter === '/' && nextCharacter === '/');
            this.inMultiLineComment = (currentCharacter === '/' && nextCharacter === '*');

            const the_current_character_is_the_beginning_of_a_comment = Boolean(this.inSingleLineComment || this.inMultiLineComment);

            if (the_current_character_is_the_beginning_of_a_comment) {
                // Skip the next '/' or '*'
                this.atCharIndexInFileContents++;
                this.prepare_for_next_character();
                continue;
            }

            codeOnly += currentCharacter;
            this.prepare_for_next_character();
        }

        return codeOnly;
    }


    static determine_if_current_character_is_where_this_particular_comment_ends() {
        const currentCharacter = this.fileContents[this.atCharIndexInFileContents];
        const previousCharacter = this.fileContents[this.atCharIndexInFileContents - 1];

        if (this.inSingleLineComment) {
            const windowsStyleComment = ["\r", "\n"];
            const at_this_point_the_single_line_comment_ends = Boolean(
                currentCharacter === '\n'
                ||
                (previousCharacter === windowsStyleComment[0] && currentCharacter === windowsStyleComment[1])
            );
            if (at_this_point_the_single_line_comment_ends) {
                this.inSingleLineComment = false;
            }
        }
        if (this.inMultiLineComment) {
            const at_this_point_the_multiline_comment_ends = Boolean(previousCharacter === '*' && currentCharacter === '/');
            if (at_this_point_the_multiline_comment_ends) {
                this.inMultiLineComment = false;
            }
        }
    }
    static prepare_for_next_character() {
        // next iteration we look at next character if there are more characters
        this.atCharIndexInFileContents++;
        this.there_are_more_characters_to_process = Boolean(this.atCharIndexInFileContents < this.fileContents.length);
    }

}