// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IToken.sol";
import "./interfaces/IPairPool.sol";

contract PalaViewer {
    struct PriceInfo {
        uint256 palaPriceInKusdt;
        uint256 palaPriceInKlay;
        uint112 palaReserveInKusdt;
        uint112 kusdtReserveInKusdt;
        uint112 palaReserveInKlay;
        uint112 klayReserveInKlay;
    }

    address immutable PALA_ADDR;
    address immutable KUSDT_ADDR;
    address immutable WKLAY_ADDR;
    
    address immutable PALA_KUSDT_ADDR;
    address immutable PALA_KLAY_ADDR;
    address immutable KUSDT_KLAY_ADDR;

    constructor(
        address _pala,
        address _kusdt,
        address _wklay,
        address _pala_kusdt,
        address _pala_klay,
        address _kusdt_klay) public 
    {
        PALA_ADDR = _pala;
        KUSDT_ADDR = _kusdt;
        WKLAY_ADDR = _wklay;
        PALA_KUSDT_ADDR = _pala_kusdt;
        PALA_KLAY_ADDR = _pala_klay;
        KUSDT_KLAY_ADDR = _kusdt_klay;
    }

    function getPriceInfo() external view returns (PriceInfo memory) {
        (uint256 palaPrice0, uint256 palaPrice1) = calcPalaPriceInPalaPools();
        (uint112 palaR0, uint112 kusdtR, uint112 palaR1, uint112 klayR) = getPalaPoolReserves();

        return PriceInfo(
            palaPrice0,
            palaPrice1,
            palaR0,
            kusdtR * 1e12,
            palaR1,
            klayR
        );
    }

    function calcPalaPriceInPalaPools() internal view returns (
        uint256 priceInKusdtPool,
        uint256 priceInKlayPool)
    {
        priceInKusdtPool = getExchangeRatio(PALA_KUSDT_ADDR, KUSDT_ADDR, PALA_ADDR);

        uint256 palaKlayExchangeRatio = getExchangeRatio(PALA_KLAY_ADDR, WKLAY_ADDR, PALA_ADDR);
        uint256 klayPrice = getExchangeRatio(KUSDT_KLAY_ADDR, KUSDT_ADDR, WKLAY_ADDR);
        priceInKlayPool = palaKlayExchangeRatio * klayPrice / 1e18;
    }

    function getPalaPoolReserves() internal view returns (
        uint112 palaR0, uint112 kusdtR, uint112 palaR1, uint112 klayR)
    {
        (uint112 reserve0, uint112 reserve1,) = IPairPool(PALA_KUSDT_ADDR).getReserves();
        (uint112 reserve2, uint112 reserve3,) = IPairPool(PALA_KLAY_ADDR).getReserves();
        palaR0 = IPairPool(PALA_KUSDT_ADDR).token0() == PALA_ADDR ? reserve0 : reserve1;
        kusdtR = IPairPool(PALA_KUSDT_ADDR).token1() == KUSDT_ADDR ? reserve1 : reserve0;

        palaR1 = IPairPool(PALA_KLAY_ADDR).token0() == PALA_ADDR ? reserve2 : reserve3;
        klayR = IPairPool(PALA_KLAY_ADDR).token1() == WKLAY_ADDR ? reserve3 : reserve2;
    }

    function getExchangeRatio(address pool, address baseToken, address targetToken)
        internal
        view
        returns (uint256)
    {
        uint256 baseTokenDecimals = IToken(baseToken).decimals();
        uint256 targetTokenDecimals = IToken(targetToken).decimals();

        uint256 expressRange = 1e18;
        uint256 decimalDiff = baseTokenDecimals > targetTokenDecimals ?
            baseTokenDecimals - targetTokenDecimals :
            targetTokenDecimals - baseTokenDecimals;

        IPairPool pair = IPairPool(pool);
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();

        if (reserve0 == 0 || reserve1 == 0) {
            return 0;
        }

        uint256 convertedReserve0;
        uint256 convertedReserve1;

        if (pair.token0() == baseToken) {
            convertedReserve0 = baseTokenDecimals > targetTokenDecimals ?
                reserve0 : reserve0 * 10**decimalDiff;
            convertedReserve1 = baseTokenDecimals > targetTokenDecimals ?
                reserve1 * 10**decimalDiff : reserve1;
           return (convertedReserve0 * expressRange) / convertedReserve1;
        } else {
            convertedReserve0 = baseTokenDecimals > targetTokenDecimals ?
                reserve0 * 10**decimalDiff : reserve0;
            convertedReserve1 = baseTokenDecimals > targetTokenDecimals ?
                reserve1 : reserve1 * 10**decimalDiff;
            return (convertedReserve1 * expressRange) / convertedReserve0;
        }
    }
}
