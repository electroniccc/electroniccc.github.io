class GameBotWolf {
	constructor(game) {
		this.game = game;

		this.locations = game.getLoc();

		this.wolfLoc = this.getWolfLoc();
	}

	getWolfLoc() {
		const ret = [];

		for(let i = 0; i < CELL_COUNT; i++) {
			for(let j = 0; j < CELL_COUNT; j++) {
				if(this.locations[i][j] == WOLF) {
					ret.push([i, j]);
					if(ret.length == 2) return ret;
				}
			}
		}

		return ret;
	}

	next(fromX, fromY, toX, toY) {
		const locations = this.locations;
		locations[toX][toY] = locations[fromX][fromY];
		locations[fromX][fromY] = 0;

		let choosedWolf = [0, 0];
		let x = 0, y = 0;

		const pairs = [];
		for(let i = 0; i < this.wolfLoc.length; i++) {
			const sheeps = this.hasSheepToEat(this.wolfLoc[i]);
			if(sheeps.length == 0) continue;
			for(let sheep of sheeps) pairs.push([this.wolfLoc[i], sheep]);
		}

		if(pairs.length == 0) {
			[choosedWolf, [x, y]] = this.chooseLocNoWhenSheep();
		} else {
			[choosedWolf, [x, y]] = pairs[0];
		}

		const ret = [choosedWolf[0], choosedWolf[1], x, y];
		
		this.locations[choosedWolf[0]][choosedWolf[1]] = 0;
		this.locations[x][y] = WOLF;
		choosedWolf[0] = x;
		choosedWolf[1] = y;

		console.log(ret);
		return ret;
	}

	chooseLocNoWhenSheep() {
		let choosedWolf = null;
		let choosedLoc = [0, 0];
		let sheepCount = 0;

		for(let wolf of this.wolfLoc) {
			const [x, y] = wolf;
			const locs = [[x, y-1], [x, y+1], [x-1, y], [x+1, y]];

			for(let loc of locs) {
				if(!this.locAvailable(loc)) continue;
				// suppose that this wolf move to this location
				// find out how many sheeps to eat
				wolf[0] = loc[0];
				wolf[1] = loc[1];
				let sheeps = [];
				for(let tmpWolf of this.wolfLoc) {
					sheeps = sheeps.concat(this.hasSheepToEat(tmpWolf));
				}
				wolf[0] = x;
				wolf[1] = y;

				if(sheepCount < sheeps.length || !choosedWolf) {
					sheepCount = sheeps.length;
					choosedWolf = wolf;
					choosedLoc = loc;
				}
			}
		}

		if(!choosedWolf) debugger;
		return [choosedWolf, choosedLoc]
	}

	hasSheepToEat(wolf) {
		const [x, y] = wolf;
		const ret = [];
		const locs = [[x, y-2], [x, y+2], [x-2, y], [x+2, y]];

		for(let loc of locs) {
			if(this.game.validLoc(loc) && this.canEat(wolf, loc))
				ret.push(loc);
		}

		return ret;
	}

	isSheep([x, y]) {
		return this.locations[x][y] == SHEEP;
	}

	canEat(wolf, loc) {
		const [wx, wy] = wolf;
		const [sx, sy] = loc;

		if(this.locations[sx][sy] != SHEEP) return false;
		if(wx != sx && wy != sy) return false;
		if(this.game.locDistance(wx, wy, sx, sy) != 2) return false;
		if(wx == sx && this.locations[wx][(wy+sy)/2]) return false;
		if(wy == sy && this.locations[(wx+sx)/2][wy]) return false;

		return true;
	}

	locAvailable([x, y]) {
		return x >= 0 && x < CELL_COUNT && y >= 0 && y < CELL_COUNT && !this.locations[x][y];
	}
}
