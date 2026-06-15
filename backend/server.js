const express = require("express");
const multer = require("multer");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const Jimp = require("jimp");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------- STORAGE ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* ---------- TEMP STORAGE ---------- */
let storedEmail = "";
let generatedOTP = "";

/* ---------- EMAIL ---------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vishnusaigampa07@gmail.com",
    pass: "dboj kgpi unqf siar", // ⚠️ change this
  },
});

/* ---------- ENCODE ---------- */
app.post("/encode", upload.single("image"), async (req, res) => {
  try {
    const { message, email } = req.body;

    if (!req.file) return res.json({ message: "Upload failed" });

    storedEmail = email;

    let image = await Jimp.read(req.file.path);

    // ✅ STRONG END MARKER
    const endMarker = "1111111111111110";

    let binaryMessage =
      message
        .split("")
        .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("") + endMarker;

    let dataIndex = 0;

    for (let y = 0; y < image.bitmap.height; y++) {
      for (let x = 0; x < image.bitmap.width; x++) {
        let idx = (y * image.bitmap.width + x) * 4;

        if (dataIndex < binaryMessage.length) {
          let bit = parseInt(binaryMessage[dataIndex]);

          image.bitmap.data[idx] =
            (image.bitmap.data[idx] & 254) | bit;

          dataIndex++;
        }
      }
    }

    console.log("Encoded bits:", dataIndex);

    // ✅ SAVE AS PNG (IMPORTANT)
    const outputPath = "uploads/encoded.png";
    await image.writeAsync(outputPath);

    /* SEND EMAIL */
    await transporter.sendMail({
      from: "vishnusaigampa07@gmail.com",
      to: email,
      subject: "Encoded Image",
      text: "Hidden message inside image",
      attachments: [
        {
          filename: "encoded.png",
          path: outputPath,
        },
      ],
    });

    res.json({ message: "Encoded & sent successfully" });

  } catch (err) {
    console.log(err);
    res.json({ message: "Encoding failed" });
  }
});

/* ---------- SEND OTP ---------- */
app.post("/sendOTP", (req, res) => {
  const { email } = req.body;

  if (email !== storedEmail)
    return res.json({ message: "Wrong email" });

  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

  transporter.sendMail({
    from: "vishnusaigampa07@gmail.com",
    to: email,
    subject: "OTP",
    text: `OTP: ${generatedOTP}`,
  });

  res.json({ message: "OTP sent" });
});

/* ---------- DECODE ---------- */
app.post("/decode", upload.single("image"), async (req, res) => {
  try {
    const { otp } = req.body;

    if (otp !== generatedOTP)
      return res.json({ status: "fail", message: "Invalid OTP" });

    let image = await Jimp.read(req.file.path);

    let binaryData = "";

    for (let y = 0; y < image.bitmap.height; y++) {
      for (let x = 0; x < image.bitmap.width; x++) {
        let idx = (y * image.bitmap.width + x) * 4;

        let red = image.bitmap.data[idx];
        binaryData += (red & 1);
      }
    }

    const endMarker = "1111111111111110";
    const endIndex = binaryData.indexOf(endMarker);

    if (endIndex === -1)
      return res.json({ message: "No hidden message found" });

    let messageBits = binaryData.substring(0, endIndex);

    let message = "";

    for (let i = 0; i < messageBits.length; i += 8) {
      let byte = messageBits.substring(i, i + 8);
      message += String.fromCharCode(parseInt(byte, 2));
    }

    res.json({ status: "success", message });

  } catch (err) {
    console.log(err);
    res.json({ status: "fail", message: "Decode error" });
  }
});

/* ---------- FRONTEND ---------- */
app.use(express.static(path.join(__dirname, "../frontend")));

app.listen(3000, () => {
  console.log("Server running http://localhost:3000");
});