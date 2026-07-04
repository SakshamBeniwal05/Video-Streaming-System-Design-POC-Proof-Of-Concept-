import e from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";
import { exec } from "child_process";

const app = e();

// Ensure base uploads folder exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads', { recursive: true });
}

app.use(cors({
    origin: "*",
    credentials: true
}))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next()
})

app.use(e.urlencoded({ extended: true, limit: "10kb" }))
app.use(e.json())
app.use('/uploads', e.static('uploads'))

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('./uploads'))
    },
    filename: function (req, file, cb) {
        const uniqueId = uuidv4();
        // Attach uniqueId to req so it's accessible in the route handler
        req.vidID = uniqueId;
        cb(null, file.fieldname + "-" + uniqueId + path.extname(file.originalname))
    }
})
const uploader = multer({ storage: multerStorage })

app.get('/', (req, res) => {
    res.json("Aur Kya Chahiye")
})

app.post('/uploadMulter', uploader.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            status: "FILE_NOT_FOUND",
            message: 'Upload failed. No file payload detected in the request. Please attach a file under the key "file".'
        });
    }

    const reqVidID = req.vidID || uuidv4();
    const videoPath = req.file.path
    const folderPath = `uploads/video_m3u8/${reqVidID}`
    const hlsPath = `${folderPath}/index.m3u8`
    
    const host = `${req.protocol}://${req.get('host')}`;
    const video_URL = `${host}/${hlsPath}`

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
    console.log(`Processing file path: ${videoPath}`)

    const runFFmpeg = (command) => {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve({ stdout, stderr });
            });
        });
    };

    // Wrap paths in quotes to support special characters
    const ffmpegCommand = `ffmpeg -i "${videoPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${folderPath}/segment%03d.ts" -start_number 0 "${hlsPath}"`;

    try {
        console.log("Starting FFmpeg HLS segmentation...");
        await runFFmpeg(ffmpegCommand); 
        console.log("FFmpeg completed perfectly.");

        return res.status(200).json({
            success: true,
            status: "UPLOAD_AND_PROCESSING_SUCCESSFUL",
            message: 'File successfully processed and converted to HLS format.',
            playlistUrl: video_URL,
            fileMetadata: {
                originalName: req.file.originalname,
                savedAs: req.file.filename,
                mimeType: req.file.mimetype,
                sizeInBytes: req.file.size,
                savedToPath: req.file.path,
                videoURL: video_URL
            }
        });
    } catch (ffmpegError) {
        console.error(`FFmpeg Error Occurred: ${ffmpegError.message}`);
        return res.status(500).json({
            success: false,
            status: "PROCESSING_FAILED",
            message: "The file was uploaded, but converting it to HLS stream format failed.",
            error: ffmpegError.message
        });
    }
})

app.listen(3000, () => {
    console.log("server is running on port 3000");
})
