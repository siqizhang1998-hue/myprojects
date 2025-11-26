import { GRID_SIZE, TILE_TYPES } from '../constants';
import { Tile, TileType, Position, SpecialType } from '../types';

export const generateGrid = (): Tile[] => {
  const grid: Tile[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let type: TileType;
      do {
        type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
      } while (
        (x >= 2 && grid[y * GRID_SIZE + (x - 1)]?.type === type && grid[y * GRID_SIZE + (x - 2)]?.type === type) ||
        (y >= 2 && grid[(y - 1) * GRID_SIZE + x]?.type === type && grid[(y - 2) * GRID_SIZE + x]?.type === type)
      );
      grid.push({
        id: `${x}-${y}-${Date.now()}-${Math.random()}`,
        type,
        x,
        y,
        isNew: true
      });
    }
  }
  return grid;
};

export const getTileAt = (grid: Tile[], x: number, y: number): Tile | undefined => {
  return grid.find(t => t.x === x && t.y === y);
};

export const findMatches = (grid: Tile[]): Tile[] => {
  const matchedTiles = new Set<Tile>();

  // Horizontal
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE - 2; x++) {
      const t1 = getTileAt(grid, x, y);
      const t2 = getTileAt(grid, x + 1, y);
      const t3 = getTileAt(grid, x + 2, y);
      if (t1 && t2 && t3 && t1.type === t2.type && t2.type === t3.type && !t1.isMatched && !t2.isMatched && !t3.isMatched) {
        matchedTiles.add(t1);
        matchedTiles.add(t2);
        matchedTiles.add(t3);
      }
    }
  }

  // Vertical
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE - 2; y++) {
      const t1 = getTileAt(grid, x, y);
      const t2 = getTileAt(grid, x, y + 1);
      const t3 = getTileAt(grid, x, y + 2);
      if (t1 && t2 && t3 && t1.type === t2.type && t2.type === t3.type && !t1.isMatched && !t2.isMatched && !t3.isMatched) {
        matchedTiles.add(t1);
        matchedTiles.add(t2);
        matchedTiles.add(t3);
      }
    }
  }

  return Array.from(matchedTiles);
};

export const canSwap = (p1: Position, p2: Position): boolean => {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

// Helper to group connected matched tiles to determine if it's a Match 4 or 5
export const groupMatches = (matches: Tile[]): Tile[][] => {
  const groups: Tile[][] = [];
  const visited = new Set<string>();

  const getNeighbors = (t: Tile, pool: Tile[]) => {
    return pool.filter(p => 
      !visited.has(p.id) && 
      p.type === t.type && 
      ((Math.abs(p.x - t.x) === 1 && p.y === t.y) || (Math.abs(p.y - t.y) === 1 && p.x === t.x))
    );
  };

  for (const tile of matches) {
    if (visited.has(tile.id)) continue;
    
    const group: Tile[] = [tile];
    visited.add(tile.id);
    const queue = [tile];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = getNeighbors(current, matches);
      for (const n of neighbors) {
        visited.add(n.id);
        group.push(n);
        queue.push(n);
      }
    }
    groups.push(group);
  }
  return groups;
};

// Helper to check if a move involves a special tile interaction
const isSpecialMove = (t1: Tile, t2: Tile): boolean => {
    // Rainbow interacts with anything
    if (t1.special === SpecialType.RAINBOW || t2.special === SpecialType.RAINBOW) return true;
    // Two specials interacting (e.g. Line + Line) could be valid in future updates, 
    // for now we ensure at least one is Rainbow or the swap results in a match.
    return false;
}

// Improved Hint Finder: Returns the PAIR of tiles to swap
export const findBestMove = (grid: Tile[]): [Tile, Tile] | null => {
  // Check Horizontal swaps
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE - 1; x++) {
      const t1 = getTileAt(grid, x, y);
      const t2 = getTileAt(grid, x + 1, y);
      if (t1 && t2) {
        // Special Check First
        if (isSpecialMove(t1, t2)) return [t1, t2];

        // Simulate swap
        const tempGrid = grid.map(t => {
          if (t.id === t1.id) return { ...t, x: t2.x, y: t2.y };
          if (t.id === t2.id) return { ...t, x: t1.x, y: t1.y };
          return t;
        });
        if (findMatches(tempGrid).length > 0) return [t1, t2];
      }
    }
  }
  // Check Vertical swaps
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE - 1; y++) {
      const t1 = getTileAt(grid, x, y);
      const t2 = getTileAt(grid, x, y + 1);
      if (t1 && t2) {
        // Special Check First
        if (isSpecialMove(t1, t2)) return [t1, t2];

        const tempGrid = grid.map(t => {
          if (t.id === t1.id) return { ...t, x: t2.x, y: t2.y };
          if (t.id === t2.id) return { ...t, x: t1.x, y: t1.y };
          return t;
        });
        if (findMatches(tempGrid).length > 0) return [t1, t2];
      }
    }
  }
  return null;
};