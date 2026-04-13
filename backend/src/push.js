const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function sendPush(to, title, body, data) {
  if (!to) return { ok: false, reason: 'missing_token' };
  if (!Expo.isExpoPushToken(to)) return { ok: false, reason: 'invalid_token' };

  const messages = [
    {
      to,
      sound: 'default',
      title,
      body,
      data: data || {},
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    // eslint-disable-next-line no-await-in-loop
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return { ok: true, tickets };
}

module.exports = { sendPush };
