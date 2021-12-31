const Caver = require("caver-js");
const ConfigYaml = require("config-yaml");
const addrBook = ConfigYaml("./addrBook.yaml");

const EN_NODE = "https://gateway.pala.world";

const Token = require("../build/contracts/IToken");
const PairPool = require("../build/contracts/IPairPool");
const PalaViewer = require("../build/contracts/PalaViewer");

const caver = new Caver(EN_NODE);
const palaViewer = caver.contract.create(PalaViewer.abi, addrBook.palaContracts.palaViewer);

const DEX = Object.freeze({
    PalaDEX: 0,
    Klayswap: 1
});
const TOKENS = Object.freeze({
    wklay: "wklay",
    pala: "pala",
    kusdt: "kusdt"
});
const POOL = Object.freeze({
    klay_kusdt: "klay-kusdt",
    pala_kusdt: "pala-kusdt",
    pala_klay: "pala-klay"
});

const getPalaPriceInfo = async () => {
    const EXCHANGE_RATE = 1200;
    const priceInfo = await palaViewer.methods.getPriceInfo().call();

    const palaPriceInKusdt = (parseInt(priceInfo.palaPriceInKusdt) / 1e18 * EXCHANGE_RATE).toFixed(3);
    const palaPriceInKlay= (parseInt(priceInfo.palaPriceInKlay) / 1e18 * EXCHANGE_RATE).toFixed(3);
    const palaR0 = (parseInt(priceInfo.palaReserveInKusdt) / 1e18).toFixed(3);
    const kusdtR = (parseInt(priceInfo.kusdtReserveInKusdt) / 1e18).toFixed(3);
    const palaR1 = (parseInt(priceInfo.palaReserveInKlay) / 1e18).toFixed(3);
    const klayR = (parseInt(priceInfo.klayReserveInKlay) / 1e18).toFixed(3);
    
    return [palaPriceInKusdt, palaPriceInKlay, palaR0, kusdtR, palaR1, klayR];
}

const printPriceInfo = (info) => {
    console.log(`=======================================`);
    console.log(`PALA price in PALA-KUSDT: ${info[0]} won`); 
    console.log(`* pala reserve: ${info[2]}`);
    console.log(`* kusdt reserve: ${info[3]}`);
    console.log(`PALA price in PALA-KLAY: ${info[1]} won`); 
    console.log(`* pala reserve: ${info[4]}`);
    console.log(`* klay reserve: ${info[5]}`);
    const priceDiff = Math.abs(parseInt(info[0]) - parseInt(info[1]));
    const cheaperPool = info[0] < info[1] ? "PALA-KUSDT" : "PALA-KLAY";
    console.log(`--------------------------------------`);
    console.log(`cheaper in ${cheaperPool} as ${priceDiff} won`);
    console.log(`=======================================`);
}

const scanSpread = async () => {
    const inputAmount = [1, 10, 100, 1000];
    for (let i = 0; i < inputAmount.length; ++i) {
        let info = await palaViewer.methods.scanSpread(inputAmount[i]).call();
        let outputToken = (info.outputToken).toLowerCase();
        let kusdtAddr = (addrBook.tokens[TOKENS.kusdt]).toLowerCase();

        let inputDecimals = outputToken == kusdtAddr ? 1e18 : 1e6;
        let inputToken = outputToken == kusdtAddr ? TOKENS.wklay : TOKENS.kusdt;
        let expectedAmount = (parseInt(info.spread) / inputDecimals).toFixed(3);

        console.log(`[input] ${inputToken}: ${inputAmount[i]}`);
        console.log(`[get] ${inputToken}: ${expectedAmount}`);
        console.log(`[Expected profit] ${(parseFloat(expectedAmount) - inputAmount[i]).toFixed(3)} ${inputToken}`);
        console.log(`---------------------------------`);
    }
}

const asyncMain = async () => {
    try {
        const res = await getPalaPriceInfo();
        printPriceInfo(res);
        await scanSpread();
    } catch (err) {
        console.log(err); 
    }
}

if (require.main === module) {
    asyncMain();
}
