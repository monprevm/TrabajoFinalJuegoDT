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
