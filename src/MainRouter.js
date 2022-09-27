import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { inject } from "mobx-react";
import { observer } from "mobx-react";

import Navigation from "./components/Navigation";

import Snackbar from "./components/Snackbar";
import Dashboard from "./pages/Dashboard";
import Template from "./pages/Template";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import Transactions from "./pages/Transactions";
import Footer from "./components/Footer";

import MyPage from "./pages/MyPage";
import TermsAndPolicy from "./pages/TermsAndPolicy";
import ETHToWFCASwap from "./pages/ETHToWFCA";
import ETHToDGPSwap from "./pages/ETHToDGP";

const MainRouter = ({ match, snackbarStore }) => {
	const { isActive, message, handleClick } = snackbarStore;

	return (
		<>
			<Navigation />
			<Snackbar isActive={isActive} message={message} handleClick={handleClick} isDismiss={true} dismissTime={4000} />
			<Switch>
				<Route exact path={`${match.url}`}>
					<Redirect to="/dashboard" />
				</Route>
				<Route path={`${match.url}dashboard`} component={Dashboard} />
				<Route path={`${match.url}send`} component={Send} />
				<Route path={`${match.url}receive`} component={Receive} />
				<Route path={`${match.url}wfca-swap`} component={ETHToWFCASwap} />
				<Route path={`${match.url}dgp-swap`} component={ETHToDGPSwap} />
				<Route path={`${match.url}transactions`} component={Transactions} />

				{/* <Route path={`${match.url}wallet-properties`} component={AppProperty} />
        <Route path={`${match.url}new-property`} component={NewAppProperty} />
        <Route
          path={`${match.url}modify-property/:id`}
          component={NewAppProperty}
        />
        <Route path={`${match.url}users`} component={Users} />
        <Route path={`${match.url}lockup-all`} component={LockUpAll} />
        <Route path={`${match.url}lockup`} component={UserLockUp} />
        <Route path={`${match.url}airdrop`} component={AirdropTransfer} /> */}
				<Route path={`${match.url}mypage`} component={MyPage} />
				<Route path={`${match.url}terms-and-policy`} component={TermsAndPolicy} />
				<Route path={`${match.url}notice`} component={Template} />
				<Route path={`${match.url}faq`} component={Template} />
				<Route path={`${match.url}setting`} component={Template} />
				{/* <Route component={NoMatch} /> */}
			</Switch>
			<Footer />
		</>
	);
};

export default inject("snackbarStore")(observer(MainRouter));
