const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Route for listing files
app.get('/', (req, res) => {
    fs.readdir(DATA_DIR, (err, files) => {
        if (err) {
            console.error('Error reading data directory:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('index', { files });
    });
});

// Route for creating a new file
app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/create', (req, res) => {
    const { filename, content } = req.body;
    const filePath = path.join(DATA_DIR, filename);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error('Error creating file:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

// Route for viewing file content
app.get('/files/:filename', (req, res) => {
    const filePath = path.join(DATA_DIR, req.params.filename);

    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(404).send('File Not Found');
        }
        res.render('detail', { filename: req.params.filename, content });
    });
});

// Route for updating a file name
app.post('/update', (req, res) => {
    const { oldFilename, newFilename } = req.body;
    const oldFilePath = path.join(DATA_DIR, oldFilename);
    const newFilePath = path.join(DATA_DIR, newFilename);

    fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
            console.error('Error renaming file:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

// Route for deleting a file
app.post('/delete', (req, res) => {
    const { filename } = req.body;
    const filePath = path.join(DATA_DIR, filename);

    // Check if the file exists before attempting to delete
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            console.error('File not found or not a regular file');
            return res.status(404).send('File not found');
        }

        // Delete the file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
