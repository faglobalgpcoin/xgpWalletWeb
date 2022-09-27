import React, { useEffect, useState, useMemo } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";
import { useTranslation } from "react-i18next";
import { FiArrowDownCircle } from "react-icons/fi";
import { FiArrowUpCircle } from "react-icons/fi";
import { FiArrowRight } from "react-icons/fi";
import { MdKeyboardArrowRight } from "react-icons/md";
import BigNumber from "bignumber.js";
import { observer, inject } from "mobx-react";

import { timeConverterNumber, NumberWithCommas } from "../utils/string";
import { getAppProperties } from "../apis/appProperty";
import { verifyUser } from "../apis/auth";
import { getTransferEvent, getBalance } from "../apis/wallet";
import { getTokenInfos } from "../apis/user";
import { decodeCookieData, getCookie } from "../utils/auth";
import APP_PROPERTY from "../constants/appProperty";

const Dashboard = ({ history, settingStore }) => {
	const { tokenPriceByCurrency, tokenCurrency, feeAddress } = settingStore;

	const { t } = useTranslation();
	const [properties, setProperties] = useState([]);
	const [gridData, setGridData] = useState([]);
	const [address, setAddress] = useState("");
	const [ethAddress, setEthAddress] = useState("");
	const [btcAddress, setBtcAddress] = useState("");
	const [decimals, setDecimals] = useState("");
	const [balance, setBalance] = useState("");
	const [addressBreak, setAddressBreak] = useState(false);

	const [tokenType, setTokenType] = useState("");
	const [tokenImage, setTokenImage] = useState("");
	const [tokenSymbol, setTokenSymbol] = useState("");
	const [tokenName, setTokenName] = useState("");
	const [tokenList, setTokenList] = useState([]);
	const [rootSymbol, setRootSymbol] = useState("xgp");

	const assetTotal = useMemo(() => {
		const balanceBN = new BigNumber(balance);
		let assetTotalStr;
		if (balanceBN) {
			assetTotalStr = balanceBN.multipliedBy(settingStore.tokenPriceByCurrency[rootSymbol]).toString();
		}

		return assetTotalStr;
	}, [balance, rootSymbol, settingStore.tokenPriceByCurrency]);

	useEffect(() => {
		async function fetchData() {
			const cookieData = decodeCookieData(getCookie("key"));
			await settingStore.updateAppProperty(cookieData.accessToken);

			const userResponse = await verifyUser(cookieData.accessToken);
			const tokenResponse = await getTokenInfos();
			const txResponse = await getTransferEvent(cookieData.accessToken, "XGP", "luniverse");
			const response = await getAppProperties(cookieData.accessToken);
			setAddress(userResponse.data.address);
			setEthAddress(userResponse.data.ethAddress);
			setBtcAddress(userResponse.data.btcAddress);

			if (response) {
				setProperties(response.data);
			}

			if (tokenResponse && tokenResponse.status === "success") {
				setTokenList(tokenResponse.data);
				const tokensInfo = tokenResponse.data;
				const tokenInfo = tokensInfo.find((i) => i.symbol === APP_PROPERTY.TOKEN_SYMBOL["XGP"]);

				if (tokenInfo) {
					const { name, symbol, imageUrl, decimals, type } = tokenInfo;
					setTokenImage(imageUrl);
					setTokenSymbol(symbol);
					setTokenName(name);
					setTokenType(type);
					setDecimals(decimals);

					const tokenBalanceResponse = await getBalance(cookieData.accessToken, "XGP", "luniverse");
					if (tokenBalanceResponse && tokenBalanceResponse.status === "success") {
						const { balance } = tokenBalanceResponse.data;
						const balanceBN = new BigNumber(balance);
						const balanceStr = balanceBN.shiftedBy(-decimals).toString();
						setBalance(balanceStr);
					} else {
						setBalance("0");
					}
				} else {
					setDecimals("18");
				}
			}

			if (txResponse && txResponse.status === "success") {
				setGridData(txResponse.data.txns.filter((tx) => tx.token.symbol === APP_PROPERTY.TOKEN_SYMBOL["XGP"]).slice(0, 10));
			}
		}

		fetchData();

		if (window.innerWidth <= 768) {
			setAddressBreak(true);
		} else {
			setAddressBreak(false);
		}
	}, [settingStore]);

	const formatValue = (value) => {
		const amountBN = new BigNumber(value);
		const amountStr = amountBN.shiftedBy(-decimals).toString();
		return amountStr;
	};

	const fetchBalance = async (address, symbol) => {
		const cookieData = decodeCookieData(getCookie("key"));
		setRootSymbol(symbol.toLowerCase());
		const tokenResponse = await getTokenInfos();

		if (tokenResponse && tokenResponse.status === "success") {
			const tokensInfo = tokenResponse.data;
			const tokenInfo = tokensInfo.find((i) => i.symbol === APP_PROPERTY.TOKEN_SYMBOL[symbol]);

			if (tokenInfo) {
				const { name, symbol, imageUrl, type, decimals } = tokenInfo;
				setTokenImage(imageUrl);
				setTokenSymbol(symbol);
				setTokenName(name);
				setTokenType(type);
				setDecimals(decimals);

				const tokenBalanceResponse = await getBalance(cookieData.accessToken, symbol, type);
				const txResponse = await getTransferEvent(cookieData.accessToken, symbol, type);

				if (tokenBalanceResponse && tokenBalanceResponse.status === "success") {
					const { balance } = tokenBalanceResponse.data;
					const balanceBN = new BigNumber(balance);
					const balanceStr = balanceBN.shiftedBy(-decimals).toString();
					setBalance(balanceStr);
				} else {
					setBalance("0");
				}

				if (txResponse && txResponse.status === "success" && type === "luniverse") {
					setGridData(txResponse.data.txns.filter((tx) => tx.token.symbol === APP_PROPERTY.TOKEN_SYMBOL[symbol]).slice(0, 10));
				} else if (txResponse && txResponse.status === "success" && type === "ethereum") {
					setGridData(txResponse.data.txns.slice(0, 10));
				} else if (txResponse && txResponse.status === "success" && type === "bitcoin") {
					setGridData(txResponse.data.txns.slice(0, 10));
				}
			} else {
				setDecimals("18");
			}
		}
	};

	const tokenListHtml = (idx, symbol, img) => {
		return (
			<Button imageUrl={img} onClick={() => fetchBalance(address, symbol)} key={idx}>
				{symbol}
			</Button>
		);
	};

	return (
		<div className="content container">
			<div
				className="k-button-group-wrap"
				// style={{
				//   display: "flex",
				//   marginRight: "15px",
				//   marginLeft: "15px",
				//   marginBottom: "20px",
				//   overflow: "auto",
				// }}
			>
				<ButtonGroup>
					{tokenList.map((v, i) => {
						return tokenListHtml(i, v.symbol, v.imageUrl);
					})}
				</ButtonGroup>
			</div>

			<div className="input-header">
				<div
					className="token-information card card-full-height"
					style={{
						display: "flex",
						marginLeft: "15px",
						marginRight: "15px",
					}}
				>
					<div className="row no-gutters height-100 second-header" style={{ display: "flex", flex: 1 }}>
						<div className="col-md-6 text-center flex-center mobile-hr border" style={{ flex: 1 }}>
							<div className="token-info">
								<div className="token-info-list">
									<div className="token-info-iconWrap">
										<img className="token-info-icon" src={tokenImage} alt="icon" />
									</div>
									<div>
										<ul>
											<li>
												{/* <span>{t("coin_name")} : </span> */}
												<span>{t("coin_name")}</span>
												{tokenName}
											</li>
											<li>
												{/* <span>{t("coin_symbol")} : </span> */}
												<span>{t("coin_symbol")}</span>
												{tokenSymbol}
											</li>
										</ul>
									</div>
								</div>

								<div className="gaps-2x" />
								<div className="token-info-priceWrap">
									<h1 className="token-info-head text-light">
										{assetTotal ? NumberWithCommas(assetTotal, 4) : 0} <span>{tokenCurrency}</span>
									</h1>
									<h5 className="token-info-sub" style={{ marginTop: 0 }}>
										1 {tokenSymbol} = {tokenPriceByCurrency[rootSymbol]} {tokenCurrency}
									</h5>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div
					className="token-statistics card card-token height-auto"
					// style={{
					//   display: "flex",
					//   alignItems: "center",
					//   marginRight: "15px",
					//   marginLeft: "15px",
					//   width: "100%",
					// }}
				>
					<div className="card-innr">
						<div className="token-balance token-balance-with-icon">
							{/* <div className="token-balance-icon">
                <img src={tokenImage} alt="icon" />
              </div> */}
							<div className="token-balance-text">
								<span className="card-sub-title">
									{tokenSymbol} {t("holding_amount")}
								</span>
								<span className="lead">
									{balance ? NumberWithCommas(balance, 4) : "-"} <span>{tokenSymbol}</span>
								</span>
							</div>
						</div>
						<div className="token-balance token-balance-s2">
							<h6 className="card-sub-title">{t("your_address")}</h6>
							<ul className="token-balance-list">
								<li className={`token-balance-sub ${addressBreak ? "break-word-all" : ""}`}>
									<span className="lead" onClick={() =>
                    window.open(
                      tokenType === "luniverse"
                        ? "https://sidescan.luniverse.io/chains/7806468005210300226/accounts/" + address
                        : tokenType === "ethereum"
                        ? "https://etherscan.io/address/" + ethAddress + "#tokentxns"
                        : "https://blockchain.com/btc/address/" + btcAddress,
                      "_blank"
                    )
                  }>
                    {tokenType === "luniverse" ? address : tokenType === "ethereum" ? ethAddress : btcAddress}
									</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div className="card card-full-height transaction" style={{ marginLeft: 15, marginRight: 15, padding: 15 }}>
				<div className="content-title title-row">
					<span>{t("transaction_history")}</span>
					<div className="navlink-text" onClick={() => history.push("/transactions")}>
						<span>{t("view_all")}</span>
						<MdKeyboardArrowRight size={20} />
					</div>
				</div>
				<div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
					<Grid style={{ height: "85%", width: "100%" }} data={gridData && gridData.length > 0 ? gridData : []} resizable sortable>
						<Column field="from" title="From" width={addressBreak ? "200px" : ""} cell={(props) => <td colSpan="1">{props.dataItem.from === feeAddress ? "Fee" : props.dataItem.from}</td>} />
						<Column
							field=""
							title=" "
							width="30px"
							cell={(props) => (
								<td colSpan="1" style={{ padding: 0 }}>
									<FiArrowRight size={18} style={{ color: "gray", marginBottom: -5 }} />
								</td>
							)}
						/>
						<Column field="to" title="To" width={addressBreak ? "200px" : ""} cell={(props) => <td colSpan="1">{props.dataItem.to === feeAddress ? "Fee" : props.dataItem.to}</td>} />
						<Column
							field="timestamp"
							title="Date"
							width="200px"
							cell={(props) => (
								<td colSpan="1">
									{timeConverterNumber(tokenType === "luniverse" ? props.dataItem.timestamp * 1000 : tokenType === "ethereum" ? props.dataItem.timeStamp * 1000 : props.dataItem.time * 1000)}
								</td>
							)}
						/>
						<Column
							field="value"
							title="Amount"
							width="280px"
							headerClassName="header-align-right"
							cell={(props) => (
								<td
									colSpan="1"
									style={{
										display: "flex",
										justifyContent: "flex-end",
										alignItems: "center",
									}}
								>
									{/*<div*/}
									{/*	className={`balance-text-${*/}
									{/*		props.dataItem.to === address ? "receive" : "send"*/}
									{/*	}`}>*/}
									<div>
										<span>
											{tokenType === "luniverse"
												? props.dataItem.to === address
													? `+ `
													: `- `
												: tokenType === "ethereum"
												? props.dataItem.to === ethAddress
													? `+ `
													: `- `
												: props.dataItem.to === btcAddress
												? `+ `
												: `- `}
										</span>
										<span>{formatValue(props.dataItem.value)}</span>
									</div>
									<span style={{ marginLeft: 5 }}>{`${tokenSymbol}`}</span>
								</td>
							)}
						/>
						<Column
							field="to"
							title=" "
							width="70px"
							cell={(props) => (
								<td colSpan="1">
									{tokenType === "luniverse" ? (
										props.dataItem.to === address ? (
											<FiArrowDownCircle
												size={20}
												// style={{ color: "#744B26", marginBottom: -5 }}
												style={{ color: "#1A9B27", marginBottom: -5 }}
											/>
										) : (
											<FiArrowUpCircle
												size={20}
												// style={{ color: "#8E54E9", marginBottom: -5 }}
												style={{ color: "#D34848", marginBottom: -5 }}
											/>
										)
									) : tokenType === "ethereum" ? (
										props.dataItem.to === ethAddress ? (
											<FiArrowDownCircle
												size={20}
												// style={{ color: "#744B26", marginBottom: -5 }}
												style={{ color: "#1A9B27", marginBottom: -5 }}
											/>
										) : (
											<FiArrowUpCircle
												size={20}
												// style={{ color: "#8E54E9", marginBottom: -5 }}
												style={{ color: "#D34848", marginBottom: -5 }}
											/>
										)
									) : props.dataItem.to === btcAddress ? (
										<FiArrowDownCircle
											size={20}
											// style={{ color: "#744B26", marginBottom: -5 }}
											style={{ color: "#1A9B27", marginBottom: -5 }}
										/>
									) : (
										<FiArrowUpCircle
											size={20}
											// style={{ color: "#8E54E9", marginBottom: -5 }}
											style={{ color: "#D34848", marginBottom: -5 }}
										/>
									)}
								</td>
							)}
						/>
					</Grid>
				</div>
				{/* <Grid
          style={{height: '90%', width: '100%'}}
          data={properties}
          // onSortChange={(e) => setSort(e.sort)}
          // sort={sort}
          resizable
          // sortable
        >
          <Column field="id" title="Id" width="350px" />
          <Column field="keyName" title="Key Name" width="250px" />
          <Column field="value" title="Value" />
          <Column
            title=""
            width="200px"
            locked
            cell={(props) => (
              <td className="k-grid-content-sticky locked-right">
                <button
                  className="simple-circle-button"
                  style={{marginLeft: 10}}
                  onClick={() =>
                    history.push('/modify-property/' + props.dataItem.id)
                  }
                  // onClick={() =>
                  //   handleOpenModal(props.dataItem.serialNum, 'EDIT')
                  // }
                >
                  <MdCreate size={20} />
                </button>
              </td>
            )}
          />
        </Grid> */}
			</div>
		</div>
	);
};

export default inject("settingStore")(observer(Dashboard));
