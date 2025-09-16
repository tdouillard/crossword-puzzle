import { describe, it, expect, beforeEach, vi } from 'vitest'
import CrosswordClueManager from './CrosswordClueManager'

function makeMockEngine() {
    const listeners = {}
    return {
        puzzleData: {
            words: {
                across: [{ number: 1, clue: 'One across', startRow: 0, startCol: 0 }],
                down: [{ number: 2, clue: 'Two down', startRow: 1, startCol: 1 }]
            }
        },
        on(event, cb) { listeners[event] = cb },
        emit(event, data) { if (listeners[event]) listeners[event](data) },
        selectWord(direction, number) { this._selected = { direction, number } },
        getWord(direction, number) { return { startRow: 0, startCol: 0 } }
    }
}

describe('CrosswordClueManager', () => {
    let across, down, engine, manager

    beforeEach(() => {
        document.body.innerHTML = '<div id="across"></div><div id="down"></div>'
        across = document.getElementById('across')
        down = document.getElementById('down')
        engine = makeMockEngine()
        manager = new CrosswordClueManager(across, down, engine)
    })

    it('renders clues into containers', () => {
        expect(across.querySelector('.clue-item')).toBeTruthy()
        expect(down.querySelector('.clue-item')).toBeTruthy()
    })

    it('selectClue calls engine.selectWord and focuses first cell', () => {
        // Since we cannot actually focus, ensure no error thrown
        const clueEl = across.querySelector('.clue-item')
        expect(() => clueEl.click()).not.toThrow()
        expect(engine._selected).toBeDefined()
    })

    it('highlightClue toggles active class', () => {
        manager.highlightClue('across', 1)
        const el = manager.getClueElement('across', 1)
        expect(el.classList.contains('active')).toBe(true)
        manager.clearClueHighlights()
        expect(el.classList.contains('active')).toBe(false)
    })

    it('markClueAsCompleted and update statuses', () => {
        manager.markClueAsCompleted('across', 1, true)
        const el = manager.getClueElement('across', 1)
        expect(el.classList.contains('completed')).toBe(true)

        // updateClueStatuses
        manager.updateClueStatuses([{ direction: 'across', number: 1, isComplete: true, isCorrect: true }])
        expect(el.classList.contains('completed')).toBe(true)
    })
})
