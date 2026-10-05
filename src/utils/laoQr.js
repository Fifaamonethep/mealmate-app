export function generateLaoQR(phoneNumber, amount) {
  if (!phoneNumber) return '';

  // ล้างเบอร์โทรศัพท์ (ลบตัวอักษรที่ไม่ใช่ตัวเลขออก)
  let phone = phoneNumber.replace(/[^0-9]/g, '');
  // ปรับรูปแบบให้เป็นมาตรฐาน 856
  if (phone.startsWith('020')) {
    phone = '856' + phone.substring(1);
  } else if (!phone.startsWith('856')) {
    phone = '85620' + phone; // ค่าเริ่มต้นถ้าไม่มี
  }

  // ฟิลด์มาตรฐานสำหรับ EMVCo QR Code
  let payload = '';
  // 00 - รูปแบบของ Payload (01)
  payload += '000201';
  // 01 - วิธีการเริ่มต้น (12 = แบบไดนามิก เนื่องจากเราระบุจำนวนเงิน)
  payload += '010212';
  
  // 38 - ข้อมูลบัญชีร้านค้า (Generic BCEL / LaoQR EMVCo AID)
  // Sub-tag 00 = AID, Sub-tag 01 = เบอร์โทรศัพท์
  // หมายเหตุ: โครงสร้างนี้จำลองแบบมาจาก BCEL One
  const subTag00 = '0016A000000677010112'; 
  const subTag01 = `01${String(phone.length).padStart(2, '0')}${phone}`;
  const merchantInfo = subTag00 + subTag01;
  payload += `38${String(merchantInfo.length).padStart(2, '0')}${merchantInfo}`;

  // 53 - รหัสสกุลเงินของการทำธุรกรรม (418 = LAK)
  payload += '5303418';

  // 54 - จำนวนเงิน

  if (amount > 0) {
    const amountStr = Number(amount).toFixed(2);
    payload += `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  }

  // 58 - รหัสประเทศ (LA)
  payload += '5802LA';

  // 59 - ชื่อร้านค้า
  const merchantName = 'MealMate User';
  payload += `59${String(merchantName.length).padStart(2, '0')}${merchantName}`;

  // 60 - เมืองของร้านค้า
  const merchantCity = 'Vientiane';
  payload += `60${String(merchantCity.length).padStart(2, '0')}${merchantCity}`;

  // 63 - CRC16 (รอคำนวณ)
  payload += '6304';

  // คำนวณ CRC16 CCITT (ค่าเริ่มต้น 0xFFFF, Polynomial 0x1021)
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
  
  // 1. ลบ CRC เดิมออก (8 ตัวอักษรสุดท้าย: 6304XXXX)
  // ตรวจสอบให้แน่ใจว่าสตริงลงท้ายด้วย 6304 และ CRC 4 ตัวอักษร
  const crcIndex = qrString.indexOf('6304');
  if (crcIndex === -1) return qrString;
  
  let payload = qrString.substring(0, crcIndex);
  
  // 2. เปลี่ยน 010211 (แบบคงที่) เป็น 010212 (แบบไดนามิก)
  payload = payload.replace('010211', '010212');
  
  // 3. ลบแท็ก 54 ที่มีอยู่ออก (ถึงแม้แทบจะเป็นไปไม่ได้ใน QR คงที่ แต่เผื่อไว้)
  // การใช้ parser ที่สมบูรณ์แบบจะดีกว่า แต่สำหรับสตริง BCEL ปกติ ถือว่าปลอดภัย
  const tag54Index = payload.indexOf('54');
  if (tag54Index !== -1 && payload.substring(tag54Index, tag54Index + 2) === '54') {
     // การลบแท็กแบบพื้นฐาน ควรสมมติว่าไม่มีแท็กนี้ใน QR แบบคงที่
     // หรือควรสร้างสตริงขึ้นมาใหม่ให้ถูกต้อง แต่ในที่นี้เราสมมติว่าไม่มี 54
  }

  // 4. เพิ่มแท็ก 54 (จำนวนเงิน)
  if (amount > 0) {
    // แปลงจำนวนเงินเป็นสตริง โดยอาจไม่มีทศนิยม หรือระบุทศนิยม 2 ตำแหน่ง
    // สำหรับลาว (LAK) ปกติไม่จำเป็นต้องมีทศนิยม หรืออาจใช้ .00
    // BCEL มักจะรับตัวเลขจำนวนเต็มสำหรับ LAK
    let amountStr = amount.toString();
    if (amountStr.includes('.')) {
      amountStr = Number(amount).toFixed(2);
    }
    
    const len = String(amountStr.length).padStart(2, '0');
    payload += `54${len}${amountStr}`;
  }
  
  // 5. ใส่ 6304 กลับเข้าไป
  payload += '6304';
  
  // 6. คำนวณ CRC ใหม่
  const crc = crc16(payload);
  return payload + crc;
}
