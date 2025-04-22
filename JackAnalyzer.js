import fs from "node:fs";
import { Comment_Remover } from "./Comment_Remover.js";
import { Config } from "./Config.js";
import { Tokens_Saver } from "./Tokens_Saver.js";
import { Code_To_Tokens_Converter } from "./Code_To_Tokens_Converter.js";
import { Tokens_To_Tree_Converter } from "./Tokens_To_Tree_Converter.js";


const provided_path_from_command_line_argument = process.argv[2];
const pathToFileWithoutComments = Comment_Remover.get_code_without_comments_from_file_at_path_and_save_to_a_new_file_in_the_same_directory(provided_path_from_command_line_argument);

const codeWithoutComments = fs.readFileSync(pathToFileWithoutComments, "utf8");
const tokens = Code_To_Tokens_Converter.convert_code_to_tokens(codeWithoutComments);
Tokens_Saver.save_tokens_in_the_same_directory_as_path(tokens, pathToFileWithoutComments);

Tokens_To_Tree_Converter.parse_tokens_into_tree_XML(tokens);
Tokens_To_Tree_Converter.save_tree_XML_in_same_dir_as_path(provided_path_from_command_line_argument);



