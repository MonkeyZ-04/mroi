const { NodeSSH } = require('node-ssh');

class SSHService {
  async executeCommand(command) {
    const ssh = new NodeSSH();

    const connectionConfig = {
      host: '192.168.1.100',
      username: 'linaro',
      password: 'test123', // เปลี่ยนจากการใช้ privateKeyPath มาใช้ password โดยตรง
      timeout: 5000
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