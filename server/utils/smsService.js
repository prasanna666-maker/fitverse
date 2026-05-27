// Utilizing modern Node's native built-in fetch API
const fetchFn = globalThis.fetch;

export const sendSMS = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`📱 [TWILIO SMS MOCK] To: ${to} | Body: ${body}`);
    return { success: true, mock: true };
  }

  try {
    const authString = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetchFn(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: body,
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log(`📱 SMS successfully sent to ${to} via Twilio! SID: ${data.sid}`);
      return { success: true, sid: data.sid };
    } else {
      console.error(`❌ Twilio SMS Error: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.error("❌ SMS sending exception:", err.message);
    return { success: false, error: err.message };
  }
};

export const sendWhatsApp = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Default Twilio Sandbox Number

  if (!accountSid || !authToken) {
    console.log(`💬 [TWILIO WHATSAPP MOCK] To: whatsapp:${to} | Body: ${body}`);
    return { success: true, mock: true };
  }

  try {
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;

    const authString = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetchFn(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: formattedFrom,
          Body: body,
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log(`💬 WhatsApp message sent to ${to} via Twilio! SID: ${data.sid}`);
      return { success: true, sid: data.sid };
    } else {
      console.error(`❌ Twilio WhatsApp Error: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (err) {
    console.error("❌ WhatsApp sending exception:", err.message);
    return { success: false, error: err.message };
  }
};
