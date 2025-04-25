import { Tokens_Saver } from "#root/Tokens_Saver.js";
import { Code_To_Tokens_Converter } from "#root/Code_To_Tokens_Converter.js";
import { Tokens_To_VM_Code_Converter as Tokens_To_VM_Code_Converter } from "#root/Tokens_To_VM_Code_Converter.js";


const provided_path_to_jack_file_from_command_line_argument = process.argv[2];
const tokens = Code_To_Tokens_Converter.convert_code_to_tokens(provided_path_to_jack_file_from_command_line_argument);
Tokens_Saver.save_tokens_in_the_same_directory_as_path(tokens, provided_path_to_jack_file_from_command_line_argument);

Tokens_To_VM_Code_Converter.Convert_Tokens_Into_VM_Code(tokens);

Tokens_To_VM_Code_Converter.Save_VM_Code_In_Same_Dir_As_Path(provided_path_to_jack_file_from_command_line_argument);



