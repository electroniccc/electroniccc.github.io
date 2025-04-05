const phrases = {};

phrases['zh'] = {
	'Start': '开始',
	'Reset': '重置',
	'Wolf🐺 or Sheep🐏?': '狼🐺还是羊🐏？',
	'Wolf🐺': '狼🐺',
	'Sheep🐏': '羊🐏',
	'Wolf': '狼',
	'Sheep': '羊',
	'Ok': '好',
	'Win!': '赢了'
};

function i18n(str) {
	let lan = navigator.language.toLowerCase();
	
	if(lan.indexOf('zh') > -1) {
		lan = 'zh'
	}

	if(lan in phrases && str in phrases[lan]) {
		return phrases[lan][str]
	}

	return str;
}

function i18nInit() {
	const els = document.querySelectorAll('.i18n');

	for(let el of els) {
		el.innerHTML = i18n(el.innerHTML);
	}
}
