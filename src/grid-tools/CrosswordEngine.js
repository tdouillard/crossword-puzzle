/**
 * Simplified Crossword Engine
 */
export default class CrosswordEngine {
    constructor(puzzleData) {
        this.grid = [];
        this.data = [];
        this.gridSize = { rows: puzzleData.size.x, cols: puzzleData.size.y };

        this.init(puzzleData);
    }

    /**
     * Initialize the grid with given data
     */
    init(puzzleData) {
        // Transform puzzle data to simplified format
        this.data = this.transformPuzzleData(puzzleData);

        // Calculate grid size if needed
        // this.gridSize = this.calculateGridSize(puzzleData);

        // Initialize empty grid
        this.grid = this.createEmptyGrid();

        // Populate grid with words
        this.populateGrid();
    }
    /**
     * Transform original puzzle data to simplified format
     */
    transformPuzzleData(puzzleData) {
        return puzzleData.words.map(word => ({
            value: word.answer,
            clue: word.clue,
            direction: word.direction,
            start: word.position,
            size: word.answer.length,
        }));
    }

    /**
     * Create empty 2D grid
     */
    createEmptyGrid() {
        return Array(this.gridSize.rows).fill(null).map(() =>
            Array(this.gridSize.cols).fill(null).map(() => ({
                type: "value",
                solution: "",
                current: "",
                hints: []
            }))
        );
    }

    /**
     * Populate grid with word data
     */
    populateGrid() {

        // First pass: populate solution values
        this.data.forEach(word => {
            try {
                const { value, direction, start, size, clue } = word;
                // Mark hint
                this.grid[clue.position.x][clue.position.y].type = "hint";
                this.grid[clue.position.x][clue.position.y].hints.push({
                    direction,
                    value: clue
                });
                // Place each letter of the word
                for (let i = 0; i < size; i++) {
                    const row = direction === 'across' ? start.x : start.x + i;
                    const col = direction === 'across' ? start.y + i : start.y;

                    // Ensure we're within grid bounds
                    if (row >= 0 && row < this.gridSize.rows &&
                        col >= 0 && col < this.gridSize.cols) {
                        this.grid[row][col].solution = value[i];
                    }
                }
            } catch (e) {
                console.error("Error populating word:", word, e);
            }
        });
    }

    /**
     * Verify grid: check if current values match solutions
     */
    verifyGrid() {
        let correct = 0;
        let mistakes = 0;
        let totalSolutionCells = 0;

        // Count all cells that should have solutions
        this.grid.flat().forEach(cell => {
            if (cell.solution) {
                totalSolutionCells++;

                if (cell.current) {
                    if (cell.current.toUpperCase() === cell.solution.toUpperCase()) {
                        correct++;
                    } else {
                        mistakes++;
                    }
                }
            }
        });

        const isValid = mistakes === 0 && correct === totalSolutionCells;

        return {
            isValid,
            correct,
            mistakes
        };
    }

    /**
     * Get progress: percentage of filled cells
     */
    getProgress() {
        let filledCells = 0;
        let totalCells = 0;

        this.grid.flat().forEach(cell => {
            if (cell.solution) { // Only count cells that are part of the puzzle
                totalCells++;
                if (cell.current && cell.current.trim() !== "") {
                    filledCells++;
                }
            }
        });

        return totalCells > 0 ? Math.round((filledCells * 100) / totalCells) : 0;
    }

    /**
     * Utility: Set cell value
     */
    setCellValue(row, col, value) {
        if (this.isValidPosition(row, col)) {
            this.grid[row][col].current = value;
            return true;
        }
        return false;
    }

    /**
     * Utility: Get cell value
     */
    getCellValue(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.grid[row][col].current;
        }
        return "";
    }

    /**
     * Utility: Check if position is valid
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.gridSize.rows &&
            col >= 0 && col < this.gridSize.cols &&
            this.grid[row][col].solution !== "";
    }

    /**
     * Utility: Clear all current values
     */
    clearGrid() {
        this.grid.flat().forEach(cell => {
            if (cell.solution) {
                cell.current = "";
            }
        });
    }

    /**
     * Utility: Fill grid with solutions
     */
    showSolution() {
        this.grid.flat().forEach(cell => {
            if (cell.solution) {
                cell.current = cell.solution;
            }
        });
    }

    /**
     * Get grid dimensions
     */
    getGridSize() {
        return this.gridSize;
    }

    /**
     * Get word data
     */
    getWordData() {
        return this.data;
    }

    /**
     * Get hints for a specific cell
     */
    getHintsForCell(row, col) {
        if (row >= 0 && row < this.gridSize.rows &&
            col >= 0 && col < this.gridSize.cols) {
            return this.grid[row][col].hints || [];
        }
        return [];
    }

    /**
     * Debug method to print grid info
     */
    debugGrid() {
        console.log('Grid Size:', this.gridSize);
        console.log('Words:', this.data.length);
        console.log('Hint cells:');

        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const cell = this.grid[row][col];
                if (cell.type === "hint" && cell.hints.length > 0) {
                    console.log(`  (${row},${col}):`, cell.hints.map(h => `${h.direction}: ${h.text}`));
                }
            }
        }
    }
}