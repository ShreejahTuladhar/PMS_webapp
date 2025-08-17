import React, { useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const ESewaPayment = ({ amount, onSuccess, onError, onCancel }) => {
  const [step, setStep] = useState(1); // 1: QR Code, 2: PIN Entry, 3: Success
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate eSewa payment URL (simulated)
  const eSewaPaymentUrl = `esewa://payment?amount=${amount}&product_id=PARKSATHI_${Date.now()}&merchant_id=PARKSATHI`;

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      onError('Please enter a valid 4-digit PIN');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      if (pin === '1234') { // Simulate successful PIN
        setStep(3);
        setTimeout(() => {
          onSuccess({
            id: `ESEWA-${Date.now()}`,
            status: 'COMPLETED',
            amount: amount,
            method: 'esewa',
            transactionId: `ESW${Date.now().toString().slice(-8)}`
          });
        }, 1500);
      } else {
        setIsProcessing(false);
        onError('Invalid PIN. Please try again. (Use 1234 for demo)');
      }
    }, 2000);
  };

  if (step === 1) {
    return (
      <div className="text-center p-6">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">eSewa Payment</h3>
          <p className="text-gray-600">Amount: Rs. {amount}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
          <QRCode value={eSewaPaymentUrl} size={200} className="mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Scan QR code with eSewa app</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setStep(2)}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
          >
            Continue with eSewa PIN
          </button>
          
          <button
            onClick={onCancel}
            className="w-full text-gray-600 py-2 px-4 rounded-lg hover:text-gray-800"
          >
            Cancel Payment
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>• Make sure you have sufficient balance in your eSewa account</p>
          <p>• Transaction will be processed securely through eSewa</p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="text-center p-6">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter eSewa PIN</h3>
          <p className="text-gray-600">Enter your 4-digit eSewa PIN to complete payment</p>
          <p className="text-sm text-green-600 mt-1">Amount: Rs. {amount}</p>
        </div>

        <div className="mb-6">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            className="w-32 h-14 text-center text-2xl font-mono border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            maxLength={4}
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">Demo PIN: 1234</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePinSubmit}
            disabled={pin.length !== 4 || isProcessing}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              'Pay Now'
            )}
          </button>
          
          <button
            onClick={() => setStep(1)}
            disabled={isProcessing}
            className="w-full text-gray-600 py-2 px-4 rounded-lg hover:text-gray-800 disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="text-center p-6">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600">Your payment has been processed successfully</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="font-semibold">Rs. {amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span>eSewa</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-green-600 font-medium">Completed</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>Payment confirmation will be sent to your registered mobile number</p>
        </div>
      </div>
    );
  }

  return null;
};

export default ESewaPayment;