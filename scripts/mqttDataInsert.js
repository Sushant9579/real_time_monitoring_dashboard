import mqtt from "mqtt";
import pool from "../lib/db.js";
//import cron from "node-cron";

// MQTT setup
const brokerUrl = "mqtt://broker.hivemq.com";
const topic = "rtdashboardtopic";
//const mqttClient = mqtt.connect(brokerUrl);
const mqttClient = mqtt.connect(brokerUrl, {
  clientId: "rtdashboard_subscriber_" + Math.random().toString(16).substring(2, 8),
  clean: true,
});


mqttClient.on("connect", () => {
  //console.log(`Connected to MQTT broker: ${brokerUrl}`);
  mqttClient.subscribe(topic, (err) => {
    if (err) console.error("MQTT Subscription error:", err);
    else console.log(`Subscribed to topic: ${topic}`);
  });
});

mqttClient.on("error", (err) => {
  console.error("MQTT Connection Error:", err);
});

// Convert "17102025" → "17-10-2025"
function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  return `${dateStr.slice(0, 2)}-${dateStr.slice(2, 4)}-${dateStr.slice(4, 8)}`;
}

// Convert "142302" → "14:23:02"
function formatTime(timeStr) {
  if (!timeStr || timeStr.length !== 6) return timeStr;
  return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`;
}

// Store all incoming messages in memory
let dataBuffer = [];

// Handle incoming MQTT messages
mqttClient.on("message", (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const formattedDate = formatDate(payload.date);
    const formattedTime = formatTime(payload.time);

    const record = {
      machine: payload.P1,
      motor_temperature: Number(payload.P2),
      vibration: Number(payload.P3),
      speed: Number(payload.P4),
      bearing_temperature: Number(payload.P5),
      load_current: Number(payload.P6),
      power_consumption: Number(payload.P7),
      oil_pressure: Number(payload.P8),
      datetime: `${formattedDate} ${formattedTime}`,
    };

    dataBuffer.push(record);
   // console.log(`Received data from ${record.machine} at ${record.datetime}`);
  } catch (err) {
    console.error("Error parsing MQTT message:", err);
  }
});

setInterval(async () => {
  if (dataBuffer.length === 0) {
    console.log("No new MQTT data to insert this cycle.");
    return;
  }

  const latestRecord = dataBuffer[dataBuffer.length - 1];
 // console.log(`Inserting latest record: ${latestRecord.machine} at ${latestRecord.datetime}`);

  try {
    await pool.query(
      `INSERT INTO Machine_Data 
      (machine, motor_temperature, vibration, speed, bearing_temperature, load_current, power_consumption, oil_pressure, datetime)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        latestRecord.machine,
        latestRecord.motor_temperature,
        latestRecord.vibration,
        latestRecord.speed,
        latestRecord.bearing_temperature,
        latestRecord.load_current,
        latestRecord.power_consumption,
        latestRecord.oil_pressure,
        latestRecord.datetime,
      ]
    );

    //console.log(`Inserted latest record for ${latestRecord.machine}`);
  } catch (err) {
    console.error("Error inserting latest MQTT data:", err);
  } finally {
    dataBuffer = []; // Clear buffer
  }
}, 5 * 60 * 1000); // every 5 min
