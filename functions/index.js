const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const XLSX = require('xlsx');

admin.initializeApp();

const db = admin.firestore();

getUsers = async () => {
  const users = db.collection('users');
  const marketableUsers = users.where('marketingConsent', '==', true);
  const finalUsers = await marketableUsers.get();
  const wb = XLSX.utils.book_new();
  wb.SheetNames.push('Marketing');
  marketingSheet = [];
  marketingSheet.push(['Email', 'Source', 'Time']);
  finalUsers.docs.forEach(doc => {
    const timeCreated = new Date(doc.createTime.seconds * 1000);
    const data = doc.data();
    marketingSheet.push([data.email, data.sources[0], timeCreated.toLocaleString()])
  });
  const marketingWS = XLSX.utils.aoa_to_sheet(marketingSheet);
  wb.Sheets["Marketing"] = marketingWS;
  const storage = new Storage();
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  const bucket = storage.bucket(functions.config().config.bucket);
  const file = bucket.file('marketing.xlsx');
  await file.save(buffer);
  const config = {
    version: 'v2',
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };
  const [url] = await file.getSignedUrl(config);
  return url;
};

exports.marketingSpreadsheet = functions.https.onCall((data, context) => {
  if (context.auth.token.admin === true) {
    return getUsers();
  }
  else {
    throw new Error("Unauthenticated");
  }
});

getRaffle = async (id) => {
  const raffles = await db.collection('quiz').doc('web-client').collection('raffles').doc(id).collection('subscribers').get();
  const wb = XLSX.utils.book_new();
  wb.SheetNames.push("Raffle");
  raffleSheet = [];
  raffleSheet.push(['First Name', 'Last Name', 'Email']);
  raffles.docs.forEach(doc => {
    const data = doc.data();
    raffleSheet.push([data.firstName, data.lastName, data.email]);
  });
  const raffleWS = XLSX.utils.aoa_to_sheet(raffleSheet);
  wb.Sheets["Raffle"] = raffleWS;
  const storage = new Storage();
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  const bucket = storage.bucket(functions.config().config.bucket);
  const file = bucket.file(`${id}.xlsx`);
  await file.save(buffer);
  const config = {
    version: 'v2',
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };
  const [url] = await file.getSignedUrl(config);
  return url;
}

exports.raffleSpreadsheet = functions.https.onCall((data, context) => {
  if (context.auth.token.admin === true) {
    return getRaffle(data.id);
  }
  else {
    throw new Error("Unauthenticated");
  }
});
