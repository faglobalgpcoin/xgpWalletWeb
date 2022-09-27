import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import BigNumber from "bignumber.js";
import { inject, observer } from "mobx-react";
import { MdLockOutline } from "react-icons/md";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";

import { getAppProperties } from "../apis/appProperty";
import { decodeCookieData, getCookie } from "../utils/auth";
import { checkVerifyCode, getTokenInfos, modifyUser, sendEmailCode } from "../apis/user";
import { verifyUser } from "../apis/auth";
import { sendAsset, getBalance, validateAddress } from "../apis/wallet";
import { is55Address, NumberWithCommas, timeConverter, bitcoinAddress, validateEmailFormat } from "../utils/string";
import APP_PROPERTY from "../constants/appProperty";
import { ClipLoader } from "react-spinners";
import useForm from "react-hook-form";

function Send({ snackbarStore }) {
	const { t } = useTranslation();
	const { activeSnackbar } = snackbarStore;

	const [fee, setFee] = useState("0");
	const [amount, setAmount] = useState("");
	const [address, setAddress] = useState("");
	const [fromAddress, setFromAddress] = useState("");
	const [amountError, setAmountError] = useState(false);
	const [addressError, setAddressError] = useState(false);
	const [balance, setBalance] = useState("0");
	const [ethBalance, setEthBalance] = useState("0");
	const [gas, setGas] = useState("0");
	const [lockUpState, setLockUpState] = useState([]);
	const [isAfterTransfer, setIsAfterTransfer] = useState(false);
	const [isValidAmount, setIsValidAmount] = useState(false);
	const [isValidAddress, setIsValidAddress] = useState(false);
	const [tokenSymbol, setTokenSymbol] = useState("");
	const [tokenName, setTokenName] = useState("");
	const [decimals, setDecimals] = useState("");
	const [tokenType, setTokenType] = useState("");
	const [tokenList, setTokenList] = useState([]);
	const [email, setEmail] = useState("");
	const [emailCode, setEmailCode] = useState("");
	const [emailCodeInput, setEmailCodeInput] = useState("");
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const [isAfterSendEmail, setIsAfterSendEmail] = useState(false);
	const [pinCode, setPinCode] = useState("");
	const [checkAddress, setCheckAddress] = useState("");

	const { register, handleSubmit, getValues, setError, errors, triggerValidation, clearError } = useForm();

	let totalAmount;
	if (tokenType !== "ethereum") {
		totalAmount = useMemo(() => BigNumber.sum(amount || "0", fee || "0").toString(), [amount, fee]);
	} else if (tokenType === "ethereum" && tokenSymbol === "ETH") {
		totalAmount = useMemo(() => BigNumber.sum(amount || "0", gas || "0").toString(), [amount, gas]);
	} else if (tokenType === "ethereum" && tokenSymbol !== "ETH") {
		totalAmount = useMemo(() => new BigNumber(amount || "0").toString(), [amount]);
	}

	useEffect(() => {
		async function fetchData() {
			const { accessToken } = decodeCookieData(getCookie("key"));
			const userResponse = await verifyUser(accessToken);
			setEmail(userResponse.data.emailAddress);

			await fetchBalance(userResponse.data.address, "XGP");
			setFromAddress(userResponse.data.address);
		}

		fetchData();
	}, []);

	const triggerError = (name) => {
		if (name === "amount") {
			setAmountError(true);
			setTimeout(() => {
				setAmountError(false);
			}, 3000);
		} else if (name === "address") {
			setAddressError(true);
			setTimeout(() => {
				setAddressError(false);
			}, 3000);
		}
	};

	const fetchBalance = async (address, symbol) => {
		setAmount("");
		const { accessToken } = decodeCookieData(getCookie("key"));
		const userResponse = await verifyUser(accessToken);
		const propertyResponse = await getAppProperties(accessToken);
		let currentD = new Date();
		let transferFee;
		let gasPrice;

		if (propertyResponse) {
			const isLockUpAllUser = propertyResponse.data.find((i) => i.keyName === APP_PROPERTY.LOCK_UP_ALL).value;
			transferFee = propertyResponse.data.find((i) => i.keyName === APP_PROPERTY["TRANSFER_FEE_" + symbol]).value;
			gasPrice = propertyResponse.data.find((i) => i.keyName === APP_PROPERTY["TRANSFER_FEE_ETH"]).value;
			setLockUpState({
				isLockUpAllUser: isLockUpAllUser === "true",
				isLockUpUser: userResponse.data.lock_up || false,
				lockUpRate: userResponse.data.lock_up_rate || "0",
				lockUpPeriod: userResponse.data.lock_up_period ? new Date(userResponse.data.lock_up_period) : null,
				isLockUpPeriod: isLockUpAllUser === "false" && userResponse.data.lock_up && currentD < new Date(userResponse.data.lock_up_period),
			});
		}

		const tokenResponse = await getTokenInfos();
		if (tokenResponse && tokenResponse.status === "success") {
			setTokenList(tokenResponse.data);
			const tokensInfo = tokenResponse.data;
			const tokenInfo = tokensInfo.find((i) => i.symbol === APP_PROPERTY.TOKEN_SYMBOL[symbol]);

			if (tokenInfo) {
				const { name, type, decimals, symbol } = tokenInfo;
				setTokenSymbol(symbol);
				setTokenName(name);
				setTokenType(type);
				setDecimals(decimals);
				if (type === "luniverse" || type === "bitcoin") setFee(transferFee);
				else if (symbol !== "ETH") setGas(gasPrice * 100000);
				else if (symbol === "ETH") setGas(gasPrice * 21000);

				const tokenBalanceResponse = await getBalance(accessToken, symbol, type);

				if (tokenBalanceResponse && tokenBalanceResponse.status === "success") {
					const { balance } = tokenBalanceResponse.data;
					const balanceBN = new BigNumber(balance);
					const balanceStr = balanceBN.shiftedBy(-decimals).toString();
					setBalance(balanceStr);
				} else {
					setBalance("0");
				}

				const ethBalanceResponse = await getBalance(accessToken, "ETH", "ethereum");

				if (ethBalanceResponse && ethBalanceResponse.status === "success") {
					const { balance } = ethBalanceResponse.data;
					const balanceBN = new BigNumber(balance);
					const balanceStr = balanceBN.shiftedBy(-decimals).toString();
					setEthBalance(balanceStr);
				} else {
					setEthBalance("0");
				}
			}
		}
	};

	const handleChangeAmount = (e) => {
		setAmount(e.target.value);
	};

	const handleChangeEmailCode = (e) => {
		setEmailCodeInput(e.target.value);
	};

	const handleAmountButton = (a) => {
		let newAmount;
		if (amount === "") newAmount = 0 + a;
		else newAmount = parseInt(amount) + a;

		if (a === "reset") {
			newAmount = 0;
		}

		setAmount(newAmount.toString());

		let amountBN = new BigNumber(newAmount.toString());
		let balanceBN = new BigNumber(balance);
		let ethBalanceBN = new BigNumber(ethBalance);
		let feeBN = new BigNumber(fee);
		let gasBN = new BigNumber(gas);

		if (tokenType !== "ethereum") {
			if (!lockUpState.isLockUpAllUser && lockUpState.isLockUpUser) {
				balanceBN = balanceBN.multipliedBy((100 - lockUpState.lockUpRate) / 100);
			}

			if (amountBN === undefined || amountBN.comparedTo(0) <= 0 || amountBN.plus(feeBN).comparedTo(balanceBN) === 1) {
				setIsValidAmount(false);
				triggerError("amount");
			} else {
				setIsValidAmount(true);
			}
		} else {
			if (!lockUpState.isLockUpAllUser && lockUpState.isLockUpUser) {
				balanceBN = balanceBN.multipliedBy((100 - lockUpState.lockUpRate) / 100);
			}
			if ((tokenSymbol !== "ETH" && amountBN === undefined) || amountBN.comparedTo(0) <= 0 || amountBN.comparedTo(balanceBN) === 1 || ethBalanceBN.comparedTo(gasBN) === -1) {
				setIsValidAmount(false);
				triggerError("amount");
			} else if (tokenSymbol === "ETH" && (amountBN.comparedTo(0) <= 0 || amountBN.comparedTo(balanceBN) === 1 || amountBN.plus(gasBN).comparedTo(balanceBN) === 1)) {
				setIsValidAmount(false);
				triggerError("amount");
			} else {
				setIsValidAmount(true);
			}
		}
	};

	const handleBlurAmount = () => {
		if (amount === "") {
			return;
		}

		let amountBN = new BigNumber(amount);
		let balanceBN = new BigNumber(balance);
		let ethBalanceBN = new BigNumber(ethBalance);
		let feeBN = new BigNumber(fee);
		let gasBN = new BigNumber(gas);

		if (tokenType !== "ethereum") {
			if (!lockUpState.isLockUpAllUser && lockUpState.isLockUpUser) {
				balanceBN = balanceBN.multipliedBy((100 - lockUpState.lockUpRate) / 100);
			}

			if (amountBN === undefined || amountBN.comparedTo(0) <= 0 || amountBN.plus(feeBN).comparedTo(balanceBN) === 1) {
				setIsValidAmount(false);
				triggerError("amount");
			} else {
				setIsValidAmount(true);
			}
		} else {
			if (!lockUpState.isLockUpAllUser && lockUpState.isLockUpUser) {
				balanceBN = balanceBN.multipliedBy((100 - lockUpState.lockUpRate) / 100);
			}
			if ((tokenSymbol !== "ETH" && amountBN === undefined) || amountBN.comparedTo(0) <= 0 || amountBN.comparedTo(balanceBN) === 1 || ethBalanceBN.comparedTo(gasBN) === -1) {
				setIsValidAmount(false);
				triggerError("amount");
			} else if (tokenSymbol === "ETH" && (amountBN.comparedTo(0) <= 0 || amountBN.comparedTo(balanceBN) === 1 || amountBN.plus(gasBN).comparedTo(balanceBN) === 1)) {
				setIsValidAmount(false);
				triggerError("amount");
			} else {
				setIsValidAmount(true);
			}
		}
	};

	const handleBlurAddress = async () => {
		let isChecked = false;

		if (address === "") {
			return;
		}

		try {
			if (tokenType !== "bitcoin") isChecked = is55Address(address.toLowerCase());
			else isChecked = bitcoinAddress(address);
		} catch (e) {
			console.log(e);
		}

		setIsValidAddress(isChecked);

		if (!isChecked) {
			triggerError("address");
		}
	};

	const handleSubmitButton = async () => {
		setIsAfterTransfer(true);
		const { accessToken } = decodeCookieData(getCookie("key"));

		const result = await sendAsset(accessToken, {
			amount: amount,
			receiveAddress: address,
			sideTokenSymbol: tokenSymbol,
			type: tokenType,
			pinCode: pinCode,
			emailCode: emailCodeInput,
		});

		if (!result) {
			setIsAfterTransfer(false);
			activeSnackbar(t("failed_send_request_desc"));
			return;
		}

		if (result.status === "fail") {
			setIsAfterTransfer(false);
			activeSnackbar(t("failed_send_request_desc"));
			return;
		}

		if (result.data === true) {
			setIsAfterTransfer(false);
			activeSnackbar(t("complete_send_request_desc"));
			setAmount("");
			setAddress("");
			setPinCode("");
			setEmailCodeInput("");
			setIsEmailVerified(false);
			setEmailCode(false);

			setTimeout(async () => {
				for (let [key, value] of Object.entries(APP_PROPERTY.TOKEN_SYMBOL)) {
					if (value === tokenSymbol) {
						await fetchBalance(fromAddress, key);
					}
				}
			}, 3000);
		}
	};

	const tokenListHtml = (idx, symbol, img) => {
		return (
			<Button imageUrl={img} onClick={() => fetchBalance(address, symbol)} key={idx}>
				{symbol}
			</Button>
		);
	};

	const sendEmail = async () => {
		let result;

		if (!validateEmailFormat(email)) {
			setError("suEmail", "format", t("email_error_invalid"));
			return;
		}

		setIsAfterSendEmail(true);
		result = await sendEmailCode({
			sendTypeKind: "EMAIL_FOR_COIN_SEND",
			emailAddress: email,
			phoneNumber: null,
		});

		setIsAfterSendEmail(false);

		if (result.status === "fail") {
			setError("suEmail", "format", t("email_error_invalid"));
			return;
		}

		setEmailCode(true);
		clearError("suEmail");
	};

	const validateEmail = async () => {
		let result;
		console.log("=== validateEmail");

		result = await checkVerifyCode({
			emailAddress: email,
			phoneNumber: null,
			code: emailCodeInput,
		});

		if (!result) {
			setError("emailCode", "invalid", t("please_check_code"));
			return;
		}

		if (result.status === "fail") {
			setError("emailCode", "invalid", t("please_check_code"));
			return;
		}

		if (result.data !== true) {
			setError("emailCode", "invalid", t("please_check_code"));
			return;
		}

		setIsEmailVerified(true);
		clearError("emailCode");
	};

	const onChangeFunction = (e) => {
		e.preventDefault();
		setPinCode(e.target.value);
	};

	const handleValidateAddress = async () => {
		let result;
		result = await validateAddress({
			type: tokenType,
			address,
		});

		setCheckAddress(result.data);
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
					<span>{t("send_token", { name: tokenSymbol })}</span>
				</div>

				<div className="col-md-6 text-center flex-center">
					<div className="token-info" style={{ padding: 0, alignItems: "flex-end" }}>
						<div className="balance-wrap">
							<div className="input-label" style={{ margin: 0, marginRight: 10 }}>
								{/* {t("holding_amount")} :{" "} */}
								{t("holding_amount")}{" "}
							</div>
							<h4 className="token-info-head" style={{ position: "relative" }}>
								{NumberWithCommas(balance)} {tokenSymbol}
								<div className="text-highlight" />
							</h4>
							{(lockUpState.isLockUpAllUser || lockUpState.isLockUpUser) && (
								<div className="flex-center" style={{ marginTop: "-3px" }}>
									<MdLockOutline
										className="lock-icon"
										size={21}
										// color={Colors.secondColorToneDown}
									/>
									{!lockUpState.isLockUpAllUser && lockUpState.isLockUpUser && lockUpState.lockUpRate && <span className="lock-rate">{lockUpState.lockUpRate}%</span>}
								</div>
							)}
						</div>
						{!lockUpState.isLockUpAllUser && lockUpState.isLockUpUser && lockUpState.lockUpPeriod && <span>~ {timeConverter(lockUpState.lockUpPeriod)}</span>}
					</div>
				</div>
				{tokenType === "ethereum" && tokenSymbol !== "ETH" && (
					<div className="col-md-6 text-center flex-center">
						<div className="token-info" style={{ padding: 0, alignItems: "flex-end" }}>
							<div className="balance-wrap">
								<div className="input-label" style={{ margin: 0, marginRight: 10 }}>
									{t("holding_amount")} :{" "}
								</div>
								<h4 className="token-info-head" style={{ position: "relative" }}>
									{NumberWithCommas(ethBalance)} ETH
									<div className="text-highlight" />
								</h4>
							</div>
						</div>
					</div>
				)}
				<form onSubmit={null} autoComplete="off">
					<div className="flex-center form-container" style={{ flexDirection: "column" }}>
						<div className="input-row email-input-row">
							<div className="input-label">{t("receive_to")}</div>
							<input
								className={`send-input email-input ${addressError ? "error" : ""}`}
								type="text"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								onBlur={handleBlurAddress}
								autoComplete="off"
							/>
							<button type="button" onClick={handleValidateAddress}>
								{t("checkAddress")}
							</button>
							{checkAddress === true ? <span className="error-desc">{t("internalAddress")}</span> : checkAddress === false ? <span className="error-desc">{t("externalAddress")}</span> : ""}
						</div>
						<div className="input-row">
							<div className="input-label">{t("send_amount")}</div>
							<input className={`send-input ${amountError ? "error" : ""}`} type="text" value={amount} onBlur={handleBlurAmount} autoComplete="off" readOnly={tokenType === "luniverse"} onChange={handleChangeAmount} />
							<div className="input-unit">{tokenSymbol}</div>
							{tokenType === "luniverse" && (
								<div className="input-button">
									<button type="button" className="quick-amt-button" onClick={() => handleAmountButton(10000)}>
										10,000
									</button>
									<button type="button" className="quick-amt-button" onClick={() => handleAmountButton(30000)}>
										30,000
									</button>
									<button type="button" className="quick-amt-button" onClick={() => handleAmountButton(50000)}>
										50,000
									</button>
									<button type="button" className="quick-amt-button" onClick={() => handleAmountButton(100000)}>
										100,000
									</button>
									<button type="button" className="quick-amt-button" onClick={() => handleAmountButton("reset")}>
										{t("reset")}
									</button>
								</div>
							)}
						</div>
					</div>

					{/* pin security and email */}
					<div className="flex-center form-container" style={{ flexDirection: "column" }}>
						<div className="input-row email-input-row">
							<div className="input-row">
								<div className="input-label">{t("pinPassword")}</div>
								<input className={`send-input`} type="password" autoComplete="new-password" minLength={4} maxLength={4} onChange={onChangeFunction} value={pinCode} />
							</div>
							<div className="input-label">{t("email")}</div>
							<input className={`send-input email-input`} type="email" defaultValue={email} readOnly />
							<button type="button" className={`send-button ${emailCode ? "done" : ""}`} disabled={isEmailVerified} onClick={sendEmail}>
								{isAfterSendEmail ? (
									<ClipLoader size={15} color={"white"} loading={true} style={{ marginRight: 5 }} />
								) : emailCode ? (
									<span className="send-text" style={{ color: "gray" }}>
										{t("resend")}
									</span>
								) : (
									<span className="send-text">{t("send")}</span>
								)}
							</button>
						</div>
						<div className="input-row email-input-row">
							<div className="input-label">{t("email_code")}</div>
							<input
								className={`send-input email-input`}
								name="emailCode"
								type="number"
								autoComplete="new-password"
								maxLength={6}
								ref={register}
								onChange={handleChangeEmailCode}
								value={emailCodeInput}
							/>
							{/* {errors.emailCode && <span className="error-desc">{errors.emailCode.message || t("field_error_required")}</span>} */}
							{isEmailVerified ? (
								<button type="button" className="send-button" disabled={true}>
									<span className="send-text">{t("verified")}</span>
								</button>
							) : (
								<button type="button" className="send-button" onClick={() => validateEmail()}>
									<span className="send-text">{t("verify")}</span>
								</button>
							)}
							{errors.emailCode && <span className="error-desc">{errors.emailCode.message || t("field_error_required")}</span>}
						</div>
					</div>
					{/* pin security and email end*/}

					<div className="flex-center payment-info-container" style={{ flexDirection: "column" }}>
						<div className="input-row" style={{ marginBottom: 10 }}>
							<div className="input-label" style={{ marginBottom: 0 }}>
								{t("payment_request")}
							</div>
						</div>
						<div className="info-background">
							<div className="info-row">
								<span className="info-label">{t("transfer_amount")}</span>
								<span className="info-value">{amount}</span>
								<span className="info-unit">{tokenSymbol}</span>
							</div>
							<div className="info-row">
								<span className="info-label">{tokenType === "luniverse" || tokenType === "bitcoin" ? t("transfer_fee") : t("gas_price")}</span>
								<span className="info-value">{tokenType === "luniverse" || tokenType === "bitcoin" ? fee : gas}</span>
								<span className="info-unit">{tokenType === "luniverse" || tokenType === "bitcoin" ? tokenSymbol : "ETH"}</span>
							</div>
							<hr />
							<div className="info-row">
								<span className="info-label">{t("total_amount")}</span>
								<span className="info-value total">{totalAmount}</span>
								<span className="info-unit">{tokenSymbol}</span>
							</div>
						</div>

						<div className="input-row" style={{ marginTop: 50, alignItems: "flex-end" }}>
							<button
								className="primary-button"
								style={{ borderRadius: "4px", minWidth: "150px" }}
								disabled={lockUpState.isLockUpAllUser || lockUpState.isLockUpPeriod || !isValidAmount || !isValidAddress || isAfterTransfer || !isEmailVerified}
								onClick={handleSubmitButton}
							>
								{t("send")}
							</button>
						</div>
					</div>
				</form>
				{/* <hr /> */}
			</div>
		</div>
	);
}

export default inject("snackbarStore")(observer(Send));
