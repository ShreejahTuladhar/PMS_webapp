import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import EntryExit from './EntryExit';

jest.useFakeTimers();

const vehicleData = {
    licensePlate: 'BA 2 PA 1234',
    type: 'car',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'white'
};

const ticketData = {
    id: 'PKG-123456789',
    vehiclePlate: 'BA 2 PA 1234',
    entryTime: new Date().toISOString(),
    location: {
        name: 'Downtown Parking Plaza',
        address: '123 Main Street, Kathmandu',
        spaceNumber: 'A12',
        level: 2
    },
    pricing: {
        hourlyRate: 150,
        dailyRate: 1200,
        currency: 'NPR'
    },
    status: 'active',
    qrCode: '{}'
};

describe('EntryExit', () => {
    it('renders entry mode initial UI', () => {
        render(
            <EntryExit
                mode="entry"
                vehicleData={vehicleData}
                onComplete={jest.fn()}
                onBack={jest.fn()}
            />
        );
        expect(screen.getByText('Park Entry')).toBeInTheDocument();
        expect(screen.getByText('Ready to Enter?')).toBeInTheDocument();
        expect(screen.getByText('Generate Ticket & Enter')).toBeInTheDocument();
        expect(screen.getByText(vehicleData.licensePlate)).toBeInTheDocument();
    });

    it('renders exit mode initial UI', () => {
        render(
            <EntryExit
                mode="exit"
                vehicleData={vehicleData}
                ticketData={ticketData}
                onComplete={jest.fn()}
                onBack={jest.fn()}
            />
        );
        expect(screen.getByText('Exit Process')).toBeInTheDocument();
        expect(screen.getByText('Ready to Exit?')).toBeInTheDocument();
        expect(screen.getByText('Process Payment & Exit')).toBeInTheDocument();
        expect(screen.getByText(vehicleData.licensePlate)).toBeInTheDocument();
    });

    it('calls onBack when back button is clicked', () => {
        const onBack = jest.fn();
        render(
            <EntryExit
                mode="entry"
                vehicleData={vehicleData}
                onComplete={jest.fn()}
                onBack={onBack}
            />
        );
        fireEvent.click(screen.getByText(/← Back/i));
        expect(onBack).toHaveBeenCalled();
    });

    it('processes entry and shows success state', async () => {
        const onComplete = jest.fn();
        render(
            <EntryExit
                mode="entry"
                vehicleData={vehicleData}
                onComplete={onComplete}
                onBack={jest.fn()}
            />
        );
        fireEvent.click(screen.getByText('Generate Ticket & Enter'));
        // Processing state
        expect(screen.getByText('Generating Your Digital Ticket...')).toBeInTheDocument();
        // Advance timers for async processing
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });
        // Success state after 1s
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByText("Welcome! You're All Set!")).toBeInTheDocument();
        expect(screen.getByText('Continue to Parking')).toBeInTheDocument();
        // Complete
        fireEvent.click(screen.getByText('Continue to Parking'));
        expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
            id: expect.stringMatching(/^PKG-/),
            vehiclePlate: vehicleData.licensePlate,
            status: 'active'
        }));
    });

    it('processes exit and shows success state', async () => {
        const onComplete = jest.fn();
        render(
            <EntryExit
                mode="exit"
                vehicleData={vehicleData}
                ticketData={ticketData}
                onComplete={onComplete}
                onBack={jest.fn()}
            />
        );
        fireEvent.click(screen.getByText('Process Payment & Exit'));
        expect(screen.getByText('Processing Exit...')).toBeInTheDocument();
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByText('Thank You for Parking with Us!')).toBeInTheDocument();
        expect(screen.getByText('Return Home')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Return Home'));
        expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
            exitTime: expect.any(String),
            id: ticketData.id
        }));
    });

    it('shows QR code in entry success state', async () => {
        render(
            <EntryExit
                mode="entry"
                vehicleData={vehicleData}
                onComplete={jest.fn()}
                onBack={jest.fn()}
            />
        );
        fireEvent.click(screen.getByText('Generate Ticket & Enter'));
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByText('Scan this QR code at exit')).toBeInTheDocument();
        // QRCodeSVG renders an <svg>
        expect(screen.getByRole('img')).toBeInTheDocument();
    });
});

// We recommend installing an extension to run jest tests.