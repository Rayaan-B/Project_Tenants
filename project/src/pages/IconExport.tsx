import { useEffect, useRef } from 'react';
import AppIcon from '../components/AppIcon';

const IconExport = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const exportIcon = (size: number) => {
      if (!svgRef.current) return;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgString = new XMLSerializer().serializeToString(svgRef.current);
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
        const link = document.createElement('a');
        link.download = `logo${size}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        URL.revokeObjectURL(url);
      };

      img.src = url;
    };

    // Add click event listeners
    const exportButton192 = document.getElementById('export192');
    const exportButton512 = document.getElementById('export512');

    if (exportButton192) {
      exportButton192.addEventListener('click', () => exportIcon(192));
    }
    if (exportButton512) {
      exportButton512.addEventListener('click', () => exportIcon(512));
    }

    return () => {
      if (exportButton192) {
        exportButton192.removeEventListener('click', () => exportIcon(192));
      }
      if (exportButton512) {
        exportButton512.removeEventListener('click', () => exportIcon(512));
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">App Icon Export</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Click the buttons below to download the app icons
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="w-64 h-64 mx-auto mb-6">
            <AppIcon ref={svgRef} />
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              id="export192"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Export 192x192
            </button>
            <button
              id="export512"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Export 512x512
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconExport;
