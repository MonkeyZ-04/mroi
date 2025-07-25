// **คำเตือน:** คุณต้องติดตั้ง Library เพิ่มเติมโดยใช้คำสั่ง: npm install node-ssh
const { NodeSSH } = require('node-ssh');

class SSHService {
  async executeCommand(command) {
    
    // --- **ส่วนสำหรับการทดสอบ** ---
    console.log('--- SSH SERVICE TEST MODE ---');
    console.log(`[SUCCESS] Function was called correctly.`);
    console.log(`[INFO] The following command would be executed on production:`);
    console.log(`---> ${command}`);
    console.log('---------------------------');
    
    // คืนค่าว่าทำงานสำเร็จ เพื่อให้ Controller ทำงานต่อได้
    return Promise.resolve({ success: true, stdout: 'Simulated success' });
    // --- จบส่วนสำหรับการทดสอบ ---


    /*
    // --- โค้ดสำหรับใช้งานจริง (ปิดไว้ชั่วคราว) ---
    const ssh = new NodeSSH();
    
    const connectionConfig = {
      host: '',
      username: '',
      privateKeyPath: '/path/to/your/private/key'
    };

    console.log(`Attempting to execute on ${connectionConfig.host}: "${command}"`);

    try {
      await ssh.connect(connectionConfig);
      const result = await ssh.execCommand(command);

      console.log('STDOUT: ' + result.stdout);
      if (result.stderr && result.code !== 0) {
        console.error('STDERR: ' + result.stderr);
        throw new Error(result.stderr);
      }
      return { success: true, stdout: result.stdout, stderr: result.stderr };
    } catch (error) {
      console.error('SSH Execution Error:', error);
      throw error;
    } finally {
      if (ssh.isConnected()) {
        ssh.dispose();
      }
    }
    // --- จบโค้ดสำหรับใช้งานจริง ---
    */
  }
}

module.exports = new SSHService();