# Video Segmentation & Adaptive Bitrate Streaming (POC)

## Introduction

In this project, I built a system that implements **segmented video streaming** (i.e., transferring video in chunks instead of a single file). This is a **Proof of Concept (POC)** based on my learnings about **Adaptive Bitrate Streaming (ABR)**.

I've only implemented the **segmentation** part here, since generating multiple quality renditions (multi-bitrate encoding) is a heavy process to execute. However, the player side is already ABR-ready — **video.js**, which is an HLS-based video player, supports automatic bitrate/quality switching out of the box (from v7 onwards) via its bundled `videojs-http-streaming` (VHS) engine.

So if we generate a properly segmented and quality-tiered `index.m3u8` (a master playlist referencing multiple renditions), video.js will handle the adaptive switching on its own — no custom bandwidth-monitoring logic required on the frontend.

## Project Structure

The project has two parts:

- **Backend**  handles video upload/processing and generates HLS segments using FFmpeg.
- **Frontend** plays the segmented video using video.js.

Setup is the same as any typical full-stack project. The main prerequisite is that **FFmpeg must be correctly installed and configured** on your machine, since the backend shells out to it for segmentation.

## Tech Stack

- **Backend:** Node.js, local file storage (no cloud storage — kept local intentionally since this is a POC)
- **Frontend:** React + TypeScript, using the `video.js` library for playback

## Core FFmpeg Command

The backend uses the following FFmpeg command to segment an input video into HLS chunks:

```js
const ffmpegCommand = `ffmpeg -i "${videoPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${folderPath}/segment%03d.ts" -start_number 0 "${hlsPath}"`;
```

**What this does:**
- `-codec:v libx264 -codec:a aac` — encodes video with H.264 and audio with AAC (broadly compatible codecs for HLS)
- `-hls_time 10` — splits the video into 10-second segments
- `-hls_playlist_type vod` — generates a Video-on-Demand playlist (not live)
- `-hls_segment_filename` — naming pattern for output `.ts` segment files
- `-start_number 0` — segment numbering starts at 0
- Output is an `index.m3u8` playlist referencing all generated segments

## Prerequisites

- Node.js installed
- **FFmpeg installed and available in your system PATH**
- npm/yarn for installing frontend and backend dependencies

## Run with Docker

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine), then pull the [backend image](https://hub.docker.com/repository/docker/sakshambeniwal/videostreambackend/general) and [frontend image](https://hub.docker.com/repository/docker/sakshambeniwal/videostreamfrontend/general):

```bash
docker pull sakshambeniwal/videostreambackend:latest
docker pull sakshambeniwal/videostreamfrontend:latest
```

Run each container in a separate terminal. The images do not declare exposed ports, so publish the container ports explicitly with `-p HOST_PORT:CONTAINER_PORT`:

```bash
docker run -d --name videostream-backend -p 3000:3000 -v videostream-uploads:/VideoStream/uploads sakshambeniwal/videostreambackend:latest
docker run -d --name videostream-frontend -p 8000:8000 sakshambeniwal/videostreamfrontend:latest
```

Open the frontend at [http://localhost:8000](http://localhost:8000). It sends upload requests to the backend at `http://localhost:3000`. The named Docker volume keeps uploaded videos when the backend container is replaced.

The backend requires FFmpeg to process uploaded videos. Make sure the backend image includes FFmpeg; otherwise, upload processing will fail.

## Notes / Scope of this POC

- This POC focuses on **segmentation only** a single quality rendition is generated per video.
- Multi-bitrate (360p/720p/1080p) encoding is **not implemented** here due to the processing overhead, but the same FFmpeg-based approach can be extended to generate multiple renditions and a master playlist for full ABR support.
- Since video.js (version 7+) already supports automatic quality switching when given a proper master `.m3u8` with multiple renditions, no additional frontend logic is needed for ABR the player handles it internally via VHS.
- Everything runs locally with local storage; no cloud/CDN integration.

## References

- [@chaiaurcode - YouTube](https://www.youtube.com/watch?v=Hn0uZwjghng)
- [@piyushgargdev - YouTube Playlist](https://www.youtube.com/watch?v=-JtjQ-OA7XE&list=PLinedj3B30sBlBWRox2V2tg9QJ2zr4M3o&index=45)
- [Adaptive Bitrate Streaming - ImageKit.io Docs](https://imagekit.io/docs/adaptive-bitrate-streaming)