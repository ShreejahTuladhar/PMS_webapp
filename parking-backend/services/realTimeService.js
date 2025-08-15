/**
 * Real-Time Communication Service for ParkSathi
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * WebSocket-based real-time updates and notifications
 */

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingLocation = require('../models/ParkingLocation');

class RealTimeService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
        this.locationSubscriptions = new Map();
    }

    initialize(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        this.setupMiddleware();
        this.setupEventHandlers();
        console.log('✅ Real-time service initialized');
    }

    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId).select('-password');
                
                if (!user) {
                    return next(new Error('User not found'));
                }

                socket.userId = user._id.toString();
                socket.userRole = user.role;
                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
            
            socket.on('subscribe:location', (locationId) => {
                this.handleLocationSubscription(socket, locationId);
            });

            socket.on('unsubscribe:location', (locationId) => {
                this.handleLocationUnsubscription(socket, locationId);
            });

            socket.on('subscribe:bookings', () => {
                this.handleBookingSubscription(socket);
            });

            socket.on('request:parking:status', (locationId) => {
                this.handleParkingStatusRequest(socket, locationId);
            });

            socket.on('booking:update', (data) => {
                this.handleBookingUpdate(socket, data);
            });

            socket.on('disconnect', () => {
                this.handleDisconnection(socket);
            });
        });
    }

    handleConnection(socket) {
        this.connectedUsers.set(socket.userId, {
            socketId: socket.id,
            user: socket.user,
            connectedAt: new Date(),
            subscriptions: new Set()
        });

        socket.emit('connection:success', {
            message: 'Connected to ParkSathi real-time service',
            userId: socket.userId,
            timestamp: new Date()
        });

        console.log(`👤 User ${socket.user.firstName} connected (${socket.id})`);
    }

    handleLocationSubscription(socket, locationId) {
        if (!locationId) return;

        const userSession = this.connectedUsers.get(socket.userId);
        if (userSession) {
            userSession.subscriptions.add(`location:${locationId}`);
        }

        if (!this.locationSubscriptions.has(locationId)) {
            this.locationSubscriptions.set(locationId, new Set());
        }
        
        this.locationSubscriptions.get(locationId).add(socket.id);
        socket.join(`location:${locationId}`);

        // Send current location status
        this.sendLocationStatus(socket, locationId);
        
        console.log(`📍 User ${socket.userId} subscribed to location ${locationId}`);
    }

    handleLocationUnsubscription(socket, locationId) {
        if (!locationId) return;

        const userSession = this.connectedUsers.get(socket.userId);
        if (userSession) {
            userSession.subscriptions.delete(`location:${locationId}`);
        }

        if (this.locationSubscriptions.has(locationId)) {
            this.locationSubscriptions.get(locationId).delete(socket.id);
        }
        
        socket.leave(`location:${locationId}`);
        console.log(`📍 User ${socket.userId} unsubscribed from location ${locationId}`);
    }

    handleBookingSubscription(socket) {
        socket.join(`user:bookings:${socket.userId}`);
        console.log(`📋 User ${socket.userId} subscribed to booking updates`);
    }

    async handleParkingStatusRequest(socket, locationId) {
        try {
            const location = await ParkingLocation.findById(locationId);
            if (!location) {
                socket.emit('error', { message: 'Location not found' });
                return;
            }

            const activeBookings = await Booking.countDocuments({
                parkingLocationId: locationId,
                status: 'active'
            });

            const status = {
                locationId,
                totalSpaces: location.totalSpaces,
                occupiedSpaces: activeBookings,
                availableSpaces: location.totalSpaces - activeBookings,
                utilizationRate: (activeBookings / location.totalSpaces) * 100,
                timestamp: new Date()
            };

            socket.emit('parking:status', status);
        } catch (error) {
            socket.emit('error', { message: 'Failed to fetch parking status' });
        }
    }

    async handleBookingUpdate(socket, data) {
        if (socket.userRole !== 'admin' && socket.userRole !== 'operator') {
            socket.emit('error', { message: 'Unauthorized operation' });
            return;
        }

        try {
            const { bookingId, action, data: updateData } = data;
            const booking = await Booking.findById(bookingId);
            
            if (!booking) {
                socket.emit('error', { message: 'Booking not found' });
                return;
            }

            // Process the update based on action
            let updatedBooking;
            switch (action) {
                case 'confirm':
                    updatedBooking = await Booking.findByIdAndUpdate(
                        bookingId,
                        { status: 'active', checkInTime: new Date() },
                        { new: true }
                    );
                    break;
                case 'complete':
                    updatedBooking = await Booking.findByIdAndUpdate(
                        bookingId,
                        { status: 'completed', checkOutTime: new Date() },
                        { new: true }
                    );
                    break;
                case 'cancel':
                    updatedBooking = await Booking.findByIdAndUpdate(
                        bookingId,
                        { status: 'cancelled' },
                        { new: true }
                    );
                    break;
                default:
                    socket.emit('error', { message: 'Invalid action' });
                    return;
            }

            // Notify all relevant parties
            this.broadcastBookingUpdate(updatedBooking);
            this.updateLocationAvailability(booking.parkingLocationId);
            
        } catch (error) {
            socket.emit('error', { message: 'Failed to update booking' });
        }
    }

    handleDisconnection(socket) {
        // Clean up user session
        this.connectedUsers.delete(socket.userId);
        
        // Clean up location subscriptions
        this.locationSubscriptions.forEach((subscribers, locationId) => {
            subscribers.delete(socket.id);
            if (subscribers.size === 0) {
                this.locationSubscriptions.delete(locationId);
            }
        });

        console.log(`👤 User ${socket.userId} disconnected`);
    }

    // Broadcasting Methods
    async broadcastLocationUpdate(locationId, updateType = 'availability') {
        try {
            const location = await ParkingLocation.findById(locationId);
            const activeBookings = await Booking.countDocuments({
                parkingLocationId: locationId,
                status: 'active'
            });

            const update = {
                type: updateType,
                locationId,
                totalSpaces: location.totalSpaces,
                availableSpaces: location.totalSpaces - activeBookings,
                occupiedSpaces: activeBookings,
                utilizationRate: (activeBookings / location.totalSpaces) * 100,
                timestamp: new Date()
            };

            this.io.to(`location:${locationId}`).emit('location:update', update);
            console.log(`📡 Broadcasted location update for ${locationId}`);
        } catch (error) {
            console.error('Failed to broadcast location update:', error);
        }
    }

    broadcastBookingUpdate(booking) {
        // Notify the booking owner
        this.io.to(`user:bookings:${booking.userId}`).emit('booking:update', {
            type: 'status_change',
            booking,
            timestamp: new Date()
        });

        // Notify location subscribers
        this.io.to(`location:${booking.parkingLocationId}`).emit('location:booking:update', {
            type: 'booking_status_change',
            bookingId: booking._id,
            status: booking.status,
            locationId: booking.parkingLocationId,
            timestamp: new Date()
        });
    }

    async updateLocationAvailability(locationId) {
        await this.broadcastLocationUpdate(locationId, 'availability');
    }

    // Admin/Operator specific broadcasts
    broadcastSystemAlert(alert, targetRole = null) {
        const emission = targetRole ? 
            this.io.to(`role:${targetRole}`) : 
            this.io;

        emission.emit('system:alert', {
            ...alert,
            timestamp: new Date()
        });
    }

    // Analytics broadcasts
    broadcastAnalyticsUpdate(analytics) {
        this.io.to('role:admin').emit('analytics:update', {
            ...analytics,
            timestamp: new Date()
        });
    }

    // Emergency broadcasts
    broadcastEmergencyNotification(notification) {
        this.io.emit('emergency:notification', {
            ...notification,
            timestamp: new Date(),
            priority: 'high'
        });
    }

    async sendLocationStatus(socket, locationId) {
        try {
            const location = await ParkingLocation.findById(locationId);
            if (!location) return;

            const activeBookings = await Booking.countDocuments({
                parkingLocationId: locationId,
                status: 'active'
            });

            const status = {
                locationId,
                name: location.name,
                totalSpaces: location.totalSpaces,
                availableSpaces: location.totalSpaces - activeBookings,
                occupiedSpaces: activeBookings,
                utilizationRate: (activeBookings / location.totalSpaces) * 100,
                operatingHours: location.operatingHours,
                pricing: location.pricing,
                timestamp: new Date()
            };

            socket.emit('location:status', status);
        } catch (error) {
            console.error('Failed to send location status:', error);
        }
    }

    // Utility methods
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    getLocationSubscribersCount(locationId) {
        return this.locationSubscriptions.get(locationId)?.size || 0;
    }

    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }

    async notifyUser(userId, notification) {
        const userSession = this.connectedUsers.get(userId);
        if (userSession) {
            this.io.to(userSession.socketId).emit('notification', {
                ...notification,
                timestamp: new Date()
            });
            return true;
        }
        return false;
    }
}

module.exports = new RealTimeService();