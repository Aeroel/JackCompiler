import fs from "node:fs";
import { Comment_Remover } from "#root/Comment_Remover.js";
import { Config } from "#root/Config.js";
import { Tokens_Saver } from "#root/Tokens_Saver.js";
import { Code_To_Tokens_Converter } from "#root/Code_To_Tokens_Converter.js";
import { Tokens_To_VM_Code_Converter as Tokens_To_VM_Code_Converter } from "#root/Tokens_To_Tree_Converter.js";


const provided_path_from_command_line_argument = process.argv[2];
const pathToFileWithoutComments = Comment_Remover.get_code_without_comments_from_file_at_path_and_save_to_a_new_file_in_the_same_directory(provided_path_from_command_line_argument);

const codeWithoutComments = fs.readFileSync(pathToFileWithoutComments, "utf8");
const tokens = Code_To_Tokens_Converter.convert_code_to_tokens(codeWithoutComments);
Tokens_Saver.save_tokens_in_the_same_directory_as_path(tokens, pathToFileWithoutComments);

Tokens_To_VM_Code_Converter.Parse_Tokens_Into_VM_Code(tokens);
Tokens_To_VM_Code_Converter.Save_VM_Code_In_Same_Dir_As_Path(provided_path_from_command_line_argument);



