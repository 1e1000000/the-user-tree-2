addLayer("e", {
    name: "enhance", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new OmegaNum(0),
    }},
    color: "#b82fbd",
    requires: new OmegaNum(1e200), // Can be a function that takes requirement increases into account
    resource: "enhance points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ['b','g'],
    exponent(){
        let exp = 1/50
        if (!player.e.unlocked) exp = 0
        return exp
    }, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new OmegaNum(1)
        if (hasUpgrade('p',34)) mult = mult.mul(upgradeEffect('p',34).eff)
        if (hasUpgrade('p',36)) mult = mult.mul(upgradeEffect('p',36))
        if (hasUpgrade('p',37)) mult = mult.mul(upgradeEffect('p',37))

        if (hasUpgrade('b',23)) mult = mult.mul(upgradeEffect('b',23))
        if (hasUpgrade('g',23)) mult = mult.mul(upgradeEffect('g',23))
        if (hasUpgrade('e',13)) mult = mult.mul(upgradeEffect('e',13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new OmegaNum(1)

        return exp
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E: Reset for enhance points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player[this.layer].unlocked || buyableGTE("main",12,6)},
    doReset(resettingLayer){
        let keep = []
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer,keep)
    },
    tabFormat:[
        "main-display",
        "prestige-button",
        "resource-display",
        "buyables","blank","upgrades",
    ],
    passiveGeneration(){
        return 0
    },
    buyables:{
        11: {
            title: "Enhancer",
            display(){
                let nextEff = [
                    "Upg1 now provide a exponential boost to the effect, increase over time (+0.05/s, up to 10 seconds)",
                    "Upg2 effect exponent is increased by 0.02 per prestige upgrade",
                    "You keep Booster/Generator Upgrade on Row 3 reset, Enh1 cap is 50% higher but spent 50% more time to max effect",
                    "Booster/Generator no longer reset anything, Upg4 effect become 10^x but nullify the boost from Upg16",
                    "Upg5 effect is raised by 1+Enhancers/10",
                    "Enh1 increase 25% faster and Upg1 now decay up to +100% of minimum effect",
                    "Upg7 effect become 10^x but nullify the boost from Upg16",
                    "Upg8 effect above 1e100 points use a better formula",
                    "Additive part of Upg9 effect is raised by (Bought Prestige Upgrades+1)^0.5",
                    "If you have Upg16, then Upg10 effect become x^3 before Upg26 boost",
                    "Upg11 effect raise PP gain at reduced rate",
                    "Upg12 effect uses a better formula",
                    "You reached the maximum level available",
                ]
                return "Boost Prestige Upgrades/Unlock QoL.<br>Bought: " + formatWhole(getBuyableAmount(this.layer,this.id)) + 
                "<br><br>Cost: " + format(this.cost()) + " enhance points<br><br><h3>Effect for next level:</h3><br>" + nextEff[Math.round(getBuyableAmount(this.layer,this.id).toNumber())]
            },
            costBase(){
                let base = new OmegaNum(2)
                return base
            },
            cost(x){
                let b = tmp.e.buyables[11].costBase
                let cost = OmegaNum.pow(b,x.pow(2))
                if (x.gte(20)) cost = OmegaNum.pow(b,x.pow(4).div(400))
                if (x.gte(50)) cost = OmegaNum.pow(b,x.pow(8).div(2.5e9))
                if (x.gte(100)) cost = OmegaNum.pow(b,OmegaNum.pow(1.1,x.sub(100)).mul(4e6))
                return cost
            },
            canAfford(){
                return player.e.points.gte(this.cost())
            },
            buy(){
                player.e.points = player.e.points.sub(this.cost())
                addBuyables(this.layer, this.id, new OmegaNum(1))
            },
            unlocked(){return player.e.unlocked},
            purchaseLimit: new OmegaNum(12)
        },
    },
    upgrades:{
        11: {
            title: "Points boost",
            description(){return "best enhance points multiply points gain, currently: " + format(this.effect()) + "x"},
            effect(){
                let s = new OmegaNum(1e50)
                if (hasUpgrade('p',39)) s = s.mul(upgradeEffect('p',39))
                let eff = expSoftcap(player.e.best.add(1).pow(5),s,0.5)
                return eff
            },
            cost: new OmegaNum(4),
            unlocked(){return buyableGTE("e",11,2)},
        },
        12: {
            title: "Prestige boost",
            description(){return "best enhance points multiply prestige points gain, currently: " + format(this.effect()) + "x"},
            effect(){
                let s = new OmegaNum(1e50)
                if (hasUpgrade('p',39)) s = s.mul(upgradeEffect('p',39))
                let eff = expSoftcap(player.e.best.add(1).pow(2),s,0.5)
                return eff
            },
            cost: new OmegaNum(4e8),
            unlocked(){return buyableGTE("e",11,6)},
        },
        13: {
            title: "Super Enhancer",
            description(){return "Each Enhancers increase Enhance Points gain by 100%, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = getBuyableAmount('e',11).max(0).add(1)
                return eff
            },
            cost: new OmegaNum(1e10),
            unlocked(){return buyableGTE("e",11,6)},
        },
        14: {
            title: "B and G boost",
            description(){return "Increase Boosters and Generators amount based on Enhance Points, currently: +" + format(this.effect().sub(1).mul(100),3) + "%"},
            effect(){
                let eff = player.e.points.max(2).logBase(2).logBase(2).div(100).add(1)
                return eff
            },
            cost: new OmegaNum(2e17),
            unlocked(){return buyableGTE("e",11,8)},
        },
    },
})
