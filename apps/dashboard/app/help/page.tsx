import { DocViewer } from './_components/DocViewer';

const WELCOME_CONTENT = `
# Welcome to the Documentation

Welcome to our documentation portal. Here you can find information about:

## Getting Started
- Quick start guide
- Initial setup
- Basic operations

## Product Information
- Technical specifications
- Performance metrics
- Integration capabilities

## Support
- Troubleshooting guides
- Common issues and solutions
- Maintenance procedures

Use the search bar above or navigate through categories in the sidebar to find what you need.
`;

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <DocViewer content={WELCOME_CONTENT} />
    </div>
  );
} 