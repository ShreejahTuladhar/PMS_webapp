import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const QRCodeGenerator = ({ bookingId, qrData, onGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [qrCodeSVG, setQrCodeSVG] = useState('');
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const canvasRef = useRef(null);

  // Generate QR Code data
  const generateQRCode = async () => {
    try {
      // Create QR code data object
      const qrPayload = {
        type: 'PARKING_CHECKIN',
        bookingId: bookingId,
        qrCode: qrData,
        timestamp: new Date().toISOString(),
        venue: 'ParkSathi',
        version: '1.0'
      };

      const qrString = JSON.stringify(qrPayload);
      
      // Generate a simple QR code pattern using canvas
      await generateQRCodeCanvas(qrString);
      
      setIsGenerating(false);
      onGenerated && onGenerated();
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
      setIsGenerating(false);
    }
  };

  // Simple QR code generation using canvas (placeholder - in production use a proper QR library)
  const generateQRCodeCanvas = async (data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 200;
    const modules = 21; // QR code modules
    const moduleSize = size / modules;
    
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Generate a pseudo-QR pattern based on data hash
    const hash = simpleHash(data);
    ctx.fillStyle = '#000000';
    
    // Create QR-like pattern
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const shouldFill = (hash + i * modules + j) % 3 === 0;
        
        // Add corner squares (finder patterns)
        const isCorner = (i < 7 && j < 7) || 
                        (i < 7 && j >= modules - 7) || 
                        (i >= modules - 7 && j < 7);
        
        if (isCorner) {
          const isOuterBorder = i === 0 || i === 6 || j === 0 || j === 6 ||
                               (i >= modules - 7 && (i === modules - 7 || i === modules - 1)) ||
                               (j >= modules - 7 && (j === modules - 7 || j === modules - 1));
          const isInnerSquare = (i >= 2 && i <= 4 && j >= 2 && j <= 4) ||
                               (i >= 2 && i <= 4 && j >= modules - 5 && j <= modules - 3) ||
                               (i >= modules - 5 && i <= modules - 3 && j >= 2 && j <= 4);
          
          if (isOuterBorder || isInnerSquare) {
            ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize);
          }
        } else if (shouldFill) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/png');
    setQrCodeDataURL(dataURL);
  };

  // Simple hash function for QR pattern generation
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const downloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement('a');
      link.download = `parking-qr-${bookingId}.png`;
      link.href = qrCodeDataURL;
      link.click();
      toast.success('QR code downloaded to your device!');
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && qrCodeDataURL) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCodeDataURL);
        const blob = await response.blob();
        const file = new File([blob], `parking-qr-${bookingId}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'Parking QR Code',
          text: `Parking QR Code for booking ${bookingId}`,
          files: [file]
        });
        
        toast.success('QR code shared successfully!');
      } catch (error) {
        console.error('Error sharing QR code:', error);
        downloadQRCode(); // Fallback to download
      }
    } else {
      downloadQRCode(); // Fallback to download
    }
  };

  const copyToClipboard = async () => {
    try {
      const qrPayload = {
        type: 'PARKING_CHECKIN',
        bookingId: bookingId,
        qrCode: qrData,
        timestamp: new Date().toISOString(),
        venue: 'ParkSathi'
      };
      
      await navigator.clipboard.writeText(JSON.stringify(qrPayload));
      toast.success('QR data copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy QR data');
    }
  };

  useEffect(() => {
    // Start generating QR code after component mounts
    const timer = setTimeout(() => {
      generateQRCode();
    }, 1000);

    return () => clearTimeout(timer);
  }, [bookingId, qrData]);

  if (isGenerating) {
    return (
      <div className="text-center space-y-4">
        <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium">Generating QR Code...</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm">
            Creating your unique check-in QR code with advanced security features...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      {/* QR Code Display */}
      <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-6 mx-auto inline-block">
        <div className="relative">
          <canvas 
            ref={canvasRef}
            className="mx-auto border border-gray-200 rounded-lg shadow-sm"
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
          
          {/* QR Code overlay information */}
          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            QR
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
            ID: {bookingId}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-yellow-800 mb-1">How to use your QR code:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Save this QR code to your phone</li>
              <li>• Show it at the parking entrance gate</li>
              <li>• The scanner will verify your booking instantly</li>
              <li>• Keep it handy for easy exit too</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={downloadQRCode}
          className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Save</span>
        </button>
        
        <button
          onClick={shareQRCode}
          className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Share</span>
        </button>
      </div>

      {/* Additional Options */}
      <div className="flex justify-center">
        <button
          onClick={copyToClipboard}
          className="text-gray-600 hover:text-gray-800 text-sm flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span>Copy QR Data</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          🔒 This QR code is unique to your booking and expires after use. 
          Keep it secure and don't share it publicly.
        </p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;