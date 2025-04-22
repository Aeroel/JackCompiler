import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testsDir = join(__dirname, 'tests');
const comparerPath = `"` +join(testsDir, "TextComparer.bat")+`"`;
const analyzerPath = `"` +join(__dirname, "JackAnalyzer.js")+`"`;

let totalTests = 0;
let successTests = 0;

function runJackAnalyzer(filePath: string) {
    return new Promise((resolve, reject) => {
        execFile('node', [analyzerPath, filePath],{shell:true}, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running JackAnalyzer on ${filePath}: ${stderr}`);
                return reject(error);
            }
            resolve(stdout);
        });
    });
}

function runTextComparer(xmlFile: string, tokensFile: string): Promise<string> {
    return new Promise((resolve, reject) => {
        execFile(comparerPath, [xmlFile, tokensFile],{shell:true}, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running TextComparer on ${xmlFile} and ${tokensFile}: ${stderr}`);
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
            totalTests++;
            const jackFile = join(folderPath, file);
            const baseName = basename(file, '.jack');
            const xmlFile = join(folderPath, `${baseName}.xml`);
            const tokensFile = join(folderPath, `${baseName}.jack.comments_removed.tokens.xml`);
            const tXmlFile = join(folderPath, `${baseName}T.xml`);

            try {
                await runJackAnalyzer(jackFile);
                const tokenizerResult = await runTextComparer(tXmlFile, tokensFile);
                const parserResult = await runTextComparer(xmlFile, join(folderPath, `${baseName}.jack.tree.xml`));
                console.log({result1: tokenizerResult, result2: parserResult});
                
                const tokenizerPassed = tokenizerResult.includes('success') && tokenizerResult.includes('Comparison');
                const parserPassed = parserResult.includes('success') && parserResult.includes('Comparison');
                if (tokenizerPassed && parserPassed) {
                    successTests++;
                }
            } catch (error) {
                if(!(error instanceof Error)) {
                   throw new Error("Unknown error")
                }
                console.error(`Test failed for ${file}: ${error.message}`);
            }
        }
    }
}

async function main() {
    const folders = readdirSync(testsDir);

    for (const folder of folders) {
        const folderPath = join(testsDir, folder);
        if (statSync(folderPath).isDirectory()) {
            await processFolder(folderPath);
        }
    }

    console.log(`[${successTests}] out of [${totalTests}] succeeded`);
}

main().catch(err => console.error(err));