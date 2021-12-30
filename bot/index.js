const Caver = require("caver-js");
const ConfigYaml = require("config-yaml");
const addrBook = ConfigYaml("./addrBook.yaml");

const EN_NODE = "https://gateway.pala.world";

const Token = require("../build/contracts/IToken");
const PairPool = require("../build/contracts/IPairPool");
const PalaViewer = require("../build/contracts/PalaViewer");

const caver = new Caver(EN_NODE);

const DEX = Object.freeze({
    PalaDEX: 0,
    Klayswap: 1
});
const POOL = Object.freeze({
    klay_kusdt: "klay-kusdt",
    pala_kusdt: "pala-kusdt",
    pala_klay: "pala-klay"
});

const getTokenDecimal = async (tokenAddr) => {
    const token = await caver.contract.create(Token.abi, tokenAddr);
    return await token.methods.decimals().call();
}

const getPoolReserves = async (dexType, poolType) => {
    let pool;
    let res;
    switch (dexType) {
        case DEX.PalaDEX:
            pool = caver.contract.create(PairPool.abi, addrBook.palaPools[poolType]);
            res = await pool.methods.getReserves().call();
            break;
        case DEX.Klayswap:
            pool = caver.contract.create(PairPool.abi, addrBook.klayswapPools[poolType]);
            res = await pool.methods.getCurrentPool().call();
            break;
        default:
            break;
    }
    return res;
}

const calcValueDiff = async (reserves0, reserves1) => {
    const ratio0 = parseInt(reserves0.reserve0) / (parseInt(reserves0.reserve1) * 1e12);
    const ratio1 = parseInt(reserves1.reserve0) / (parseInt(reserves1.reserve1) * 1e12);
    console.log(ratio0);
    console.log(ratio1);
    console.log(Math.abs(ratio0 - ratio1));

    const ratio2 = (parseInt(reserves0.reserve1) * 1e12) / parseInt(reserves0.reserve0);
    const ratio3 = (parseInt(reserves1.reserve1) * 1e12) / parseInt(reserves1.reserve0);
    console.log(ratio2);
    console.log(ratio3);
    console.log(Math.abs(ratio2 - ratio3));
}

const getPalaPriceInfo = async () => {
    const EXCHANGE_RATE = 1200;
    const palaViewer = caver.contract.create(PalaViewer.abi, addrBook.palaContracts.palaViewer);
    const priceInfo = await palaViewer.methods.getPriceInfo().call();

    const palaPriceInKusdt = (parseInt(priceInfo.palaPriceInKusdt) / 1e18 * EXCHANGE_RATE).toFixed(3);
    const palaPriceInKlay= (parseInt(priceInfo.palaPriceInKlay) / 1e18 * EXCHANGE_RATE).toFixed(3);
    const palaR0 = (parseInt(priceInfo.palaReserveInKusdt) / 1e18).toFixed(3);
    const kusdtR = (parseInt(priceInfo.kusdtReserveInKusdt) / 1e18).toFixed(3);
    const palaR1 = (parseInt(priceInfo.palaReserveInKlay) / 1e18).toFixed(3);
    const klayR = (parseInt(priceInfo.klayReserveInKlay) / 1e18).toFixed(3);
    
    return [palaPriceInKusdt, palaPriceInKlay, palaR0, kusdtR, palaR1, klayR];
}

const asyncMain = async () => {
    try {
        const res = await getPalaPriceInfo();
        console.log(res);
    } catch (err) {
        console.log(err); 
    }
}

if (require.main === module) {
    asyncMain();
}
