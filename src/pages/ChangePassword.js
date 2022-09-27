import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import useForm from "react-hook-form";
import { withRouter } from "react-router";
import { ClipLoader } from "react-spinners";

import { validateEmailFormat } from "../utils/string";
import { checkIsExistUserAndEmail, sendEmailCode, checkVerifyCode, changeUserPassword } from "../apis/user";

function ChangePassword({ history }) {
	const { t } = useTranslation();
	const { register, handleSubmit, getValues, setError, errors, triggerValidation, clearError } = useForm();

	const [userId, setUserId] = useState("");
	const [email, setEmail] = useState("");
	const [emailCode, setEmailCode] = useState("");
	const [verifyCode, setVerifyCode] = useState("");
	const [isAfterSendEmail, setIsAfterSendEmail] = useState(false);
	const [isEmailVerified, setIsEmailVerified] = useState(false);

	const sendEmail = async () => {
		let result;
		const { email, userId } = getValues();

		if (!email) {
			setError("email", "required", t("email_error_required"));
			return;
		}

		if (!validateEmailFormat(email)) {
			setError("email", "format", t("email_error_invalid"));
			return;
		}

    result = await checkIsExistUserAndEmail({ userId: userId, emailAddress: email });

    if (!result) {
      setError("email", "required", t("api_error"));
      return;
    }

    if (result.status === "success") {
      setError("email", "required", t("email_error_required"));
      return;
    }

		triggerValidation();

		setIsAfterSendEmail(true);

		result = await sendEmailCode({
			sendTypeKind: "EMAIL_FOR_PASSWORD",
			emailAddress: email,
			phoneNumber: null,
		});

		if (!result) {
			setError("email", "required", t("api_error"));
			return;
		}

		if (result.status === "fail") {
			setError("email", "required", t("api_error"));
			return;
		}

		setIsAfterSendEmail(false);
		setEmailCode(result.data);
		setEmail(email);
		setUserId(userId);
	};

	const validateEmail = async () => {
		let result;
		const { emailVerificationCode, email } = getValues();

		result = await checkVerifyCode({
			emailAddress: email,
			phoneNumber: null,
			code: emailVerificationCode,
		});

		if (!result) {
			setError("emailVerificationCode", "invalid", t("please_check_code"));
			return;
		}

		if (result.status === "fail") {
			setError("emailVerificationCode", "invalid", t("please_check_code"));
			return;
		}

		if (result.data !== true) {
			setError("emailVerificationCode", "invalid", t("please_check_code"));
			return;
		}

		setVerifyCode(emailVerificationCode);
		setIsEmailVerified(true);
		clearError("emailVerificationCode");
	};

	const onSubmit = async (formdata, e) => {
		await triggerValidation();
		const { password, passwordVerify } = getValues();

		if (password === undefined || passwordVerify === undefined || password === "" || passwordVerify === "") {
			return;
		}

		if (password.length < 8) {
			setError("password", "minLength", t("password_error_length"));
			return;
		}

		if (password !== passwordVerify) {
			setError("passwordVerify", "notMatch", t("password_error_notmatched"));
			return;
		}

		const result = await changeUserPassword({
      userId: userId,
			code: verifyCode,
			emailAddress: email,
			newPassword: passwordVerify,
		});

		if (!result) {
			setError("passwordVerify", "notMatch", t("password_change_error")); // 번역파일 추가필요
			return;
		}

		if (result.status === "fail") {
			setError("passwordVerify", "notMatch", t("password_change_error"));
			return;
		}

		history.push("/");
	};

	return (
		<div className="login">
			<div className="bg-wrapper">
				<span className="bg-footer">cs@gp.com</span>
				<div className="bg-title">
					<img src={require("../imgs/intro_moon.png")} alt="icon" />
					<hr />
					<p className="bg-desc">GP Coin Wallet</p>
				</div>
			</div>
			<div className="login-wrapper">
				{/* <span className="login-footer">Forgot your password?</span> */}
				<form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
					<div className="login-content change-password">
						<div className="page-ath-header">
							<a href="" className="page-ath-logo">
								<img src={require("../imgs/logo.png")} alt="logo" />{" "}
							</a>
						</div>
						<span className="welcome" style={{ marginBottom: 20 }}>
							{isEmailVerified ? t("reset_password_title") : t("forgot_password_title")}
						</span>
						<p className="please" style={{ marginBottom: 40 }}>
							{isEmailVerified ? t("reset_password_desc") : t("forgot_password_desc")}
						</p>

						{isEmailVerified ? (
							<>
								<div className="input-row">
									<p className="input-label">{t("password")}</p>
									<div className="input-wrapper">
										<input className="signup-input-text" name="password" type="password" ref={register} />
										{errors.password && <span className="error-desc">{errors.password.message || t("password_error_length")}</span>}
									</div>
								</div>
								<div className="input-row">
									<p className="input-label">{t("repeat_password")}</p>
									<div className="input-wrapper">
										<input className="signup-input-text" name="passwordVerify" type="password" ref={register} />
										{errors.passwordVerify && <span className="error-desc">{errors.passwordVerify.message}</span>}
									</div>
								</div>
							</>
						) : (
							<>
                {/* id */}
                <div className="input-row">
                  <p className="input-label">{t("userId")}</p>
                  <div className="input-wrapper">
                    <input className="signup-input-text" name="userId" type="text" ref={register} />
                    {errors.userId && <span className="error-desc">{t("userId_error_required")}</span>}
                  </div>
                </div>
                {/* id end */}
								<div className="input-row">
									<p className="input-label">{t("email")}</p>
									<div className="input-with-button">
										<div className="input-wrapper">
											<input className="signup-input-text" name="email" type="text" ref={register} disabled={isEmailVerified || emailCode} />
											{errors.email && <span className="error-desc">{errors.email.message || t("email_error_required")}</span>}
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
											<input className="signup-input-text" name="emailVerificationCode" type="number" disabled={isEmailVerified} maxLength={6} ref={register} />
											{errors.emailVerificationCode && <span className="error-desc">{errors.emailVerificationCode.message || t("field_error_required")}</span>}
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
							</>
						)}
						{isEmailVerified && (
							<button className="primary-button" disabled={!isEmailVerified}>
								<span>{t("submit")}</span>
								<FiArrowRight size={25} style={{ marginLeft: "15px" }} />
							</button>
						)}
						<p className="signup-desc">
							{t("already_have_an_account")} <span onClick={() => history.push("/login")}>{t("login")} </span>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}

export default inject("snackbarStore")(observer(withRouter(ChangePassword)));
