"""
Contains utilities for audio analysis. Some of the visualization functions are
based on examples from the parselmouth-praat library:
https://github.com/YannickJadoul/Parselmouth
"""

from __future__ import absolute_import
import io
import os
import shutil
import tempfile
from math import isnan

import matplotlib.pyplot as plt
import numpy as np
import parselmouth

# sns.set()  # Use seaborn's default style to make attractive graph
from metilda.default import MIN_PITCH_HZ, MAX_PITCH_HZ


def draw_spectrogram(spectrogram, dynamic_range=70):
    X, Y = spectrogram.x_grid(), spectrogram.y_grid()
    sg_db = 10 * np.log10(spectrogram.values)
    plt.pcolormesh(X, Y, sg_db, vmin=sg_db.max() - dynamic_range, cmap='afmhot')
    plt.ylim([spectrogram.ymin, spectrogram.ymax])
    plt.xlabel("time [s]")
    plt.ylabel("frequency [Hz]")


def draw_pitch(pitch, min_pitch, max_pitch):
    # Extract selected pitch contour, and
    # replace unvoiced samples by NaN to not plot
    pitch_values = pitch.selected_array['frequency']
    pitch_values[pitch_values==0] = np.nan
    plt.plot(pitch.xs(), pitch_values, 'o', markersize=5, color='w')
    plt.plot(pitch.xs(), pitch_values, 'o', markersize=2)
    plt.grid(False)
    plt.ylim(min_pitch, max_pitch)
    plt.ylabel("fundamental frequency [Hz]")


def audio_analysis_image(upload_path,
                         tmin=-1,
                         tmax=-1,
                         min_pitch=MIN_PITCH_HZ,
                         max_pitch=MAX_PITCH_HZ,
                         output_path=None):                     
    snd = parselmouth.Sound(upload_path)
    snd = snd.convert_to_mono()

    if tmin > -1 or tmax > -1:
        tmin = max(0, tmin)
        tmax = min(snd.xmax, tmax)
        snd = snd.extract_part(from_time=tmin, to_time=tmax)
        snd.scale_times_to(tmin, tmax)

    fig, (ax1, ax2) = plt.subplots(ncols=1, nrows=2, figsize=(7, 3.25), gridspec_kw = {'height_ratios':[1, 2]}, dpi=400)

    # Draw waveform
    plt.sca(ax1)
    plt.plot(snd.xs(), snd.values.T)
    plt.xlim([snd.xmin, snd.xmax])
    ax1.set_xticklabels([])
    plt.ylabel("amplitude")

    # Draw spectogram
    plt.sca(ax2)
    draw_spectrogram(snd.to_spectrogram())

    # Draw pitch
    plt.twinx()
    draw_pitch(snd.to_pitch(pitch_floor=min_pitch, pitch_ceiling=max_pitch), min_pitch, max_pitch)
    plt.xlim([snd.xmin, snd.xmax])

    plt.subplots_adjust(hspace=0.1, top=0.98, bottom=0.14)

    image = io.BytesIO()
    plt.savefig(image, format="png")
    image.seek(0)

    if output_path is not None:
        plt.savefig(output_path, format="png")

    # Free up memory
    plt.cla()
    plt.clf()
    plt.close('all')

    return image


def get_pitches_in_range(tmin, tmax, snd_pitch):
    tmin = max(tmin, snd_pitch.xmin)
    tmax = min(tmax, snd_pitch.xmax)
    pitch_samples = [(t, snd_pitch.get_value_at_time(t)) for t in snd_pitch.xs() if tmin <= t <= tmax]
    return [(t, p) for t, p in pitch_samples if not isnan(p)]


def get_avg_pitch(time_range, upload_path, min_pitch=MIN_PITCH_HZ, max_pitch=MAX_PITCH_HZ):
    snd = parselmouth.Sound(upload_path)
    snd_pitch = snd.to_pitch(pitch_floor=min_pitch, pitch_ceiling=max_pitch)
    t0, t1 = time_range
    pitch_samples = get_pitches_in_range(t0, t1, snd_pitch)

    if len(pitch_samples) == 0:
        return -1
    else:
        pitches = list(zip(*pitch_samples))[1]
        return sum(pitches) / len(pitches)


def get_all_pitches(time_range, upload_path, min_pitch=MIN_PITCH_HZ, max_pitch=MAX_PITCH_HZ):
    snd = parselmouth.Sound(upload_path)
    snd_pitch = snd.to_pitch(pitch_floor=min_pitch, pitch_ceiling=max_pitch)
    t0, t1 = time_range
    return get_pitches_in_range(t0, t1, snd_pitch)


def get_sound_length(upload_path):
    return parselmouth.Sound(upload_path).get_total_duration()

def test(upload_path):
    return parselmouth.Sound(upload_path)


def get_audio(upload_path, tmin=-1, tmax=-1):
    snd = parselmouth.Sound(upload_path)
    if tmin > -1 or tmax > -1:
        tmin = max(0, tmin)
        tmax = min(snd.xmax, tmax)
        snd = snd.extract_part(from_time=tmin, to_time=tmax)
        snd.scale_times_to(tmin, tmax)

    temp_dir = tempfile.mkdtemp()
    temp_file = os.path.join(temp_dir, "audio.wav")
    snd.save(temp_file, "WAV")

    audio_file = open(temp_file, "rb")
    file_bytes = io.BytesIO(audio_file.read())
    file_bytes.seek(0)
    audio_file.close()

    shutil.rmtree(temp_dir)
    return file_bytes
