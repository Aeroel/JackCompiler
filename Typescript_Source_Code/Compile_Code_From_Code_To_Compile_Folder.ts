import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const code_dir = join(__dirname, 'code_to_compile');
const myCompilerPath = `"` + join(__dirname, "JackCompiler.ts") + `"`;
const providedCompilerPath = `"` + join("C:", "Users", "E", "Desktop", "Nand2Tetris_File_Storage", "nand2tetris", "tools", "JackCompiler.bat") + `"`;

let totalCompilations = 0;
let successCompilations = 0;

function runMyJackCompiler(filePath: string) {
    return new Promise((resolve, reject) => {
        execFile('node', [myCompilerPath, filePath], { shell: true }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running JackCompiler on ${filePath}: ${stderr}`);
                return reject(error);
            }
            resolve(stdout);
        });
    });
}
async function runProvidedJackCompiler(filePath: string) {
    // Wrap the batch file path and filePath in quotes to handle spaces
    // execFile handles arguments safely, so no need to quote manually here
    try {
        const { stdout, stderr } = await execFileAsync(providedCompilerPath, [filePath], { shell: true });
        if (stderr) {
            console.error(`Compiler stderr: ${stderr}`);
        }
        return stdout;
    } catch (error: any) {
        console.error(`Error running provided JackCompiler on ${filePath}: ${error.message}`);
        throw error;
    }
}

async function processFolder(folderPath: string) {
    const files = readdirSync(folderPath);

    for (const file of files) {
        if (file.endsWith('.jack')) {
            totalCompilations++;
            const jackFile = join(folderPath, file);

            try {
                await runMyJackCompiler(jackFile);
                await runProvidedJackCompiler(jackFile);
            } catch (error) {
                if (!(error instanceof Error)) {
                    throw new Error("Unknown error")
                }
                console.error(`Compilation failed for ${file}: ${error.message}`);
            }
        }
    }
}

async function main() {
    const folders = readdirSync(code_dir);

    for (const folder of folders) {
        const folderPath = join(code_dir, folder);
        if (statSync(folderPath).isDirectory()) {
            await processFolder(folderPath);
        }
    }

    console.log(`[${successCompilations}] out of [${totalCompilations}] succeeded`);
}

main().catch(err => console.error(err));