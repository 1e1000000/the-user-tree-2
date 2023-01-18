addLayer("b", {
    name: "boosters", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new OmegaNum(0),
    }},
    color: "#6e64c4",
    requires(){return new OmegaNum(1e6)}, // Can be a function that takes requirement increases into account
    resource: "boosters", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    branches: ['p'],
    base(){
        let b = new OmegaNum(10)
        return b
    },
    exponent(){
        let e = new OmegaNum(1.5)
        return e
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new OmegaNum(1)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new OmegaNum(1)

        return exp
    },
    directMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new OmegaNum(1)
        if (hasUpgrade('e',14)) mult = mult.mul(upgradeEffect('e',14))

        return mult
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for boosters", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    effect(){
        let base = new OmegaNum(4)
        if (hasUpgrade('b',13)) base = base.add(upgradeEffect('b',13))
        if (hasUpgrade('b',21)) base = base.add(upgradeEffect('b',21))

        let amt = player.b.points
        if (hasUpgrade('b',13)) amt = amt.add(1)
        if (hasUpgrade('b',21)) amt = amt.add(upgradeEffect('b',21))

        let eff = base.pow(amt)
        if (hasUpgrade('b',22)) eff = powExp(eff,upgradeEffect('b',22))

        return eff
    },
    effectDescription(){return "which multiply points gain by " + format(this.effect()) + "."},
    layerShown(){return player[this.layer].unlocked || buyableGTE("main",12,2)},
    canBuyMax(){return player.e.unlocked},
    autoPrestige(){return tmp.auto.clickables['b_Points'].isActivated},
    resetsNothing(){return buyableGTE("e",11,4)},
    doReset(resettingLayer){
        let keep = []
        if (buyableGTE("e",11,3) && layers[resettingLayer].row == 2) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer,keep)
    },
    tabFormat:[
        "main-display",
        "prestige-button",
        "resource-display",
        "blank","upgrades",
    ],
    upgrades:{
        11: {
            title: "B to P",
            description(){return "Multiply PP gain based on best boosters, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.b.best.max(1).pow(2)
                if (hasUpgrade('p',19)) eff = eff.pow(upgradeEffect('p',19))
                return eff
            },
            cost: new OmegaNum(2),
        },
        12: {
            title: "PU5 boost",
            description(){return "Raise Prestige Upgrade 5 effect based on boosters, currently: ^" + format(this.effect())},
            effect(){
                let eff = player.b.points.add(1).max(1).pow(0.5)
                return eff
            },
            cost: new OmegaNum(4),
        },
        13: {
            title: "P to B",
            description(){return "Add boosters effect base based on Prestige Upgrades and give 1 free booster, currently: +" + format(this.effect())},
            effect(){
                let eff = new OmegaNum(player.p.upgrades.length).max(1).pow(0.5)
                return eff
            },
            cost: new OmegaNum(7),
        },
        14: {
            title: "PU1 boost",
            description(){return "Prestige Upgrade 1 affect PP gain with reduced effect (" + format(this.effect()) + "x), it also reduce the decay scaling"},
            effect(){
                let eff = upgradeEffect('p',1).curr?upgradeEffect('p',1).curr.max(1).logBase(2).max(1):new OmegaNum(1)
                if (hasUpgrade('b',24)) eff = upgradeEffect('p',1).curr?upgradeEffect('p',1).curr.max(1).pow(0.5):new OmegaNum(1)
                return eff
            },
            cost: new OmegaNum(9),
        },
        21: {
            title: "G to B",
            description(){return "Generator Power add Boosters effect base and Boosters amount, currently: +" + format(this.effect())},
            effect(){
                let eff = player.g.power.max(10).log10().pow(0.5)
                return eff
            },
            cost: new OmegaNum(25),
            unlocked(){return buyableGTE("main",11,3)},
        },
        22: {
            title: "Booster boost",
            description(){return "Raise Boosters effect exponent by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(1.05)
                return eff
            },
            cost: new OmegaNum(30),
            unlocked(){return buyableGTE("main",11,3)},
        },
        23: {
            title: "B to E",
            description(){return "Multiply Enhance Points gain based on boosters, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.b.points.max(1).pow(0.5)
                return eff
            },
            cost: new OmegaNum(40),
            unlocked(){return player.e.unlocked},
        },
        24: {
            title: "PU1 improvement",
            description(){return "The upgrade above uses a better formula (log2(x) -> x^0.5), require 5e276x boosters effect to be able purchase"},
            effect(){
                let eff = new OmegaNum(1)
                return eff
            },
            cost: new OmegaNum(128),
            canAfford(){return tmp.b.effect?tmp.b.effect.gte(5e276):false},
            unlocked(){return player.e.unlocked},
        },
    },
})
