addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new OmegaNum(0),
        reduceColumn: false,
    }},
    color: "#31aeb0",
    requires: new OmegaNum(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new OmegaNum(1)
        if (hasUpgrade('p',4)) mult = mult.mul(upgradeEffect('p',4))
        if (hasUpgrade('p',7)) mult = mult.mul(upgradeEffect('p',7))
        if (hasUpgrade('p',9)) mult = mult.mul(upgradeEffect('p',9).eff)
        if (hasUpgrade('p',10)) mult = mult.mul(upgradeEffect('p',10)[0])
        if (hasUpgrade('p',12)) mult = mult.mul(upgradeEffect('p',12))
        if (hasUpgrade('p',18)) mult = mult.mul(upgradeEffect('p',18))
        if (hasUpgrade('p',25)) mult = mult.mul(upgradeEffect('p',25))

        if (hasUpgrade('b',11)) mult = mult.mul(upgradeEffect('b',11))
        if (hasUpgrade('b',14)) mult = mult.mul(upgradeEffect('b',14))

        if (hasUpgrade('g',11)) mult = mult.mul(upgradeEffect('g',11))

        if (hasUpgrade('e',12)) mult = mult.mul(upgradeEffect('e',12))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new OmegaNum(1)
        if (buyableGTE("e",11,11)) exp = exp.mul(upgradeEffect('p',11).mul(100).root(2).div(100).add(1))

        return exp
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player[this.layer].unlocked || buyableGTE("main",12,1)},
    doReset(resettingLayer){
        let keep = ["reduceColumn"]
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer,keep)
    },
    tabFormat:[
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text",function(){return "Reset time: " + formatTime(player.p.resetTime)}],
        "clickables","blank","grid","blank",
    ],
    passiveGeneration(){
        return tmp.auto.clickables['p_Points'].isActivated?1:0
    },
    //RTPassiveGeneration: true, // Passively Generate Resource real-time instead of game-time
    //RTLayer: true, // Layer run with real-time instead of game-time
    //Both default to false
    clickables:{
        11:{
            display(){return "Reduce Column of Prestige Upgrades to 5 " + (player.p.reduceColumn?"(ON)":"(OFF)")},
            canClick(){return true},
            onClick(){player.p.reduceColumn = Boolean(1-player.p.reduceColumn)},
        }
    },
    upgrades:{
        1: {
            title: "thefinaluptake",
            description(){return "Multiply points gain by " + format(this.effect().eff[0]) + " but it decay over time, currently: " + format(this.effect().curr) + "x"},
            effect(){
                let eff = [new OmegaNum(10),new OmegaNum(10),new OmegaNum(0)] // eff at max, decay time, min effect multi

                if (hasUpgrade('p',3)) eff[0] = eff[0].mul(upgradeEffect('p',3)[0])
                if (hasUpgrade('p',7)) eff[0] = eff[0].mul(upgradeEffect('p',7))
                if (hasUpgrade('p',11)) eff[0] = eff[0].pow(upgradeEffect('p',11).add(1))
                if (hasUpgrade('p',21)) eff[0] = eff[0].mul(upgradeEffect('p',21))

                if (hasUpgrade('p',3)) eff[1] = eff[1].div(upgradeEffect('p',3)[1])
                if (hasUpgrade('p',6)) eff[1] = eff[1].mul(upgradeEffect('p',6))
                if (hasUpgrade('p',21)) eff[1] = eff[1].mul(2)

                if (hasUpgrade('p',6)) eff[2] = eff[2].add(0.1)
                if (hasUpgrade('p',11)) eff[2] = eff[2].add(upgradeEffect('p',11).mul(hasUpgrade('g',14)?3:1))
                if (hasUpgrade('p',21)) eff[2] = eff[2].add(0.15)
                if (buyableGTE("e",11,6)) eff[2] = eff[2].add(1)

                eff[2] = eff[2].min(1)

                let expEff = [new OmegaNum(0),new OmegaNum(10)] // max effect, time to max
                if (buyableGTE("e",11,1)) expEff[0] = new OmegaNum(0.5)
                if (buyableGTE("e",11,3)) expEff[0] = expEff[0].mul(1.5)

                if (buyableGTE("e",11,3)) expEff[1] = expEff[1].mul(1.5)
                if (buyableGTE("e",11,6)) expEff[1] = expEff[1].div(1.25)

                let t = new OmegaNum(player.p.resetTime)
                let decayRate = t.div(eff[1]).min(1)
                if (hasUpgrade('b',14)) decayRate = decayRate.pow(2)
                let incRate = t.div(expEff[1]).min(1)

                let mult = new OmegaNum(1).sub(decayRate).add(eff[2].mul(decayRate)).mul(eff[0])
                let exp = new OmegaNum(1).add(incRate.mul(expEff[0]))
                let curr = expSoftcap(mult.pow(exp),new OmegaNum(1e100),0.5)
                return {eff:eff,curr:curr}
            },
            cost: new OmegaNum(1),
            canAfford(){return player.p.unlocked},
            type: "playable"
        },
        2: {
            title: "Menoche",
            description(){return "For every upgrade you have, increase points gain by " + format(this.effect().base.mul(100)) + "%, currently: " + format(this.effect().eff) + "x"},
            effect(){
                let effBase = new OmegaNum(1)
                if (hasUpgrade('p',10)) effBase = effBase.add(upgradeEffect('p',10)[1])
                if (hasUpgrade('p',31)) effBase = effBase.add(upgradeEffect('p',31))

                let eff = effBase.mul(player.p.upgrades.length).add(1)
                if (hasUpgrade('p',13)) eff = eff.pow(upgradeEffect('p',13))
                if (hasUpgrade('p',27)) eff = eff.pow(upgradeEffect('p',27))
                if (buyableGTE("e",11,2)) eff = eff.pow(player.p.upgrades.length/50+1)
                return {base: effBase, eff: eff}
            },
            cost: new OmegaNum(20),
            canAfford(){return player.p.unlocked},
            type: "empty"
        },
        3: {
            title: "Katakana1",
            description(){return format(this.effect()[0]) + "x the effect of Upgrade 1 in return of " + format(this.effect()[1]) + "x decay speed"},
            effect(){
                let eff = [new OmegaNum(3), new OmegaNum(2)]
                if (hasUpgrade('p',14)) eff[0] = eff[0].add(upgradeEffect('p',14))
                return eff
            },
            cost: new OmegaNum(50),
            canAfford(){return player.p.unlocked},
            type: "empty"
        },
        4: {
            title: "okamii17",
            description(){return "Multiply points and PP gain by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(1.7)
                if (hasUpgrade('p',26)) eff = OmegaNum.pow(10,eff)
                if (buyableGTE("e",11,4)) eff = OmegaNum.pow(10,eff)
                if (!buyableGTE("e",11,4)){
                    if (hasUpgrade('p',16)) eff = eff.pow(upgradeEffect('p',16))
                }
                return eff
            },
            cost: new OmegaNum(150),
            canAfford(){return player.p.unlocked},
            type: "playable"
        },
        5: {
            title: "Letorin",
            description(){return "Multiply points gain based on PP, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.p.points.add(10).log10()
                if (hasUpgrade('p',20)) eff = eff.max(powExp(player.p.points,upgradeEffect('p',20)))
                if (hasUpgrade('b',12)) eff = eff.pow(upgradeEffect('b',12))
                if (buyableGTE("e",11,5)) eff = eff.pow(getBuyableAmount('e',11).div(10).add(1))
                return eff
            },
            cost: new OmegaNum(500),
            canAfford(){return player.p.unlocked},
            type: "empty"
        },
        6: {
            title: "thepaperpilot",
            description(){return "Upgrade 1 effect decay " + format(this.effect()) + "x slower, and it will goes up to 10% of max effect"},
            effect(){
                let eff = new OmegaNum(1.5)
                return eff
            },
            cost: new OmegaNum(1000),
            canAfford(){return player.p.unlocked},
            type: "playable"
        },
        7: {
            title: "Dystopia-user181",
            description(){return "Multiply PP gain and Upgrade 1 effect by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(1.81)
                if (hasUpgrade('p',26)) eff = OmegaNum.pow(10,eff)
                if (buyableGTE("e",11,7)) eff = OmegaNum.pow(10,eff)
                if (!buyableGTE("e",11,7)){
                    if (hasUpgrade('p',16)) eff = eff.pow(upgradeEffect('p',16))
                }
                return eff
            },
            cost: new OmegaNum(1500),
            canAfford(){return player.p.unlocked},
            type: "playable"
        },
        8: {
            title: "MocyaTheMole",
            description(){return "Multiply points gain based on points, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.points.add(10).log10()
                if (hasUpgrade('p',17)){
                    if (player.points.gte(1e100)) eff = buyableGTE("e",11,8)?powExp(player.points,0.5):player.points.add(10).log10().pow(5)
                    else if (player.points.gte(1e10)) eff = player.points.add(1).pow(0.1)
                    else eff = player.points.add(10).log10()
                }
                if (hasUpgrade('p',17)) eff = eff.pow(upgradeEffect('p',17))
                return eff
            },
            cost: new OmegaNum(4000),
            canAfford(){return player.p.unlocked},
            type: "empty"
        },
        9: {
            title: "jgdovin",
            description(){return "For every upgrade you have, increase PP gain by " + format(this.effect().base.mul(100)) + "%, currently: " + format(this.effect().eff) + "x"},
            effect(){
                let effBase = new OmegaNum(0.1)
                if (hasUpgrade('p',22)) effBase = effBase.add(upgradeEffect('p',22))
                if (hasUpgrade('p',30)) effBase = effBase.add(upgradeEffect('p',30)[0])
                if (hasUpgrade('p',40)) effBase = effBase.add(upgradeEffect('p',40))

                let eff = effBase.mul(player.p.upgrades.length).add(1)
                if (hasUpgrade('p',16)) eff = eff.pow(upgradeEffect('p',16))
                if (buyableGTE("e",11,9)) eff = eff.pow(new OmegaNum(player.p.upgrades.length).add(1).pow(0.5))

                let eff2 = new OmegaNum(1)
                if (hasUpgrade('p',22)) eff2 = effBase.add(1).pow(player.p.upgrades.length)
                return {base: effBase, eff: eff.mul(eff2)}
            },
            cost: new OmegaNum(1e4),
            canAfford(){return player.p.unlocked},
            type: "empty"
        },
        10: {
            title: "Crimson4061",
            description(){return "Multiply PP gain by " + format(this.effect()[0]) + " and increase Upgrade 2 effect base by " + format(this.effect()[1].mul(100).round()) + "%"},
            effect(){
                let eff = [new OmegaNum(4.06),new OmegaNum(4.06)]
                if (buyableGTE("e",11,10) && hasUpgrade('p',16)) eff[0] = eff[0].pow(upgradeEffect('p',16))
                if (hasUpgrade('p',26)) eff[0] = OmegaNum.pow(10,eff[0])
                if (hasUpgrade('p',26)) eff[1] = eff[1].pow(2)
                return eff
            },
            cost: new OmegaNum(2.5e4),
            canAfford(){return player.p.unlocked},
            type: "empty"
        },
        11: {
            title: "IEmory",
            description(){return "Increase Upgrade 1 maximum effect exponent and the minimum effect based on bought prestige upgrades (up to 100), currently: +" + format(this.effect())},
            effect(){
                let x = player.p.upgrades.length
                let amt = 0
                for (let i=1;i<=x;i++){
                    if ([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97].includes(i)) amt+=1
                }
                let eff = new OmegaNum(amt/100)
                return eff
            },
            cost: new OmegaNum(3e6),
            canAfford(){return player.b.unlocked},
            type: "playable"
        },
        12: {
            title: "peachparlor",
            description(){return "Multiply PP gain based on PP, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.p.points.add(10).log10()
                if (buyableGTE("e",11,12)) eff = eff.max(powExp(player.p.points.max(1),0.35))
                if (hasUpgrade('g',12)) eff = eff.pow(upgradeEffect('g',12))
                return eff
            },
            cost: new OmegaNum(5e6),
            canAfford(){return player.b.unlocked},
            type: "empty"
        },
        13: {
            title: "gapples2",
            description(){return "Raise Upgrade 2 effect by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(2)
                return eff
            },
            cost: new OmegaNum(1e9),
            canAfford(){return player.b.unlocked},
            type: "playable"
        },
        14: {
            title: "Pimvgd",
            description(){return "Increase the buff of Upgrade 3 based on boosters, currently: +" + format(this.effect())},
            effect(){
                let eff = player.b.points
                if (hasUpgrade('p',33)) eff = eff.pow(upgradeEffect('p',33))
                return eff
            },
            cost: new OmegaNum(111111111111),
            canAfford(){return player.b.unlocked},
            type: "playable"
        },
        15: {
            title: "Grodvert",
            description(){return "Upgrade 2 now also provide rooted-exponential boost to points gain, currently: " + format(this.effect()) + "x"},
            effect(){
                let exp = 0.5
                if (hasUpgrade('p',23)) exp += 0.1
                let eff = upgradeEffect('p',2).base.add(1).pow(player.p.upgrades.length**exp)
                return eff
            },
            cost: new OmegaNum(2e12),
            canAfford(){return player.b.unlocked},
            type: "empty"
        },
        16: {
            title: "Cubedey",
            description(){return "Raise Upgrade 4,7,9 effect by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(3)
                return eff
            },
            cost: new OmegaNum(5.00001e14),
            canAfford(){return player.b.unlocked},
            type: "playable"
        },
        17: {
            title: "Pikiquouik",
            description(){return "Upgrade 8 effect between 1e10 and 1e100 points uses a better formula, and the effect is raised by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(4/3)
                return eff
            },
            cost: new OmegaNum(2.0202e20),
            canAfford(){return player.b.unlocked},
            type: "empty"
        },
        18: {
            title: "pg132",
            description(){return "Multiply points and PP gain by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(132)
                return eff
            },
            cost: new OmegaNum(2.32323e23),
            canAfford(){return player.b.unlocked},
            type: "playable"
        },
        19: {
            title: "MCKight",
            description(){return "Raise B to P effect by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(1.5)
                return eff
            },
            cost: new OmegaNum(1e28),
            canAfford(){return player.b.unlocked},
            type: "empty"
        },
        20: {
            title: "multivberse",
            description(){return "Upgrade 5 uses a better formula (10^log(PP)^" + format(this.effect()) + ")"},
            effect(){
                let eff = new OmegaNum(0.25)
                if (hasUpgrade('p',28)) eff = eff.add(upgradeEffect('p',28))
                return eff
            },
            cost: new OmegaNum(1.5e29),
            canAfford(){return player.b.unlocked},
            type: "playable"
        },
        21: {
            title: "randomtuba",
            description(){return "Upgrade 1 is " + format(this.effect()) + "x stronger (after Upgrade 11 effect, based on booster and generator), decay 2x slower and up to +15% of maximum effect"},
            effect(){
                let eff = player.b.points.max(1).mul(player.g.points.max(1)).pow(0.75)
                return eff
            },
            cost: new OmegaNum(2.36001e34),
            canAfford(){return player.g.unlocked},
            type: "playable"
        },
        22: {
            title: "jckwik",
            description(){return "Increase Upgrade 9 base by " + format(this.effect().mul(100)) + "% (based on booster and generator), it also provide exponential boost to PP gain"},
            effect(){
                let eff = player.b.points.add(player.g.points).max(0).div(100)
                return eff
            },
            cost: new OmegaNum(1.5e36),
            canAfford(){return player.g.unlocked},
            type: "broken"
        },
        23: {
            title: "unsmith19",
            description(){return "Multiply Generator Power production by " + format(this.effect()) + ", Upgrade 15 effect is increased"},
            effect(){
                let eff = new OmegaNum(19)
                return eff
            },
            cost: new OmegaNum(5.00001e39),
            canAfford(){return player.g.unlocked},
            type: "empty"
        },
        24: {
            title: "SkitsTheSkitty",
            description(){return "Multiply Generator Power production by " + format(this.effect()) + " (based on boosters), Generator Power effect is stronger"},
            effect(){
                let eff = player.b.points.max(1)
                return eff
            },
            cost: new OmegaNum(6e45),
            canAfford(){return player.g.unlocked},
            type: "empty"
        },
        25: {
            title: "xidafo",
            description(){return "Multiply PP gain by " + format(this.effect()) + " (based on generator power), Generator Power effect is stronger again"},
            effect(){
                let eff = player.g.power.max(10).log10().pow(2)
                return eff
            },
            cost: new OmegaNum(4.80001e48),
            canAfford(){return player.g.unlocked},
            type: "playable"
        },
        26: {
            title: "ttops",
            description(){return "Upgrade 4,7,10 first effect become 10^x (before Upgrade 16 boost), Upgrade 10 second effect is raised by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(2)
                return eff
            },
            cost: new OmegaNum(1e54),
            canAfford(){return player.g.unlocked},
            type: "broken"
        },
        27: {
            title: "erofu",
            description(){return "Raise Upgrade 2 effect by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(2)
                return eff
            },
            cost: new OmegaNum(1e85),
            canAfford(){return player.g.unlocked},
            type: "empty"
        },
        28: {
            title: "jacobcoder",
            description(){return "Upgrade 20 is stronger (+" + format(this.effect(),3) + " to exponent^2)"},
            effect(){
                let eff = new OmegaNum(1/12)
                return eff
            },
            cost: new OmegaNum(2.0102e102),
            canAfford(){return player.g.unlocked},
            type: "empty"
        },
        29: {
            title: "denisolenison",
            description(){return "Raise G to P effect by " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(1.5)
                return eff
            },
            cost: new OmegaNum(3.210123e123),
            canAfford(){return player.g.unlocked},
            type: "playable"
        },
        30: {
            title: "Bwing89",
            description(){return "Increase Upgrade 9 base by " + format(this.effect()[0].mul(100)) + "%, multiply points and generator power gain by " + format(this.effect()[1])},
            effect(){
                let eff = [new OmegaNum(0.89),new OmegaNum(89)]
                return eff
            },
            cost: new OmegaNum(1e145),
            canAfford(){return player.g.unlocked},
            type: "empty"
        },
        31: {
            title: "demonicRiddle",
            description(){return "Increase Upgrade 2 base by " + format(this.effect().mul(100)) + "% (based on Enhance Points)"},
            effect(){
                let eff = player.e.points.add(1).log10().mul(100)
                if (eff.gte(100)) eff = eff.div(100).pow(0.5).mul(100)
                return eff
            },
            cost: new OmegaNum(1e187),
            canAfford(){return player.e.unlocked},
            type: "playable"
        },
        32: {
            title: "jokre33",
            description(){return "Increase Generator base by " + format(this.effect()) + " (based on Enhance Points)"},
            effect(){
                let eff = player.e.points.add(1).log10()
                if (eff.gte(10)) eff = eff.div(10).pow(0.5).mul(10)
                return eff
            },
            cost: new OmegaNum("1e338"),
            canAfford(){return player.e.unlocked},
            type: "playable"
        },
        33: {
            title: "meme0846",
            description(){return "Raise Upgrade 14 effect by " + format(this.effect()) + ""},
            effect(){
                let eff = new OmegaNum(8.46)
                return eff
            },
            cost: new OmegaNum("8.46001e392"),
            canAfford(){return player.e.unlocked},
            type: "playable"
        },
        34: {
            title: "Pyrocon",
            description(){return "For every " + format(OmegaNum.pow(2,1024)) + "x of product of Points and PP, increase enhance points gain by " + format(this.effect().base.mul(100)) + "%, currently: " + format(this.effect().eff) + "x"},
            effect(){
                let effBase = new OmegaNum(1)

                let x = player.points.max(1).mul(player.p.points.max(1))

                let eff = effBase.mul(x.logBase(OmegaNum.pow(2,1024)).floor()).add(1)
                eff = eff.pow(2)
                return {base: effBase, eff: eff, amt: x}
            },
            cost: new OmegaNum(2).pow(2048),
            canAfford(){return player.e.unlocked},
            type: "empty"
        },
        35: {
            title: "flammehawk",
            description(){return "Boosters effect multiply Generator Power gain, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = tmp.b.effect?tmp.b.effect.pow(1/4):new OmegaNum(1)
                return eff
            },
            cost: new OmegaNum("1e650"),
            canAfford(){return player.e.unlocked},
            type: "empty"
        },
        36: {
            title: "JimboSausage",
            description(){return "Multiply Enhance Points gain based on Prestige Points, currently: " + format(this.effect()) + "x"},
            effect(){
                let eff = player.p.points.max(10).log10().pow(0.5)
                return eff
            },
            cost: new OmegaNum("1e835"),
            canAfford(){return player.e.unlocked},
            type: "empty"
        },
        37: {
            title: "c0v1d-9119361",
            description(){return "Multiply Enhance Points gain by " + format(this.effect(),4) + ""},
            effect(){
                let eff = new OmegaNum(911.9361)
                return eff
            },
            cost: new OmegaNum("9.361e925"),
            canAfford(){return player.e.unlocked},
            type: "playable"
        },
        38: {
            title: "SandKingg",
            description(){return "Increase 'B to G' effect exponent by " + format(this.effect(),3) + ""},
            effect(){
                let eff = new OmegaNum(0.575-1/3)
                return eff
            },
            cost: new OmegaNum("e1008"),
            canAfford(){return player.e.unlocked},
            type: "playable"
        },
        39: {
            title: "DioiD-Pissman",
            description(){return "'Point boost' and 'Prestige boost' softcap starts " + format(this.effect()) + "x later"},
            effect(){
                let eff = new OmegaNum(1e150)
                return eff
            },
            cost: new OmegaNum("e1125"),
            canAfford(){return player.e.unlocked},
            type: "playable"
        },
        40: {
            title: "thebroziscool",
            description(){return "Increase Upgrade 9 base by " + format(this.effect().mul(100)) + "% (based on Enhance Points)"},
            effect(){
                let eff = player.e.points.max(1).log10().pow(2.3).div(100)
                return eff
            },
            cost: new OmegaNum("e1420"),
            canAfford(){return player.e.unlocked},
            type: "empty"
        },
        // next upgrade cost: 1e1420
        // goal: 1e1500 PP
        /*number: {
            title: "username",
            description(){return "effect, currently: " + format(this.effect())},
            effect(){
                let eff = new OmegaNum(1)
                return eff
            },
            cost: new OmegaNum(1),
            canAfford(){return player.layer.unlocked},
            type: "playable empty broken"
        },*/
    },
    autoUpgrade(){return tmp.auto.clickables['p_Upgs'].isActivated},
    grid:{
        rows(){
            let max = 0
            if (player.p.unlocked) max+=10
            if (player.b.unlocked) max+=10
            if (player.g.unlocked) max+=10
            if (player.e.unlocked) max+=10
            return Math.ceil((max-0.5)/(player.p.reduceColumn?5:10))
        },
        maxRows: 100,
        cols(){
            return player.p.reduceColumn?5:10
        },
        maxCols: 10,
        getStartData(id){
            return true
        },
        getDisplay(data,id){
            let x = convertGridToNum(id,player.p.reduceColumn?5:10).toString()
            return "<b style='font-size:18px;'>" + x + "</b><br><br>" + (tmp.p.upgrades[x]?tmp.p.upgrades[x].title:"???") + (tmp.p.upgrades[x]?(tmp.p.upgrades[x].title.length<=12?"<br>":""):"<br>")
        },
        getTooltip(data,id){
            let x = convertGridToNum(id,player.p.reduceColumn?5:10).toString()
            return (tmp.p.upgrades[x]?tmp.p.upgrades[x].description:"???") + "<br><br>" + 
            "Cost: " + formatWhole(tmp.p.upgrades[x]?tmp.p.upgrades[x].cost:1/0) + " PP"
        },
        getCanClick(data,id){
            let x = convertGridToNum(id,player.p.reduceColumn?5:10).toString()
            return tmp.p.upgrades[x] && canAffordUpgrade('p', x) && !player.p.upgrades.includes(x)
        },
        onClick(data,id){
            let x = convertGridToNum(id,player.p.reduceColumn?5:10).toString()
            if (tmp.p.upgrades[x]) buyUpgrade('p', x)
        },
        getStyle(data,id){
            let x = convertGridToNum(id,player.p.reduceColumn?5:10).toString()
            let color = '#bf8f8f'
            if (tmp.p.upgrades[x] && canAffordUpgrade('p', x)) color = '#31aeb0'
            if (player.p.upgrades.includes(x)){
                if (tmp.p.upgrades[x] && tmp.p.upgrades[x].type == "playable") color = '#31b033'
                else if (tmp.p.upgrades[x] && tmp.p.upgrades[x].type == "empty") color = '#aeb031'
                else if (tmp.p.upgrades[x] && tmp.p.upgrades[x].type == "broken") color = '#b03331'
            }
            return {'word-wrap':'break-word','height':'88px','width':'88px','background-color':color,'border-radius': '0%',}
        },
    },
})
