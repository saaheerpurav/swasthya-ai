'use strict';

/**
 * Voice service — Amazon Transcribe (STT) + Amazon Polly (TTS).
 * Stubs return mock data when AWS credentials are not configured.
 */

const path = require('path');
const { mapToTranscribeCode, mapToPollyVoice, mapToPollyCode } = require('../utils/language');

const AWS_CONFIGURED =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.TRANSCRIBE_REGION;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const detectMediaFormat = (filePath) => {
  const ext = path.extname(filePath || '').toLowerCase().slice(1);
  const map = { mp3: 'mp3', mp4: 'mp4', wav: 'wav', flac: 'flac', ogg: 'ogg', webm: 'webm', m4a: 'mp4', amr: 'amr' };
  return map[ext] || 'mp4';
};

/**
 * Upload a buffer or local file to S3 and return the s3:// URI.
 */
const uploadToS3 = async (input, filename) => {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const { v4: uuidv4 } = require('uuid');
  const fs = require('fs');

  const s3 = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });
  const bucket = process.env.S3_USERDATA_BUCKET;
  const key = `voice-input/${uuidv4()}-${filename || 'audio.mp4'}`;

  const body = Buffer.isBuffer(input) ? input : fs.readFileSync(input);

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: 'audio/mpeg',
  }));

  return `s3://${bucket}/${key}`;
};

// ─── Transcribe ───────────────────────────────────────────────────────────────

/**
 * Transcribe audio → text using Amazon Transcribe.
 * @param {Buffer|string} audioInput - Buffer, S3 URI (s3://...), or local file path
 * @param {string} language - 'en'|'hi'|'kn'|'te'
 * @param {string} [filename] - original filename (used for format detection)
 */
const transcribeAudio = async (audioInput, language = 'en', filename = 'audio.mp4') => {
  if (!AWS_CONFIGURED) {
    console.log('[voiceService] Transcribe stub — AWS not configured');
    return {
      transcript: 'What are the symptoms of dengue fever?',
      detectedLanguage: language,
      confidence: 0.95,
    };
  }

  const {
    TranscribeClient,
    StartTranscriptionJobCommand,
    GetTranscriptionJobCommand,
    DeleteTranscriptionJobCommand,
  } = require('@aws-sdk/client-transcribe');

  const client = new TranscribeClient({ region: process.env.TRANSCRIBE_REGION });

  // Upload local buffer/file to S3 if not already an S3 URI
  let mediaUri = audioInput;
  if (typeof audioInput !== 'string' || !audioInput.startsWith('s3://')) {
    mediaUri = await uploadToS3(audioInput, filename);
  }

  const jobName = `swasthya-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const mediaFormat = detectMediaFormat(filename);
  const languageCode = mapToTranscribeCode(language);

  await client.send(new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: languageCode,
    MediaFormat: mediaFormat,
    Media: { MediaFileUri: mediaUri },
    Settings: { ShowSpeakerLabels: false },
  }));

  // Poll with backoff (Transcribe jobs typically take 20-60s)
  const maxWaitMs = 120000;
  const pollIntervals = [3000, 5000, 5000, 5000, 10000, 10000, 10000, 10000, 10000, 10000];
  let waited = 0;
  let pollIdx = 0;

  while (waited < maxWaitMs) {
    const interval = pollIntervals[Math.min(pollIdx++, pollIntervals.length - 1)];
    await sleep(interval);
    waited += interval;

    const { TranscriptionJob: job } = await client.send(
      new GetTranscriptionJobCommand({ TranscriptionJobName: jobName }),
    );

    if (job.TranscriptionJobStatus === 'COMPLETED') {
      // Clean up job (fire-and-forget)
      client.send(new DeleteTranscriptionJobCommand({ TranscriptionJobName: jobName })).catch(() => {});

      const resp = await fetch(job.Transcript.TranscriptFileUri);
      const data = await resp.json();
      const transcript = data.results?.transcripts?.[0]?.transcript || '';
      const confidence =
        parseFloat(data.results?.items?.[0]?.alternatives?.[0]?.confidence) || 0.9;

      return { transcript, detectedLanguage: language, confidence };
    }

    if (job.TranscriptionJobStatus === 'FAILED') {
      throw new Error(`Transcription failed: ${job.FailureReason}`);
    }
  }

  throw new Error('Transcription timeout after 120s');
};

// ─── Polly (TTS) ─────────────────────────────────────────────────────────────

/**
 * Synthesize text → audio via Amazon Polly, upload to S3, return signed URL.
 * @param {string} text
 * @param {string} language - 'en'|'hi'|'kn'|'te'
 */
const synthesizeSpeech = async (text, language = 'en') => {
  if (!AWS_CONFIGURED) {
    console.log('[voiceService] Polly stub — AWS not configured');
    return {
      audioUrl: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
      durationSeconds: 5,
      format: 'mp3',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
  const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
  const { v4: uuidv4 } = require('uuid');

  const polly = new PollyClient({ region: process.env.POLLY_REGION || 'us-east-1' });
  const s3 = new S3Client({ region: process.env.S3_REGION || 'us-east-1' });

  const voiceId = mapToPollyVoice(language);
  const languageCode = mapToPollyCode(language);

  // Polly max 3000 chars per request
  const truncated = text.slice(0, 2900);

  const { AudioStream } = await polly.send(new SynthesizeSpeechCommand({
    Text: truncated,
    OutputFormat: 'mp3',
    VoiceId: voiceId,
    LanguageCode: languageCode,
    Engine: 'standard',
  }));

  const bucket = process.env.S3_USERDATA_BUCKET;
  const key = `audio-output/${uuidv4()}.mp3`;
  const audioBuffer = Buffer.from(await AudioStream.transformToByteArray());

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
  }));

  const audioUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 },
  );

  return {
    audioUrl,
    durationSeconds: Math.max(1, Math.round(truncated.length / 15)),
    format: 'mp3',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
};

module.exports = { transcribeAudio, synthesizeSpeech };
