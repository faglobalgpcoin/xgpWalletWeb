import { action, observable } from "mobx";
import { persist } from "mobx-persist";
import BigNumber from "bignumber.js";

import APP_PROPERTY from "../constants/appProperty";
import { getAppProperties } from "../apis/appProperty";

class SettingStore {
  @persist @observable isLockUpAllUser = "";
  @persist("object") @observable tokenPrice = {
    xgp: "0",
    eth: "0",
    btc: "0"
  };
  @persist("object") @observable tokenPriceByCurrency = {
    xgp: "",
    eth: "",
    btc: ""
  };
  @persist("object") @observable transferFee = {
    xgp: "0",
    eth: "0",
    btc: "0"
  };
  @persist @observable tokenCurrency = "";
  @persist @observable tapickExchangeFee = "";
  @persist @observable feeAddress = "";

  @action setTokenCurrency = async (value) => (this.tokenCurrency = value);
  @action setTokenPriceByCurrency = (value) =>
    (this.tokenPriceByCurrency = value);

  getExchange = async (current) => {
    const obj = {
      method: "spotRateHistory",
      data: {
        base: "KRW",
        term: current,
        period: "day"
      }
    }
    const response = await fetch(
      'https://api.rates-history-service.prd.aws.ofx.com/rate-history/api/1',
      {
        method: 'post',
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const data = await response.json();
    if (data) {
      return data.data.CurrentInterbankRate;
    }
  };

  @action calculatePrice = (currency, price, rate) => {
    const priceBN = new BigNumber(price);
    const rateBN = new BigNumber(rate);

    return priceBN
      .multipliedBy(rateBN)
      .decimalPlaces(4)
      .toString();
  };

  updateTokenPriceByCurrency = async (tokenPrice) => {
    if (this.tokenCurrency && this.tokenCurrency !== "KRW") {
      const rate = await this.getExchange(this.tokenCurrency);

      const currencyPriceXGP = this.calculatePrice(
        this.tokenCurrency,
        tokenPrice.xgp,
        rate
      );
      const currencyPriceETH = this.calculatePrice(
        this.tokenCurrency,
        tokenPrice.eth,
        rate
      );
      const currencyPriceBTC = this.calculatePrice(
        this.tokenCurrency,
        tokenPrice.btc,
        rate
      );

      this.tokenPriceByCurrency = {
        xgp: currencyPriceXGP,
        eth: currencyPriceETH,
        btc: currencyPriceBTC
      };
    } else {
      this.tokenCurrency = "KRW";
      this.tokenPriceByCurrency = {
        xgp: this.tokenPrice.xgp,
        eth: this.tokenPrice.eth,
        btc: this.tokenPrice.btc
      };
    }
  };

  @action updateAppProperty = async (accessToken) => {
    let result;

    try {
      result = await getAppProperties(accessToken);

      if (result.data.length === 0) {
        return;
      }

      for (let i = 0; i < result.data.length; i++) {
        if (result.data[i].keyName === APP_PROPERTY.LOCK_UP_ALL) {
          this.isLockUpAllUser = result.data[i].value;
        } else if (result.data[i].keyName === APP_PROPERTY.TOKEN_PRICE_XGP) {
          this.tokenPrice.xgp = result.data[i].value;
        } else if (result.data[i].keyName === APP_PROPERTY.TRANSFER_FEE_XGP) {
          this.transferFee.xgp = result.data[i].value;
        } else if (result.data[i].keyName === APP_PROPERTY.TOKEN_PRICE_ETH) {
          this.tokenPrice.eth = result.data[i].value;
        } else if (result.data[i].keyName === APP_PROPERTY.TRANSFER_FEE_ETH) {
          this.transferFee.eth = result.data[i].value;
        } else if (result.data[i].keyName === APP_PROPERTY.TOKEN_PRICE_BTC) {
          this.tokenPrice.btc = result.data[i].value;
        } else if (result.data[i].keyName === APP_PROPERTY.TRANSFER_FEE_BTC) {
          this.transferFee.btc = result.data[i].value;
        } else if (
          result.data[i].keyName === APP_PROPERTY.TAPICK_EXCHANGE_FEE
        ) {
          this.tapickExchangeFee = result.data[i].value;
        } else if (result.data[i].keyName === "fee_address") {
          this.feeAddress = result.data[i].value;
        }
      }

      this.updateTokenPriceByCurrency(this.tokenPrice);
    } catch (e) {
      console.log(e);
    }
  };
}

export default SettingStore;
