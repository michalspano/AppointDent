import fkill from 'fkill';
import * as yargs from 'yargs';

// Configure command-line arguments
// Assumes that `--port` is given
const argv = yargs
  .usage('Usage: $0 --port [port]')
  .demandOption(['port'])
  .argv;

// Get the port from command-line arguments
const port: number = (argv as { port: number }).port;

// Function to kill the process using the specified port
const killProcess = async (port: number): Promise<void> => {
  try {
    // Find and kill the process using the specified port
    await fkill(`:${port}`);
    console.log(`Process using port ${port} terminated successfully.`);
  } catch (error: any) {
    console.error(`Error terminating process on port ${port}: ${error.message}`);
  }
};

// Call the function to kill the process
void killProcess(port);
