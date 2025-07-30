const { NodeSSH } = require('node-ssh');

class SSHService {
  async executeCommand(command) {
    const ssh = new NodeSSH();

    const connectionConfig = {
      host: '49.0.85.146',
      port: 822,
      username: 'linaro',
      password: 'linaro',
      timeout: 10000 // เพิ่ม timeout เป็น 10 วินาทีเผื่อการเชื่อมต่อช้า
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
  }
}

module.exports = new SSHService();