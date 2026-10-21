export const WALL = 1;
export const FLOOR = 0;

export class MazeGenerator {
  constructor({ cols, rows, random }) {
    this.cols = cols;
    this.rows = rows;
    this.random = random;
    this.grid = [];
    this.startCell = { col: 0, row: 0 };
  }

  generate() {
    const width = this.cols * 2 + 1;
    const height = this.rows * 2 + 1;
    this.grid = Array.from({ length: height }, () => Array(width).fill(WALL));

    const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
    const stack = [];
    const first = { col: this.startCell.col, row: this.startCell.row };
    visited[first.row][first.col] = true;
    this.#openCell(first.col, first.row);
    stack.push(first);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.#unvisitedNeighbors(current, visited);
      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }
      const next = this.random.pick(neighbors);
      this.#carveBetween(current, next);
      visited[next.row][next.col] = true;
      this.#openCell(next.col, next.row);
      stack.push(next);
    }

    return this.grid;
  }

  #unvisitedNeighbors(cell, visited) {
    const directions = [
      { col: 0, row: -1 },
      { col: 0, row: 1 },
      { col: -1, row: 0 },
      { col: 1, row: 0 },
    ];
    const result = [];
    for (const dir of directions) {
      const col = cell.col + dir.col;
      const row = cell.row + dir.row;
      if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) continue;
      if (visited[row][col]) continue;
      result.push({ col, row });
    }
    return result;
  }

  #carveBetween(a, b) {
    const wallX = a.col + b.col + 1;
    const wallY = a.row + b.row + 1;
    this.grid[wallY][wallX] = FLOOR;
  }

  #openCell(col, row) {
    this.grid[row * 2 + 1][col * 2 + 1] = FLOOR;
  }

  width() {
    return this.grid.length > 0 ? this.grid[0].length : 0;
  }

  height() {
    return this.grid.length;
  }

  isWallAt(tileX, tileY) {
    if (tileX < 0 || tileY < 0 || tileX >= this.width() || tileY >= this.height()) {
      return true;
    }
    return this.grid[tileY][tileX] === WALL;
  }

  openTiles() {
    const tiles = [];
    for (let y = 0; y < this.height(); y += 1) {
      for (let x = 0; x < this.width(); x += 1) {
        if (this.grid[y][x] === FLOOR) tiles.push({ x, y });
      }
    }
    return tiles;
  }

  distancesFrom(startTile) {
    const width = this.width();
    const height = this.height();
    const dist = Array.from({ length: height }, () => Array(width).fill(-1));
    const queue = [{ x: startTile.x, y: startTile.y }];
    dist[startTile.y][startTile.x] = 0;
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];
      for (const next of neighbors) {
        if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) continue;
        if (dist[next.y][next.x] !== -1) continue;
        if (this.grid[next.y][next.x] === WALL) continue;
        dist[next.y][next.x] = dist[current.y][current.x] + 1;
        queue.push(next);
      }
    }
    return dist;
  }

  farthestTileFrom(startTile, excluded = new Set()) {
    const dist = this.distancesFrom(startTile);
    let best = null;
    let bestDistance = -1;
    for (const tile of this.openTiles()) {
      const key = `${tile.x},${tile.y}`;
      if (excluded.has(key)) continue;
      const d = dist[tile.y][tile.x];
      if (d > bestDistance) {
        bestDistance = d;
        best = tile;
      }
    }
    return best;
  }

  hasLineOfSight(x1, y1, x2, y2, tileSize) {
    const distance = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(distance / (tileSize * 0.4)));
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      const tileX = Math.floor(px / tileSize);
      const tileY = Math.floor(py / tileSize);
      if (this.isWallAt(tileX, tileY)) return false;
    }
    return true;
  }
}
