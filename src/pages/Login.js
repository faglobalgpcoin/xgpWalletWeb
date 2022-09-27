import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { FiArrowRight } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { AiOutlineKey } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import useForm from "react-hook-form";
import { withRouter } from "react-router";
import { ClipLoader } from "react-spinners";

import { adminLogin, verifyUser } from "../apis/auth";
import { checkIsExistPhoneNumber, checkIsExistUser, sendCode, sendEmailCode, signupUser, checkVerifyCode } from "../apis/user";
import { validateEmailFormat } from "../utils/string";
import APP_PROPERTY from "../constants/appProperty";
import i18n from "../i18n";

function Login({ history, snackbarStore }) {
	const { t, i18n } = useTranslation();
	const { register, handleSubmit, getValues, setError, errors, triggerValidation, clearError } = useForm();
	const [formMode, setFormMode] = useState("login");
	const [isMobile, setIsMobile] = useState(false);
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const [isAfterSendEmail, setIsAfterSendEmail] = useState(false);
	const [emailCode, setEmailCode] = useState("");
	//const [isMobileVerified, setIsMobileVerified] = useState(false);
	const [isAfterSendMobile, setIsAfterSendMobile] = useState(false);
	//const [mobileCode, setMobileCode] = useState("");
	const [idCard, setIdCard] = useState("");

	const { activeSnackbar } = snackbarStore;

	const setInitialState = () => {
		setEmailCode("");
		//setMobileCode("");
		setIsEmailVerified(false);
		setIsAfterSendEmail(false);
		//setIsMobileVerified(false);
		setIsAfterSendMobile(false);
	};

	const toggleMode = (value) => {
		setFormMode(value);
		setInitialState();
	};

	const sendEmail = async () => {
		let result;
		const { suEmail } = getValues();
		// console.log(suEmail);
		// console.log(validateEmailFormat(suEmail));

		if (!validateEmailFormat(suEmail)) {
			setError("suEmail", "format", t("email_error_invalid"));
			return;
		}

		result = await checkIsExistUser({ emailAddress: suEmail });

		if (!result) {
			setError("suEmail", "required", t("email_error_exist"));
			return;
		}

		if (result.status === "fail") {
			setError("suEmail", "required", t("email_error_exist"));
			return;
		}

		setIsAfterSendEmail(true);
		result = await sendEmailCode({
			sendTypeKind: "EMAIL_FOR_SIGNUP",
			emailAddress: suEmail,
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
		const { suEmailCode, suEmail } = getValues();

		result = await checkVerifyCode({
			emailAddress: suEmail,
			phoneNumber: null,
			code: suEmailCode,
		});

		if (!result) {
			setError("suEmailCode", "invalid", t("please_check_code"));
			return;
		}

		if (result.status === "fail") {
			setError("suEmailCode", "invalid", t("please_check_code"));
			return;
		}

		if (result.data !== true) {
			setError("suEmailCode", "invalid", t("please_check_code"));
			return;
		}

		setIsEmailVerified(true);
		clearError("suEmailCode");
	};

	const sendSMS = async () => {
		console.log("=== sendSMS");
		let result;
		const { suNationalCode, suMobile } = getValues();

		let phoneNumber = suNationalCode + suMobile;
		let isHasZeroAtFront = phoneNumber.substring(0, 5) === "82010";
		// console.log(phoneNumber);

		if (isHasZeroAtFront) {
			phoneNumber = suNationalCode + suMobile.slice(1);
		}

		if (!suNationalCode) {
			setError("suNationalCode", "format", t("mobile_nationcode_error_invalid"));
			return;
		}

		result = await checkIsExistPhoneNumber({ phoneNumber: phoneNumber });

		if (!result) {
			setError("suNationalCode", "exist", t("mobile_error_exist"));
			return;
		}

		if (result.status === "fail") {
			setError("suNationalCode", "exist", t("mobile_error_exist"));
			return;
		}

		setIsAfterSendMobile(true);
		result = await sendCode({
			sendTypeKind: "SMS",
			phoneNumber: phoneNumber,
		});
		setIsAfterSendMobile(false);

		if (result.status === "fail") {
			setError("suNationalCode", "format", t("mobile_error_invalid"));
			return;
		}

		setMobileCode(true);
		clearError("suNationalCode");
	};

	const validateSMS = async () => {
		console.log("=== validateSMS");
		let result;
		const { suMobileCode, suNationalCode, suMobile } = getValues();

		let phoneNumber = suNationalCode + suMobile;

		let isHasZeroAtFront = phoneNumber.substring(0, 5) === "82010";
		// console.log(phoneNumber);

		if (isHasZeroAtFront) {
			phoneNumber = suNationalCode + suMobile.slice(1);
		}
		// console.log(suMobileCode);
		// console.log(mobileCode);

		result = await checkVerifyCode({
			emailAddress: null,
			phoneNumber: phoneNumber,
			code: suMobileCode,
		});

		if (result.status === "fail") {
			setError("suMobileCode", "invalid", t("please_check_code"));
		}

		if (result.data !== true) {
			setError("suMobileCode", "invalid", t("please_check_code"));
			return;
		}

		setIsMobileVerified(true);
		clearError("suMobileCode");
	};

	const onSubmit = async (formdata, e) => {
		const response = await adminLogin(formdata);

		if (response.status === "fail") {
			alert("Please check your account again"); // 번역필요
			return;
		}

		if (!response.data) {
			alert("API Error"); // 번역필요
			return;
		}

		const userResponse = await verifyUser(response.data.accessToken);

		if (!userResponse || userResponse.status === "fail") {
			alert("Please check expiration of your account"); // 번역필요
			return;
		}

		document.cookie =
			"key=" +
			btoa(
				unescape(
					encodeURIComponent(
						JSON.stringify({
							isLoggedIn: true,
							email: formdata.emailAddress,
							username: userResponse.data.name || "User",
							accessToken: response.data.accessToken,
						})
					)
				)
			);
		history.push("/");
	};

	const onFormSubmit = async (formdata, e) => {
		let result;
		const data = getValues();
		result = await triggerValidation();
		//console.log(formdata);

		if (data.suPassword.length < 8) {
			setError("suPassword", "minLength", t("password_error_length"));
			return;
		}

		if (data.suSecurityPassword.length < 4) {
			setError("suSecurityPasswordVerify", "minLength", t("securityPassword_error_length"));
			return;
		}

		if (!isEmailVerified) {
			setError("suEmailCode", "required", t("verify_email"));
			return;
		}

		/*if (!isMobileVerified) {
			setError("suMobileCode", "required", t("verify_phonenumber"));
			return;
		}*/

		if (data.suPassword !== data.suPasswordVerify) {
			setError("suPasswordVerify", "notMatch", t("password_error_notmatched"));
			return;
		}

		if (data.suSecurityPassword !== data.suSecurityPasswordVerify) {
			setError("suSecurityPasswordVerify", "notMatch", t("password_error_notmatched"));
			return;
		}

		let phoneNumber = data.suNationalCode + data.suMobile;
		let isHasZeroAtFront = phoneNumber.substring(0, 5) === "82010";

		if (isHasZeroAtFront) {
			phoneNumber = data.suNationalCode + data.suMobile.slice(1);
		}

		const formData = new FormData();
		formData.append("userId", data.suUserId);
		formData.append("emailAddress", data.suEmail);
		formData.append("password", data.suPassword);
		formData.append("pinCode", data.suSecurityPassword);
		formData.append("name", data.suName);
		formData.append("phoneNumber", phoneNumber);
		formData.append("emailCode", data.suEmailCode);
		//formData.append("mobileCode", data.suMobileCode);
		formData.append("userPic", data.suUserPic[0]);

		result = await signupUser(formData);

		if (result && result.status === "success") {
			activeSnackbar(t("signup_complete"));

			setTimeout(() => {
				history.push("/");
			}, 2000);
		} else {
			if (result.message === "Upload Error") {
				setError("suUserPic", "error", t("userpic_upload_error"));
			} else if (result.message === "Already Registered") {
				setError("suUserId", "error", t("check_already_signedup"));
			} else if (result.message === "Register Error") {
				setError("suUserId", "error", t("register_error"));
			} else if (result.message === "API Error") {
				setError("suUserId", "error", t("api_error"));
			} else {
				setError("suUserId", "error", t("register_error"));
			}
		}
	};

	const handleChangeLocales = async (current) => {
		document.cookie = "locale=" + current;
		i18n.changeLanguage(current);
	};

	return (
		<div className="login">
			<div className="bg-wrapper">
				<span className="bg-footer">{APP_PROPERTY.CS_EMAIL}</span>
				<div className="bg-title">
					<img src={require("../imgs/intro_moon.png")} alt="icon" />
					<p className="bg-desc">{APP_PROPERTY.TOKEN_NAME} Wallet</p>
				</div>
			</div>
			{formMode === "login" ? (
				<div className="login-wrapper">
					<span className="login-footer" onClick={() => history.push("/change-password")}>
						{t("forgot_password")}
					</span>
					<form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
						<div className="login-content">
							<div className="page-ath-header">
								<a href="" className="page-ath-logo">
									<img src={require("../imgs/logo.png")} alt="logo" />{" "}
								</a>
							</div>
							<p className="please">{t("login_welcome", { symbol: APP_PROPERTY.MAIN_TOKEN_SYMBOL })}</p>
							<span className="welcome">{t("login_welcome_page")}</span>
							<div>
								<AiOutlineUser className="input-icon" size={28} />
								<input className="input-text" name="userId" type="text" ref={register} />
							</div>
							<div>
								<AiOutlineKey className="input-icon" size={28} />
								<input className="input-text" name="password" type="password" ref={register} />
							</div>
							<button className="primary-button">
								<span>{t("login")}</span>
								<FiArrowRight size={25} style={{ marginLeft: "15px" }} />
							</button>
							<p className="signup-desc">
								{t("need_account")}{" "}
								<span style={{ color: "black" }} onClick={() => toggleMode("signup")}>
									{t("signup")}
								</span>
							</p>
							<div className="lang">
								<div className="lang-list" onClick={() => handleChangeLocales("en")}>
									<label htmlFor="lang_en">
										<input type="radio" name="lang" id="lang_en" />
										<span className="active-bar" />
										<img src={require("../imgs/en.png")} alt="" />
										<p>en</p>
									</label>
								</div>
								<div className="lang-list" onClick={() => handleChangeLocales("ko")}>
									<label htmlFor="lang_ko">
										<input type="radio" name="lang" id="lang_ko" />
										<span className="active-bar" />
										<img src={require("../imgs/ko.png")} alt="" />
										<p>ko</p>
									</label>
								</div>
								<div className="lang-list" onClick={() => handleChangeLocales("jp")}>
									<label htmlFor="lang_jp">
										<input type="radio" name="lang" id="lang_jp" />
										<span className="active-bar" />
										<img src={require("../imgs/jp.png")} alt="" />
										<p>jp</p>
									</label>
								</div>
								<div className="lang-list" onClick={() => handleChangeLocales("th")}>
									<label htmlFor="lang_th">
										<input type="radio" name="lang" id="lang_th" />
										<span className="active-bar" />
										<img src={require("../imgs/th.png")} alt="" />
										<p>th</p>
									</label>
								</div>
								<div className="lang-list" onClick={() => handleChangeLocales("zh")}>
									<label htmlFor="lang_zh">
										<input type="radio" name="lang" id="lang_zh" />
										<span className="active-bar" />
										<img src={require("../imgs/cn.png")} alt="" />
										<p>zh</p>
									</label>
								</div>
							</div>
						</div>
					</form>
				</div>
			) : (
				<div className="login-wrapper">
					<form onSubmit={handleSubmit(onFormSubmit)} style={{ width: "100%" }}>
						<div className="login-content signup">
							<span className="welcome">{t("signup")}</span>
							{/* <p className="please"></p> */}
							{/* id */}
							<div className="input-row">
								<p className="input-label">{t("userId")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suUserId" type="text" ref={register} />
									{errors.suUserId && <span className="error-desc">{t("userId_error_required")}</span>}
								</div>
							</div>
							{/* id end */}
							<div className="input-row">
								<p className="input-label">{t("email")}</p>
								<div className="input-with-button">
									<div className="input-wrapper">
										<input className="signup-input-text" name="suEmail" type="text" ref={register} disabled={isEmailVerified} />
										{errors.suEmail && <span className="error-desc">{errors.suEmail.message || t("email_error_required")}</span>}
									</div>
									{!isEmailVerified && (
										<button type="button" className={`send-button ${emailCode ? "done" : ""}`} disabled={isAfterSendEmail} onClick={sendEmail}>
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
									)}
								</div>
							</div>
							<div className="input-row">
								<p className="input-label">{t("email_code")}</p>
								<div className="input-with-button">
									<div className="input-wrapper">
										<input className="signup-input-text" name="suEmailCode" type="number" disabled={isEmailVerified} maxLength={6} ref={register} />
										{errors.suEmailCode && <span className="error-desc">{errors.suEmailCode.message || t("field_error_required")}</span>}
									</div>
									{isEmailVerified ? (
										<span className="send-text" style={{ marginLeft: 15, marginRight: 10 }}>
											{t("verified")}
										</span>
									) : emailCode ? (
										<button type="button" className="send-button" onClick={() => validateEmail()}>
											<span className="send-text">{t("verify")}</span>
										</button>
									) : null}
								</div>
							</div>
							<div className="input-row">
								<p className="input-label">{t("password")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suPassword" type="password" ref={register} placeholder={t("password_info")} />
									{errors.suPassword && <span className="error-desc">{errors.suPassword.message || t("password_error_length")}</span>}
								</div>
							</div>
							<div className="input-row">
								<p className="input-label">{t("repeat_password")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suPasswordVerify" type="password" ref={register} placeholder={t("password_info")} />
									{errors.suPasswordVerify && <span className="error-desc">{errors.suPasswordVerify.message || t("password_error_length")}</span>}
								</div>
							</div>
							{/* security password */}
							<div className="input-row">
								<p className="input-label">{t("pinPassword")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suSecurityPassword" type="password" minLength={4} maxLength={4} ref={register} placeholder={t("pincode_info")} />
									{errors.suSecurityPassword && <span className="error-desc">{errors.suSecurityPassword.message || t("securityPassword_error_length")}</span>}
								</div>
							</div>
							<div className="input-row">
								<p className="input-label">{t("repeatPinPassword")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suSecurityPasswordVerify" type="password" minLength={4} maxLength={4} ref={register} placeholder={t("pincode_info")} />
									{errors.suSecurityPasswordVerify && <span className="error-desc">{errors.suSecurityPasswordVerify.message || t("securityPassword_error_length")}</span>}
								</div>
							</div>
							{/* security password end*/}
							<div className="input-row">
								<p className="input-label">{t("name")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suName" type="text" ref={register} />
									{errors.suName && <span className="error-desc">{t("name_error_required")}</span>}
									<p className="suName_info">{t("suName_info")}</p>
								</div>
							</div>
							{/* idCard */}
							<div className="input-row">
								<p className="input-label">{t("id_card")}</p>
								<div className="input-with-button">
									<div className="input-wrapper">
										<input className="signup-input-text" name="suUserPicUrl" type="text" ref={register} value={idCard} readOnly />
										{errors.suUserPic && <span className="error-desc">{t("suUserPic_error_required")}</span>}
									</div>
									<label htmlFor="idcard">
										<input
											className="signup-input-text"
											accept="image/jpg,impge/png,image/jpeg,image/gif"
											name="suUserPic"
											type="file"
											ref={register}
											id="idcard"
											onChange={(e) => setIdCard(e.target.value)}
										/>
										<p>{t("file_upload")}</p>
									</label>
								</div>
							</div>
							{/* idCard end */}
							<div className="input-row">
								<p className="input-label">{t("mobile")}</p>
								<div className="input-with-button">
									<div className="input-wrapper">
										<div
											style={{
												display: "flex",
												flexDirection: "row",
												position: "relative",
											}}
										>
											<span className="national-text">+</span>
											<input
												className="signup-input-text"
												name="suNationalCode"
												// style={{
												// 	width: "100px",
												// 	marginRight: 15,
												// 	paddingLeft: 27,
												// }}
												type="number"
												//disabled={isMobileVerified}
												ref={register}
												maxLength={3}
											/>
											<input
												className="signup-input-text"
												style={{ width: "100%" }}
												name="suMobile"
												//disabled={isMobileVerified}
												type="number"
												ref={register}
											/>
										</div>
									</div>
									{/*!isMobileVerified && (
										<button type="button" className={`send-button ${mobileCode ? "done" : ""}`} disabled={isAfterSendMobile} onClick={sendSMS}>
											{isAfterSendMobile ? (
												<ClipLoader size={15} color={"white"} loading={true} style={{ marginRight: 5 }} />
											) : mobileCode ? (
												<span className="send-text" style={{ color: "gray" }}>
													{t("resend")}
												</span>
											) : (
												<span className="send-text">{t("send")}</span>
											)}
										</button>
									)*/}
								</div>
								{(errors.suMobile || errors.suNationalCode) && (
									<span className="error-desc">
										{(errors.suNationalCode && errors.suNationalCode.message) || (errors.suMobile && errors.suMobile.message) || t("phonenumber_error_required")}
									</span>
								)}
							</div>
							{/*<div className="input-row">
								<p className="input-label">{t("mobile_code")}</p>
								<div className="input-with-button">
									<div className="input-wrapper">
										<input className="signup-input-text" name="suMobileCode" type="number" disabled={isMobileVerified} ref={register} />
									</div>
									{isMobileVerified ? (
										<span className="send-text" style={{ marginLeft: 15, marginRight: 10 }}>
											{t("verified")}
										</span>
									) : mobileCode ? (
										<button type="button" className="send-button" onClick={() => validateSMS()}>
											<span className="send-text">{t("verify")}</span>
										</button>
									) : null}
								</div>
							</div>*/}
							<button
								className="primary-button"
								disabled={
									//!isMobileVerified ||
									!isEmailVerified
								}
							>
								<span>{t("signup")}</span>
								<FiArrowRight size={25} style={{ marginLeft: "15px" }} />
							</button>
							<p className="signup-desc">
								{t("already_account")}{" "}
								<span style={{ color: "black" }} onClick={() => toggleMode("login")}>
									{t("login")}
								</span>
							</p>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}

export default inject("snackbarStore")(observer(withRouter(Login)));
