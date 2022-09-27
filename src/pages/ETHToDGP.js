import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode.react";
import { inject, observer } from "mobx-react";
import { MdContentCopy } from "react-icons/md";

import { decodeCookieData, getCookie } from "../utils/auth";
import { verifyUser } from "../apis/auth";
import { getEtherAddress } from "../apis/wallet";

function ETHToWFCA() {

	const { t  } = useTranslation();
	const [user, setUser] = useState({});
	const [address, setAddress] = useState("");
	const [ethAddress, setEthAddress] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const [qrCodeStr, setQrCodeStr] = useState("");

	useEffect(() => {
		async function fetchData(){
			const { accessToken } = decodeCookieData(getCookie("key"));
			const userResponse = await verifyUser(accessToken);
			const ethAddressRes = await getEtherAddress({ wfcAddr: userResponse.data.address, token: "dgp" });

			if ( userResponse ) {
				setUser(userResponse.data);
				setAddress(userResponse.data.address);
				setQrCodeStr(`${ethAddressRes.data.ethAddr}`);
				setEthAddress(ethAddressRes.data.ethAddr);
			}
		}

		fetchData();
	}, []);

	const handleClickCopy = () => {
		setIsCopied(true);

		setTimeout(() => {
			setIsCopied(false);
		}, 2500);

		var tempElem = document.createElement("textarea");
		tempElem.value = ethAddress;
		document.body.appendChild(tempElem);

		tempElem.select();
		document.execCommand("copy");
		document.body.removeChild(tempElem);
	};

	return (
		<div className="container wallet-container">

			<div className="card card-full-height" style={{ padding: 15 }}>
				<div className="content-title title-row">
          <span>
	          {t('dgp_swap')}
          </span>
				</div>

				<div className="balance-container">
          <span className="address-info">
            {t("your_token_address", { name: 'ETH' })}
          </span>
					<div
						className={`address-wrapper input-row ${isCopied ? "copied" : ""}`}
						onClick={handleClickCopy}>
						{isCopied ? (
							<p style={{ margin: 0 }}>
								{`${t("address_copy_complete", {
									name: "Address"
								})} 👌`}
							</p>
						) : (
							<>
								<p className="break-word-all">{ethAddress}</p>
								<span style={{ marginTop: "3px" }}>
                  <MdContentCopy size={20} />
                </span>
							</>
						)}
					</div>
					<div className="qrcode-container">
						<QRCode value={qrCodeStr} size={250} />
					</div>
					<div className="button-container"></div>
				</div>
			</div>
		</div>
	);
}

export default inject("snackbarStore")(observer(ETHToWFCA));
