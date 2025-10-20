import mqtt from "mqtt";

//  MQTT setup
const brokerUrl = "mqtt://broker.hivemq.com"; // Public broker (or replace with your local one)
const topic = "rtdashboardtopic";
const mqttClient = mqtt.connect(brokerUrl);

mqttClient.on("connect", () => {
  console.log(" Connected to MQTT broker:", brokerUrl);
});

mqttClient.on("error", (err) => {
  console.error(" MQTT Connection Error:", err);
});

// Generate random double value
function randomDouble(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Assign machine based on hour
function getMachineByHour(hour) {
  if (hour >= 0 && hour < 8) return "Machine 1";
  if (hour >= 8 && hour < 16) return "Machine 2";
  return "Machine 3";
}

// Format date to DD-MM-YYYY HH:mm:ss
function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${dd}${mm}${yyyy} ${hh}${min}${ss}`;
}

// Function to  publish
async function insertAndPublishData() {
  try {
    const date = new Date();
    const machine = getMachineByHour(date.getHours());
    const dtFormatted = formatDate(date);
    const Mqttdate = dtFormatted.split(' ')[0]
    const Mqtttime = dtFormatted.split(' ')[1]
    const data = {
      P1:machine,
      P2: randomDouble(20, 100),//motor_temperature
      P3: randomDouble(0.05, 10),//vibration
      P4: randomDouble(100, 2000),//speed
      P5: randomDouble(20, 90),//bearing_temperature
      P6: randomDouble(1, 100),//load_current
      P7: randomDouble(1, 80),//power_consumption
      P8: randomDouble(0.001, 10),//oil_pressure
      date: Mqttdate,
      time: Mqtttime,
    };

    // Publish to MQTT topic
    mqttClient.publish(topic, JSON.stringify(data));
    //console.log(`Sent to MQTT topic "${topic}" at ${dtFormatted}`);

  } catch (err) {
    console.error("Error publishing data:", err);
  }
}

// Send data every 1 second
setInterval(insertAndPublishData, 4000);

// import pool from '../lib/db.js';
// import cron from 'node-cron';

// // Generate random double value
// function randomDouble(min, max) {
//   return Number((Math.random() * (max - min) + min).toFixed(2));
// }

// // Assign machine based on hour
// function getMachineByHour(hour) {
//   if (hour >= 0 && hour < 8) return 'Machine 1';
//   if (hour >= 8 && hour < 16) return 'Machine 2';
//   return 'Machine 3';
// }

// // Format date to dd-mm-yyyy hh:mm:ss
// function formatDate(date) {
//   const dd = String(date.getDate()).padStart(2, '0');
//   const mm = String(date.getMonth() + 1).padStart(2, '0');
//   const yyyy = date.getFullYear();
//   const hh = String(date.getHours()).padStart(2, '0');
//   const min = String(date.getMinutes()).padStart(2, '0');
//   const ss = String(date.getSeconds()).padStart(2, '0');
//   return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
// }

// async function insertRandomData() {
//   try {
//     const date = new Date();
//     const machine = getMachineByHour(date.getHours());
//     const dtFormatted = formatDate(date);

//     await pool.query(
//       `INSERT INTO Machine_Data
//       (machine, motor_temperature, vibration, speed, bearing_temperature, load_current, power_consumption, oil_pressure, datetime)
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
//       [
//         machine,
//         randomDouble(20, 100),
//         randomDouble(0.05, 10),
//         randomDouble(100, 2000),
//         randomDouble(20, 90),
//         randomDouble(1, 100),
//         randomDouble(1, 80),
//         randomDouble(0.001, 10),
//         dtFormatted,
//       ]
//     );

//     console.log(`Data inserted at ${dtFormatted} for ${machine}`);
//   } catch (err) {
//     console.error('Error inserting data:', err);
//   }
// }

// // Schedule every 5 minutes
// cron.schedule('*/5 * * * *', () => {
//   insertRandomData();
//   console.log('Scheduler ran at', new Date().toLocaleTimeString());
// });

// // Run immediately on start
// insertRandomData();