const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'Icoin' directory
app.use(express.static(path.join(__dirname, 'Icoin')));

// Serve CSS files with the correct MIME type
app.get('*.css', (req, res) => {
    res.sendFile(path.join(__dirname,  req.url), {
        headers: {
            'Content-Type': 'text/css'
        }
    });
});

// Serve JavaScript files with the correct MIME type
app.get('*.js', (req, res) => {
    res.sendFile(path.join(__dirname,  req.url), {
        headers: {
            'Content-Type': 'text/javascript'
        }
    });
});

// Serve login.html at the root URL ('/')
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,  'html', 'login.html'));
});

// Serve other HTML files from the 'html' directory with their respective URLs
app.get('/html/*.html', (req, res) => {
    const fileName = req.url.split('/').pop();
    res.sendFile(path.join(__dirname,  'html', fileName), err => {
        if (err) {
            res.status(404).send('Page not found');
        }
    });
});

// Define the port to listen on
const port = process.env.PORT || 80;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
