import e from "express";
import cors from "cors";
import multer from "multer";
import path from "path"
import { v4 as uuidv4 } from 'uuid';
import fs from "fs"
import { exec } from "child_process";
import { error } from "console";
import { stdout } from "process";

const app = e();

app.use(cors({
    origin: "*",
    credentials: true
}))

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*") // watch it
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next()
})

app.use(e.urlencoded({ extended: true, limit: "10kb" }))
app.use(e.json())
app.use('/uploads', e.static('uploads'))

const vidID = uuidv4()

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('./uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + vidID + path.extname(file.originalname))
    }
})
const uploader = multer({ storage: multerStorage })

app.get('/', (req, res) => {
    res.json("Aur Kya Chahiye")
})

app.post('/uploadMulter', uploader.single('file'), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            status: "FILE_NOT_FOUND",
            message: 'Upload failed. No file payload detected in the request. Please attach a file under the key "video".'
        });
    }

    const videoPath = req.file.path
    const folderPath = `uploads/videoM3u8/${vidID}`
    const hlsPath = `${folderPath}/index.m3u8`

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
    console.log(videoPath)

    // sample ffmpeg command

    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${folderPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    // ffmpeg -i C:\Users\Test\Downloads\9594355-uhd_4096_2160_25fps.mp4 -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename C:\Users\Test\Downloads\inner\segment%03d.ts -start_number 0 C:\Users\Test\Downloads\inner\index.m3u8;

    // sample ffmpeg command

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}`)
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
    })



    // return res.status(200).json({
    //     success: true,
    //     status: "UPLOAD_SUCCESSFUL",
    //     message: 'File successfully received and written to backend storage.',
    //     fileMetadata: {
    //         originalName: req.file.originalname,   
    //         savedAs: req.file.filename,            
    //         mimeType: req.file.mimetype,           
    //         sizeInBytes: req.file.size,            
    //         savedToPath: req.file.path 
    //     }
    // });
})

app.listen(3000, (req, res) => {
    console.log("server is runnming");
})
