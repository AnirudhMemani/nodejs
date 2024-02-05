const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");

app.use(express.json());
app.use(cors());

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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
