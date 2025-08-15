# 🖼️ Landmark Images Directory Structure

This directory contains authentic Kathmandu Valley landmark images for the ParkSathi marketing system.

## Directory Structure

```
public/images/
├── landmarks/                    # Landmark-specific images
│   ├── kathmandu-durbar-square-banner.jpg     (800x400)
│   ├── kathmandu-durbar-square-thumb.jpg      (400x300)
│   ├── kathmandu-durbar-square-marketing.jpg  (600x400)
│   ├── patan-durbar-square-banner.jpg
│   ├── patan-durbar-square-thumb.jpg
│   ├── patan-durbar-square-marketing.jpg
│   ├── bhaktapur-durbar-square-banner.jpg
│   ├── bhaktapur-durbar-square-thumb.jpg
│   ├── bhaktapur-durbar-square-marketing.jpg
│   ├── pashupatinath-temple-banner.jpg
│   ├── pashupatinath-temple-thumb.jpg
│   ├── pashupatinath-temple-marketing.jpg
│   ├── boudhanath-stupa-banner.jpg
│   ├── boudhanath-stupa-thumb.jpg
│   ├── boudhanath-stupa-marketing.jpg
│   ├── swayambhunath-banner.jpg
│   ├── swayambhunath-thumb.jpg
│   ├── swayambhunath-marketing.jpg
│   ├── garden-of-dreams-banner.jpg
│   ├── garden-of-dreams-thumb.jpg
│   ├── garden-of-dreams-marketing.jpg
│   ├── thamel-banner.jpg
│   ├── thamel-thumb.jpg
│   ├── thamel-marketing.jpg
│   ├── tribhuvan-university-banner.jpg
│   ├── tribhuvan-university-thumb.jpg
│   ├── tribhuvan-university-marketing.jpg
│   └── ... (more landmarks)
│
├── categories/                   # Category default images
│   ├── heritage-banner.jpg
│   ├── heritage-thumb.jpg
│   ├── religious-banner.jpg
│   ├── religious-thumb.jpg
│   ├── educational-banner.jpg
│   ├── educational-thumb.jpg
│   ├── commercial-banner.jpg
│   ├── commercial-thumb.jpg
│   ├── tourist-banner.jpg
│   ├── tourist-thumb.jpg
│   ├── transportation-banner.jpg
│   ├── transportation-thumb.jpg
│   ├── medical-banner.jpg
│   ├── medical-thumb.jpg
│   ├── government-banner.jpg
│   ├── government-thumb.jpg
│   ├── viewpoints-banner.jpg
│   ├── viewpoints-thumb.jpg
│   ├── neighborhoods-banner.jpg
│   └── neighborhoods-thumb.jpg
│
├── default-parking-card.jpg     # Default card image
├── default-parking-banner.jpg   # Default banner image
└── placeholder-parking.jpg      # Loading placeholder
```

## Image Specifications

### Banner Images (800x400px)
- High resolution for hero banners
- Optimized for text overlay
- Landscape orientation
- Professional quality

### Thumbnail Images (400x300px) 
- For marketing cards
- Clear landmark visibility
- Good contrast
- Web optimized

### Marketing Images (600x400px)
- For promotional materials
- Balanced resolution
- Versatile usage
- Social media ready

## Landmark Coverage

### 🏛️ Heritage Sites
- Kathmandu Durbar Square
- Patan Durbar Square  
- Bhaktapur Durbar Square
- Hanuman Dhoka
- Basantapur Durbar Square
- Changunarayan Temple

### 🕉️ Religious Sites
- Pashupatinath Temple
- Boudhanath Stupa
- Swayambhunath (Monkey Temple)

### 🎒 Tourist Attractions
- Garden of Dreams
- Thamel
- Nagarkot
- Sarangkot

### 🎓 Educational Institutions
- Tribhuvan University
- Kathmandu University

### 🛒 Commercial Areas
- New Road
- Asan Bazaar

### 🚌 Transportation Hubs
- Ratna Park Bus Station
- Old Bus Park

### 🏛️ Government Buildings
- Singha Durbar

### 🏥 Medical Centers
- Bir Hospital
- TU Teaching Hospital

## Usage in Components

The `landmarkImagesService` automatically:
1. **Matches landmarks** by name with fuzzy matching
2. **Provides fallbacks** using category defaults
3. **Handles errors** with Unsplash backup images
4. **Optimizes loading** with responsive sizing

## Image Sources

- **Local Images**: Authentic photos of Kathmandu Valley landmarks
- **Fallback Images**: High-quality Unsplash images
- **Placeholder**: Loading states and errors

## Implementation Notes

- All images are web-optimized
- Progressive loading supported
- Responsive image sizing
- Error handling with graceful fallbacks
- SEO-friendly alt texts
- Cultural sensitivity maintained

## Future Enhancements

- [ ] WebP format support
- [ ] Lazy loading implementation
- [ ] Image CDN integration
- [ ] Multi-language descriptions
- [ ] Seasonal image variants
- [ ] User-contributed photos