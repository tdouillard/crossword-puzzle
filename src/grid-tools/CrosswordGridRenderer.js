/**
 * Simplified Grid Renderer - Handles DOM manipulation for the crossword grid
 */
export class CrosswordGridRenderer {
    constructor(containerElement, engine) {
        this.container = containerElement;
        this.engine = engine;
        this.cells = {};
        this.selectedCell = null;
        this.hintPopup = null;
        console.log('engine', engine);
        this.render();
        this.createHintPopup();
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for grid interaction
     */
    setupEventListeners() {
        // Close hint popup when clicking outside
        document.addEventListener('click', (e) => {
            if (this.hintPopup && !this.hintPopup.contains(e.target) && !e.target.closest('.hint-cell')) {
                this.hideHintPopup();
            }
        });

        // Close hint popup on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.hintPopup && this.hintPopup.style.display === 'block') {
                this.hideHintPopup();
            }
        });
    }

    /**
     * Render the crossword grid
     */
    render() {
        this.container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'crossword-grid';

        const { rows, cols } = this.engine.getGridSize();

        for (let row = 0; row < rows; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'grid-row';

            for (let col = 0; col < cols; col++) {
                const cell = this.createCell(row, col);
                rowElement.appendChild(cell);

                // Store reference for easy access
                if (!this.cells[row]) this.cells[row] = {};
                this.cells[row][col] = cell;
            }

            grid.appendChild(rowElement);
        }

        this.container.appendChild(grid);
    }

    /**
     * Create a single cell element based on cell type
     */
    createCell(row, col) {
        const cellData = this.engine.grid[row][col];
        const cellElement = document.createElement('div');
        cellElement.className = 'grid-cell';
        cellElement.dataset.row = row;
        cellElement.dataset.col = col;

        // Check if cell has a solution (is part of the puzzle)
        if (!cellData.solution) {
            cellElement.classList.add('black');
            return cellElement;
        }

        // Determine cell type and render accordingly
        if (cellData.type === 'hint') {
            return this.createHintCell(cellElement, row, col);
        } else {
            return this.createValueCell(cellElement, row, col);
        }
    }

    /**
     * Create a hint cell (shows hints, no input)
     */
    createHintCell(cellElement, row, col) {
        cellElement.classList.add('white', 'hint-type', 'hint-cell');

        // Get hints for this cell
        const hints = this.getHintsForCell(row, col);

        if (hints.length > 0) {
            // Create container for hint content
            const hintContent = document.createElement('div');
            hintContent.className = 'hint-content';

            hints.forEach(hint => {
                const hintItem = document.createElement('div');
                hintItem.className = 'hint-item-inline';

                // Add direction arrow
                const arrow = document.createElement('span');
                arrow.className = 'hint-arrow';
                arrow.innerHTML = hint.direction === 'across' ? '→' : '↓';

                // Add hint text (truncated if too long)
                const hintText = document.createElement('span');
                hintText.className = 'hint-text';
                const maxLength = 15; // Adjust based on cell size
                const displayText = hint.hint.length > maxLength ?
                    hint.hint.substring(0, maxLength) + '...' :
                    hint.hint;
                hintText.textContent = displayText;
                hintText.title = hint.hint; // Full text on hover

                hintItem.appendChild(arrow);
                hintItem.appendChild(hintText);
                hintContent.appendChild(hintItem);
            });

            cellElement.appendChild(hintContent);

            // Add click event for hint popup
            cellElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showHintPopup(cellElement, hints, row, col);
            });
        }

        return cellElement;
    }

    /**
     * Create a value cell (has input for user answers)
     */
    createValueCell(cellElement, row, col) {
        const cellData = this.engine.grid[row][col];
        cellElement.classList.add('white', 'value-type');

        // Add input element
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.value = cellData.current;

        // Event listeners for input
        input.addEventListener('input', (e) => {
            this.handleInput(row, col, e.target.value);
        });

        input.addEventListener('keydown', (e) => {
            this.handleKeydown(row, col, e);
        });

        input.addEventListener('focus', () => {
            this.selectCell(row, col);
        });

        input.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectCell(row, col);
        });

        cellElement.appendChild(input);
        return cellElement;
    }

    /**
     * Focus on the first value cell related to a hint cell
     */
    focusRelatedValueCell(hintRow, hintCol) {
        // Find the first value cell that's part of words starting at this hint position
        const hints = this.getHintsForCell(hintRow, hintCol);

        if (hints.length > 0) {
            const firstHint = hints[0];
            const { direction, start } = firstHint;

            // Find the first value cell in this word
            let searchRow = start.row;
            let searchCol = start.col;

            // Move to first value cell
            while (this.engine.isValidPosition(searchRow, searchCol)) {
                const cell = this.engine.grid[searchRow][searchCol];
                if (cell.type === 'value') {
                    this.focusCell(searchRow, searchCol);
                    return;
                }

                // Move to next cell in word direction
                if (direction === 'across') {
                    searchCol++;
                } else {
                    searchRow++;
                }
            }
        }
    }

    /**
     * Get hints for a specific cell (only for hint cells)
     */
    getHintsForCell(row, col) {
        const hints = [];

        // Find words that start at this position
        this.engine.getWordData().forEach(word => {
            if (word.start.row === row && word.start.col === col) {
                hints.push({
                    direction: word.direction,
                    hint: word.hint,
                    value: word.value,
                    size: word.size,
                    start: word.start
                });
            }
        });

        return hints;
    }

    /**
     * Handle user input in value cells
     */
    handleInput(row, col, value) {
        // Filter out non-letter characters
        const filteredValue = value.replace(/[^a-zA-Z]/g, '').toUpperCase();

        if (filteredValue !== value) {
            const input = this.cells[row][col].querySelector('input');
            input.value = filteredValue;
        }

        // Update engine
        this.engine.setCellValue(row, col, filteredValue);

        // Auto-advance to next cell if a letter was entered
        if (filteredValue) {
            this.moveToNextValueCell(row, col);
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(row, col, event) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.moveInDirection(row, col, -1, 0);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.moveInDirection(row, col, 1, 0);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.moveInDirection(row, col, 0, -1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.moveInDirection(row, col, 0, 1);
                break;
            case 'Backspace':
                if (!event.target.value) {
                    event.preventDefault();
                    this.moveInDirection(row, col, 0, -1);
                }
                break;
            case 'Delete':
                event.preventDefault();
                this.engine.setCellValue(row, col, '');
                this.updateCell(row, col);
                break;
            case 'Tab':
                event.preventDefault();
                this.moveToNextHintCell(row, col);
                break;
        }
    }

    /**
     * Move in a specific direction (only to value cells)
     */
    moveInDirection(row, col, rowOffset, colOffset) {
        const newRow = row + rowOffset;
        const newCol = col + colOffset;

        if (this.engine.isValidPosition(newRow, newCol)) {
            const cell = this.engine.grid[newRow][newCol];
            if (cell.type === 'value') {
                this.focusCell(newRow, newCol);
            }
        }
    }

    /**
     * Move to next value cell (auto-advance after input)
     */
    moveToNextValueCell(row, col) {
        // Try right first, then down, but only to value cells
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up

        for (const [rowOffset, colOffset] of directions) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (this.engine.isValidPosition(newRow, newCol)) {
                const cell = this.engine.grid[newRow][newCol];
                if (cell.type === 'value') {
                    this.focusCell(newRow, newCol);
                    return;
                }
            }
        }
    }

    /**
     * Move to next hint cell (for Tab navigation)
     */
    moveToNextHintCell(currentRow, currentCol) {
        const { rows, cols } = this.engine.getGridSize();

        // Find next hint cell after current position
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip cells before current position
                if (row < currentRow || (row === currentRow && col <= currentCol)) {
                    continue;
                }

                if (this.engine.grid[row][col].type === 'hint') {
                    this.focusRelatedValueCell(row, col);
                    return;
                }
            }
        }

        // If no hint cell found after current, start from beginning
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (this.engine.grid[row][col].type === 'hint') {
                    this.focusRelatedValueCell(row, col);
                    return;
                }
            }
        }
    }

    /**
     * Focus on a specific cell (only value cells can be focused)
     */
    focusCell(row, col) {
        if (this.engine.isValidPosition(row, col)) {
            const cell = this.engine.grid[row][col];
            if (cell.type === 'value') {
                const input = this.cells[row][col].querySelector('input');
                if (input) {
                    input.focus();
                    input.select();
                }
            }
        }
    }

    /**
     * Select a cell (visual feedback)
     */
    selectCell(row, col) {
        // Remove previous selection
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        // Add new selection
        if (this.cells[row] && this.cells[row][col]) {
            this.selectedCell = this.cells[row][col];
            this.selectedCell.classList.add('selected');
        }
    }

    /**
     * Update a specific cell display
     */
    updateCell(row, col) {
        const cellData = this.engine.grid[row][col];
        const cellElement = this.cells[row][col];

        if (cellElement && cellData.solution && cellData.type === 'value') {
            const input = cellElement.querySelector('input');
            if (input) {
                input.value = cellData.current;
            }
        }
    }

    /**
     * Update all cells display
     */
    updateAllCells() {
        const { rows, cols } = this.engine.getGridSize();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.updateCell(row, col);
            }
        }
    }

    /**
     * Create hint popup
     */
    createHintPopup() {
        this.hintPopup = document.createElement('div');
        this.hintPopup.className = 'hint-popup';
        this.hintPopup.style.display = 'none';

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'hint-popup-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => this.hideHintPopup());
        this.hintPopup.appendChild(closeBtn);

        document.body.appendChild(this.hintPopup);
    }

    /**
     * Show hint popup
     */
    showHintPopup(hintElement, hints, row, col) {
        if (!this.hintPopup || hints.length === 0) return;

        // Clear previous content (except close button)
        const closeBtn = this.hintPopup.querySelector('.hint-popup-close');
        this.hintPopup.innerHTML = '';
        this.hintPopup.appendChild(closeBtn);

        // Add title
        const title = document.createElement('div');
        title.className = 'hint-popup-title';
        title.textContent = `Hints for position (${row}, ${col})`;
        this.hintPopup.appendChild(title);

        // Add hints
        hints.forEach(hint => {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'hint-item';

            const directionLabel = document.createElement('div');
            directionLabel.className = 'hint-direction';
            directionLabel.textContent = hint.direction.toUpperCase();

            const clueText = document.createElement('div');
            clueText.className = 'hint-clue';
            clueText.textContent = hint.hint;

            const answerLength = document.createElement('div');
            answerLength.className = 'hint-length';
            answerLength.textContent = `(${hint.size} letters)`;

            hintDiv.appendChild(directionLabel);
            hintDiv.appendChild(clueText);
            hintDiv.appendChild(answerLength);

            // Add click to focus on related value cells
            hintDiv.addEventListener('click', () => {
                this.focusRelatedValueCell(row, col);
                this.hideHintPopup();
            });

            this.hintPopup.appendChild(hintDiv);
        });

        // Position popup near the hint cell
        this.positionHintPopup(hintElement);

        // Show popup
        this.hintPopup.style.display = 'block';
    }

    /**
     * Position hint popup near the hint element
     */
    positionHintPopup(hintElement) {
        const rect = hintElement.getBoundingClientRect();
        const popupRect = this.hintPopup.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Default position: below and to the right of hint element
        let left = rect.right + 10;
        let top = rect.bottom + 10;

        // Adjust if popup would go off screen
        if (left + popupRect.width > viewportWidth) {
            left = rect.left - popupRect.width - 10;
        }

        if (top + popupRect.height > viewportHeight) {
            top = rect.top - popupRect.height - 10;
        }

        // Ensure popup stays within viewport
        left = Math.max(10, Math.min(left, viewportWidth - popupRect.width - 10));
        top = Math.max(10, Math.min(top, viewportHeight - popupRect.height - 10));

        this.hintPopup.style.left = `${left}px`;
        this.hintPopup.style.top = `${top}px`;
    }

    /**
     * Hide hint popup
     */
    hideHintPopup() {
        if (this.hintPopup) {
            this.hintPopup.style.display = 'none';
        }
    }

    /**
     * Clear the grid (reset all current values)
     */
    clearGrid() {
        this.engine.clearGrid();
        this.updateAllCells();
    }

    /**
     * Show solution in the grid
     */
    showSolution() {
        this.engine.showSolution();
        this.updateAllCells();
    }

    /**
     * Verify answers and show results
     */
    verifyAnswers() {
        const result = this.engine.verifyGrid();

        // Update cell styling based on correctness (only for value cells)
        const { rows, cols } = this.engine.getGridSize();
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellData = this.engine.grid[row][col];
                const cellElement = this.cells[row][col];

                if (cellData.solution && cellData.type === 'value' && cellElement) {
                    cellElement.classList.remove('correct', 'incorrect');

                    if (cellData.current) {
                        if (cellData.current.toUpperCase() === cellData.solution.toUpperCase()) {
                            cellElement.classList.add('correct');
                        } else {
                            cellElement.classList.add('incorrect');
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * Get current progress
     */
    getProgress() {
        return this.engine.getProgress();
    }

    /**
     * Flash a cell (for feedback)
     */
    flashCell(row, col) {
        const cellElement = this.cells[row][col];
        if (cellElement) {
            cellElement.style.animation = 'flash 0.5s ease-in-out';
            setTimeout(() => {
                cellElement.style.animation = '';
            }, 500);
        }
    }
}