import React from 'react';
import {useTranslation} from 'react-i18next';
import {PrivacyPolicyEnglish, TermsOfUseEnglish} from '../PolicyEnglish';

function TermsAndPolicy() {
	const {t, i18n} = useTranslation();
	
	return (
		<div className="container wallet-container">
			<div className="card card-full-height" style={{padding: 15}}>
				<div className="content-title title-row">
					<span>{t('policy')}</span>
				</div>
				<div className="col-md-6 text-center flex-center">
					<div className="input-row terms-and-policy">
						<div className="policy-title">Privacy Policy</div>
						<div className="policy-content">{PrivacyPolicyEnglish}</div>
						<hr />
						<div className="policy-title">Terms of Use</div>
						<div className="policy-content">{TermsOfUseEnglish}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TermsAndPolicy;
