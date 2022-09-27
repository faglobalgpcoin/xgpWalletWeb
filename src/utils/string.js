const BigNumber = require("bignumber.js");
const bitcoin = require("bitcoinjs-lib");

export function validateEmailFormat(email){
	var re = /\S+@\S+\.\S+/;
	return re.test(email.toLowerCase());
}

export function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp);
	var months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = date + " " + month + " " + year + " ";
	// + hour + ':' + min + ':' + sec;
	return time;
}

export function timeConverterNumber(UNIX_timestamp){
	var a = new Date(UNIX_timestamp);
	var months = [
		"01",
		"02",
		"03",
		"04",
		"05",
		"06",
		"07",
		"08",
		"09",
		"10",
		"11",
		"12"
	];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time =
		    date + "/" + month + "/" + year + " " + hour + ":" + min + ":" + sec;
	return time;
}

export function timeConverterNumberArr(UNIX_timestamp){
	var result = [];
	var a = new Date(UNIX_timestamp);
	var months = [
		"01",
		"02",
		"03",
		"04",
		"05",
		"06",
		"07",
		"08",
		"09",
		"10",
		"11",
		"12"
	];
	result.push(a.getDate() < 10 ? "0" + a.getDate() : "" + a.getDate());
	result.push(months[a.getMonth()]);
	result.push(a.getFullYear().toString());
	// var year = a.getFullYear();
	// var month = months[a.getMonth()];
	// var date = a.getDate();
	// var hour = a.getHours();
	// var min = a.getMinutes();
	// var sec = a.getSeconds();
	// var time =
	//   date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
	return result;
}

/**
 * 콤마 & 소수점 이하 0 짜르기
 *
 * @param value
 * @param decimalPosition
 * @returns {string}
 * @constructor
 */
export function NumberWithCommas(value, decimalPosition){
	value = new BigNumber(value);
	if ( value.comparedTo(0) === 1 ) {
		let parts = value.toString().split(".");
		let intPart = addCommas(parts[0]);
		if ( parts[1] ) {
			let floatPart = trimDecimal(parts[1], decimalPosition);
			return intPart + (parts[1] * 1 !== 0 ? "." + floatPart : "");
		}
		return intPart + "";
	} else {
		return value + "";
	}
}

/**
 * 콤마 찍기
 *
 * @param number
 * @returns {string}
 */
function addCommas(number){
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 소수점 0 짜르기
 * @param decimal
 * @param position
 * @returns {string}
 */
function trimDecimal(decimal, position){
	if ( position > 0 ) {
		decimal = decimal.substr(0, position);
	}
	let floatLength = decimal.length | 0;
	let lastPosition = 0;
	for ( let i = floatLength - 1; i >= 0; i-- ) {
		let temp = decimal.substr(i, 1);
		if ( temp * 1 > 0 ) {
			lastPosition = i;
			break;
		}
	}
	return decimal.substr(0, lastPosition + 1);
}

export function trimBlankSpace(str){
	return str.replace(/(\s*)/g, "");
}

export function stringSplitToArray(str){
	return str.split(" ");
}

export function removeTrailing0x(str){
	if ( str ) {
		if ( str.startsWith("0x") ) {
			return str.substring(2);
		} else {
			return str;
		}
	}
}

export function formatAddressToCFC(str){
	// return "cf" + removeTrailing0x(str);
	return str;
}

export function formatAddressFromCFC(str){
	if ( str.startsWith("cf") ) {
		return "0x" + str.substring(2);
	} else {
		return str;
	}
}

export function hidePhoneNumber(str){
	return str.slice(0, 3) + "*".repeat(str.length - 6) + str.slice(-3);
}

export function hideAddress(str){
	return str.slice(0, 8) + "..." + str.slice(-8);
}

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
 */
export function is55Address(address){
	if ( !/^(0x)?[0-9a-f]{40}$/i.test(address) ) {
		// check if it has the basic requirements of an address
		return false;
	} else if (
		/^(0x)?[0-9a-f]{40}$/.test(address) ||
		/^(0x)?[0-9A-F]{40}$/.test(address)
	) {
		// If it's all small caps or all all caps, return true
		return true;
	} else {
		// Otherwise check each case
		// return isChecksumAddress(address);
		return false;
	}
}

export function bitcoinAddress(address) {
  try {
    bitcoin.address.toOutputScript(address);
    return true
  } catch (e) {
    return false
  }
}
