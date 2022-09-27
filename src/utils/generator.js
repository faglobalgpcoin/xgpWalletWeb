import moment from 'moment';

const roughStoneGenerate = () => {
  return {
    serialNum: '2019' + Math.floor(Math.random() * 100000000),
    processStatus: 'ROUGH_DRAFT',
    roughCaratWeight: (Math.floor(Math.random() * 1000) / 100).toString(),
    roughColor: 'G',
    roughExpectedCarat: [
      (Math.floor(Math.random() * 100) / 100).toString(),
      (Math.floor(Math.random() * 100) / 100).toString(),
      (Math.floor(Math.random() * 100) / 100).toString(),
    ],
    roughExpectedClarity: 'VS-1',
    roughMeasurements: '10.9-9.8-10.8',
    roughAnalysisImages: [
      'https://5.imimg.com/data5/JU/MX/HU/SELLER-56834053/rough-gemstone-500x500.jpg',
      'https://4.imimg.com/data4/BI/JY/MY-2579407/rough-gemstone-500x500.jpg',
      'https://images-na.ssl-images-amazon.com/images/I/61jcuRRD-pL._UY395_.jpg',
      'https://5.imimg.com/data5/EH/QY/MY-37071630/aquamarine-rough-gemstone-500x500.jpg',
    ],
  };
};

const roughDiamondGenerate = () => {
  return {
    serialNum: '2019' + Math.floor(Math.random() * 100000000),
    processStatus: 'ROUGH_DRAFT',
    roughCreated: moment().format('LL'),
    roughCaratWeight: (Math.floor(Math.random() * 1000) / 100).toString(),
    roughColor: 'G',
    roughExpectedCarat: [
      (Math.floor(Math.random() * 100) / 100).toString(),
      (Math.floor(Math.random() * 100) / 100).toString(),
      (Math.floor(Math.random() * 100) / 100).toString(),
    ],
    roughExpectedClarity: 'VS-1',
    roughMeasurements: '10.9-9.8-10.8',
    roughAnalysisImages: [
      'https://5.imimg.com/data5/JU/MX/HU/SELLER-56834053/rough-gemstone-500x500.jpg',
      'https://4.imimg.com/data4/BI/JY/MY-2579407/rough-gemstone-500x500.jpg',
      'https://images-na.ssl-images-amazon.com/images/I/61jcuRRD-pL._UY395_.jpg',
      'https://5.imimg.com/data5/EH/QY/MY-37071630/aquamarine-rough-gemstone-500x500.jpg',
    ],
  };
};

const storedRoughDiamondGenerate = () => {
  return {
    serialNum: '2019' + Math.floor(Math.random() * 100000000),
    address: '0x6d9b92dfaf3cc3ae2e45b37b584f52f23bc12345',
    processStatus: 'ROUGH_STORED',
    roughCaratWeight: (Math.floor(Math.random() * 1000) / 100).toString(),
    roughColor: 'G',
    roughExpectedCarat: [
      (Math.floor(Math.random() * 100) / 100).toString(),
      (Math.floor(Math.random() * 100) / 100).toString(),
      (Math.floor(Math.random() * 100) / 100).toString(),
    ],
    roughExpectedClarity: 'VS-1',
    roughMeasurements: '10.9-9.8-10.8',
    roughAnalysisImages: [
      'https://5.imimg.com/data5/JU/MX/HU/SELLER-56834053/rough-gemstone-500x500.jpg',
      'https://4.imimg.com/data4/BI/JY/MY-2579407/rough-gemstone-500x500.jpg',
      'https://images-na.ssl-images-amazon.com/images/I/61jcuRRD-pL._UY395_.jpg',
      'https://5.imimg.com/data5/EH/QY/MY-37071630/aquamarine-rough-gemstone-500x500.jpg',
    ],
  };
};

export { roughStoneGenerate, roughDiamondGenerate, storedRoughDiamondGenerate };
