import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { FiArrowDownCircle, FiArrowUpCircle, FiArrowRight } from "react-icons/fi";
import BigNumber from "bignumber.js";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";

import { getTransferEvent, getTransferEventFromLuniverse } from "../apis/wallet";
import { getCookie, decodeCookieData } from "../utils/auth";
import { timeConverterNumber } from "../utils/string";
import { verifyUser } from "../apis/auth";
import { getTokenInfos } from "../apis/user";
import APP_PROPERTY from "../constants/appProperty";
import { inject, observer } from "mobx-react";

function Transactions({ settingStore }) {
	const { feeAddress } = settingStore;

	const { t } = useTranslation();
	const [gridData, setGridData] = useState([]);
	const [addressWidth, setAddressWidth] = useState("");
	const [address, setAddress] = useState("");
	const [ethAddress, setEthAddress] = useState("");
	const [btcAddress, setBtcAddress] = useState("");
	const [decimals, setDecimals] = useState("");
	const [tokenType, setTokenType] = useState("");
	const [tokenSymbol, setTokenSymbol] = useState("");
	const [tokenList, setTokenList] = useState([]);

	async function fetchData(symbol = "XGP") {
		const { accessToken } = decodeCookieData(getCookie("key"));
		const userResponse = await verifyUser(accessToken);
		const tokenResponse = await getTokenInfos();

		if (tokenResponse && tokenResponse.status === "success") {
			setTokenList(tokenResponse.data);
			const tokens = tokenResponse.data;
			const token = tokens.find((i) => i.symbol === APP_PROPERTY.TOKEN_SYMBOL[symbol]);

			if (token) {
				const { decimals, type, symbol } = token;
				setDecimals(decimals);
				setTokenType(type);
				setTokenSymbol(symbol);

				const txResponse = await getTransferEvent(accessToken, symbol, type);

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

		setAddress(userResponse.data.address);
		setEthAddress(userResponse.data.ethAddress);
		setBtcAddress(userResponse.data.btcAddress);
	}

	useEffect(() => {
		fetchData();

		if (window.innerWidth <= 768) {
			setAddressWidth("200");
		} else {
			setAddressWidth("");
		}
	}, []);

	const formatValue = (value) => {
		const amountBN = new BigNumber(value);
		const amountStr = amountBN.shiftedBy(-decimals).toString();
		return amountStr;
	};

	const tokenListHtml = (idx, symbol, img) => {
		return (
			<Button
				imageUrl={img}
				// onClick={() => fetchBalance(address, symbol)}
				onClick={() => fetchData(symbol)}
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
					<span>{t("transaction_history")}</span>
					<div
						className="hyperlink-text"
						onClick={() =>
							window.open(
								tokenType === "luniverse"
									? "https://sidescan.luniverse.io/chains/7806468005210300226/accounts/" + address
									: tokenType === "ethereum"
									? "https://etherscan.io/address/" + ethAddress + "#tokentxns"
									: "https://blockchain.com/btc/address/" + btcAddress,
								"_blank"
							)
						}
					>
						{t("transfer_account")}
					</div>
				</div>
				<div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
					<Grid style={{ height: "85%", width: "100%" }} data={gridData && gridData.length > 0 ? gridData : []} resizable sortable>
						<Column field="from" title="From" width={addressWidth} cell={(props) => <td colSpan="1">{props.dataItem.from === feeAddress ? "Fee" : props.dataItem.from}</td>} />
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
						<Column field="to" title="To" width={addressWidth} cell={(props) => <td colSpan="1">{props.dataItem.to === feeAddress ? "Fee" : props.dataItem.to}</td>} />
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
			</div>
		</div>
	);
}

export default inject("settingStore")(observer(Transactions));
