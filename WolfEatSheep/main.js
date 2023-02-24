/*
 * @author: electroniccc
 * @date: 2023-02-22 03:02:22
 * @desc: 
 *  A small game about wolf and sheep. I like playing this game when I was a yang child.
 *  Recently, I found that the rules of this game are almost forgotten by me.
 *  So I just write this to prevent it disappear.
 * @version: 0.1
*/

const SCAL_BIT = 1 << 4;
const SCAL_RATIO = 1.155;
const PIECE_R_CELL_RATIO = 3/10;

class WolfSheepGame {
	constructor(canvas, onOver=null, onUserMoved=null) {
		this.canvas = canvas;
		this.onOver = onOver;
		this.onUserMoved = onUserMoved || this.defaultOnUserMoved;

		this.ctx = canvas.getContext('2d');

		const cnvW = Number(window.getComputedStyle(this.canvas).width.replace('px', ''));
		const cnvH = Number(window.getComputedStyle(this.canvas).height.replace('px', ''));
		const width = Math.min(cnvW, cnvH);
		const cellWidth = width / (5 + PIECE_R_CELL_RATIO * 2 * SCAL_RATIO);
		const pieceRadius = cellWidth * PIECE_R_CELL_RATIO;

		this.width = width;
		this.cellWidth = cellWidth;
		this.pieceRadius = pieceRadius;

		const locations = [];
		for(let i =0; i < 6; i++) {
			const row = [];
			for(let j = 0; j < 6; j++) {
				row.push(0);
			}
			locations.push(row);
		}
		this.locations = locations;

		this.colors = {
			1: ['#ffffff', '#cccccc'],
			2: ['#999999', '#000000']
		};

		this.locToMove = null;

		this.running = false;
		this.stepCount = 0;

		this.prepareLoc();
		this.wolfBot = new GameBotWolf(this);

		this.userRole = SHEEP;
	}

	getLoc() {
		const loc = [];
		for(let i = 0; i < 6; i++) {
			const col = [];
			loc.push(col);
			for(let j = 0 ; j < 6; j++) {
				col.push(this.locations[i][j]);
			}
		}
		return loc;
	}

	init() {
		this.draw();
		this.addEvent();
	}

	start() {
		this.running = true;
	}

	reset() {
		this.prepareLoc();
		this.draw();
		this.running = false;
		this.stepCount = 0;

		this.wolfBot = new GameBotWolf(this);
	}

	draw() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.drawCheckerboard();
		this.drawPieces();
	}

	drawCheckerboard() {
		const ctx = this.ctx;
		const cellWidth = this.cellWidth;
		const pieceRadius = this.pieceRadius * SCAL_RATIO;

		ctx.fillStyle = '#ffffff';
		ctx.lineCap = 'square';

		for(let i = 0; i < 6; i++) {
			ctx.beginPath();
			ctx.moveTo(pieceRadius, cellWidth * i + pieceRadius);
			ctx.lineTo(cellWidth * 5 + pieceRadius, cellWidth * i + pieceRadius);
			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			ctx.moveTo(cellWidth * i + pieceRadius, pieceRadius);
			ctx.lineTo(cellWidth * i + pieceRadius, cellWidth * 5 + pieceRadius);
			ctx.stroke();
			ctx.closePath();
		}
	}

	drawPieces() {
		for(let i = 0; i < 6; i++) {
			for(let j = 0; j < 6; j++) {
				if(!this.locations[i][j]) continue;

				if(this.locations[i][j] % 2) {
					this.drawPiece(i, j, SHEEP, this.locations[i][j]&SCAL_BIT ? this.pieceRadius * SCAL_RATIO : 0);
				} else {
					this.drawPiece(i, j, WOLF, this.locations[i][j]&SCAL_BIT ? this.pieceRadius * SCAL_RATIO : 0);
				}
			}
		}
	}

	drawPiece(x, y, color, radius=0) {
		x = x * this.cellWidth + this.pieceRadius * SCAL_RATIO;
		y = y * this.cellWidth + this.pieceRadius * SCAL_RATIO;

		const ctx = this.ctx;
		if(radius === 0) {
			radius = this.pieceRadius;
		}

		const colors = this.colors;

		const radgrad = ctx.createRadialGradient(x+radius/2, y+radius/2, 0, x, y, radius);
		radgrad.addColorStop(0, colors[color][0]);
		radgrad.addColorStop(1, colors[color][1]);
	
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, true);
		ctx.fillStyle = radgrad;
		ctx.fill();
		ctx.closePath();
	}

	prepareLoc() {
		for(let i = 0; i < 6; i++) {
			for(let j = 0; j < 6; j++) {
				if(j < 3) {
					this.locations[i][j] = SHEEP;
				} else {
					this.locations[i][j] = 0;
				}
			} 
		}

		this.locations[1][4] = WOLF;
		this.locations[4][4] = WOLF;
	}

	addEvent() {
		this.canvas.addEventListener('click', (event) => {
			this.onCanvasClicked(event);
		});
	}

	onCanvasClicked(event) {
		if(!this.running) return;

		const cellWidth = this.cellWidth;
		const radius = this.pieceRadius * SCAL_RATIO;
	
		const [x, y] = [Math.round((event.offsetX-radius)/cellWidth), Math.round((event.offsetY-radius)/cellWidth)];

		if(this.locations[x][y] && this.locations[x][y] != this.userRole) return;
		
		if(this.locToMove && this.movementAllowed(this.locToMove[0], this.locToMove[1], x, y)) {
			const [a, b] = this.locToMove;
			this.moveLoc(a, b, x, y);
			this.draw();

			if(!this.running) return;

			this.onUserMoved(a, b, x, y);
			return;
		}
		
		if(this.locToMove) {
			const [a, b] = this.locToMove;
			this.markLoc(a, b, false);
			this.draw();
		}
		
		if(this.locations[x][y]) {
			this.markLoc(x, y, true);
			this.draw();
		}
	}

	markLoc(x, y, mark) {
		if(mark) {
			this.locations[x][y] |= SCAL_BIT;
		} else {
			this.locations[x][y] &= (~SCAL_BIT);
		}
		this.locToMove = mark ? [x, y] : null;
	}

	moveLoc(fromX, fromY, toX, toY) {
		const locations = this.locations;
		locations[toX][toY] = locations[fromX][fromY];
		locations[fromX][fromY] = 0;
		locations[toX][toY] &= (~SCAL_BIT);
		this.locToMove = null;
		this.stepCount += 1;

		if(this.isGameOver()) {
			this.running = false;
			if(this.onOver) {
				this.onOver(this.winner, this.stepCount);
			}
		}
	}

	isGameOver() {
		const locations = this.locations;
		let hasSheep = false;

		const wolfLoc = [];

		for(let i = 0; i < 6; i++) {
			for(let j = 0; j < 6; j++) {
				if(!locations[i][j]) continue;
				if(locations[i][j] % 2 == 1) hasSheep = true;
				if(locations[i][j] % 2 == 0) wolfLoc.push([i, j]);
			}
		}

		if(!hasSheep) {
			console.log('wolf win');
			this.winner = WOLF;
			return true;
		}

		let wolfCanMove = false;
		for(let i = 0; i < 2; i++) {
			const [x, y] = wolfLoc[i];

			const arr = [[x, y-1], [x, y+1], [x+1, y], [x-1, y]];
			for(let a of arr) {
				if(a[0] >= 0 && a[0] < 6 && a[1] >= 0 && a[1] < 6) {
					if(!locations[a[0]][a[1]]) wolfCanMove = true;
				}
			}
		}
		if(!wolfCanMove) {
			console.log('sheep win');
			this.winner = SHEEP;
			return true;
		}

		return false;
	}

	movementAllowed(fromX, fromY, toX, toY) {
		const locations = this.locations;

		if((this.stepCount+1) % 2 != locations[fromX][fromY] %2) {
			console.log('it is not your turn');
			return false;
		}
		
		// wolf selected
		if(locations[fromX][fromY]%2==0) {
			// target is sheep and distance is less than 2
			if(locations[toX][toY]%2 && this.locDistance(fromX, fromY, toX, toY) == 2) {
				return true;
			}
		}

		if(!locations[toX][toY] && this.locDistance(fromX, fromY, toX, toY) == 1) return true;

		return false;
	}

	locDistance(fromX, fromY, toX, toY) {
		return Math.sqrt(Math.pow(toX-fromX, 2) + Math.pow(toY-fromY, 2));
	}

	playerMove(fromX, fromY, toX, toY) {
		if(!this.running) return;

		if(!this.movementAllowed(fromX, fromY, toX, toY)) {
			return false;
		}

		this.moveLoc(fromX, fromY, toX, toY);
		this.draw();

		return true;
	}

	validLoc([x, y]) {
		return x >= 0 && x < CELL_COUNT && y >= 0 && y < CELL_COUNT;
	}

	defaultOnUserMoved(fromX, fromY, toX, toY) {
		[fromX, fromY, toX, toY] = this.wolfBot.next(fromX, fromY, toX, toY);

		this.playerMove(fromX, fromY, toX, toY);
	}
}

let canStart = true;
function onGameStart(game) {
	if(game.running) return;
	if(!canStart) return;
	canStart = false;
	game.start();
	const btnEl = document.getElementById('btn-start');
	// removeClass(btnEl, 'button-63');
	addClass(btnEl, 'clicked');
}

function onGameReset(game) {
	game.reset();
	canStart = true;

	const btnEl = document.getElementById('btn-start');
	removeClass(btnEl, 'clicked');
}

function onGameOver(winner, steps) {
	const btnEl = document.getElementById('btn-start');
	removeClass(btnEl, 'clicked');
	alert(`${winner==SHEEP?'Sheep': 'wolf'} win`);
}

function addEvent(game) {
	document.getElementById('btn-start').addEventListener('click', (event) => {
		onGameStart(game, event);
	});

	document.getElementById('btn-reset').addEventListener('click', (event) => {
		onGameReset(game, event);
	})
}


function main() {
	const canvas = document.getElementById('canvas');
	if(!canvas.getContext) {
		return;
	}
	const game = new WolfSheepGame(canvas, onGameOver);
	game.init();

	addEvent(game);
}

main();