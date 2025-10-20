import dotenv from "dotenv";
import mqtt from "mqtt";
import nodemailer from "nodemailer";
import pool from "../lib/db.js"; // PostgreSQL connection pool

dotenv.config();

// ---------- MQTT Setup ----------
const brokerUrl = "mqtt://broker.hivemq.com";
const topic = "rtdashboardtopic";
const mqttClient = mqtt.connect(brokerUrl);

mqttClient.on("connect", () => {
 // console.log("Connected to MQTT broker");
  mqttClient.subscribe(topic);
});

// ---------- Alarm Thresholds ----------
const limits = {
  P2: { low: 40, high: 90, name: "Motor Temperature" },
  P3: { low: 0.5, high: 5, name: "Vibration" },
  P4: { low: 950, high: 1500, name: "Speed" },
  P5: { low: 35, high: 85, name: "Bearing Temperature" },
  P6: { low: 5, high: 30, name: "Load Current" },
  P7: { low: 10, high: 50, name: "Power Consumption" },
  P8: { low: 2, high: 6, name: "Oil Pressure" },
};

// ---------- Email Setup ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------- Helper Functions ----------
async function sendEmail(alarmName, machine, creationDate) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: `⚠️ Alarm Triggered: ${alarmName}`,
    text: `Alert for ${machine}:\n${alarmName}\n\nTime: ${creationDate}`,
  };

  await transporter.sendMail(mailOptions);
  //console.log(`Email sent for ${alarmName} - ${machine}`);
}

async function insertAlarm(alarmName, machine, creationDate) {
  await pool.query(
    `INSERT INTO Alarm (alarm_name, machine, creation_date)
     VALUES ($1, $2, $3)`,
    [alarmName, machine, creationDate]
  );
 // console.log(`Alarm inserted: ${alarmName} for ${machine}`);
}

// ---------- Email Cooldown (15 min) ----------
const lastEmailSent = {}; // e.g. { "Machine1_P2": timestamp }

// ---------- MQTT Message Handler ----------
mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // Parse and format MQTT date/time
    const mqttDate = data.date; // e.g., "20102025"
    const mqttTime = data.time; // e.g., "170100"

    const formattedDate = `${mqttDate.slice(0, 2)}-${mqttDate.slice(2, 4)}-${mqttDate.slice(4)}`;
    const formattedTime = `${mqttTime.slice(0, 2)}:${mqttTime.slice(2, 4)}:${mqttTime.slice(4)}`;
    const creationDate = `${formattedDate} ${formattedTime}`;

    const machine = data.P1; // Machine name or ID
    const now = Date.now();

    // Loop through each parameter
    for (const key of Object.keys(limits)) {
      const value = parseFloat(data[key]);
      const { low, high, name } = limits[key];

      if (isNaN(value)) continue;

      // Check limits
      if (value < low || value > high) {
        const alarmName = `${name} is ${value < low ? "below" : "above"} limit (${value})`;
        const uniqueKey = `${machine}_${key}`;

        // Send email only once every 15 minutes for same alarm
        if (!lastEmailSent[uniqueKey] || now - lastEmailSent[uniqueKey] > 900000) {
          lastEmailSent[uniqueKey] = now;

          await sendEmail(alarmName, machine, creationDate);
          await insertAlarm(alarmName, machine, creationDate);
        }
      }
    }

    //console.log(` Processed data for ${machine} at ${creationDate}`);
  } catch (err) {
    console.error(" Error processing MQTT data:", err);
  }
});
