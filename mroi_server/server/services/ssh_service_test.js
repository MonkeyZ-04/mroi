const { exec } = require('child_process');

class SSHService {
  executeCommand(command) {
    const password = 'YOUR_PLAIN_TEXT_PASSWORD'; 
    const remoteUser = 'something'; 

    const escapedCommand = command.replace(/"/g, '\\"');
    const fullCommand = `sshpass -p '${remoteUser}' ssh '${password}' ${escapedCommand}`;

    console.log(`Attempting to execute command...`);

    return new Promise((resolve, reject) => {
      exec(fullCommand, (error, stdout, stderr) => {
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