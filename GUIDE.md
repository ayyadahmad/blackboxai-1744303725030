# CodeCraft Development Guide

## Project Structure

```
codecraft/
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── main.js            # Main JavaScript file
├── server/
│   ├── package.json       # Server dependencies
│   └── app.js            # Express server
├── index.html            # Homepage
├── blog.html            # Blog page
├── dashboard.html       # User dashboard
└── welcome.html         # Welcome/onboarding page
```

## Setup Instructions

1. Install Dependencies:
```bash
cd server
npm install
```

2. Start the Server:
```bash
npm start
```

3. Access the Website:
- Open http://localhost:3000 in your browser

## Development Guide

### Adding Extension Download Link

When you have the extension download link, update these locations:

1. In `index.html`:
- Main hero section button (around line 67):
```html
<a href="YOUR_EXTENSION_LINK" class="w-full flex items-center justify-center px-8 py-3...">
    Start Extracting
</a>
```
- Navigation bar button (around line 40):
```html
<a href="YOUR_EXTENSION_LINK" class="ml-8 inline-flex items-center...">
    Get Started
</a>
```

### Adding Blog Posts

To add new blog posts, edit `blog.html`:
1. Copy an existing article section
2. Update the content, image, and links
3. Add to either the featured section or regular posts grid

### Modifying Dashboard

The dashboard in `dashboard.html` includes:
- User statistics
- Recent activity
- Settings sections

To add new dashboard features:
1. Use the existing card components as templates
2. Follow the Tailwind CSS class structure
3. Update the JavaScript handlers in `main.js` if needed

## Styling Guide

- Uses Tailwind CSS for styling
- Custom styles should be added to `css/styles.css`
- Follow existing color scheme:
  - Primary: Indigo (#4F46E5)
  - Secondary: Gray (#6B7280)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Error: Red (#EF4444)

## JavaScript Components

Main functionality in `js/main.js`:
- Navigation handling
- Dashboard statistics
- User settings management
- Blog interaction features

## Server API

Express server in `server/app.js` handles:
- Static file serving
- API endpoints (if needed)
- Server-side functionality

## Adding New Features

1. Plan the feature
2. Create/modify necessary HTML templates
3. Add required JavaScript functionality
4. Style with Tailwind CSS
5. Test across different screen sizes
6. Update documentation

## Best Practices

1. Follow existing code structure and naming conventions
2. Use semantic HTML elements
3. Ensure responsive design works on all screen sizes
4. Keep JavaScript modular and documented
5. Test all features before deployment

## Troubleshooting

Common issues and solutions:

1. Server won't start:
   - Check if port 3000 is in use
   - Verify all dependencies are installed
   - Check server logs for errors

2. Styles not updating:
   - Clear browser cache
   - Verify Tailwind CSS CDN is loading
   - Check for CSS syntax errors

3. JavaScript errors:
   - Check browser console for errors
   - Verify all required files are loaded
   - Test in different browsers

## Contact & Support

For questions or support:
- GitHub Issues
- Documentation Wiki
- Development Team Contact
