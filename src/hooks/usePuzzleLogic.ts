import { useState, useCallback, useRef, useEffect } from 'react';

export interface Tile {
  id: number;
  currentPos: number;
  correctPos: number;
  isEmpty: boolean;
}

export const usePuzzleLogic = (size: number) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  const initPuzzle = useCallback(() => {
    const tileCount = size * size;
    const initialTiles: Tile[] = Array.from({ length: tileCount }, (_, i) => ({
      id: i,
      currentPos: i,
      correctPos: i,
      isEmpty: i === tileCount - 1,
    }));
    setTiles(initialTiles);
    setIsSolved(false);
  }, [size]);

  // Use a ref for tiles to avoid shuffle/moveTile dependency on tiles state
  // which can cause unnecessary re-renders or loops if used in effects
  const tilesRef = useRef<Tile[]>([]);
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  const isSolvable = (tilesArray: Tile[], boardSize: number) => {
    let inversions = 0;
    const array = tilesArray.filter(t => !t.isEmpty).map(t => t.id);
    for (let i = 0; i < array.length; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (array[i] > array[j]) inversions++;
      }
    }

    if (boardSize % 2 !== 0) return inversions % 2 === 0;
    
    const emptyTile = tilesArray.find(t => t.isEmpty)!;
    const emptyRowFromBottom = boardSize - Math.floor(emptyTile.currentPos / boardSize);
    return emptyRowFromBottom % 2 === 0 ? inversions % 2 !== 0 : inversions % 2 === 0;
  };

  const shuffle = useCallback(() => {
    let shuffled: Tile[];
    const currentTiles = [...tilesRef.current];
    do {
      shuffled = [...currentTiles].sort(() => Math.random() - 0.5)
        .map((tile, index) => ({ ...tile, currentPos: index }));
    } while (!isSolvable(shuffled, size) || shuffled.every(t => t.currentPos === t.correctPos));

    setTiles(shuffled);
    setIsSolved(false);
  }, [size]);

  const moveTile = useCallback((index: number) => {
    const currentTiles = [...tilesRef.current];
    const emptyIndex = currentTiles.findIndex(t => t.isEmpty);
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    if (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1) {
      const newTiles = [...currentTiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      newTiles[index].currentPos = index;
      newTiles[emptyIndex].currentPos = emptyIndex;

      setTiles(newTiles);
      if (newTiles.every(t => t.currentPos === t.correctPos)) setIsSolved(true);
      return true;
    }
    return false;
  }, [size]);

  return { tiles, isSolved, initPuzzle, shuffle, moveTile };
};
