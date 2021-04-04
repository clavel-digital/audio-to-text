# audio-to-text (WIP)

Node script that uses IBM Watson Speech to Text API to transcribe audio files.

- The **audio files** must be in the `audio` folder in the root of this project.
- The **output** of this script will be generated in a Mongo database.

To get the transcription of the selected audio files, the next script must be run:

```
node index.js
```

For each audio, it will generate a Mongo document with the attributes:

- `file`, the name of the audio file. 
- `transcription`, an array of objects with the properties word (the transcribed word), start and end (when the word started in the audio file and when it ended).

## Requirements

The following environment variables must be defined:

- `SPEECH_TO_TEXT_IAM_APIKEY` https://cloud.ibm.com/apidocs/speech-to-text?code=node#authentication
- `SPEECH_TO_TEXT_URL` https://cloud.ibm.com/apidocs/speech-to-text?code=node#authentication
- `MONGODB_URI` MongoDB Connection String URI

## Useful documentation and examples

- https://cloud.ibm.com/apidocs/speech-to-text?code=node#introduction
- https://github.com/watson-developer-cloud/speech-to-text-nodejs
- https://github.com/watson-developer-cloud/node-sdk
