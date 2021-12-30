const PalaViewer = artifacts.require("PalaViewer");

let PALA_ADDR;
let KUSDT_ADDR;
let WKLAY_ADDR;

let PALA_KUSDT_ADDR;
let PALA_KLAY_ADDR;
let KUSDT_KLAY_ADDR;

module.exports = async function(deployer, network) {
    if (network == "cypress") {
        PALA_ADDR = "0x7A1CdCA99FE5995ab8E317eDE8495c07Cbf488aD";
        KUSDT_ADDR = "0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167";
        WKLAY_ADDR = "0x2ff5f6dE2287CA3075232127277E53519A77947C";

        PALA_KUSDT_ADDR = "0x2caA83Af6bBF61Dc15e7BCC5952bbb554358AD11";
        PALA_KLAY_ADDR = "0xc556be31D170cA00241231371E139C8e4c0fc204";
        KUSDT_KLAY_ADDR = "0xAb47eDf354348e14cFcc1949b38BF2317d510B79";
    }

    await deployer.deploy(
        PalaViewer,
        PALA_ADDR,
        KUSDT_ADDR,
        WKLAY_ADDR,
        PALA_KUSDT_ADDR,
        PALA_KLAY_ADDR,
        KUSDT_KLAY_ADDR
    );
};
