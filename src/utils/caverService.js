// import Caver from 'caver-js';
// import DEXIO_ABI from '../abis/DexioABI';

// const BAOBAB_TESTNET_RPC_URL = 'https://api.baobab.klaytn.net:8651';
// const DEXIO_ADDRESS = '0xC3Af2B0bD06f7CA792CC9cCF03F4dfeae1892bB2';

// const deployer = {
//   private: '0xfee4d621abf74978940596c48214883dec525672d51d1d701832e91d21ee930f',
//   address: '0x6a31b35cbccad110dddc69b29d180b80da3e6b09',
// };

// const caver = new Caver(BAOBAB_TESTNET_RPC_URL);
// const contract = new caver.klay.Contract(DEXIO_ABI, DEXIO_ADDRESS);
// const owner = caver.klay.accounts.wallet.add(deployer.private);

// const storeOnBlockchain = async (data) => {
//   return new Promise(function(resolve, reject) {
//     contract.methods
//       .mint(data)
//       .send({
//         from: owner.address,
//         gasPrice: '25000000000',
//         gas: '1000000',
//       })
//       .then(function(receipt) {
//         resolve(receipt);
//       });
//   });
// };

// const addMetadataOnBlockchain = async (tokenId, data) => {
//   return new Promise(function(resolve, reject) {
//     contract.methods
//       .addTokenMetadata(tokenId, JSON.stringify(data))
//       .send({
//         from: owner.address,
//         gasPrice: '25000000000',
//         gas: '2000000',
//       })
//       .catch(function(e) {
//         console.log(e); // "oh, no!"
//         reject(e);
//       })
//       .then(function(receipt) {
//         console.log('store metadata successfully::', receipt);
//         resolve(receipt);
//       });
//   });
// };

// const getStoredDiamond = async () => {
//   let roughData = [];
//   let facetedData = [];

//   const tokens = await contract.methods.tokensOf(owner.address).call();

//   for (let i = 0; i < tokens.length; i++) {
//     let tempData = await contract.methods.tokenMetadata(tokens[i]).call();
//     tempData = tempData.split(';', 2);

//     if (tempData[1]) {
//       facetedData.push({
//         ...JSON.parse(tempData[0]),
//         ...JSON.parse(tempData[1]),
//       });
//     } else {
//       roughData.push(JSON.parse(tempData[0]));
//     }
//   }

//   return { roughData, facetedData };
// };

// const getTokensOfOwner = async () => {
//   return await contract.methods.tokensOf(owner.address).call();
// };

// const getTokenMetadata = async (tokenId) => {
//   return await contract.methods.tokenMetadata(tokenId).call();
// };

// export {
//   caver,
//   storeOnBlockchain,
//   getStoredDiamond,
//   getTokensOfOwner,
//   getTokenMetadata,
//   addMetadataOnBlockchain,
// };
