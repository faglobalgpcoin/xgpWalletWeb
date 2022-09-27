const API_URL = "https://api.xgpinco.com/api/v1";
const CHAIN_CODE = "7806468005210300226";

const SCAN_TOKEN_URL = (address) =>
	// `https://api.luniverse.io/scan/v1.0/chains/6022710925185810777/accounts/0x638734cbc723167a2c59f23e81f4028bf7904443/tokens?limit=25`;
	`https://api.luniverse.io/scan/v1.0/chains/${CHAIN_CODE}/accounts/${address}/tokens?limit=25`;

const SCAN_TRANSFER_URL = (address) =>
	// `https://api.luniverse.io/scan/v1.0/chains/6022710925185810777/accounts/0x77cb25519224ba6db97e5e43dd75874d5c5610bd/transfer-events`;
	`https://api.luniverse.io/scan/v1.0/chains/${CHAIN_CODE}/accounts/${address}/transfer-events`;

const SCAN_TRANSFER_URL_LIMIT = (address, limit = 500) =>
	// `https://api.luniverse.io/scan/v1.0/chains/6022710925185810777/accounts/0x77cb25519224ba6db97e5e43dd75874d5c5610bd/transfer-events?limit=${limit}`;
	`https://api.luniverse.io/scan/v1.0/chains/${CHAIN_CODE}/accounts/${address}/transfer-events?limit=${limit}`;

const GET_TOKEN_LIST = () =>
	`${API_URL}/support/gettokeninfo`;

const GET_ETHER_ADDRESS = `https://swapapi.dmwwallet.com/api/v1/address/setwfctoeth`;

export { API_URL, SCAN_TOKEN_URL, SCAN_TRANSFER_URL, SCAN_TRANSFER_URL_LIMIT, GET_TOKEN_LIST, GET_ETHER_ADDRESS };
