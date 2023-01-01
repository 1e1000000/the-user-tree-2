addLayer("main", {
    name: "main", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
    }},
    color: "#8c0ade",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side", // Row the layer is in on the tree (0 is the first row)
    tooltip: "Main",
    layerShown(){return true},
    tabFormat:[
        "buyables","blank",
        ["display-text",function(){return tmp.main.buyables[11].allEffect}],
        "blank",
        ["display-text",function(){return tmp.main.buyables[12].allEffect}],
    ],
    buyables:{
        11:{
            title: "Jacorb",
            cost(x){
                let cost = [
                    0,77777777,1e100,
                    Infinity,
                ][x.toNumber()]
                return new OmegaNum(cost)
            },
            display(){
                let x = player[this.layer].buyables[this.id]
                let ver = "N/A"
                if (x.gte(1)) ver = "Pre-Alpha"
                if (x.gte(2)) ver = "Beta 1.0 " + (x.eq(12)?" Full Release":"Alpha "+formatWhole(x.sub(1)))
                if (x.gte(13)) ver = "Beta 1.1 " + (x.eq(34)?" Full Release":"Alpha "+formatWhole(x.sub(12)))
                if (x.gte(35)) ver = "Beta 1.2 " + (x.eq(49)?" Full Release":"Alpha "+formatWhole(x.sub(34)))
                if (x.gte(50)) ver = "v1.0 " + (x.eq(54)?" Full Release":"Beta "+formatWhole(x.sub(49)))
                if (x.gte(55)) ver = "v1.1 " + (x.eq(68)?" Full Release":(x.gte(63)?"Pre Release "+formatWhole(x.sub(62)):"Beta "+formatWhole(x.sub(54))))
                if (x.gte(69)) ver = "v1.2 " + (x.eq(80)?" Full Release":(x.gte(63)?"Pre Release "+formatWhole(x.sub(76)):"Beta "+formatWhole(x.sub(68))))
                if (x.gte(81)) ver = "v1.3 " + (x.eq(105)?" Full Release":"Beta "+formatWhole(x.sub(80)))
                if (x.gte(105)) ver = "v1.3 Full Release"

                let eff = [
                    "Produce 1 point per second",
                    "Multiply points gain by 10",
                    "Multiply points gain by 1e9",
                    "???",
                ]

                let disp = "Current version:<br>" + ver + " (" + formatWhole(player[this.layer].buyables[this.id]) + ")" + "<br><br>"
                disp += "Next Level effect:<br>" + eff[x] + "<br><br>"
                disp += "Require for next level:<br>" + format(this.cost()) + " points"

                return disp
            },
            allEffect(){
                let x = player[this.layer].buyables[this.id].toNumber()
                let array = [
                    [new OmegaNum(1),new OmegaNum(10),new OmegaNum(1e10)]
                ]
                let display = "<h2>Jacorb effects:</h2>"
                if (x==0) return "None"
                if (x>=1) display += "<br>Produce 1 point per second"
                if (x>=2) display += "<br>Points gain x" + format(array[0][x-1])

                return display
            },
            canAfford(){
                return player.points.gte(this.cost())
            },
            buy(){
                if (!this.canAfford()) return
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            purchaseLimit: new OmegaNum(105),
        },
        12:{
            title: "Acamaeda",
            cost(x){
                let cost = [
                    0,10,15,20,26,30,
                    1.79769e308,
                ][x.toNumber()]
                return cost
            },
            display(){
                let x = player[this.layer].buyables[this.id]
                let ver = "N/A"
                if (x.gte(1)) ver = "v1.0"
                if (x.gte(2)) ver = "v1.1" + (x.eq(2)?"":"."+formatWhole(x.sub(2)))
                if (x.gte(4)) ver = "v1.2" + (x.eq(4)?"":"."+formatWhole(x.sub(4)))
                if (x.gte(9)) ver = "v1.3" + (x.eq(9)?"":"."+formatWhole(x.sub(9)))
                if (x.gte(15)) ver = "v2.0" + (x.eq(15)?"":"."+formatWhole(x.sub(15)))
                if (x.gte(21)) ver = "v2.1" + (x.eq(21)?"":"."+formatWhole(x.sub(21)))
                if (x.gte(26)) ver = "v2.2" + (x.eq(26)?"":"."+formatWhole(x.sub(26)))
                if (x.gte(35)) ver = "v2.3" + (x.eq(35)?"":"."+formatWhole(x.sub(35)))
                if (x.gte(41)) ver = "v2.pi" + (x.eq(41)?"":"."+formatWhole(x.sub(41)))
                if (x.gte(43)) ver = "v2.4" + (x.eq(43)?"":"."+formatWhole(x.sub(43)))
                if (x.gte(45)) ver = "v2.5" + (x.eq(45)?"":"."+formatWhole(x.sub(45)))
                if (x.gte(57)) ver = "v2.6" + (x.eq(57)?"":"."+formatWhole(x.sub(57)))
                if (x.gte(63)) ver = "v2.6.6"

                let eff = [
                    "Unlock Prestige",
                    "Unlock Booster",
                    "Unlock an automation for Prestige Upgrades",
                    "Unlock Generator",
                    "Unlock an automation for Prestige Points",
                    "Unlock a new layer, the cost of the first generator is now same as the first booster (1e40 -> 1e6)",
                    "???",
                ]

                let disp = "Current version:<br>" + ver + " (" + formatWhole(player[this.layer].buyables[this.id]) + ")" + "<br><br>"
                disp += "Next Level effect:<br>" + eff[x] + "<br><br>"
                disp += "Require for next level:<br>" + formatWhole(this.cost()) + " prestige upgrades"

                return disp
            },
            allEffect(){
                let x = player[this.layer].buyables[this.id].toNumber()
                let array = [
                    [0,1,2,2,3,3,3], // layers
                    [0,0,0,1,1,2,2], // automations
                    [0,0,0,0,0,0,0], // max static
                ]
                let display = "<h2>Acamaeda effects:</h2>"
                if (x==0) return "None"
                if (x>=1) display += "<br>Unlock " + formatWhole(array[0][x]) + " layers"
                if (x>=3) display += "<br>Automate " + formatWhole(array[1][x]) + " stuffs"
                if (x>=6) display += "<br>Buy Max " + formatWhole(array[2][x]) + " static layer resources"
                if (x>=6) display += "<br>Reduce the base generator cost from 1e40 to 1e6"

                return display
            },
            canAfford(){
                return player.p.upgrades.length>=this.cost()
            },
            buy(){
                if (!this.canAfford()) return
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
            },
            purchaseLimit: new OmegaNum(63),
        },
    },
})

addLayer("auto", {
    name: "auto", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AB", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        p_Upgs: false,
        p_Points: false,
    }},
    color: "#ffff00",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side", // Row the layer is in on the tree (0 is the first row)
    tooltip: "Autobuyers",
    layerShown(){return buyableGTE("main",12,3)},
    tabFormat:[
        ["display-text",function(){return "<h2>Prestige</h2>"}],
        ["row",[["clickable","p_Upgs"],"blank",["clickable","p_Points"]]],
        "blank",
    ],
    clickables:{
        p_Upgs:{
            title: "Prestige Upgrades",
            display(){
                return !this.canActive()?"Require 6 best boosters":(player.auto[this.id]?"ON":"OFF")
            },
            unlocked(){
                return buyableGTE("main",12,3)
            },
            canActive(){
                return player.b.best.gte(6)
            },
            canClick(){
                return buyableGTE("main",12,3) && this.canActive()
            },
            isActivated(){
                return player.auto[this.id] && this.canActive()
            },
            onClick(){
                player.auto[this.id] = Boolean(1-player.auto[this.id])
            },
            style(){
                return {'background-color':'#31aeb0'}
            },
        },
        p_Points:{
            title: "Prestige Points",
            display(){
                return !this.canActive()?"Require 13 best generators":(player.auto[this.id]?"ON":"OFF")
            },
            unlocked(){
                return buyableGTE("main",12,5)
            },
            canActive(){
                return player.g.best.gte(13)
            },
            canClick(){
                return buyableGTE("main",12,5) && this.canActive()
            },
            isActivated(){
                return player.auto[this.id] && this.canActive()
            },
            onClick(){
                player.auto[this.id] = Boolean(1-player.auto[this.id])
            },
            style(){
                return {'background-color':'#31aeb0'}
            },
        },
    },
    automate(){

    },
})

addLayer("stat", {
    name: "stat", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ST", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
    }},
    color: "#ffffff",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: "side", // Row the layer is in on the tree (0 is the first row)
    tooltip: "Statistics",
    layerShown(){return true},
    tabFormat:[
        ["display-text",function(){
            return tmp.stat.getPointProductionBreakdown
        }],
        "blank","blank",
        ["display-text",function(){
            return tmp.stat.getPrestigeResources
        }],
    ],
    getPointProductionBreakdown(){
        let effectFrom = [
            [ // multi
                "Level 2 Jacorb Buyable",
                "Level 3 Jacorb Buyable",
                "Prestige Upgrade 1",
                "Prestige Upgrade 2",
                "Prestige Upgrade 4",
                "Prestige Upgrade 5",
                "Prestige Upgrade 8",
                "Prestige Upgrade 15",
                "Prestige Upgrade 18",
                "Prestige Upgrade 30",
                "Boosters",
                "Generator Power"
            ],
            [ // exp
                "Generator Upgrade 'PU11 boost'"
            ],
        ]
        let effect = [
            [ // multi
                new OmegaNum(10),
                new OmegaNum(1e9),
                upgradeEffect('p',1).curr,
                upgradeEffect('p',2).eff,
                upgradeEffect('p',4),
                upgradeEffect('p',5),
                upgradeEffect('p',8),
                upgradeEffect('p',15),
                upgradeEffect('p',18),
                upgradeEffect('p',30)[1],
                tmp.b.effect,
                tmp.g.effect.eff,
            ],
            [ // exp
                upgradeEffect('g',14),
            ]
        ]
        let text = "<h2>Production breakdown</h2><br><h3>Points multiplier</h3>"
        text += "<br>Base points production: " + formatWhole(buyableGTE("main",11,1)?1:0) + "/s"
        for (let i=0;i<effectFrom[0].length-0.5;i++){
            text += "<br>From " + effectFrom[0][i] + ": x" + format(effect[0][i])
        }
        text += "<br>" + "-".repeat(40)
        text += "<br>Total point gain multi: x" + format(getPointsGainMulti())
        text += "<br><br><h3>Points exponent</h3>"
        for (let i=0;i<effectFrom[1].length-0.5;i++){
            text += "<br>From " + effectFrom[1][i] + ": ^" + format(effect[1][i],4)
        }
        text += "<br>" + "-".repeat(40)
        text += "<br>Total point gain exp: ^" + format(getPointsGainExp(),4) + "<br>"
        text += "<br>Total points generation: " + format(getPointGen()) + "/s"
        return text
    },
    getPrestigeResources(){
        let resName = [" prestige points"," boosters"," generators"]
        let resID = ["p","b","g"]
        let text = "<h2>Prestige Resources</h2>"
        for (let i=0;i<resName.length-0.5;i++){
            if (player[resID[i]].unlocked) text += "<br>You have " + formatWhole(player[resID[i]].points) + resName[i]
        }
        return text
    },
})