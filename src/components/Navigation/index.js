import React from "react";
import { NavLink } from "react-router-dom";
import { Translation } from "react-i18next";
import { withRouter } from "react-router";
import { IoIosSend, IoIosListBox } from "react-icons/io";
import { MdDashboard, MdSettings } from "react-icons/md";
import { FaQrcode, FaStore, FaMoneyCheck, FaBarcode } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { AiOutlineSwap } from "react-icons/ai";

import { resetCookie, getCookie, decodeCookieData } from "../../utils/auth";
import { verifyUser, logout } from "../../apis/auth";

import i18n from "../../i18n";

import { inject, observer } from "mobx-react";

@inject("settingStore")
@observer
class Navigation extends React.Component {
	state = {
		isFold: true,
		isMobile: false,
		isMobileActive: false,
		isSettingOpen: false,
		isSettingChildOpen: "",
		accessToken: "",
	};

	async componentDidMount() {
		if (window.innerWidth <= 992) {
			this.setState({ isMobile: true });
		} else {
			this.setState({ isMobile: false });
		}

		const cookieData = decodeCookieData(getCookie("key"));
		const userResponse = await verifyUser(cookieData.accessToken);
		try {
			if (userResponse.data === null) {
				resetCookie();
				this.props.history.push("/");
			} else {
				this.setState({
					user: userResponse.data,
				});
				this.setState({
					accessToken: cookieData.accessToken,
				});
			}
		} catch (e) {
			resetCookie();
			this.props.history.push("/");
		}
	}

	handleLogout = async () => {
		resetCookie();
		await logout();
		this.props.history.push("/");
	};

	handleToggleFold = () => {
		this.setState((prevState) => ({ isFold: !prevState.isFold }));
	};

	handleToggleMobileNav = () => {
		this.setState((prevState) => ({
			isMobileActive: !prevState.isMobileActive,
		}));
	};

	handleChangeLocales = async (current) => {
		document.cookie = "locale=" + current;
		i18n.changeLanguage(current);
	};

	handleChangeCurrency = async (current) => {
		await this.props.settingStore.setTokenCurrency(current);
		await this.props.settingStore.updateTokenPriceByCurrency(this.props.settingStore.tokenPrice);
	};

	toggleSettingNav = () => {
		if (!this.state.isMobile) {
			return;
		}

		this.setState((prevState) => ({
			isSettingOpen: !prevState.isSettingOpen,
		}));
	};

	toggleSettingChildNav = (value) => {
		if (!this.state.isMobile) {
			return;
		}

		if (this.state.isSettingChildOpen === value) {
			this.setState({
				isSettingChildOpen: "",
			});
			return;
		}

		this.setState({
			isSettingChildOpen: value,
		});
	};

	render() {
		const { isMobile, isMobileActive, isSettingOpen, isSettingChildOpen } = this.state;

		return (
			<div className={`topbar-wrap ${isMobile ? "is-sticky-wrap" : ""}`}>
				<div className="topbar-wrap">
					<div className={`topbar ${isMobile ? "is-sticky" : ""}`}>
						<div className="header-container container">
							{isMobile && (
								<ul className="topbar-nav d-lg-none">
									<li className="topbar-nav-item relative">
										<div className={`toggle-nav ${isMobileActive ? "active" : ""}`} onClick={this.handleToggleMobileNav}>
											<div className="toggle-icon">
												<span className="toggle-line"></span>
												<span className="toggle-line"></span>
												<span className="toggle-line"></span>
												<span className="toggle-line"></span>
											</div>
										</div>
									</li>
								</ul>
							)}
							<div className="title">
								<div className="topbar-logo" style={{ cursor: "pointer" }} onClick={() => this.props.history.push("/")}>
									<img src={require("../../imgs/logo-light2x.png")} alt="logo" height={50} />
								</div>
							</div>
						</div>{" "}
					</div>
					<div className={`navbar ${isMobile ? "navbar-mobile" : ""} ${isMobileActive ? "active" : ""}`}>
						<div className="container">
							<div className="navbar-innr">
								<ul className="navbar-menu">
									<li onClick={this.handleToggleMobileNav}>
										<NavLink
											to="/dashboard"
											className="link"
											activeClassName="active"
											isActive={(_, { pathname }) => {
												return pathname.includes("/wallet-properties") || pathname.includes("/new-property") || pathname.includes("/modify-property");
											}}
										>
											<MdDashboard size={17} />
											<Translation>{(t, { i18n }) => <>{t("dashboard")}</>}</Translation>
										</NavLink>
									</li>
									<li onClick={this.handleToggleMobileNav}>
										<NavLink to="/send" className="link" activeClassName="active">
											<IoIosSend size={18} />
											<Translation>{(t, { i18n }) => <>{t("send")}</>}</Translation>
										</NavLink>
									</li>
									<li onClick={this.handleToggleMobileNav}>
										<NavLink to="/receive" className="link" activeClassName="active">
											<FaQrcode size={18} />
											<Translation>{(t, { i18n }) => <>{t("receive")}</>}</Translation>
										</NavLink>
									</li>
									<li onClick={this.handleToggleMobileNav}>
										<NavLink to="/transactions" className="link" activeClassName="active">
											<IoIosListBox size={18} />
											<Translation>{(t, { i18n }) => <>{t("transactions")}</>}</Translation>
										</NavLink>
									</li>
									<li className="page-links-all current">
										<a href={`http://app.lifechainpartners.com/service/excpn.php?accessToken=${this.state.accessToken}`} className="link">
											<FaStore size={18} />
											<Translation>{(t, { i18n }) => <>{t("market")}</>}</Translation>
										</a>
									</li>
									<li className="page-links-all current">
										<a href={`http://xgppos.com/storeposition/`} className="link">
											<FaBarcode size={18} />
											<Translation>{(t, { i18n }) => <>{t("POS Market")}</>}</Translation>
										</a>
									</li>
									<li className="page-links-all current">
										<a href="https://office.xgpinco.com" className="link">
											<FaMoneyCheck size={18} />
											<Translation>{(t, { i18n }) => <>{t("office")}</>}</Translation>
										</a>
									</li>
									{/* <li>
                    <NavLink
                      to="/wfca-swap"
                      className="link"
                      activeClassName="active">
                      <AiOutlineSwap size={18} />
                      <Translation>
                        {(t, { i18n }) => <>{t("wfca_swap")}</>}
                      </Translation>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/dgp-swap"
                      className="link"
                      activeClassName="active">
                      <AiOutlineSwap size={18} />
                      <Translation>
                        {(t, { i18n }) => <>{t("dgp_swap")}</>}
                      </Translation>
                    </NavLink>
                  </li> */}
									<li className="has-dropdown page-links-all current">
										<a className="drop-toggle" href="#" onClick={this.toggleSettingNav}>
											<MdSettings size={18} />
											<Translation>{(t, { i18n }) => <>{t("setting")}</>}</Translation>
										</a>
										<ul className={`navbar-dropdown ${isSettingOpen ? "nav-opened" : ""}`}>
											{/*<li className="has-dropdown">*/}
											{/*	<a className="drop-toggle" href="#">*/}
											{/*		<Translation>*/}
											{/*			{(t, { i18n }) => <>{t("Swap")}</>}*/}
											{/*		</Translation>*/}
											{/*	</a>*/}
											{/*	<ul className="navbar-dropdown">*/}
											{/*		<li>*/}
											{/*			<a className="child-menu" href="">*/}
											{/*				<Translation>*/}
											{/*					{(t, { i18n }) => <>{t("transfer_token")}</>}*/}
											{/*				</Translation>*/}
											{/*			</a>*/}
											{/*		</li>*/}
											{/*		<li>*/}
											{/*			<a className="child-menu" href="">*/}
											{/*				<Translation>*/}
											{/*					{(t, { i18n }) => <>{t("eth_swap")}</>}*/}
											{/*				</Translation>*/}
											{/*			</a>*/}
											{/*		</li>*/}
											{/*	</ul>*/}
											{/*</li>*/}

											{/* mysetting */}
											<li className="has-dropdown" onClick={this.handleToggleMobileNav}>
												<NavLink to="/mypage" className="link" activeClassName="active" style={{ padding: 0 }}>
													<div className="child-menu a-style">
														{/* <Translation>{(t, { i18n }) => <>{t("policy")}</>}</Translation> */}
														<Translation>{(t, { i18n }) => <>{t("change_personal_info")}</>}</Translation>
													</div>
												</NavLink>
											</li>
											{/* mysetting end */}
											<li className="has-dropdown">
												<div className="drop-toggle a-style" onClick={() => this.toggleSettingChildNav(1)}>
													<Translation>{(t, { i18n }) => <>{t("change_language")}</>}</Translation>
												</div>
												<ul className={`navbar-dropdown  ${isMobile ? "dropdown-mobile-child" : ""} ${isSettingChildOpen === 1 ? "nav-opened" : ""}`}>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeLocales("en")}>
																	ENGLISH
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeLocales("ko")}>
																	한국어
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeLocales("zh")}>
																	中國語
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeLocales("jp")}>
																	日本語
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeLocales("th")}>
																	ภาษาไทย
																</div>
															)}
														</Translation>
													</li>
												</ul>
											</li>
											<li className="has-dropdown">
												<div className="drop-toggle a-style" onClick={() => this.toggleSettingChildNav(2)}>
													<Translation>{(t, { i18n }) => <>{t("change_currency")}</>}</Translation>
												</div>
												<ul className={`navbar-dropdown ${isMobile ? "dropdown-mobile-child" : ""} ${isSettingChildOpen === 2 ? "nav-opened" : ""}`}>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("USD")}>
																	USD
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("KRW")}>
																	KRW
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("CNY")}>
																	CNY
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("JPY")}>
																	JPY
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("BRL")}>
																	BRL
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("CAD")}>
																	CAD
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("EUR")}>
																	EUR
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("GBP")}>
																	GBP
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("HKD")}>
																	HKD
																</div>
															)}
														</Translation>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<Translation>
															{(t, { i18n }) => (
																<div className="child-menu a-style" onClick={() => this.handleChangeCurrency("THB")}>
																	THB
																</div>
															)}
														</Translation>
													</li>
												</ul>
											</li>
											<li className="has-dropdown">
												<div className="drop-toggle a-style" onClick={() => this.toggleSettingChildNav(3)}>
													<Translation>{(t, { i18n }) => <>{t("etc")}</>}</Translation>
												</div>
												<ul className={`navbar-dropdown ${isMobile ? "dropdown-mobile-child" : ""} ${isSettingChildOpen === 3 ? "nav-opened" : ""}`}>
													<li onClick={this.handleToggleMobileNav}>
														<NavLink to="/terms-and-policy" className="link" activeClassName="active" style={{ padding: 0 }}>
															<div className="child-menu a-style">
																<Translation>{(t, { i18n }) => <>{t("policy")}</>}</Translation>
															</div>
														</NavLink>
													</li>
													<li onClick={this.handleToggleMobileNav}>
														<div className="child-menu a-style">
															<Translation>{(t, { i18n }) => <>{t("version")}</>}</Translation>
															<span style={{ marginLeft: "8px" }}> v1.0.0</span>
														</div>
													</li>
												</ul>
											</li>
										</ul>
									</li>
								</ul>
								<div className="logout-button" onClick={this.handleLogout}>
									<FiLogOut size={17} style={{ marginRight: 7, color: "gray" }} />
									<Translation>{(t, { i18n }) => <span>{t("logout")}</span>}</Translation>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withRouter(Navigation);
