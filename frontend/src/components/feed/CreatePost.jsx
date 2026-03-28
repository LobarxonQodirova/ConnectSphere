import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../store/slices/feedSlice";
import Avatar from "../common/Avatar";

export default function CreatePost() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { creating } = useSelector((s) => s.feed);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files).slice(0, 4);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", "friends");
    files.forEach((f) => formData.append("media_files", f));

    await dispatch(createPost(formData));
    setContent("");
    setFiles([]);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex space-x-3">
        <Avatar src={user?.avatar} name={user?.username} size="md" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="flex-1 resize-none border border-gray-200 rounded-lg p-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Media previews */}
      {previews.length > 0 && (
        <div className="flex space-x-2 mt-3 overflow-x-auto">
          {previews.map((src, idx) => (
            <div key={idx} className="relative w-20 h-20 flex-shrink-0">
              <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                onClick={() => removeFile(idx)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full
                           text-xs flex items-center justify-center"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600
                       hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Photo/Video</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={creating || (!content.trim() && files.length === 0)}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg
                     hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {creating ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
