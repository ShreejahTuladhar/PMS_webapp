import { useState } from 'react';

function PaymentVerification({ ticketData, onComplete, onBack }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentStep, setPaymentStep] = useState('review'); // review, processing, success
  const [paymentData, setPaymentData] = useState(null);

  const entryTime = new Date(ticketData.entryTime);
  const exitTime = new Date();
  const totalMinutes = Math.floor((exitTime - entryTime) / (1000 * 60));
  const totalHours = Math.ceil(totalMinutes / 60); // Round up for billing
  
  const baseAmount = totalHours * ticketData.pricing.hourlyRate;
  const serviceFee = Math.round(baseAmount * 0.03); // 3% service fee
  const tax = Math.round((baseAmount + serviceFee) * 0.13); // 13% tax
  const totalAmount = baseAmount + serviceFee + tax;

  const parkingDuration = {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    totalDisplay: totalMinutes < 60 
      ? `${totalMinutes} minutes` 
      : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '',
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'digital',
      name: 'Digital Wallet',
      icon: '',
      description: 'eSewa, Khalti, PayPal'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: '',
      description: 'Direct bank account transfer'
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const payment = {
      id: `PAY-${Date.now()}`,
      ticketId: ticketData.id,
      amount: totalAmount,
      method: paymentMethod,
      processedAt: new Date().toISOString(),
      status: 'completed',
      breakdown: {
        baseAmount,
        serviceFee,
        tax,
        totalAmount
      },
      duration: parkingDuration
    };

    setPaymentData(payment);
    setPaymentStep('success');
    setIsProcessing(false);
  };

  const handleComplete = () => {
    onComplete(paymentData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
      >
        ← Back to Ticket
      </button>

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
          <div className="text-center">
            <div className="text-5xl mb-4">
              {paymentStep === 'review' ? '' :
               paymentStep === 'processing' ? '⚡' : ''}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {paymentStep === 'review' ? 'Payment Summary' :
               paymentStep === 'processing' ? 'Processing Payment' : 
               'Payment Successful!'}
            </h2>
            <p className="text-blue-100">
              {paymentStep === 'review' ? 'Review your parking charges and complete payment' :
               paymentStep === 'processing' ? 'Please wait while we process your payment...' :
               'Thank you! Your exit is authorized.'}
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Review Step */}
          {paymentStep === 'review' && (
            <div className="space-y-6">
              {/* Parking Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                   Parking Summary
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {parkingDuration.totalDisplay}
                    </div>
                    <div className="text-sm text-gray-600">Total Duration</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {ticketData.location.spaceNumber}
                    </div>
                    <div className="text-sm text-gray-600">Parking Space</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entry Time:</span>
                    <span className="font-semibold">
                      {entryTime.toLocaleDateString()} {entryTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exit Time:</span>
                    <span className="font-semibold">
                      {exitTime.toLocaleDateString()} {exitTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold">
                      {ticketData.vehicleInfo?.licensePlate || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                  💰 Cost Breakdown
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">
                      Parking ({totalHours} hours × NPR {ticketData.pricing.hourlyRate})
                    </span>
                    <span className="font-semibold">NPR {baseAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Service Fee (3%)</span>
                    <span className="font-semibold">NPR {serviceFee}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tax (13%)</span>
                    <span className="font-semibold">NPR {tax}</span>
                  </div>
                  
                  <hr className="border-gray-300" />
                  
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xl font-bold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">NPR {totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-4">Choose Payment Method</h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-700">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                   Pay NPR {totalAmount} & Exit
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          )}

          {/* Processing Step */}
          {paymentStep === 'processing' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto relative">
                <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl">⚡</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  Processing Your Payment
                </h3>
                <p className="text-gray-600 mb-4">
                  Please wait while we securely process your payment of NPR {totalAmount}
                </p>
                
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    Connecting to secure payment gateway...
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  🔒 Your payment is secured with bank-level encryption
                </div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {paymentStep === 'success' && paymentData && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600">
                Thank you for using our parking service. Have a great day!
              </p>

              {/* Payment Receipt */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <h4 className="font-bold text-green-700 mb-4 flex items-center justify-center gap-2">
                  ✅ Payment Receipt
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono font-semibold">{paymentData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-600">NPR {paymentData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold capitalize">{paymentData.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Time:</span>
                    <span className="font-semibold">
                      {new Date(paymentData.processedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-xl text-sm text-gray-600">
                  📧 Receipt has been sent to your email address
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              >
                 Complete Exit Process
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentVerification;