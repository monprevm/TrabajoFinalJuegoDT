import { FLOOR, WALL } from './MazeGenerator.js';

export class LevelLayout {
  constructor(maze, random, levelConfig) {
    this.maze = maze;
    this.random = random;
    this.levelConfig = levelConfig;
  }

  place() {
    const playerTile = { x: 1, y: 1 };
    const used = new Set([`${playerTile.x},${playerTile.y}`]);

    const doorTile = this.maze.farthestTileFrom(playerTile, used);
    used.add(`${doorTile.x},${doorTile.y}`);

    const keyTiles = this.#pickSpreadTiles(playerTile, this.levelConfig.keyCount, used, new Set([
      `${doorTile.x},${doorTile.y}`,
    ]));
    for (const tile of keyTiles) used.add(`${tile.x},${tile.y}`);

    const chestTiles = this.#pickTilesAtDistance(
      playerTile,
      this.levelConfig.chestCount,
      this.levelConfig.minChestDistanceFromPlayer,
      used,
    );
    for (const tile of chestTiles) used.add(`${tile.x},${tile.y}`);

    const mushroomPairs = this.#pickMushroomPairs(
      playerTile,
      this.levelConfig.mushroomPairCount ?? 0,
      this.levelConfig.mushroomMinDistanceFromPlayer ?? this.levelConfig.minItemDistanceFromPlayer,
      used,
    );

    const ogreTiles = this.#pickSpreadTilesAtDistance(
      playerTile,
      this.levelConfig.ogreCount ?? 0,
      this.levelConfig.ogreMinDistanceFromPlayer ?? this.levelConfig.minSpawnDistanceFromPlayer,
      used,
      10,
    );
    for (const tile of ogreTiles) used.add(`${tile.x},${tile.y}`);

    const elfGroups = this.#pickEnemyGroups(
      playerTile,
      this.levelConfig.elfGroups,
      this.levelConfig.elfPerGroupMin,
      this.levelConfig.elfPerGroupMax,
      used,
    );
    const zombieGroups = this.#pickEnemyGroups(
      playerTile,
      this.levelConfig.zombieGroups,
      this.levelConfig.zombiePerGroupMin,
      this.levelConfig.zombiePerGroupMax,
      used,
    );

    return {
      playerTile,
      doorTile,
      keyTiles,
      chestTiles,
      mushroomPairs,
      ogreTiles,
      elfGroups,
      zombieGroups,
    };
  }

  #pickSpreadTiles(origin, count, used, alsoAvoid = new Set()) {
    const dist = this.maze.distancesFrom(origin);
    const candidates = this.maze
      .openTiles()
      .filter((tile) => {
        const key = `${tile.x},${tile.y}`;
        return !used.has(key) && !alsoAvoid.has(key);
      })
      .map((tile) => ({ ...tile, distance: dist[tile.y][tile.x] }))
      .filter((tile) => tile.distance >= this.levelConfig.minItemDistanceFromPlayer)
      .sort((a, b) => b.distance - a.distance);

    const picked = [];
    for (const candidate of candidates) {
      if (picked.length >= count) break;
      const tooClose = picked.some(
        (tile) => Math.abs(tile.x - candidate.x) + Math.abs(tile.y - candidate.y) < 8,
      );
      if (!tooClose) picked.push(candidate);
    }

    while (picked.length < count && candidates.length > 0) {
      picked.push(candidates[picked.length]);
    }
    return picked.map(({ x, y }) => ({ x, y }));
  }

  #pickTilesAtDistance(origin, count, minDistance, used) {
    const dist = this.maze.distancesFrom(origin);
    const candidates = this.maze
      .openTiles()
      .filter((tile) => {
        const key = `${tile.x},${tile.y}`;
        return !used.has(key) && dist[tile.y][tile.x] >= minDistance;
      });
    return this.random.shuffle(candidates).slice(0, count);
  }

  #pickSpreadTilesAtDistance(origin, count, minDistance, used, spacing) {
    if (count <= 0) return [];
    const dist = this.maze.distancesFrom(origin);
    const candidates = this.maze
      .openTiles()
      .filter((tile) => {
        const key = `${tile.x},${tile.y}`;
        return !used.has(key) && dist[tile.y][tile.x] >= minDistance;
      })
      .sort((a, b) => dist[b.y][b.x] - dist[a.y][a.x]);

    const picked = [];
    for (const candidate of candidates) {
      if (picked.length >= count) break;
      const tooClose = picked.some(
        (tile) => Math.abs(tile.x - candidate.x) + Math.abs(tile.y - candidate.y) < spacing,
      );
      if (!tooClose) picked.push(candidate);
    }

    for (const candidate of candidates) {
      if (picked.length >= count) break;
      if (!picked.includes(candidate)) picked.push(candidate);
    }
    return picked;
  }

  #pickMushroomPairs(origin, count, minDistance, used) {
    if (count <= 0) return [];
    const dist = this.maze.distancesFrom(origin);
    const candidates = [];

    for (let y = 1; y < this.maze.height() - 1; y += 1) {
      for (let x = 1; x < this.maze.width() - 1; x += 1) {
        if (this.maze.grid[y][x] !== WALL) continue;
        const options = [
          {
            orientation: 'horizontal',
            a: { x: x - 1, y },
            b: { x: x + 1, y },
          },
          {
            orientation: 'vertical',
            a: { x, y: y - 1 },
            b: { x, y: y + 1 },
          },
        ];

        for (const option of options) {
          if (this.maze.grid[option.a.y][option.a.x] !== FLOOR) continue;
          if (this.maze.grid[option.b.y][option.b.x] !== FLOOR) continue;
          const aKey = `${option.a.x},${option.a.y}`;
          const bKey = `${option.b.x},${option.b.y}`;
          if (used.has(aKey) || used.has(bKey)) continue;
          const pairDistance = Math.min(
            dist[option.a.y][option.a.x],
            dist[option.b.y][option.b.x],
          );
          if (pairDistance < minDistance) continue;
          candidates.push({
            ...option,
            wall: { x, y },
          });
        }
      }
    }

    const picked = [];
    const takenTiles = new Set();
    const takenWalls = new Set();
    for (const candidate of this.random.shuffle(candidates)) {
      if (picked.length >= count) break;
      const aKey = `${candidate.a.x},${candidate.a.y}`;
      const bKey = `${candidate.b.x},${candidate.b.y}`;
      const wallKey = `${candidate.wall.x},${candidate.wall.y}`;
      if (takenTiles.has(aKey) || takenTiles.has(bKey) || takenWalls.has(wallKey)) continue;
      takenTiles.add(aKey);
      takenTiles.add(bKey);
      takenWalls.add(wallKey);
      used.add(aKey);
      used.add(bKey);
      picked.push({
        a: candidate.a,
        b: candidate.b,
        wall: candidate.wall,
        orientation: candidate.orientation,
      });
    }
    return picked;
  }

  #pickEnemyGroups(origin, groupCount, minPerGroup, maxPerGroup, used) {
    const groups = this.#pickTilesAtDistance(
      origin,
      groupCount,
      this.levelConfig.minSpawnDistanceFromPlayer,
      used,
    );
    return groups.map((center) => {
      const size = this.random.int(minPerGroup, maxPerGroup);
      const spawnTiles = [center];
      const nearby = this.random.shuffle(
        this.maze.openTiles().filter((tile) => {
          const key = `${tile.x},${tile.y}`;
          if (used.has(key)) return false;
          if (tile.x === center.x && tile.y === center.y) return false;
          return Math.abs(tile.x - center.x) + Math.abs(tile.y - center.y) <= 4;
        }),
      );
      for (const tile of nearby) {
        if (spawnTiles.length >= size) break;
        spawnTiles.push(tile);
        used.add(`${tile.x},${tile.y}`);
      }
      used.add(`${center.x},${center.y}`);
      return spawnTiles;
    });
  }
}
