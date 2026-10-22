"""Create an original, quiet music-box sketch for the invitation preview."""
import array
import math
from pathlib import Path
import subprocess
import tempfile
import wave
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
rate = 22050
duration = 32
samples = [0.0] * (rate * duration)

def note(midi, start, length, volume):
    frequency = 440 * 2 ** ((midi - 69) / 12)
    offset = int(start * rate)
    for j in range(min(int(length * rate), len(samples) - offset)):
        t = j / rate
        envelope = min(1, t / .015) * math.exp(-t * 2.1)
        tone = math.sin(2 * math.pi * frequency * t) + .20 * math.sin(2 * math.pi * frequency * 2 * t) + .06 * math.sin(2 * math.pi * frequency * 3 * t)
        samples[offset + j] += tone * envelope * volume

chords = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]
melody = [76, 79, 81, 79, 76, 74, 72, 76, 77, 76, 72, 69, 71, 74, 79, 74]
for bar in range(8):
    chord = chords[bar % 4]
    for beat in range(8):
        note(chord[beat % 3], bar * 4 + beat * .5, 2.5, .09)
    for beat in range(4):
        note(melody[(bar * 2 + beat) % len(melody)], bar * 4 + beat, 2.5, .12)
pcm = array.array('h')
for i, value in enumerate(samples):
    t = i / rate
    fade = min(1, t / 1.5, (duration - t) / 2)
    pcm.append(int(max(-1, min(1, value * fade)) * 26000))
with tempfile.TemporaryDirectory() as temp:
    wav = Path(temp) / 'music.wav'
    with wave.open(str(wav), 'wb') as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes(pcm.tobytes())
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-i', str(wav), '-codec:a', 'libmp3lame', '-b:a', '96k', str(root / 'assets' / 'musica.mp3')], check=True)
print('Created assets/musica.mp3')
