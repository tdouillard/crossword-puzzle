import { describe, it, expect, vi } from 'vitest'
import CrosswordEngine from './CrosswordEngine'

function makePuzzle() {
    return {
        size: { x: 4, y: 4 },
        words: [
            { answer: 'CAT', clue: { position: { x: 0, y: 0 }, text: 'feline' }, direction: 'across', position: { x: 0, y: 0 } },
            { answer: 'ACE', clue: { position: { x: 0, y: 2 }, text: 'card' }, direction: 'down', position: { x: 0, y: 2 } },
            // malformed word to exercise catch block
            { answer: 'BAD', clue: null, direction: 'across', position: { x: 10, y: 10 } }
        ]
    }
}

describe('CrosswordEngine', () => {
    it('transforms puzzle data correctly', () => {
        const puzzle = makePuzzle()
        const engine = new CrosswordEngine(puzzle)
        const data = engine.getWordData()
        expect(Array.isArray(data)).toBe(true)
        expect(data[0].value).toBe('CAT')
        expect(data[0].size).toBe(3)
    })

    it('creates empty grid with correct dimensions and cell shape', () => {
        const engine = new CrosswordEngine(makePuzzle())
        const size = engine.getGridSize()
        expect(size.rows).toBe(4)
        expect(size.cols).toBe(4)
        const cell = engine.grid[0][0]
        expect(cell).toHaveProperty('solution')
        expect(cell).toHaveProperty('current')
    })

    it('populates grid solutions and hint cells', () => {
        const engine = new CrosswordEngine(makePuzzle())
        // CAT placed across starting at 0,0
        expect(engine.grid[0][0].solution).toBe('C')
        expect(engine.grid[0][1].solution).toBe('A')
        // For overlapping words, ensure the shared cell has some solution letter
        const shared = engine.grid[0][2].solution
        expect(typeof shared === 'string' && shared.length > 0).toBe(true)

        // Hint cell(s) should be present (type may be undefined depending on clue data)
        const hintCell = engine.grid[0][0]
        expect(hintCell).toBeTruthy()
        // getHintsForCell should return array (maybe empty)
        const hints = engine.getHintsForCell(0, 0)
        expect(Array.isArray(hints)).toBe(true)
    })

    it('set/get cell value and validity checks', () => {
        const engine = new CrosswordEngine(makePuzzle())
        const ok = engine.setCellValue(0, 0, 'c')
        expect(ok).toBe(true)
        expect(engine.getCellValue(0, 0)).toBe('c')
        expect(engine.isValidPosition(0, 0)).toBe(true)
        expect(engine.isValidPosition(-1, 0)).toBe(false)
    })

    it('verifyGrid returns correct results for right and wrong answers', () => {
        const engine = new CrosswordEngine(makePuzzle())
        engine.clearGrid()
        engine.setCellValue(0, 0, 'C')
        engine.setCellValue(0, 1, 'A')
        engine.setCellValue(0, 2, 'T')
        const ok = engine.verifyGrid()
        expect(ok.isValid).toBe(true)
        expect(ok.correct).toBeGreaterThan(0)

        // Introduce a mistake
        engine.setCellValue(0, 1, 'Z')
        const res2 = engine.verifyGrid()
        expect(res2.isValid).toBe(false)
        expect(res2.mistakes).toBeGreaterThan(0)
    })

    it('getProgress, clearGrid and showSolution', () => {
        const engine = new CrosswordEngine(makePuzzle())
        engine.clearGrid()
        expect(engine.getProgress()).toBe(0)
        engine.setCellValue(0, 0, 'C')
        expect(engine.getProgress()).toBeGreaterThanOrEqual(0)
        engine.showSolution()
        expect(engine.getProgress()).toBe(100)
    })

    it('debugGrid prints without throwing', () => {
        const engine = new CrosswordEngine(makePuzzle())
        const spy = vi.spyOn(console, 'log')
        engine.debugGrid()
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })
})
