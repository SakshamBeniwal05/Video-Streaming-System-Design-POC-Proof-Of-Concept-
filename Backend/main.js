import e from "express";
import cors from "cors";
import multer from "multer";
import path from "path"
import { v4 as uuidv4 } from 'uuid';

const app = e();

app.use(cors({
    origin: "*",
    credentials: true
}))

// dont know use yet

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*") // watch it
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next()
})

// dont know use yet

app.use(e.urlencoded({ extended: true, limit: "10kb" }))
app.use(e.json())
app.use('/uploads', e.static('uploads'))

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('./uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname))
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

    return res.status(200).json({
        success: true,
        status: "UPLOAD_SUCCESSFUL",
        message: 'File successfully received and written to backend storage.',
        fileMetadata: {
            originalName: req.file.originalname,   
            savedAs: req.file.filename,            
            mimeType: req.file.mimetype,           
            sizeInBytes: req.file.size,            
            savedToPath: req.file.path
        }
    });

})

app.listen(3000, (req, res) => {
    console.log("server is runnming");
})
