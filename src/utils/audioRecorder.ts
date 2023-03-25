export const AudioRecorder = {
  recorder: undefined as unknown as MediaRecorder,
  stream: undefined as unknown as MediaStream,
  audioChunks: [] as Array<Blob>,

  init: async function () {
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.recorder = new MediaRecorder(this.stream);

    this.recorder.addEventListener('dataavailable', (event) => {
      this.audioChunks.push(event.data);
    });
  },
  start: function () {
    this.recorder.start();
  },
  stop: async function (): Promise<{ audioBlob: Blob; audioUrl: string }> {
    return new Promise((resolve) => {
      this.recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve({ audioBlob, audioUrl });
      });

      this.recorder.stop();
      this.stream.getAudioTracks().forEach((track) => track.stop());
    });
  },
};
