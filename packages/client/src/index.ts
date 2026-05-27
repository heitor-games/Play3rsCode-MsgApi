import { io } from 'socket.io-client';
import * as readline from 'readline';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const TOKEN = process.env.JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NTJlZjgxMy1hZGQ4LTRlMDgtYmI0OC05NGNkYjNmNzlkNjMiLCJ1c2VybmFtZSI6ImFsaWNlIiwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSIsImlhdCI6MTc3OTkwMzM1OSwiZXhwIjoxNzgyNDk1MzU5fQ.geDYSANSYZXjwZtx6VE8Vk__cI3gpXn2NEWygxMDp7Q';

if (!TOKEN) {
  console.error('Set JWT_TOKEN env variable first. Run: npm run dev -w @chat/server, then login via POST /auth/login');
  process.exit(1);
}

const socket = io(SERVER_URL, {
  auth: { token: TOKEN },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentChannel: string | null = null;
let currentRecipient: string | null = null;

socket.on('connect', () => {
  console.log(`\n✓ Connected as socket ${socket.id}`);
  console.log('Commands:');
  console.log('  /dm <userId> <message>  - Send DM');
  console.log('  /channel <channelId>     - Switch to channel');
  console.log('  /send <message>          - Send to current channel');
  console.log('  /create <name>           - Create channel');
  console.log('  /join <channelId>        - Join channel');
  console.log('  /leave                   - Leave current channel');
  console.log('  /quit                    - Exit\n');
  prompt();
});

socket.on('disconnect', (reason) => {
  console.log(`\n✗ Disconnected: ${reason}`);
});

socket.on('message:new', (data) => {
  const { message, sender } = data;
  const prefix = message.channelId ? `[channel:${message.channelId}]` : '[DM]';
  console.log(`\n${prefix} ${sender.username}: ${message.content}`);
  prompt();
});

socket.on('message:ack', (data) => {
  console.log(`\n✓ Message sent (id: ${data.messageId})`);
  prompt();
});

socket.on('channel:created', (data) => {
  console.log(`\n✓ Channel created: ${data.channel.name} (${data.channel.id})`);
  prompt();
});

socket.on('channel:member_joined', (data) => {
  console.log(`\n→ ${data.user.username} joined channel ${data.channelId}`);
  prompt();
});

socket.on('channel:member_left', (data) => {
  console.log(`\n← User ${data.userId} left channel ${data.channelId}`);
  prompt();
});

socket.on('user:online', (data) => {
  console.log(`\n● User ${data.userId} is online`);
  prompt();
});

socket.on('user:offline', (data) => {
  console.log(`\n○ User ${data.userId} is offline`);
  prompt();
});

socket.on('typing:indicator', (data) => {
  const status = data.isTyping ? 'typing...' : 'stopped typing';
  console.log(`\n✎ ${data.userId} ${status}`);
  prompt();
});

socket.on('error', (data) => {
  console.error(`\n✗ Error [${data.code}]: ${data.message}`);
  prompt();
});

function prompt() {
  rl.question('> ', (input) => {
    const trimmed = input.trim();
    if (!trimmed) return prompt();

    if (trimmed.startsWith('/dm ')) {
      const parts = trimmed.slice(4).split(' ');
      const recipientId = parts[0];
      const message = parts.slice(1).join(' ');
      if (recipientId && message) {
        socket.emit('message:send', { content: message, recipientId });
        console.log(`(DM to ${recipientId})`);
      } else {
        console.log('Usage: /dm <userId> <message>');
      }
    } else if (trimmed.startsWith('/channel ')) {
      currentChannel = trimmed.slice(9).trim();
      console.log(`Switched to channel: ${currentChannel}`);
    } else if (trimmed.startsWith('/send ')) {
      const message = trimmed.slice(6);
      if (currentChannel) {
        socket.emit('message:send', { content: message, channelId: currentChannel });
        console.log(`(sent to channel ${currentChannel})`);
      } else {
        console.log('No channel selected. Use /channel <channelId> first.');
      }
    } else if (trimmed.startsWith('/create ')) {
      const name = trimmed.slice(8).trim();
      socket.emit('channel:create', { name, isPublic: true });
    } else if (trimmed.startsWith('/join ')) {
      const channelId = trimmed.slice(6).trim();
      socket.emit('channel:join', { channelId });
    } else if (trimmed === '/leave' && currentChannel) {
      socket.emit('channel:leave', { channelId: currentChannel });
      currentChannel = null;
    } else if (trimmed === '/quit') {
      socket.disconnect();
      rl.close();
      process.exit(0);
    } else {
      // Default: send to current channel or DM
      if (currentChannel) {
        socket.emit('message:send', { content: trimmed, channelId: currentChannel });
      } else if (currentRecipient) {
        socket.emit('message:send', { content: trimmed, recipientId: currentRecipient });
      } else {
        console.log('Use /channel, /dm, or /send to specify a target.');
      }
    }

    prompt();
  });
}

process.on('SIGINT', () => {
  socket.disconnect();
  rl.close();
  process.exit(0);
});
