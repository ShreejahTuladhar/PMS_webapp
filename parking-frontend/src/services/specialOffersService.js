/**
 * Special Offers Service
 * Handles peak hours detection, dynamic pricing, and special offers generation
 */

class SpecialOffersService {
  constructor() {
    this.offerTypes = {
      OFF_PEAK_DISCOUNT: 'off_peak_discount',
      STUDENT_SPECIAL: 'student_special',
      TOURIST_PACKAGE: 'tourist_package',
      FLASH_SALE: 'flash_sale',
      EARLY_BIRD: 'early_bird',
      WEEKEND_SPECIAL: 'weekend_special',
      LANDMARK_EXCLUSIVE: 'landmark_exclusive'
    };

    this.discountRanges = {
      off_peak: { min: 15, max: 25 },
      student: { min: 20, max: 30 },
      tourist: { min: 10, max: 20 },
      flash: { min: 30, max: 40 },
      early_bird: { min: 20, max: 25 },
      weekend: { min: 15, max: 30 }
    };
  }

  /**
   * Check if current time is within peak hours for a location
   */
  isCurrentlyPeakHours(location) {
    if (!location.peakHours || !Array.isArray(location.peakHours)) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    return location.peakHours.some(peakRange => {
      const [startTime, endTime] = peakRange.split('-');
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const peakStart = startHour * 60 + (startMin || 0);
      const peakEnd = endHour * 60 + (endMin || 0);
      
      return currentTime >= peakStart && currentTime <= peakEnd;
    });
  }

  /**
   * Get time until next peak hours or off-peak period
   */
  getTimeUntilNextPeriod(location) {
    if (!location.peakHours || !Array.isArray(location.peakHours)) {
      return null;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const isPeak = this.isCurrentlyPeakHours(location);

    let nextChange = null;
    let minDifference = Infinity;

    location.peakHours.forEach(peakRange => {
      const [startTime, endTime] = peakRange.split('-');
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const peakStart = startHour * 60 + (startMin || 0);
      const peakEnd = endHour * 60 + (endMin || 0);

      if (isPeak) {
        // Currently in peak, find next off-peak
        const timeToOffPeak = peakEnd - currentTime;
        if (timeToOffPeak > 0 && timeToOffPeak < minDifference) {
          minDifference = timeToOffPeak;
          nextChange = { type: 'off_peak', minutes: timeToOffPeak };
        }
      } else {
        // Currently off-peak, find next peak
        let timeToPeak = peakStart - currentTime;
        if (timeToPeak <= 0) {
          timeToPeak += 24 * 60; // Next day
        }
        if (timeToPeak < minDifference) {
          minDifference = timeToPeak;
          nextChange = { type: 'peak', minutes: timeToPeak };
        }
      }
    });

    return nextChange;
  }

  /**
   * Generate special offers based on location and timing
   */
  generateSpecialOffers(location) {
    const offers = [];
    const isPeakHours = this.isCurrentlyPeakHours(location);
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Off-peak discount
    if (!isPeakHours) {
      const discount = this.randomBetween(
        this.discountRanges.off_peak.min, 
        this.discountRanges.off_peak.max
      );
      
      offers.push({
        id: `off_peak_${location.id}`,
        type: this.offerTypes.OFF_PEAK_DISCOUNT,
        title: `${discount}% Off During Off-Peak Hours!`,
        description: `Save ₹${Math.round(location.hourlyRate * discount / 100)} per hour when you park now`,
        discount: discount,
        discountedPrice: Math.round(location.hourlyRate * (1 - discount / 100)),
        originalPrice: location.hourlyRate,
        validUntil: this.getNextPeakTime(location),
        badge: 'LIMITED TIME',
        color: 'green',
        icon: '⚡',
        urgency: 'medium'
      });
    }

    // Student special (educational locations)
    if (location.category === 'educational' && location.pricing?.studentDiscount > 0) {
      const discount = Math.round(location.pricing.studentDiscount * 100);
      offers.push({
        id: `student_${location.id}`,
        type: this.offerTypes.STUDENT_SPECIAL,
        title: `🎓 Student Special: ${discount}% Off`,
        description: `Show your student ID and save big at ${location.landmarkName}`,
        discount: discount,
        discountedPrice: Math.round(location.hourlyRate * (1 - location.pricing.studentDiscount)),
        originalPrice: location.hourlyRate,
        requirements: ['Valid student ID required'],
        badge: 'STUDENT ONLY',
        color: 'blue',
        icon: '🎓',
        urgency: 'low'
      });
    }

    // Tourist package (heritage/tourist locations)
    if (['heritage', 'tourist', 'religious'].includes(location.category) && location.pricing?.touristPackage) {
      offers.push({
        id: `tourist_${location.id}`,
        type: this.offerTypes.TOURIST_PACKAGE,
        title: `🎒 Tourist Day Pass: ₹${location.pricing.touristPackage}`,
        description: `All-day parking near ${location.landmarkName} with bonus perks`,
        packagePrice: location.pricing.touristPackage,
        savings: Math.round(location.hourlyRate * 8 - location.pricing.touristPackage),
        includes: ['All-day parking', 'Tourist information', 'Local guide recommendations'],
        badge: 'BEST VALUE',
        color: 'orange',
        icon: '🗺️',
        urgency: 'low'
      });
    }

    // Early bird special (before 8 AM)
    if (hour < 8 && !isPeakHours) {
      const discount = this.randomBetween(
        this.discountRanges.early_bird.min,
        this.discountRanges.early_bird.max
      );

      offers.push({
        id: `early_bird_${location.id}`,
        type: this.offerTypes.EARLY_BIRD,
        title: `🌅 Early Bird: ${discount}% Off`,
        description: `Beat the rush and save! Valid until 8:00 AM`,
        discount: discount,
        discountedPrice: Math.round(location.hourlyRate * (1 - discount / 100)),
        originalPrice: location.hourlyRate,
        validUntil: this.getTodayAtTime('08:00'),
        badge: 'EARLY BIRD',
        color: 'yellow',
        icon: '🌅',
        urgency: 'high'
      });
    }

    // Weekend special
    if (isWeekend && !isPeakHours) {
      const discount = this.randomBetween(
        this.discountRanges.weekend.min,
        this.discountRanges.weekend.max
      );

      offers.push({
        id: `weekend_${location.id}`,
        type: this.offerTypes.WEEKEND_SPECIAL,
        title: `🎉 Weekend Special: ${discount}% Off`,
        description: `Enjoy your weekend with discounted parking!`,
        discount: discount,
        discountedPrice: Math.round(location.hourlyRate * (1 - discount / 100)),
        originalPrice: location.hourlyRate,
        badge: 'WEEKEND ONLY',
        color: 'purple',
        icon: '🎉',
        urgency: 'medium'
      });
    }

    // Flash sale (random chance during off-peak)
    if (!isPeakHours && Math.random() < 0.15) { // 15% chance
      const discount = this.randomBetween(
        this.discountRanges.flash.min,
        this.discountRanges.flash.max
      );

      const endTime = new Date(now.getTime() + (30 + Math.random() * 90) * 60000); // 30-120 minutes

      offers.push({
        id: `flash_${location.id}`,
        type: this.offerTypes.FLASH_SALE,
        title: `⚡ FLASH SALE: ${discount}% OFF!`,
        description: `Mega savings right now! Limited time only`,
        discount: discount,
        discountedPrice: Math.round(location.hourlyRate * (1 - discount / 100)),
        originalPrice: location.hourlyRate,
        validUntil: endTime,
        badge: 'FLASH SALE',
        color: 'red',
        icon: '⚡',
        urgency: 'critical',
        isFlashSale: true
      });
    }

    return offers;
  }

  /**
   * Check if location has active special offers
   */
  hasActiveOffers(location) {
    const offers = this.generateSpecialOffers(location);
    return offers.length > 0;
  }

  /**
   * Get peak hours surge pricing info
   */
  getPeakHoursSurgeInfo(location) {
    const isPeakHours = this.isCurrentlyPeakHours(location);
    
    if (!isPeakHours) {
      return null;
    }

    const nextOffPeak = this.getTimeUntilNextPeriod(location);
    
    return {
      isPeakHours: true,
      surgeMultiplier: 1.2, // 20% surge during peak hours
      surgePrice: Math.round(location.hourlyRate * 1.2),
      originalPrice: location.hourlyRate,
      message: 'Peak hours pricing in effect',
      timeUntilOffPeak: nextOffPeak?.minutes || null,
      peakHours: location.peakHours
    };
  }

  /**
   * Format time remaining for display
   */
  formatTimeRemaining(minutes) {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get best offer for display
   */
  getBestOffer(location) {
    const offers = this.generateSpecialOffers(location);
    
    if (offers.length === 0) {
      return null;
    }

    // Prioritize by urgency and discount amount
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    
    return offers.sort((a, b) => {
      const urgencyDiff = priorityOrder.indexOf(a.urgency) - priorityOrder.indexOf(b.urgency);
      if (urgencyDiff !== 0) return urgencyDiff;
      
      return (b.discount || 0) - (a.discount || 0);
    })[0];
  }

  /**
   * Utility functions
   */
  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getTodayAtTime(timeString) {
    const [hour, minute] = timeString.split(':').map(Number);
    const today = new Date();
    today.setHours(hour, minute || 0, 0, 0);
    return today;
  }

  getNextPeakTime(location) {
    const nextPeriod = this.getTimeUntilNextPeriod(location);
    if (!nextPeriod || nextPeriod.type !== 'peak') {
      return null;
    }
    
    const nextTime = new Date();
    nextTime.setMinutes(nextTime.getMinutes() + nextPeriod.minutes);
    return nextTime;
  }
}

export default new SpecialOffersService();