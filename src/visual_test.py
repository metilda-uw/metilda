import parselmouth

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# sns.set()  # Use seaborn's default style to make attractive graphs


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


# Plot nice figures using Python's "standard" matplotlib library
snd = parselmouth.Sound(r"C:\Users\Mitchell\Documents\Masters\2018\Capstone\peldawsforpraatelan\sounds\OldPart1.mp3")
snd = snd.convert_to_mono()
plt.figure(dpi=800, figsize=(8, 6))

# Draw waveform
plt.subplot(2, 1, 1)
plt.plot(snd.xs(), snd.values.T)
plt.xlim([snd.xmin, snd.xmax])
plt.xlabel("time [s]")
plt.ylabel("amplitude")

plt.subplot(2, 1, 2)
draw_spectrogram(snd.to_spectrogram())
spec_fig = plt.figure(dpi=800, figsize=(8, 6))
spec_fig.savefig(r"C:\Users\Mitchell\Documents\Masters\2018\Capstone\image_test_spec_only.png")

#plt.show()
plt.subplots_adjust(hspace=0.3)
plt.savefig(r"C:\Users\Mitchell\Documents\Masters\2018\Capstone\image_test3.png", format="png")