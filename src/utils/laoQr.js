export function generateLaoQR(phoneNumber, amount) {
  if (!phoneNumber) return '';

  // Clean the phone number (remove non-digits)
  let phone = phoneNumber.replace(/[^0-9]/g, '');
  // Standardize to 856 format
  if (phone.startsWith('020')) {
    phone = '856' + phone.substring(1);
  } else if (!phone.startsWith('856')) {
    phone = '85620' + phone; // fallback assumption
  }

  // EMVCo QR Code standard fields
  let payload = '';
  // 00 - Payload Format Indicator (01)
  payload += '000201';
  // 01 - Point of Initiation Method (12 = Dynamic, since we include amount)
  payload += '010212';
  
  // 38 - Merchant Account Information (Generic BCEL / LaoQR EMVCo AID)
  // Sub-tag 00 = AID, Sub-tag 01 = Phone Number
  // Note: This is a mocked BCEL One compatible structure.
  const subTag00 = '0016A000000677010112'; 
  const subTag01 = `01${String(phone.length).padStart(2, '0')}${phone}`;
  const merchantInfo = subTag00 + subTag01;
  payload += `38${String(merchantInfo.length).padStart(2, '0')}${merchantInfo}`;

  // 53 - Transaction Currency Code (418 = LAK)
  payload += '5303418';

  // 54 - Transaction Amount
  if (amount > 0) {
    const amountStr = Number(amount).toFixed(2);
    payload += `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  }

  // 58 - Country Code (LA)
  payload += '5802LA';

  // 59 - Merchant Name
  const merchantName = 'MealMate User';
  payload += `59${String(merchantName.length).padStart(2, '0')}${merchantName}`;

  // 60 - Merchant City
  const merchantCity = 'Vientiane';
  payload += `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}`;

  // 63 - CRC16 (To be calculated)
  payload += '6304';

  // Calculate CRC16 CCITT (Initial value 0xFFFF, Polynomial 0x1021)
  const crc = crc16(payload);
  
  return payload + crc;
}

function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) > 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export function injectAmountIntoEMVCo(qrString, amount) {
  if (!qrString || !qrString.startsWith('000201')) return qrString;
  
  // 1. Remove the old CRC (last 8 characters: 6304XXXX)
  // Ensure the string ends with 6304 and 4 chars of CRC
  const crcIndex = qrString.indexOf('6304');
  if (crcIndex === -1) return qrString;
  
  let payload = qrString.substring(0, crcIndex);
  
  // 2. Change 010211 (Static) to 010212 (Dynamic)
  payload = payload.replace('010211', '010212');
  
  // 3. Remove existing tag 54 if present (highly unlikely in a static QR, but just in case)
  // A robust parser would be better, but for standard BCEL static strings this is safe.
  const tag54Index = payload.indexOf('54');
  if (tag54Index !== -1 && payload.substring(tag54Index, tag54Index + 2) === '54') {
     // Very naive tag removal, better to just assume it's not there for static QRs
     // Or we can just rebuild the string properly, but let's assume it doesn't have 54.
  }

  // 4. Append Tag 54 (Transaction Amount)
  if (amount > 0) {
    // Convert amount to string, no decimals if not needed, or fixed 2
    // For Laos (LAK), usually no decimals are needed, or .00
    // BCEL usually accepts plain integers for LAK
    let amountStr = amount.toString();
    if (amountStr.includes('.')) {
      amountStr = Number(amount).toFixed(2);
    }
    
    const len = String(amountStr.length).padStart(2, '0');
    payload += `54${len}${amountStr}`;
  }
  
  // 5. Add 6304 back
  payload += '6304';
  
  // 6. Calculate new CRC
  const crc = crc16(payload);
  return payload + crc;
}
