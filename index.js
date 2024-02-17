const express = require("express");
const app = express();
app.set("trust proxy", 1);
const axios = require("axios");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const bodyParser = require("body-parser");
const { rateLimit } = require("express-rate-limit");

app.use(cors());
app.use(express());
app.use(bodyParser.json());

const apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day window
  max: 2, // Limit each IP to 2 requests per window
  message: "Too many requests from this IP, please try again tomorrow",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    // Optional: Customize blocked response
    return res.status(429).json({
      error: "You've exceeded the rate limit. Please try again later.",
    });
  },
});

const port = process.env.PORT || 3000;

const voices = [
  {
    id: 1,
    model: "Charlotte (F)",
    name: "en-GB-Wavenet-A",
  },
  {
    id: 2,
    model: "John (M)",
    name: "en-GB-Wavenet-B",
  },
  {
    id: 3,
    model: "Rebecca (F)",
    name: "en-GB-Wavenet-C",
  },
  {
    id: 4,
    model: "Robert (M)",
    name: "en-GB-Wavenet-D",
  },
  {
    id: 5,
    model: "Louise (F)",
    name: "en-GB-Wavenet-F",
  },
];

app.post("/audio-stream", async (req, res) => {
  const text = req.body.text;
  const voiceId = req.body.voiceId;
  const voiceModel = voices.filter((voice) => voice.id === voiceId);
  try {
    const apiUrl =
      "https://ivcqahposk.execute-api.eu-central-1.amazonaws.com/prod/audio";

    const headers = {
      authority: "ivcqahposk.execute-api.eu-central-1.amazonaws.com",
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json;charset=UTF-8",
      origin: "https://vog.voicebooking.com",
      referer: "https://vog.voicebooking.com/",
      "sec-ch-ua":
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    };

    const requestBody = {
      input: {
        ssml: "<speak>" + text + "</speak>",
      },
      voice: {
        languageCode: "en-GB",
        name: voiceModel[0].name,
        ssmlGender: voiceModel[0].model,
      },
      audioConfig: {},
    };

    const response = await axios.post(apiUrl, requestBody, { headers });

    res.status(response.status).send(response.data.audioURL);
  } catch (error) {
    console.error("Error making API call:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/portfolio-mail", apiLimiter, async (req, res) => {
  const fullName = req.body.fullName || "Not Given";
  const email = req.body.email || "Not Given";
  const subject = req.body.subject || "Recieved from Portfolio website";
  const number = req.body.number || "Not Given";
  const message = req.body.message || "Not Given";

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    let mailOptions = {
      from: process.env.EMAIL,
      to: "whyisntitallowedcomeonman@gmail.com",
      subject: subject,
      text: `Full Name: ${fullName}\nEmail: ${email}\nNumber: ${number}\n\nMessage: ${message}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).json({
          msg: "Error sending mail",
        });
      } else {
        res.status(200).json({
          msg: "Mail sent Successfully",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

app.get("/ip", (request, response) => response.send(request.ip));

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
