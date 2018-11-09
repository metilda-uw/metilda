import parselmouth

import numpy as np
import matplotlib.pyplot as plt
from StringIO import StringIO
import io
import base64
import seaborn as sns

# sns.set()  # Use seaborn's default style to make attractive graph


def draw_spectrogram(spectrogram, dynamic_range=70):
    X, Y = spectrogram.x_grid(), spectrogram.y_grid()
    sg_db = 10 * np.log10(spectrogram.values)
    plt.pcolormesh(X, Y, sg_db, vmin=sg_db.max() - dynamic_range, cmap='afmhot')
    plt.ylim([spectrogram.ymin, spectrogram.ymax])
    plt.xlabel("time [s]")
    plt.ylabel("frequency [Hz]")


def draw_pitch(pitch):
    # Extract selected pitch contour, and
    # replace unvoiced samples by NaN to not plot
    pitch_values = pitch.selected_array['frequency']
    pitch_values[pitch_values==0] = np.nan
    plt.plot(pitch.xs(), pitch_values, 'o', markersize=5, color='w')
    plt.plot(pitch.xs(), pitch_values, 'o', markersize=2)
    plt.grid(False)
    plt.ylim(0, pitch.ceiling)
    plt.ylabel("fundamental frequency [Hz]")


def audio_analysis_image(upload_path):
    snd = parselmouth.Sound(upload_path)
    snd = snd.convert_to_mono()
    plt.figure()

    # Draw waveform
    plt.subplot(2, 1, 1)
    plt.plot(snd.xs(), snd.values.T)
    plt.xlim([snd.xmin, snd.xmax])
    plt.xlabel("time [s]")
    plt.ylabel("amplitude")

    # Draw spectogram
    plt.subplot(2, 1, 2)
    draw_spectrogram(snd.to_spectrogram())

    # Draw pitch
    plt.twinx()
    draw_pitch(snd.to_pitch())
    plt.xlim([snd.xmin, snd.xmax])

    plt.subplots_adjust(hspace=0.5)

    image = io.BytesIO()
    plt.savefig(image, format="png", dpi=400, figsize=(4, 3))
    image.seek(0)

    return image
