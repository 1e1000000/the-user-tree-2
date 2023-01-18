addLayer("g", {
    name: "generators", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new OmegaNum(0),
        power: new OmegaNum(0),
    }},
    color: "#a3d9a5",
    requires(){return buyableGTE("main",12,6)?new OmegaNum(1e6):new OmegaNum(1e40)}, // Can be a function that takes requirement increases into account
    resource: "generators", // Name of prestige currency
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
        {key: "g", description: "G: Reset for generators", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    effect(){
        let base = new OmegaNum(4)
        if (hasUpgrade('g',21)) base = base.add(upgradeEffect('g',21))
        if (hasUpgrade('p',32)) base = base.add(upgradeEffect('p',32))

        let amt = player.g.points
        if (hasUpgrade('g',21)) amt = amt.add(upgradeEffect('g',21))

        let prod = base.pow(amt.sub(1))
        if (amt.lte(0)) prod = new OmegaNum(0)
        if (hasUpgrade('p',23)) prod = prod.mul(upgradeEffect('p',23))
        if (hasUpgrade('p',24)) prod = prod.mul(upgradeEffect('p',24))
        if (hasUpgrade('p',30)) prod = prod.mul(upgradeEffect('p',30)[1])
        if (hasUpgrade('p',35)) prod = prod.mul(upgradeEffect('p',35))
        if (hasUpgrade('g',13)) prod = prod.mul(upgradeEffect('g',13))
        if (hasUpgrade('g',22)) prod = prod.mul(upgradeEffect('g',22).prod)

        let x = player.g.power.max(1)
        let exp = new OmegaNum(0.5)
        if (hasUpgrade('p',24)) exp = exp.add(0.15)
        if (hasUpgrade('p',25)) exp = exp.add(0.15)
        let eff = powExp(x,exp)
        if (hasUpgrade('g',22)) eff = eff.pow(upgradeEffect('g',22).eff)

        return {prod: prod, eff: eff}
    },
    effectDescription(){return "which produce " + format(tmp.g.effect.prod.mul(getGameSpeed())) + " generator power per second."},
    layerShown(){return player[this.layer].unlocked || buyableGTE("main",12,4)},
    canBuyMax(){return player.e.unlocked},
    autoPrestige(){return tmp.auto.clickables['b_Points'].isActivated},
    resetsNothing(){return buyableGTE("e",11,4)},
    doReset(resettingLayer){
        let keep = []
        if (buyableGTE("e",11,3) && layers[resettingLayer].row == 2) keep.push("upgrades")
        if (layers[resettingLayer].row >= this.row) player.g.power = new OmegaNum(0)
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer,keep)
    },
    tabFormat:[
        "main-display",
        ["display-text",function(){return "You have " + format(player.g.power) + " Generator Power, multiply points gain by " + format(tmp.g.effect.eff)}],
        "prestige-button",
        "resource-display",
        "blank","upgrades",
    ],
    update(diff){
        if (player.g.unlocked) player.g.power = player.g.power.add(tmp.g.effect.prod.mul(diff))
    },
    upgrades:{
        11: {
            title: "G to P",
            description(){return "Multiply PP gain based on best generators, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.g.best.max(1).pow(2)
                if (hasUpgrade('p',29)) eff = eff.pow(upgradeEffect('p',29))
                return eff
            },
            cost: new OmegaNum(3),
        },
        12: {
            title: "PU12 boost",
            description(){return "Raise Prestige Upgrade 12 effect based on generators, currently: ^" + format(this.effect())},
            effect(){
                let eff = player.g.points.add(1).max(1).pow(0.5)
                return eff
            },
            cost: new OmegaNum(5),
        },
        13: {
            title: "P to G",
            description(){return "You gain Generator Power faster based on PP, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.p.points.max(10).log10()
                return eff
            },
            cost: new OmegaNum(7),
        },
        14: {
            title: "PU11 boost",
            description(){return "Prestige Upgrade 11 affect points gain with reduced effect (^" + format(this.effect(),4) + "), it also make the minimum effect from this upgrade 3x stronger"},
            effect(){
                let eff = upgradeEffect('p',11).max(0).mul(100).root(2).div(100).add(1)
                if (hasUpgrade('g',24)) eff = upgradeEffect('p',11).add(1)
                return eff
            },
            cost: new OmegaNum(15),
        },
        21: {
            title: "B to G",
            description(){return "Boosters add Generator effect base and Generators amount, currently: +" + format(this.effect())},
            effect(){
                let exp = new OmegaNum(1/3)
                if (hasUpgrade('p',38)) exp = exp.add(upgradeEffect('p',38))
                let eff = player.b.points.max(0).pow(exp)
                return eff
            },
            cost: new OmegaNum(22),
            unlocked(){return buyableGTE("main",11,3)},
        },
        22: {
            title: "Generator boost",
            description(){return "Multiply Generator Power production based on itself and the effect is stronger based on Generator, currently: " + format(this.effect().prod) + "x, ^" + format(this.effect().eff,3)},
            effect(){
                let prod = player.g.power.max(10).log10().pow(2)

                let eff = player.g.points.div(50).add(1)
                if (eff.gte(2)) eff = eff.div(2).pow(0.5).mul(2)

                return {prod: prod, eff: eff}
            },
            cost: new OmegaNum(24),
            unlocked(){return buyableGTE("main",11,3)},
        },
        23: {
            title: "G to E",
            description(){return "Multiply Enhance Points gain based on generators, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.g.points.max(1).pow(0.5)
                return eff
            },
            cost: new OmegaNum(61),
            unlocked(){return player.e.unlocked},
        },
        24: {
            title: "PU11 improvement",
            description(){return "The upgrade above uses a better formula (1+x^0.5/100 -> 1+x/100), require 1e213 generator power to be able purchase"},
            effect(){
                let eff = new OmegaNum(1)
                return eff
            },
            cost: new OmegaNum(103),
            canAfford(){return player.g.power.gte(1e213)},
            unlocked(){return player.e.unlocked},
        },
    },
})
