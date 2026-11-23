// SHARED.JS - Final (U1-U8)
// Stores set per your choice (only the 6 new stores).
// Customers and retailers are demo entries.

const DEMO_STORES = [
  { id: 0, name: "S Mart", cash: 12000, commission: 0 },
  { id: 1, name: "More Retail Store", cash: 8500, commission: 0 },
  { id: 2, name: "Sitarama Book Store", cash: 7500, commission: 0 },
  { id: 3, name: "Jyothi Sweet Shop", cash: 9300, commission: 0 },
  { id: 4, name: "Rani Hardware", cash: 11000, commission: 0 },
  { id: 5, name: "DS Kirana Store", cash: 10050, commission: 0 }
];

const DEMO_USERS = {
  customers: [
    { username: "siddu_2512", password: "Siddu@2004", name: "Siddardha", bank: { name: "HDFC Bank", last4: "9214" }, pin: "1111" },
    { username: "mms_2005", password: "Mms@2005", name: "Mohan Sai", bank: { name: "SBI", last4: "3842" }, pin: "2222" },
    { username: "mohith_2006", password: "Mohith@2006", name: "Mohith Kumar", bank: { name: "ICICI Bank", last4: "7421" }, pin: "3333" }
  ],
  retailers: [
    { username: "ret0", password: "ret0pass", storeId: 0, name: "S Mart - Retailer" },
    { username: "ret1", password: "ret1pass", storeId: 1, name: "More Retail - Retailer" }
  ],
  admins: [
    { username: "admin", password: "adminpass", name: "System Admin" }
  ]
};

const KEY = {
  STORES: "rw_stores_vfinal",
  TX: "rw_tx_vfinal",
  USERS: "rw_users_vfinal",
  CURRENT_CUSTOMER: "rw_current_customer_vfinal",
  CURRENT_RETAILER: "rw_current_retailer_vfinal",
  CURRENT_ADMIN: "rw_current_admin_vfinal",
  LOGIN_OTP: "rw_login_otp_vfinal",
  WITHDRAW_CODES: "rw_withdraw_codes_vfinal"
};

function initSeed(){ 
  if(!localStorage.getItem(KEY.STORES)) localStorage.setItem(KEY.STORES, JSON.stringify(DEMO_STORES));
  if(!localStorage.getItem(KEY.TX)) localStorage.setItem(KEY.TX, JSON.stringify([]));
  if(!localStorage.getItem(KEY.USERS)) localStorage.setItem(KEY.USERS, JSON.stringify(DEMO_USERS));
  if(!localStorage.getItem(KEY.LOGIN_OTP)) localStorage.setItem(KEY.LOGIN_OTP, JSON.stringify({}));
  if(!localStorage.getItem(KEY.WITHDRAW_CODES)) localStorage.setItem(KEY.WITHDRAW_CODES, JSON.stringify({}));
}
initSeed();

function getStores(){ return JSON.parse(localStorage.getItem(KEY.STORES) || "[]"); }
function saveStores(data){ localStorage.setItem(KEY.STORES, JSON.stringify(data)); }
function getTx(){ return JSON.parse(localStorage.getItem(KEY.TX) || "[]"); }
function saveTx(data){ localStorage.setItem(KEY.TX, JSON.stringify(data)); }
function getUsers(){ return JSON.parse(localStorage.getItem(KEY.USERS)); }

function _rand6(){ return Math.floor(100000 + Math.random()*900000).toString(); }

function sendLoginOTP(username){
  const otp = _rand6();
  const store = JSON.parse(localStorage.getItem(KEY.LOGIN_OTP) || "{}");
  store[username] = { otp, ts: Date.now(), expires: Date.now() + 2*60*1000 };
  localStorage.setItem(KEY.LOGIN_OTP, JSON.stringify(store));
  return otp;
}

function verifyLoginOTP(username, entered){
  const store = JSON.parse(localStorage.getItem(KEY.LOGIN_OTP) || "{}");
  const entry = store[username];
  if(!entry) return false;
  if(Date.now() > (entry.expires||0)){ delete store[username]; localStorage.setItem(KEY.LOGIN_OTP, JSON.stringify(store)); return false; }
  const ok = String(entry.otp) === String(entered);
  delete store[username]; localStorage.setItem(KEY.LOGIN_OTP, JSON.stringify(store)); return ok;
}

function verifyCredentials(role, username, password){
  const users = getUsers();
  if(role === "customer") return users.customers.find(u=>u.username===username && u.password===password) || null;
  if(role === "retailer") return users.retailers.find(u=>u.username===username && u.password===password) || null;
  if(role === "admin") return users.admins.find(u=>u.username===username && u.password===password) || null;
  return null;
}

function completeLogin(role, username){
  const users = getUsers();
  if(role==="customer"){ const u = users.customers.find(x=>x.username===username); if(!u) return false; localStorage.setItem(KEY.CURRENT_CUSTOMER, JSON.stringify(u)); return true; }
  if(role==="retailer"){ const u = users.retailers.find(x=>x.username===username); if(!u) return false; localStorage.setItem(KEY.CURRENT_RETAILER, JSON.stringify(u)); return true; }
  if(role==="admin"){ const u = users.admins.find(x=>x.username===username); if(!u) return false; localStorage.setItem(KEY.CURRENT_ADMIN, JSON.stringify(u)); return true; }
  return false;
}

function getCurrentCustomer(){ return JSON.parse(localStorage.getItem(KEY.CURRENT_CUSTOMER) || "null"); }
function getCurrentRetailer(){ return JSON.parse(localStorage.getItem(KEY.CURRENT_RETAILER) || "null"); }
function getCurrentAdmin(){ return JSON.parse(localStorage.getItem(KEY.CURRENT_ADMIN) || "null"); }
function logoutCustomer(){ localStorage.removeItem(KEY.CURRENT_CUSTOMER); }
function logoutRetailer(){ localStorage.removeItem(KEY.CURRENT_RETAILER); }
function logoutAdmin(){ localStorage.removeItem(KEY.CURRENT_ADMIN); }

function validatePinForCustomer(username, pin){
  const users = getUsers(); const u = users.customers.find(x=>x.username===username); if(!u) return false; return String(u.pin) === String(pin);
}

function createTransaction(customerName, bankDisplay, storeId, amount){
  const txs = getTx();
  const tx = { id: "tx_"+Date.now()+"_"+Math.floor(Math.random()*9000), customerName, bank: bankDisplay, storeId, amount: Number(amount), status: "Pending", ts: Date.now() };
  txs.unshift(tx); saveTx(txs); return tx;
}

function generateWithdrawCode(txId){
  const code = _rand6();
  const codes = JSON.parse(localStorage.getItem(KEY.WITHDRAW_CODES) || "{}");
  codes[txId] = { code, ts: Date.now(), expires: Date.now() + 12*60*60*1000 };
  localStorage.setItem(KEY.WITHDRAW_CODES, JSON.stringify(codes));
  return code;
}

function retailerVerifyCode(txId, entered){
  const codes = JSON.parse(localStorage.getItem(KEY.WITHDRAW_CODES) || "{}");
  const entry = codes[txId];
  if(!entry) return { ok:false, msg: "Withdrawal code not found" };
  if(String(entry.code) !== String(entered)) return { ok:false, msg: "Invalid withdrawal code" };

  const txs = getTx(); const tx = txs.find(t=>t.id===txId);
  if(!tx) return { ok:false, msg: "Transaction not found" };
  const stores = getStores(); const store = stores.find(s=>s.id === tx.storeId);
  if(!store) return { ok:false, msg: "Store not found" };
  if(store.cash < tx.amount) return { ok:false, msg: "Insufficient cash in store" };

  store.cash = Number(store.cash) - Number(tx.amount);
  store.commission = Number(store.commission||0) + 5;
  tx.status = "Success";
  tx.completedAt = Date.now();
  saveTx(txs);
  saveStores(stores);
  delete codes[txId]; localStorage.setItem(KEY.WITHDRAW_CODES, JSON.stringify(codes));
  return { ok:true, tx };
}

function retailerCancel(txId){
  const txs = getTx(); const tx = txs.find(t=>t.id===txId);
  if(!tx) return { ok:false, msg: "Transaction not found" };
  if(tx.status !== "Pending") return { ok:false, msg: "Only pending transactions can be cancelled" };
  tx.status = "Failed"; tx.cancelledAt = Date.now(); saveTx(txs);
  const codes = JSON.parse(localStorage.getItem(KEY.WITHDRAW_CODES) || "{}"); if(codes[txId]){ delete codes[txId]; localStorage.setItem(KEY.WITHDRAW_CODES, JSON.stringify(codes)); }
  return { ok:true, tx };
}

function formatINR(x){ return "₹" + Number(x).toLocaleString("en-IN"); }

function resetAll(){
  localStorage.removeItem(KEY.STORES); localStorage.removeItem(KEY.TX); localStorage.removeItem(KEY.USERS);
  localStorage.removeItem(KEY.CURRENT_CUSTOMER); localStorage.removeItem(KEY.CURRENT_RETAILER); localStorage.removeItem(KEY.CURRENT_ADMIN);
  localStorage.removeItem(KEY.LOGIN_OTP); localStorage.removeItem(KEY.WITHDRAW_CODES);
  initSeed(); location.reload();
}

window.RW = {
  KEY,
  getStores, saveStores, getTx, saveTx, getUsers,
  verifyCredentials, sendLoginOTP, verifyLoginOTP, completeLogin,
  getCurrentCustomer, getCurrentRetailer, getCurrentAdmin, logoutCustomer, logoutRetailer, logoutAdmin,
  validatePinForCustomer, createTransaction, generateWithdrawCode, retailerVerifyCode, retailerCancel,
  formatINR, resetAll
};
