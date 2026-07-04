import { useState, useRef } from 'react'
import './App.css'
import { MyPlayer } from './VideoPlayer'

function App() {
  
  const [video, setvideo] = useState({
    "originalName": "Kalank Title Track - Arijit Singh  Alia Bhatt & Varun Dhawan  Pritam  Lyrical - Soulful Arijit Singh Songs (720p, h264).mp4",
    "savedAs": "file-6da70494-226c-4e22-954e-274fc6eaef5e.mp4",
    "mimeType": "video/mp4",
    "sizeInBytes": 20509165,
    "savedToPath": "uploads\\file-6da70494-226c-4e22-954e-274fc6eaef5e.mp4",
    "videoURL": "https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
  })
  const [uploadFlag, setuploadFlag] = useState(false)
  const serverUpload = "http://localhost:3000/uploadMulter"

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileNameRef = useRef<HTMLDivElement>(null)

  const upload = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    
    const fileInput = fileInputRef.current;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a video file first.");
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file); // Must match backend's uploader.single('file')

    try {
      setuploadFlag(true);
      const res = await fetch(serverUpload, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.fileMetadata) {
          setvideo(data.fileMetadata);
        } else {
          alert(data.message || "An error occurred during transcoding.");
        }
      } else {
        alert(`Server returned an error: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to connect to the backend server. Make sure it is running.");
    } finally {
      setuploadFlag(false);
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">HLS Streamer <span className="logo-subtext">POC</span></span>
        </div>
        <div className="header-status">
          <span className="status-indicator"></span>
          <span className="status-text">FFmpeg Transcoder Active</span>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="left-panel">
          <div className="card upload-card">
            <h2 className="card-title">Upload Video</h2>
            <p className="card-description">
              Upload an MP4 video file to automatically segment it into adaptive HLS (.m3u8) format.
            </p>

            <form onSubmit={upload} className="upload-form">
              <label htmlFor="videoPlayer" className="dropzone-label">
                <div className="dropzone-content">
                  <div className="upload-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="upload-icon">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="upload-btn-styled">Choose Video File</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="videoPlayer"
                    accept="video/mp4,video/x-matroska,video/webm"
                    className="video-input-file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (fileNameRef.current && file) {
                        fileNameRef.current.innerText = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
                        fileNameRef.current.classList.add("file-selected");
                      }
                    }}
                  />
                  <div ref={fileNameRef} className="file-name-display">No file chosen</div>
                </div>
              </label>

              <button type="submit" className="btn-upload" disabled={uploadFlag}>
                {uploadFlag ? "Transcoding..." : "Upload & Segment"}
              </button>
            </form>

            {/* loader activate on uploadFlag TRUE */}
            {uploadFlag && (
              <div className="loader-container">
                <div className="loader-spinner-wrapper">
                  <div className="loader-spinner"></div>
                </div>
                <div className="loader-text-container">
                  <div className="loader-title">Generating HLS Segments</div>
                  <div className="loader-desc">FFmpeg is slicing the video into 10s fragments. This may take a moment...</div>
                </div>
              </div>
            )}
          </div>

          {video.savedAs && (
            <div className="card info-card">
              <h2 className="card-title">Active Video Details</h2>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Original Name</span>
                  <span className="metadata-value" title={video.originalName}>{video.originalName}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Saved Filename</span>
                  <span className="metadata-value code-font">{video.savedAs}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Format / MIME</span>
                  <span className="metadata-value text-badge">{video.mimeType}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">File Size</span>
                  <span className="metadata-value">{(video.sizeInBytes / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">M3U8 Index URL</span>
                  <span className="metadata-value code-font url-text" title={video.videoURL}>{video.videoURL}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="right-panel">
          <div className="card player-card">
            <div className="player-card-header">
              <div className="window-controls">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <span className="player-header-title">HLS Stream Preview</span>
            </div>

            <div className="player-outer-container">
              <div className="ambient-glow"></div>
              <div className="video-player-container-inner">
                {video.videoURL ? (
                  <MyPlayer src={video.videoURL} />
                ) : (
                  <div className="no-video-placeholder">
                    <span className="placeholder-icon">📺</span>
                    <p className="placeholder-text">No active video segment playlist loaded.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="player-card-footer">
              <div className="badge-row">
                <span className="badge">Adaptive Bitrate (HLS)</span>
                <span className="badge">TS Segments</span>
              </div>
            </div>
          </div>

          {video.savedAs && (
            <div className="card about-video-card">
              <h2 className="card-title">📖 About the Video</h2>
              <div className="about-content">
                <div className="video-main-meta">
                  <h3 className="video-title">{video.originalName}</h3>
                  <p className="video-description">
                    This media file has been segment-transcoded into an HTTP Live Streaming (HLS) playlist. 
                    The output consists of a master index playlist (<code>.m3u8</code>) and individual 
                    MPEG-2 Transport Stream (<code>.ts</code>) segments. This architecture enables seamless 
                    seeking, instant buffering, and client-side bandwidth adaptation.
                  </p>
                </div>
                <div className="tech-badge-container">
                  <div className="tech-badge">
                    <span className="badge-label">Active Protocol</span>
                    <span className="badge-val">HLS v3 Playlist</span>
                  </div>
                  <div className="tech-badge">
                    <span className="badge-label">Mime Format</span>
                    <span className="badge-val">{video.mimeType}</span>
                  </div>
                  <div className="tech-badge">
                    <span className="badge-label">Target Segments</span>
                    <span className="badge-val">~10s Chunks</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
