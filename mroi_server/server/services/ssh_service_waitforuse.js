// **คำเตือน:** การใช้ sshpass เป็นวิธีที่ไม่ปลอดภัยอย่างยิ่ง!
// รหัสผ่านจะถูกเก็บเป็น Plain Text และอาจรั่วไหลได้ง่าย

const { exec } = require('child_process');

class SSHService {
  executeCommand(command) {
    // **สำคัญมาก:** แก้ไขข้อมูลการเชื่อมต่อและรหัสผ่านให้ถูกต้อง
    // แนะนำอย่างยิ่งให้เก็บข้อมูลเหล่านี้ในไฟล์ .env เพื่อความปลอดภัย
    const password = 'YOUR_PLAIN_TEXT_PASSWORD'; // <-- **ใส่รหัสผ่านของคุณที่นี่**

    // สร้างคำสั่ง sshpass โดย escape เครื่องหมาย " ใน command เดิม
    const escapedCommand = command.replace(/"/g, '\\"');
    const fullCommand = `sshpass -p '${password}' ${escapedCommand}`;

    console.log(`Attempting to execute command...`);

    // เราใช้ Promise เพื่อให้ Controller รอการทำงานของคำสั่งนี้จนเสร็จ
    return new Promise((resolve, reject) => {
      exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Execution Error: ${error.message}`);
          // ถ้ามี error ให้ reject Promise
          return reject(new Error(error.message));
        }
        if (stderr) {
          console.error(`STDERR: ${stderr}`);
          // ถ้ามี stderr แต่คำสั่งยังรันได้ (เช่น warning) ให้ทำงานต่อ แต่บันทึก log ไว้
        }
        console.log(`STDOUT: ${stdout}`);
        // ถ้าสำเร็จ ให้ resolve Promise
        resolve({ success: true, stdout, stderr });
      });
    });
  }
}

module.exports = new SSHService();