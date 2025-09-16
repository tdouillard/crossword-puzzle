/**
 * Clue Manager - Handles clue display and interaction
 */
export default class CrosswordClueManager {
    constructor(acrossContainer, downContainer, engine) {
        this.acrossContainer = acrossContainer;
        this.downContainer = downContainer;
        this.engine = engine;
        this.clueElements = {};

        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        this.engine.on('wordSelected', (data) => {
            this.highlightClue(data.direction, data.number);
        });

        this.engine.on('wordCompleted', (data) => {
            this.markClueAsCompleted(data.direction, data.number, data.isCorrect);
        });

        this.engine.on('answersChecked', (data) => {
            this.updateClueStatuses(data.results);
        });

        this.engine.on('gridCleared', () => {
            this.clearAllClueStatuses();
        });

        this.engine.on('solutionShown', () => {
            this.markAllCluesAsCompleted();
        });
    }

    render() {
        this.renderClues(this.acrossContainer, this.engine.puzzleData.words.across, 'across');
        this.renderClues(this.downContainer, this.engine.puzzleData.words.down, 'down');
    }

    renderClues(container, words, direction) {
        container.innerHTML = '';

        words.forEach(word => {
            const clueElement = this.createClueElement(word, direction);
            container.appendChild(clueElement);

            // Store reference
            if (!this.clueElements[direction]) {
                this.clueElements[direction] = {};
            }
            this.clueElements[direction][word.number] = clueElement;
        });
    }

    createClueElement(word, direction) {
        const clueItem = document.createElement('div');
        clueItem.className = 'clue-item';
        clueItem.dataset.direction = direction;
        clueItem.dataset.number = word.number;

        const clueNumber = document.createElement('span');
        clueNumber.className = 'clue-number';
        clueNumber.textContent = `${word.number}.`;

        const clueText = document.createElement('span');
        clueText.className = 'clue-text';
        clueText.textContent = word.clue;

        clueItem.appendChild(clueNumber);
        clueItem.appendChild(clueText);

        // Add click handler
        clueItem.addEventListener('click', () => {
            this.selectClue(direction, word.number);
        });

        return clueItem;
    }

    selectClue(direction, number) {
        // Select the word in the engine
        this.engine.selectWord(direction, number);

        // Focus on the first cell of the word
        const word = this.engine.getWord(direction, number);
        if (word) {
            const firstCell = document.querySelector(
                `[data-row="${word.startRow}"][data-col="${word.startCol}"] input`
            );
            if (firstCell) {
                firstCell.focus();
            }
        }
    }

    highlightClue(direction, number) {
        // Clear all highlights
        this.clearClueHighlights();

        // Add highlight to selected clue
        const clueElement = this.clueElements[direction]?.[number];
        if (clueElement) {
            clueElement.classList.add('active');
        }
    }

    clearClueHighlights() {
        Object.values(this.clueElements).forEach(directionClues => {
            Object.values(directionClues).forEach(clueElement => {
                clueElement.classList.remove('active');
            });
        });
    }

    markClueAsCompleted(direction, number, isCorrect) {
        const clueElement = this.clueElements[direction]?.[number];
        if (clueElement) {
            clueElement.classList.remove('completed');
            if (isCorrect) {
                clueElement.classList.add('completed');
            }
        }
    }

    updateClueStatuses(results) {
        // Clear all completion statuses
        this.clearAllClueStatuses();

        // Update based on results
        results.forEach(result => {
            if (result.isComplete && result.isCorrect) {
                this.markClueAsCompleted(result.direction, result.number, true);
            }
        });
    }

    clearAllClueStatuses() {
        Object.values(this.clueElements).forEach(directionClues => {
            Object.values(directionClues).forEach(clueElement => {
                clueElement.classList.remove('completed');
            });
        });
    }

    markAllCluesAsCompleted() {
        Object.values(this.clueElements).forEach(directionClues => {
            Object.values(directionClues).forEach(clueElement => {
                clueElement.classList.add('completed');
            });
        });
    }

    getClueElement(direction, number) {
        return this.clueElements[direction]?.[number];
    }

    scrollToClue(direction, number) {
        const clueElement = this.getClueElement(direction, number);
        if (clueElement) {
            clueElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }
}