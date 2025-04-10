# CodeCraft

CodeCraft is a comprehensive web development toolkit that combines a browser extension with a web interface for code extraction, manipulation, and analysis.

![CodeCraft Logo](assets/logo.png)

## Features

### Browser Extension
- **Element Cloning**: Clone elements from websites with ease
- **Code Grabbing**: Extract code snippets from any website
- **UI Snatching**: Capture complete UI components
- **Color Selection**: Pick colors and extract color palettes
- **Element Manipulation**: Move, hide, or modify elements
- **Code Export**: Export to CodePen or download as files
- **Image Extraction**: Extract images with one click
- **Measurement Tools**: Get precise measurements
- **Code Comparison**: Compare code from different sources
- **Code Optimization**: Optimize extracted code automatically

### Web Interface
- **Dashboard**: Track your activity and saved components
- **Blog**: Web development tutorials and best practices
- **User Settings**: Customize your experience

## Quick Start

1. **Install the Extension**:
   - Click "Start Extracting" on the homepage
   - Follow browser extension installation prompts
   - Pin the extension to your toolbar

2. **Using CodeCraft**:
   - Click the CodeCraft icon in your browser
   - Use the inspector tool to select elements
   - Choose your desired action from the context menu
   - View and manage extracted code in your dashboard

## Installation

### Website
```bash
# Clone the repository
git clone https://github.com/yourusername/codecraft.git

# Install dependencies
cd codecraft/server
npm install

# Start the server
npm start

# Access the website
open http://localhost:3000
```

### Extension
1. Download the extension package
2. Go to chrome://extensions/
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select the extension directory

## Documentation

- [Development Guide](GUIDE.md)
- [API Documentation](docs/API.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Node.js, Express
- **Extension**: Chrome Extensions API
- **Tools**: Webpack, Babel

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Edge (Latest)
- Safari (Latest)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
codecraft/
├── extension/          # Browser extension files
├── website/           # Main website
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript files
│   └── server/       # Backend server
├── docs/             # Documentation
└── tests/            # Test files
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs.codecraft.com](https://docs.codecraft.com)
- Issues: [GitHub Issues](https://github.com/yourusername/codecraft/issues)
- Email: support@codecraft.com
- Community: [Discord Server](https://discord.gg/codecraft)

## Acknowledgments

- Icons by Font Awesome
- UI Components by Tailwind CSS
- Images from Pexels

## Roadmap

- [ ] AI-powered code suggestions
- [ ] Team collaboration features
- [ ] Visual code editor
- [ ] Component library
- [ ] Code snippet marketplace

## Authors

- Your Name - *Initial work* - [YourGitHub](https://github.com/yourusername)

See also the list of [contributors](https://github.com/yourusername/codecraft/contributors) who participated in this project.

## Version History

- 1.0.0
  - Initial Release
  - Basic code extraction features
  - Dashboard implementation
  - Blog section

## FAQ

**Q: How do I install the extension?**
A: Click "Start Extracting" on our homepage and follow the installation prompts.

**Q: Is CodeCraft free to use?**
A: Yes, CodeCraft is currently free and open source.

**Q: Can I use extracted code in my projects?**
A: Yes, but please check the original source's license terms.
