require("dotenv").config();
require("./connect-db");
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { IamAuthenticator } = require('ibm-watson/auth');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const Transcription = require('./models/Transcription');

let totalFiles = 0;
let closedFiles = 0;

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.SPEECH_TO_TEXT_IAM_APIKEY,
  }),
  serviceUrl: process.env.SPEECH_TO_TEXT_URL,
});

const params = {
  objectMode: true,
  contentType: 'audio/mp3',
  model: 'es-ES_BroadbandModel', // es-ES_NarrowbandModel
  keywords: ['reina', 'museo', 'arte'],
  keywordsThreshold: 0.5,
  timestamps: true,
  inactivityTimeout: -1 // The time in seconds after which, if only silence (no speech) is detected in the audio, the connection is closed.
};

fs.readdir('./audio/', async (err, files) => {
  const savedFiles = await Transcription.find({});
  const filesToRecognize = files.filter(file => path.extname(file) === '.mp3' && !savedFiles.some(f => f.file === file));
  totalFiles = filesToRecognize.length;

  filesToRecognize.forEach(file => {
    // Create the stream.
    const recognizeStream = speechToText.recognizeUsingWebSocket(params);

    // Pipe in the audio.
    fs.createReadStream(`./audio/${file}`).pipe(recognizeStream);

    // Listen for events.
    recognizeStream.on('data', function(event) { onEvent('Data', event, file); saveData(file, event); });
    recognizeStream.on('error', function(event) { onEvent('Error', event, file); });
    recognizeStream.on('close', function(event) { onEvent('Close', event, file); });
  });
});

// Display events on the console.
function onEvent(name, event, file) {
  console.log(name, file);

  if (name !== 'Close') {
    const dir = name === 'Error' ? './errors' : './done';
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir);
      } catch (err) {
        console.error(`Error while creating ${dir}.`);
      }
    }

    fs.renameSync(`audio/${file}`, `${dir}/${file}`);
    if (name === 'Error') {
      fs.writeFileSync(`${dir}/${file.replace('.mp3', '.json')}`, JSON.stringify(event, null, 2));
    }
  } else {
    closedFiles++;
    console.log(`✨ ${closedFiles}/${totalFiles}`);

    if (closedFiles === totalFiles) {
      console.log('Disconnect');
      mongoose.disconnect();
    }
  }
};

async function saveData(file, event) {
  let transcription = [];

  event.results.forEach(result => {
    result.alternatives.forEach(alternative => {
      if (alternative.timestamps && alternative.timestamps.length)
        transcription = transcription.concat(alternative.timestamps.map(time => ({
          word: time[0],
          start: time[1],
          end: time[2],
        })));
    });
  });

  const newTranscription = new Transcription({
    file,
    transcription
  });

  await newTranscription.save();
  console.log('Saved', file);
}