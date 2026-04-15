import { AgentManager, Message } from './AgentManager.js';

async function runTest() {
  const manager = new AgentManager();
  
  const messages: Message[] = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello! Please reply with exactly "Test Successful".' }
  ];

  console.log('--- Starting Agent Manager Test ---');
  try {
    const response = await manager.chat(messages);
    console.log('\n--- Final Response ---');
    console.log(response);
  } catch (error) {
    console.error('\n--- Test Failed ---');
    console.error(error);
  }
}

runTest();
