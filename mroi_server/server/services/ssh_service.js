const { exec } = require('child_process');
const { time } = require('console');

class SSHService {
  executeCommand(command) {
    const password = 'test123'; 
    const user = 'linaro'; 
    const host = '192.168.1.100';

    const escapedCommand = command.replace(/"/g, '\\"');
    const fullCommand = `sshpass -p '${password}' ssh ${user}@${host} "${escapedCommand}"`;
    const options = {timeout: 5000};

    console.log(`Attempting to execute command...`);

    return new Promise((resolve, reject) => {
      exec(fullCommand, options, (error, stdout, stderr) => {
        if (error) {
          console.error(`Execution Error: ${error.message}`);
          return reject(new Error(error.message));
        }
        if (stderr) {
          console.error(`STDERR: ${stderr}`);
        }
        console.log(`STDOUT: ${stdout}`);
        resolve({ success: true, stdout, stderr });
      });
    });
  }
}

module.exports = new SSHService();