const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the parent directory
app.use(express.static('../'));

// API Routes
app.get('/api/extract', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Fetch the webpage content
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Extract HTML content
        const bodyHtml = $('body').html();

        // Extract CSS
        const cssContent = [];
        $('style').each((i, elem) => {
            cssContent.push($(elem).html());
        });
        $('link[rel="stylesheet"]').each((i, elem) => {
            cssContent.push($(elem).attr('href'));
        });

        // Extract JavaScript
        const jsContent = [];
        $('script').each((i, elem) => {
            if ($(elem).attr('src')) {
                jsContent.push($(elem).attr('src'));
            } else {
                jsContent.push($(elem).html());
            }
        });

        res.json({
            html: bodyHtml,
            css: cssContent.join('\n'),
            js: jsContent.join('\n')
        });

    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ 
            error: 'Failed to extract code',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        details: err.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
