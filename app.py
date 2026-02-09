from flask import Flask, render_template, request, send_file
import os
import subprocess
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ASPECT_RATIOS = {
    "Original": "Keep original dimensions",
    "1:1": "Square — Ideal for social media posts",
    "4:5": "Portrait — Vertical posts",
    "3:2": "Standard DSLR",
    "5:7": "Smaller prints",
    "16:9": "Widescreen — Horizontal",
    "9:16": "Vertical — Stories, TikTok",
    "4:3": "Standard photography"
}

FILTERS = {
    "None": "",
    "Grayscale": "hue=s=0",
    "Sepia": "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131",
    "Invert": "negate",
    "Brighten": "eq=brightness=0.1",
    "Darken": "eq=brightness=-0.1",
    "Saturation Boost": "eq=saturation=1.5"
}

ZOOM_OPTIONS = {
    "None": 1.0,
    "Slight Zoom (1.1x)": 1.1,
    "Medium Zoom (1.25x)": 1.25,
    "Strong Zoom (1.5x)": 1.5
}

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        if "video" not in request.files:
            return "No video uploaded", 400

        file = request.files["video"]
        if file.filename == "":
            return "No selected file", 400

        ratio = request.form.get("ratio", "16:9")
        filter_name = request.form.get("filter", "None")
        filter_ffmpeg = FILTERS.get(filter_name, "")
        zoom_name = request.form.get("zoom", "None")
        zoom_multiplier = ZOOM_OPTIONS.get(zoom_name, 1.0)
        green_screen = request.form.get("greenscreen") == "on"
        cut_silence = request.form.get("cutsilence") == "on"
        background_file = request.files.get("background") if green_screen else None

        cropX = float(request.form.get("cropX", 0))
        cropY = float(request.form.get("cropY", 0))
        cropW = float(request.form.get("cropW", 0))
        cropH = float(request.form.get("cropH", 0))

        filename = secure_filename(file.filename)
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)

        bg_path = None
        if background_file and green_screen:
            bg_filename = secure_filename(background_file.filename)
            bg_path = os.path.join(UPLOAD_FOLDER, bg_filename)
            background_file.save(bg_path)

        # Video filters
        vf_filters = []
        if ratio != "Original":
            vf_filters.append(f"crop={int(cropW)}:{int(cropH)}:{int(cropX)}:{int(cropY)}")
        if zoom_multiplier > 1.0:
            vf_filters.append(f"scale=iw*{zoom_multiplier}:ih*{zoom_multiplier},crop=iw:ih")
        if filter_ffmpeg:
            vf_filters.append(filter_ffmpeg)
        full_vf = ",".join(vf_filters) if vf_filters else None

        # Audio filter for silence removal
        af_filter = None
        if cut_silence:
            # stop_periods=-1 removes all silent sections
            af_filter = "silenceremove=start_periods=1:start_threshold=-35dB:start_silence=0.5:stop_periods=-1:stop_threshold=-35dB:stop_silence=0.5"

        output_filename = f"processed_{filename}"
        output_path = os.path.join(UPLOAD_FOLDER, output_filename)

        # Build FFmpeg command
        cmd = ["ffmpeg", "-i", input_path]

        if green_screen and bg_path:
            cmd = ["ffmpeg", "-i", bg_path, "-i", input_path,
                   "-filter_complex",
                   f"[1:v]chromakey=0x00FF00:0.3:0.1[fg];[0:v][fg]overlay=format=yuv420"]
            if af_filter:
                cmd += ["-af", af_filter]
            cmd += ["-c:v", "libx264", "-c:a", "aac", output_path, "-y"]
        else:
            if full_vf:
                cmd += ["-vf", full_vf]
            if af_filter:
                cmd += ["-af", af_filter]
            cmd += ["-c:v", "libx264", "-c:a", "aac", output_path, "-y"]

        # Run FFmpeg
        subprocess.run(cmd, check=True)
        return send_file(output_path, as_attachment=True)

    return render_template("index.html", ratios=ASPECT_RATIOS, filters=FILTERS, zooms=ZOOM_OPTIONS)

if __name__ == "__main__":
    app.run(debug=True)
