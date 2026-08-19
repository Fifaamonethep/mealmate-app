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
