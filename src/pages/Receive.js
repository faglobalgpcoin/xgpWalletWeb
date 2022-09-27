import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode.react";
import { inject, observer } from "mobx-react";
import { MdContentCopy } from "react-icons/md";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";

import { decodeCookieData, getCookie } from "../utils/auth";
import { verifyUser } from "../apis/auth";
import APP_PROPERTY from "../constants/appProperty";
import { getTokenInfos } from "../apis/user";

function Receive() {
  const { t } = useTranslation();
  const [user, setUser] = useState({});
  const [address, setAddress] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [qrCodeStr, setQrCodeStr] = useState("");

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenType, setTokenType] = useState("");
  const [tokenList, setTokenList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { accessToken } = decodeCookieData(getCookie("key"));
      const userResponse = await verifyUser(accessToken);

      if (userResponse) {
        setUser(userResponse.data);
        setAddress(userResponse.data.address);
        setEthAddress(userResponse.data.ethAddress);
        setBtcAddress(userResponse.data.btcAddress);
        setTokenType("luniverse");
        setTokenSymbol(APP_PROPERTY.TOKEN_SYMBOL["XGP"]);
        setQrCodeStr(
          `${APP_PROPERTY.TOKEN_SYMBOL["XGP"]}:${userResponse.data.address}`
        );
      }
    }

    fetchData();
  }, []);

  const handleClickCopy = () => {
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2500);

    var tempElem = document.createElement("textarea");
    switch (tokenType) {
      case "luniverse":
        tempElem.value = address;
        break;
      case "ethereum":
        tempElem.value = ethAddress;
        break;
      case "bitcoin":
        tempElem.value = btcAddress;
        break;
      default:
        tempElem.value = address;
        break;
    }
    document.body.appendChild(tempElem);

    tempElem.select();
    document.execCommand("copy");
    document.body.removeChild(tempElem);
  };

  const changeToken = async (symbol) => {
    setTokenSymbol(symbol);
    const tokenResponse = await getTokenInfos();
    if (tokenResponse && tokenResponse.status === "success") {
      setTokenList(tokenResponse.data);
      const tokensInfo = tokenResponse.data;
      const tokenInfo = tokensInfo.find(
        (i) => i.symbol === APP_PROPERTY.TOKEN_SYMBOL[symbol]
      );
      if (tokenInfo) {
        const { type } = tokenInfo;
        setTokenType(type);
        if (type === "ethereum") {
          setQrCodeStr(`${symbol}:${ethAddress}`);
        } else if (type === "luniverse") {
          setQrCodeStr(`${symbol}:${address}`);
        } else {
          setQrCodeStr(`${symbol}:${btcAddress}`);
        }
      }
    }
  };

  async function fetchData(symbol) {
    changeToken(symbol);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const tokenListHtml = (idx, symbol, img) => {
    return (
      <Button
        imageUrl={img}
        onClick={() => changeToken(symbol)}
        key={idx}
      >
        {symbol}
      </Button>
    );
  };

  return (
    <div className="container wallet-container">
      <div
        className="k-button-group-wrap"
        // style={{
        //   display: "flex",
        //   marginRight: "15px",
        //   marginBottom: "20px",
        // }}
      >
        <ButtonGroup>
          {tokenList.map((v, i) => {
            return tokenListHtml(i, v.symbol, v.imageUrl);
          })}
        </ButtonGroup>
      </div>

      <div className="card card-full-height border" style={{ padding: 15 }}>
        <div className="content-title title-row">
          <span>
            {t("receive_token", {
              name: tokenSymbol,
            })}
          </span>
        </div>

        <div className="balance-container">
          <span className="address-info">
            {t("your_token_address", { name: tokenSymbol })}
          </span>
          <div
            className={`address-wrapper input-row ${isCopied ? "copied" : ""}`}
            onClick={handleClickCopy}
          >
            {isCopied ? (
              <p style={{ margin: 0 }}>
                {`${t("address_copy_complete", {
                  name: "Address",
                })} 👌`}
              </p>
            ) : (
              <>
                <p className="break-word-all">
                  {tokenType === "luniverse"
                    ? address
                    : tokenType === "ethereum"
                    ? ethAddress
                    : btcAddress}
                </p>
                <span style={{ marginTop: "3px" }}>
                  <MdContentCopy size={20} />
                </span>
              </>
            )}
          </div>
          <div className="qrcode-container">
            <QRCode value={qrCodeStr} size={250} />
          </div>
          <div className="button-container"></div>
        </div>
      </div>
    </div>
  );
}

export default inject("snackbarStore")(observer(Receive));
