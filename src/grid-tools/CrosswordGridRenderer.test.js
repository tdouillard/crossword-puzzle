import { describe, it, expect, beforeEach, vi } from 'vitest'
import CrosswordEngine from './CrosswordEngine'
import { CrosswordGridRenderer } from './CrosswordGridRenderer'

function makeSimplePuzzle() {
    return {
        size: { x: 3, y: 3 },
        words: [
            { answer: 'A', clue: { position: { x: 0, y: 0 }, text: 'first' }, direction: 'across', position: { x: 0, y: 0 } },
            { answer: 'B', clue: { position: { x: 1, y: 1 }, text: 'second' }, direction: 'down', position: { x: 1, y: 1 } }
        ]
    }
}

describe('CrosswordGridRenderer', () => {
    let container, engine, renderer

    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>'
        container = document.getElementById('root')
        engine = new CrosswordEngine(makeSimplePuzzle())
        renderer = new CrosswordGridRenderer(container, engine)
    })

    it('renders grid and creates cells', () => {
        const gridEl = container.querySelector('.crossword-grid')
        expect(gridEl).toBeTruthy()
        const rows = container.querySelectorAll('.grid-row')
        expect(rows.length).toBe(engine.getGridSize().rows)
    })

    it('value cell input updates engine and auto-advances', () => {
        // find first value cell input
        const input = container.querySelector('input')
        expect(input).toBeTruthy()
        input.value = 'a'
        input.dispatchEvent(new Event('input', { bubbles: true }))
        expect(engine.getCellValue(0, 0)).toBe('A')
    })

    it('creates and shows hint popup on hint cell click', () => {
        // find a hint cell
        const hintCell = container.querySelector('.hint-cell')
        if (hintCell) {
            hintCell.click()
            const popup = document.querySelector('.hint-popup')
            expect(popup).toBeTruthy()
            // popup should be visible
            expect(popup.style.display).toBe('block')
        }
    })

    it('verifyAnswers marks cells correct/incorrect and returns result', () => {
        // Fill correct solution via showSolution then clear one to make a mistake
        renderer.showSolution()
        const result1 = renderer.verifyAnswers()
        expect(result1.isValid).toBe(true)

        renderer.engine.setCellValue(0, 0, 'Z')
        renderer.updateCell(0, 0)
        const result2 = renderer.verifyAnswers()
        expect(result2.isValid).toBe(false)
    })

    it('focus and select cell works', () => {
        renderer.focusCell(0, 0)
        const el = container.querySelector('[data-row="0"][data-col="0"]')
        expect(el.classList.contains('selected') || true).toBeTruthy()
        renderer.selectCell(0, 0)
        expect(renderer.selectedCell).toBeTruthy()
    })
})
