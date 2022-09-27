import React from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
	const { t, i18n } = useTranslation();
	return (
		<div className="container page-ath-footer" style={{}}>
			<ul className="footer-links">
				<li style={{ padding: 0 }}>
					<a href="/terms-and-policy">{t("policy")}</a>
				</li>
				<span>© 2021 FA GLOBAL FINANCE OÜ ALL RIGHTS RESERVED</span>
			</ul>
		</div>
	);
};

export default Footer;
