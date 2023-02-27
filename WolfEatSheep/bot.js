class GameBot {
	constructor(game) {
		this.game = game;

		this.locations = game.getLoc();

		this.sheepCount = this.getSheepCount();
	}

	moveLoc(fromX, fromY, toX, toY) {
		const locations = this.locations;
		locations[toX][toY] = locations[fromX][fromY];
		locations[fromX][fromY] = 0;

		if(locations[fromX][fromY] == WOLF && locations[toX][toY] == SHEEP) {
			this.sheepCount -= 1;
		}
	}

	getSheepCount() {
		let sheepCount = 0;
		for(let i = 0; i < this.locations.length; i++) {
			for(let j = 0; j < this.locations.length; j++) {
				if(this.locations[i][j] === SHEEP) sheepCount += 1;
			}
		}

		return sheepCount;
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

	canEat(wolf, loc) {
		const [wx, wy] = wolf;
		const [sx, sy] = loc;

		if(this.locations[sx][sy] != SHEEP) return false;
		if(wx != sx && wy != sy) return false;
		if(this.game.locDistance(wx, wy, sx, sy) != 2) return false;
		if(wx == sx && this.locations[wx][Math.floor((wy+sy)/2)]) return false;
		if(wy == sy && this.locations[Math.floor((wx+sx)/2)][wy]) return false;

		return true;
	}

	locAvailable([x, y]) {
		return x >= 0 && x < CELL_COUNT && y >= 0 && y < CELL_COUNT && !this.locations[x][y];
	}

	evaluate() {
		return 0;
	}

	tryStep(x1, y1, x2, y2, wolfLoc, depth, stepCount, curSheepCount, hopeSheepWin=true) {
		let wolfAvalCount = 0;

		let possibleSteps = [];
		possibleSteps = this.getWolfPossibleSteps(wolfLoc);
		wolfAvalCount = possibleSteps.length;

		if(depth <= 0 || curSheepCount <= 0 || wolfAvalCount <= 0) {
			return hopeSheepWin ? wolfAvalCount * 100 + curSheepCount * 10 + stepCount :
				(curSheepCount-18) * 20 - wolfAvalCount * 10 - stepCount;
		} 

		depth -= 1;
		stepCount += 1;

		const locations = this.locations;
		if(locations[x1][y1] == WOLF) {
			if(locations[x2][y2] == SHEEP) curSheepCount -= 1;

			for(let w of wolfLoc) {
				if(w[0] == x1 && w[1] == y1) {
					w[0] = x2;
					w[1] = y2;
					break;
				}
			}
		}

		const prevP2 = locations[x2][y2];
		locations[x2][y2] = locations[x1][y1];
		locations[x1][y1] = 0;

		let ret = 0;
		
		if(locations[x2][y2] == SHEEP) {

			let min = +Infinity, max = -Infinity;
			for(let s of possibleSteps) {
				const tmpResult = this.tryStep(s[0][0], s[0][1], s[1][0], s[1][1], wolfLoc, depth, stepCount, curSheepCount, !hopeSheepWin);
				if (tmpResult <= min) min = tmpResult;
				if(tmpResult >= max) max = tmpResult;
			}
			ret = hopeSheepWin ? max : min;
		} else {
			possibleSteps = this.getSheepPossibleSteps();

			let min = +Infinity, max = -Infinity;
			for(let s of possibleSteps) {
				const tmpResult = this.tryStep(s[0][0], s[0][1], s[1][0], s[1][1], wolfLoc, depth, stepCount, curSheepCount, !hopeSheepWin);
				if (tmpResult <= min) min = tmpResult;
				if(tmpResult >= max) max = tmpResult;
			}
			ret = hopeSheepWin ? max : min;
		}

		locations[x1][y1] = locations[x2][y2];
		locations[x2][y2] = prevP2;

		if(locations[x1][y1] == WOLF) {
			for(let w of wolfLoc) {
				if(w[0] == x2 && w[1] == y2) {
					w[0] = x1;
					w[1] = y1;
					break;
				}
			}
		}

		return ret;
	}

	getWolfPossibleSteps(wolfLoc) {
		const ret = [];

		for(let wolf of wolfLoc) {
			const [x, y] = wolf;
			let locs = [[x, y-1], [x, y+1], [x-1, y], [x+1, y]];
			
			for(let loc of locs) {
				if(this.locAvailable(loc)) {
					ret.push([[x, y], loc]);
				}
			}

			locs = [[x, y-2], [x, y+2], [x-2, y], [x+2, y]];
			for(let loc in locs) {
				if(this.game.validLoc(loc) && this.canEat([x, y], loc)) {
					ret.push([[x, y], loc]);
				}
			}
		}

		return ret;
	}

	getSheepPossibleSteps() {
		const ret = [];

		for(let i = 0; i < CELL_COUNT; i++) {
			for(let j = 0; j < CELL_COUNT; j++) {
				if(this.locations[i][j] != SHEEP) continue;

				const locs = [[i, j-1], [i, j+1], [i-1, j], [i+1, j]];
				for(let loc of locs) {
					if(this.locAvailable(loc)) ret.push([[i, j], loc])
				}
			}
		}

		return ret;
	}

	canMove([x, y]) {
		const locs = [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
		for(let loc of locs) {
			if(this.locAvailable(loc) && !this.locations[loc[0]][loc[1]]) return;
		}
		return false;
	}
}

class GameBotWolf extends GameBot {
	constructor(game) {
		super(game);

		this.wolfLoc = this.getWolfLoc();
	}

	next(fromX, fromY, toX, toY) {
		this.moveLoc(fromX, fromY, toX, toY);
		[fromX, fromY, toX, toY] = this._nextLv1(fromX, fromY, toX, toY);
		this.moveLoc(fromX, fromY, toX, toY);
		return [fromX, fromY, toX, toY];
	}

	_nextLv1(fromX, fromY, toX, toY) {
		let choosedWolf = [0, 0];
		let x = 0, y = 0;

		const pairs = [];
		for(let i = 0; i < this.wolfLoc.length; i++) {
			const sheeps = this.hasSheepToEat(this.wolfLoc[i]);
			if(sheeps.length == 0) continue;
			for(let sheep of sheeps) pairs.push([this.wolfLoc[i], sheep]);
		}

		if(pairs.length == 0) {
			[choosedWolf, [x, y]] = this.chooseLocWhenNoSheep();
		} else {
			[choosedWolf, [x, y]] = pairs[0];
		}

		const ret = [choosedWolf[0], choosedWolf[1], x, y];

		choosedWolf[0] = x;
		choosedWolf[1] = y;

		return ret;
	}

	chooseLocWhenNoSheep() {
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
				this.moveLoc(wolf[0], wolf[1], loc[0], loc[1]);
				wolf[0] = loc[0];
				wolf[1] = loc[1];
				let sheeps = [];
				for(let tmpWolf of this.wolfLoc) {
					sheeps = sheeps.concat(this.hasSheepToEat(tmpWolf));
				}
				this.moveLoc(wolf[0], wolf[1], x, y);
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

	isSheep([x, y]) {
		return this.locations[x][y] == SHEEP;
	}
}

class GameSheepBot extends GameBot {
	constructor(game) {
		super(game);

		this.wolfLoc = this.getWolfLoc();
	}

	next(fromX, fromY, toX, toY) {
		if(fromX >= 0) {
			this.moveLoc(fromX, fromY, toX, toY);
			const wolf = this.wolfLoc.find(w => w[0] == fromX && w[1] == fromY);
			this.updateWolfLoc(wolf, [toX, toY]);
		}

		[fromX, fromY, toX, toY] = this._nextLv1(fromX, fromY, toX, toY);
		this.moveLoc(fromX, fromY, toX, toY);
		return [fromX, fromY, toX, toY];
	}

	_nextLv1(fromX, fromY, toX, toY) {
		let possibleSteps = this.getSheepPossibleSteps();

		let x= -Infinity;
		let retStep = [0, 0, 0, 0];
		for(let s of possibleSteps) {
			const r = this.tryStep(s[0][0], s[0][1], s[1][0], s[1][1], this.wolfLoc, 1, 0, this.sheepCount, true);
			if(r > x) {
				x = r;
				retStep = [s[0][0], s[0][1], s[1][0], s[1][1]];
			}
		}

		return retStep;
	}

	updateWolfLoc(wolf, loc) {
		wolf[0] = loc[0];
		wolf[1] = loc[1];
	}
}
