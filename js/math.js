function powExp(n, exp){
    n = new OmegaNum(n)
	if (n.lt(10)) return n
	return OmegaNum.pow(10,n.log10().pow(exp))
}

function powExp2(n, exp){
    n = new OmegaNum(n)
	if (n.lt(1e10)) return n
	return OmegaNum.pow(10,OmegaNum.pow(10,n.log10().log10().pow(exp)))
}

function powExp3(n, exp){
    n = new OmegaNum(n)
	if (n.lt(OmegaNum.pow(10,1e10))) return n
	return OmegaNum.pow(10,OmegaNum.pow(10,OmegaNum.pow(10,n.log10().log10().log10().pow(exp))))
}

function inf(x = 1){
	return new OmegaNum(Number.MAX_VALUE).pow(x)
}

function inflog(x = 1){
	return new OmegaNum(Number.MAX_VALUE).log10().pow(x)
}

function slog(n){
	n = new OmegaNum(n)
	return n.slog()
}

function slogadd(n,add){
	n = new OmegaNum(n)
	return OmegaNum.tetrate(10,slog(n).add(add))
}

function mulSlog(n, mul){
	if (n.lt(1)) return n
	return tet10(slog(n).mul(mul))
}

function powSlog(n, exp){
	if (n.lt(10)) return n
	return tet10(slog(n).pow(exp))
}

function tet10(n){
	n = new OmegaNum(n)
	return OmegaNum.tetrate(10,n)
}

function pent10(n){
	n = new OmegaNum(n)
	return OmegaNum.pentate(10,n)
}

function ackB10(arrow, n){
    arrow = new OmegaNum(arrow).add(2).floor()
    n = new OmegaNum(n)
    return OmegaNum.hyper(arrow)(10,n)
}

function hyper(arrow){
    arrow = new OmegaNum(arrow)
    let n = arrow.sub(arrow.floor())
    n = OmegaNum.pow(5,n).mul(2)
    arrow = arrow.floor()
    return OmegaNum.hyper(arrow)(10,n)
}

// game functions

function convertNumToGrid(num,col=10){
    return Math.floor((num-1)/col+1)*100+(num-1)%col+1
}

function convertGridToNum(pos,col=10){
    return (Math.floor(pos/100)-1)*col+Math.min(pos%100,col)
}

function buyableGTE(layer,id,amt){
    return player[layer].buyables[id].gte(new OmegaNum(amt))
}