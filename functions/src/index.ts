import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ahmadalwakai76@gmail.com",
    pass: "wikmetfkdwkabead",
  },
});

export const sendOrderNotification = onDocumentCreated(
  {
    region: "europe-west1",
    document: "orders/{orderId}",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data in snapshot.");
      return;
    }

    const orderData = snap.data();

    const emailContent = `
🚨 New Order Received!

📦 Order Number: ${orderData.orderNumber}
👤 Customer: ${orderData.firstName} ${orderData.lastName}
📞 Phone: ${orderData.phoneNumber}
📧 Email: ${orderData.email}

🚚 Pickup Address: ${orderData.pickupAddress}
🏢 Pickup Floor: ${orderData.pickupFloor} | Lift: ${orderData.pickupLift ? "Yes" : "No"}

📍 Dropoff Address: ${orderData.dropoffAddress}
🏢 Dropoff Floor: ${orderData.dropoffFloor} | Lift: ${orderData.dropoffLift ? "Yes" : "No"}

🛠 Service Type: ${orderData.serviceType}
💰 Total Price: £${orderData.totalPrice}

📅 Pickup Date: ${orderData.pickupDateTime}

📝 Notes: ${orderData.pickupDriverNotes || "N/A"} / ${orderData.dropoffDriverNotes || "N/A"}

✅ Status: ${orderData.status}
`;

    await transporter.sendMail({
      from: "\"Speedy Van Orders\" <ahmadalwakai76@gmail.com>",
      to: "ahmadalwakai76@gmail.com",
      subject: `🚨 New Order Alert: ${orderData.orderNumber}`,
      text: emailContent,
    });

    console.log("✅ Email sent for order: " + orderData.orderNumber);
  }
);
