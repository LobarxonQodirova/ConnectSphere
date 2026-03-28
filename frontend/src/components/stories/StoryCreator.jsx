import React, { useRef, useState } from "react";
import api from "../../api/axiosConfig";

const bgColors = ["#000000", "#4F46E5", "#DC2626", "#059669", "#D97706", "#7C3AED", "#0891B2"];

/**
 * Modal to create a new story (text, image, or video).
 */
export default function StoryCreator({ onClose, onCreated }) {
  const [mode, setMode] = useState("text"); // "text" | "media"
  const [textContent, setTextContent] = useState("");
  const [bgColor, setBgColor] = useState("#4F46E5");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMode("media");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const formData = new FormData();

    if (mode === "text") {
      formData.append("media_type", "text");
      formData.append("text_content", textContent);
      formData.append("background_color", bgColor);
    } else if (mediaFile) {
      const isVideo = mediaFile.type.startsWith("video");
      formData.append("media_type", isVideo ? "video" : "image");
      formData.append("media_file", mediaFile);
    }

    formData.append("duration", "5");

    try {
      await api.post("/stories/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error("Failed to create story:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Story</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setMode("text")}
            className={`flex-1 py-2 text-sm font-medium ${
              mode === "text" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"
            }`}
          >
            Text
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className={`flex-1 py-2 text-sm font-medium ${
              mode === "media" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"
            }`}
          >
            Photo / Video
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="p-4">
          {mode === "text" ? (
            <>
              {/* Preview */}
              <div
                className="w-full h-64 rounded-lg flex items-center justify-center p-6 mb-4"
                style={{ backgroundColor: bgColor }}
              >
                <p className="text-white text-xl font-bold text-center">
                  {textContent || "Your story text..."}
                </p>
              </div>

              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Write something..."
                maxLength={500}
                rows={2}
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-3"
              />

              {/* Background colour picker */}
              <div className="flex space-x-2">
                {bgColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBgColor(c)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      bgColor === c ? "border-indigo-600 ring-2 ring-indigo-200" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
              {mediaPreview ? (
                mediaFile?.type.startsWith("video") ? (
                  <video src={mediaPreview} className="max-h-full" controls />
                ) : (
                  <img src={mediaPreview} alt="" className="max-h-full object-contain" />
                )
              ) : (
                <p className="text-gray-400 text-sm">Select a photo or video</p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || (mode === "text" && !textContent.trim()) || (mode === "media" && !mediaFile)}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {submitting ? "Sharing..." : "Share Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
