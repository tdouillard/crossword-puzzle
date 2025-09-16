import CrosswordEngine from "../src/grid-tools/CrosswordEngine.js";
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadPuzzleData() {
    try {
        const filePath = join(__dirname, 'crossword.json');
        const data = await readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading puzzle data:', error);
        return null;
    }
}

const puzzleData = await loadPuzzleData();
if (!puzzleData) {
    console.error('Failed to load puzzle data. Exiting.');
    process.exit(1);
}
const engine = new CrosswordEngine(puzzleData);

console.log('Crossword engine initialized successfully.', engine);