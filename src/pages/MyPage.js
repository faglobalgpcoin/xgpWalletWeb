import React, { useEffect, useState } from "react";
import useForm from "react-hook-form";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router";
import { decodeCookieData, getCookie } from "../utils/auth";
import { verifyUser } from "../apis/auth";
import { checkIsExistUser, checkVerifyCode, modifyUser, sendEmailCode, signupUser } from "../apis/user";
import { validateEmailFormat } from "../utils/string";
import { ClipLoader } from "react-spinners";

function MyPage({ history, snackbarStore }) {
	const { t, i18n } = useTranslation();

	const { register, handleSubmit, getValues, setError, errors, triggerValidation, clearError } = useForm();
	const [email, setEmail] = useState("");
	const [emailCode, setEmailCode] = useState("");
	const [userId, setUserId] = useState("");
	const [name, setName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");

	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const [isAfterSendEmail, setIsAfterSendEmail] = useState(false);
	const { activeSnackbar } = snackbarStore;

	useEffect(() => {
		async function fetchData() {
			const { accessToken } = decodeCookieData(getCookie("key"));
			const userResponse = await verifyUser(accessToken);
			setEmail(userResponse.data.emailAddress);
			setName(userResponse.data.name);
			setUserId(userResponse.data.userId);
			setPhoneNumber(userResponse.data.phoneNumber);
		}

		fetchData();
	}, []);

	const sendEmail = async () => {
		let result;
		// console.log(suEmail);
		// console.log(validateEmailFormat(suEmail));

		if (!validateEmailFormat(email)) {
			setError("suEmail", "format", t("email_error_invalid"));
			return;
		}

		setIsAfterSendEmail(true);
		result = await sendEmailCode({
			sendTypeKind: "EMAIL_FOR_SIGNUP",
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
		const { emailCode } = getValues();

		result = await checkVerifyCode({
			emailAddress: email,
			phoneNumber: null,
			code: emailCode,
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

	const onSubmit = async (formdata, e) => {
		let result;
		const data = getValues();
		result = await triggerValidation();
		const { accessToken } = decodeCookieData(getCookie("key"));

		if (!isEmailVerified) {
			setError("emailCode", "required", t("verify_email"));
			return;
		}

		if (data.suPassword !== "" && data.suPassword.length < 8) {
			setError("suPassword", "minLength", t("password_error_length"));
			return;
		}

		if (data.suPassword !== data.suPasswordVerify) {
			setError("suPasswordVerify", "notMatch", t("password_error_notmatched"));
			return;
		}

		if (data.suSecurityPassword !== "" && data.suSecurityPassword.length < 4) {
			setError("suSecurityPasswordVerify", "minLength", t("password_error_length"));
			return;
		}

		if (data.suSecurityPassword !== data.suSecurityPasswordVerify) {
			setError("suSecurityPasswordVerify", "notMatch", t("password_error_notmatched"));
			return;
		}

		if (!result) {
			return;
		}

		result = await modifyUser(accessToken, {
			emailAddress: email,
			password: data.suPassword,
			pinCode: data.suSecurityPassword,
			emailCode: data.emailCode,
		});

		if (result && result.status === "success") {
			activeSnackbar(t("modify_complete"));

			setTimeout(() => {
				history.push("/");
			}, 2000);
		} else {
			setError("suEmail", "exist", t("modifyError"));
		}
	};

	return (
		<div className="container wallet-container mypage-container">
			<div className="card card-full-height" style={{ padding: 15 }}>
				<div className="content-title title-row">
					<span>{t("change_my_personal_info")}</span>
				</div>
				<div className="col-md-6 text-center flex-center">
					<form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
						<div className="input-row-wrap mypage">
							{/* email */}
							<div className="input-row">
								<p className="input-label">{t("email")}</p>
								<div className="input-with-button">
									<div className="input-wrapper">
										<input className="signup-input-text" name="suEmail" type="text" defaultValue={email} readOnly />
										{/* {errors.suEmail && <span className="error-desc">{errors.suEmail.message || t("email_error_required")}</span>} */}
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
										<input className="signup-input-text" name="emailCode" type="number" maxLength={6} ref={register} />
										{errors.emailCode && <span className="error-desc">{errors.emailCode.message || t("field_error_required")}</span>}
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
							{/* password and pin password */}
							<div className="input-row">
								<p className="input-label">{t("password")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suPassword" type="password" ref={register} />
									{errors.suPassword && <span className="error-desc">{errors.suPassword.message || t("password_error_length")}</span>}
								</div>
							</div>
							<div className="input-row">
								<p className="input-label">{t("repeat_password")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suPasswordVerify" type="password" ref={register} />
									{errors.suPasswordVerify && <span className="error-desc">{errors.suPasswordVerify.message}</span>}
								</div>
							</div>
							<div className="input-row">
								<p className="input-label">{t("pinPassword")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suSecurityPassword" type="password" minLength={4} maxLength={4} ref={register} />
									{errors.suSecurityPassword && <span className="error-desc">{errors.suSecurityPassword.message}</span>}
								</div>
							</div>
							<div className="input-row">
								<p className="input-label">{t("repeatPinPassword")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suSecurityPasswordVerify" type="password" minLength={4} maxLength={4} ref={register} />
									{errors.suSecurityPasswordVerify && <span className="error-desc">{errors.suSecurityPasswordVerify.message}</span>}
								</div>
							</div>
							{/* name and id */}
							<div className="input-row">
								<p className="input-label">{t("name")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suName" type="text" defaultValue={name} readOnly />
									{errors.suName && <span className="error-desc">{t("name_error_required")}</span>}
								</div>
							</div>
							<div className="input-row">
								<p className="input-label">{t("userId")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suName" type="text" defaultValue={userId} readOnly />
									{/* {errors.suName && <span className="error-desc">{t("name_error_required")}</span>} */}
								</div>
							</div>
							{/* phone */}
							<div className="input-row">
								<p className="input-label">{t("mobile")}</p>
								<div className="input-wrapper">
									<input className="signup-input-text" name="suMobile" type="text" defaultValue={phoneNumber} readOnly />
									{/* {errors.suName && <span className="error-desc">{t("name_error_required")}</span>} */}
								</div>
							</div>
						</div>
						<button className="primary-button">
							<span>{t("change")}</span>
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default inject("snackbarStore")(observer(withRouter(MyPage)));
