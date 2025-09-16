import CrosswordEngine from './src/grid-tools/CrosswordEngine.js';
import { CrosswordGridRenderer } from './src/grid-tools/CrosswordGridRenderer.js';


class CrosswordApp {
  constructor() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.init();
  }

  // Fetch JSON data asynchronously
  async loadPuzzleData() {
    try {
      const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? (import.meta.env.BASE_URL + 'crossword.json') : 'crossword.json';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const puzzleData = await response.json();
      return puzzleData;
    } catch (error) {
      console.error('Error loading puzzle data:', error);
      return null;
    }
  }

  async init() {
    try {

      const puzzleData = await this.loadPuzzleData();
      const rendererContainer = document.getElementById('crosswordGrid');
      console.log("=== INITIALISATION DU RENDERER ===", rendererContainer, puzzleData);
      this.gridRenderer = new CrosswordGridRenderer(rendererContainer, new CrosswordEngine(puzzleData));

    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      this.showStatus('⌐ Erreur lors du chargement des données', 'error');
    }
  }

}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CrosswordApp();
});

// Export for potential external use
new CrosswordApp()