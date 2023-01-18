let modInfo = {
	name: "The User Tree 2 (OmegaNum edition)",
	id: "user2",
	author: "F1e308",
	pointsName: "points",
	modFiles: ["math.js","layers/sideLayers.js",
	"layers/p.js","layers/b.js","layers/g.js",
	"layers/e.js",
	"tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new OmegaNum (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2",
	name: "Row 3",
}

let changelog = `<h1>Changelog:</h1><br>
	<br><h1>v0.2</h1><br>
		- Added a layers, 10 more prestige upgrades.<br>
		- You can reduce the upgrade column to 5.<br>
		- Some technical changes, including the addition of game speed modifier, power exponent softcap.<br>
		- Fixed bulking Static Layer.<br>
		- Endgame is increased to <b>1e1,625</b> points (1e1,500 prestige points).<br>
	<br><h1>v0.1</h1><br>
		- Added 3 layers, 30 prestige upgrades.<br>
		- Endgame is set at <b>1e200</b> points.<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new OmegaNum(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return buyableGTE("main",11,1)
}

function getPointsGainMulti(){
	let multi = new OmegaNum(1)
	if (buyableGTE("main",11,2)) multi = multi.mul(10)
	if (buyableGTE("main",11,3)) multi = multi.mul(1e9)
	if (hasUpgrade('p',1)) multi = multi.mul(upgradeEffect('p',1).curr)
	if (hasUpgrade('p',2)) multi = multi.mul(upgradeEffect('p',2).eff)
	if (hasUpgrade('p',4)) multi = multi.mul(upgradeEffect('p',4))
	if (hasUpgrade('p',5)) multi = multi.mul(upgradeEffect('p',5))
	if (hasUpgrade('p',8)) multi = multi.mul(upgradeEffect('p',8))
	if (hasUpgrade('p',15)) multi = multi.mul(upgradeEffect('p',15))
	if (hasUpgrade('p',18)) multi = multi.mul(upgradeEffect('p',18))
	if (hasUpgrade('p',30)) multi = multi.mul(upgradeEffect('p',30)[1])
	if (player.b.unlocked) multi = multi.mul(tmp.b.effect)
	if (player.g.unlocked) multi = multi.mul(tmp.g.effect.eff)
	if (hasUpgrade('e',11)) multi = multi.mul(upgradeEffect('e',11))

	return multi
}

function getPointsGainExp(){
	let exp = new OmegaNum(1)
	if (hasUpgrade('g',14)) exp = exp.mul(upgradeEffect('g',14))

	return exp
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new OmegaNum(0)

	let gain = new OmegaNum(1)
	gain = gain.mul(getPointsGainMulti())
	gain = gain.pow(getPointsGainExp())

	return gain
}

function getGameSpeed(){
	let speed = new OmegaNum(1)
	return speed
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function(){
		if (false) return "Current Endgame: ??? points (0.00%)"
		return "Current Endgame: <b>" + format("1e1500") + "</b> prestige points (<b>" + format(slogadd(player.p.points.max(1),-1).div(1500).min(1).mul(100)) + "%</b>)<br>3.5e39 enhance points and e1,625 points"
		+ (getGameSpeed().neq(1)?"<br><br>Game speed: <b>" + format(getGameSpeed()) + "</b>x (doesn't affect prestige time)":"")
	}
]

// Determines when the game "ends"
function isEndgame() {
	return player.p.points.gte(slogadd(1500,1))
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
