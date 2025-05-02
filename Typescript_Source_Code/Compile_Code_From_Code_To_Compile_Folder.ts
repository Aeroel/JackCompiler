import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const code_dir = join(__dirname, 'code_to_compile');
const compilerPath = `"` +join(__dirname, "JackCompiler.ts")+`"`;

let totalCompilations = 0;
let successCompilations = 0;

function runJackCompiler(filePath: string) {
    return new Promise((resolve, reject) => {
        execFile('node', [compilerPath, filePath],{shell:true}, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running JackCompiler on ${filePath}: ${stderr}`);
                return reject(error);
            }
            resolve(stdout);
        });
    });
}


async function processFolder(folderPath: string) {
    const files = readdirSync(folderPath);

    for (const file of files) {
        if (file.endsWith('.jack')) {
            totalCompilations++;
            const jackFile = join(folderPath, file);

            try {
                await runJackCompiler(jackFile);
            } catch (error) {
                if(!(error instanceof Error)) {
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