/*
 * @author: electroniccc
 * @date: 2023-02-22 03:02:22
 * @desc: 
 *  A small game about wolf and sheep. I like playing this game when I was a yang child.
 *  Recently, I found that the rules of this game are almost forgotten by me.
 *  So I just write this to prevent it disappear.
 * @version: 0.1
*/

let canStart = true;
function onGameStart(game) {
	if(game.running) return;
	if(!canStart) return;

	document.getElementById("choose-dialog").style.display = "block";
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
	
	document.getElementById('dialog-result').style.display = "block";
	document.getElementById('result-header').innerHTML = `${winner==SHEEP?i18n('Sheep'): i18n('Wolf')} ${i18n('Win!')}`
}

function onDlgClicked(evt, game) {
	if(evt.target.id == 'sheep-btn') {
		game.setUserRole(SHEEP);
		document.getElementById('canvas').classList.add('user-is-sheep');
	} else if(evt.target.id == 'wolf-btn') {
		game.setUserRole(WOLF);
	} else {
		return;
	}

	canStart = false;
	game.start();
	const btnEl = document.getElementById('btn-start');

	addClass(btnEl, 'clicked');

	document.getElementById("choose-dialog").style.display = "none";
}

function onResultDlgClicked(evt, game) {
	if(evt.target.id != 'ok-btn') return;

	void game;
	document.getElementById('dialog-result').style.display = 'none';
}

function addEvent(game) {
	document.getElementById('btn-start').addEventListener('click', (event) => {
		onGameStart(game, event);
	});

	document.getElementById('btn-reset').addEventListener('click', (event) => {
		onGameReset(game, event);
	});

	let dlg = document.getElementById('dialog');
	dlg.addEventListener('click', (evt) => {
		onDlgClicked(evt, game);
	});

	dlg = document.getElementById('dialog-result');
	dlg.addEventListener('click', (evt) => {
		onResultDlgClicked(evt, game);
	});
}

function adjustCanvasSize(el) {
	const dpr = window.devicePixelRatio;
	const cssWidth = el.getBoundingClientRect().width;

	el.style.height = cssWidth + 'px';

	el.width = cssWidth * dpr;
	el.height = cssWidth * dpr;

	const ctx = el.getContext('2d');
	ctx.scale(dpr,dpr);

}

function main() {
	const canvas = document.getElementById('canvas');
	if(!canvas.getContext) {
		return;
	}

	i18nInit();

	adjustCanvasSize(canvas);

	const game = new WolfSheepGame(canvas, onGameOver);
	game.init();

	addEvent(game);

	// alert(isSupportFontFamily('serif'))

	let lan = navigator.language.toLowerCase();
	if(lan.indexOf('zh') > -1) {
		document.getElementById('rule-zh').style.display = 'block';
	} else {
		document.getElementById('rule-en').style.display = 'block';
	}
}

main();
