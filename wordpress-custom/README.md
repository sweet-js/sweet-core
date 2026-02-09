# WordPress Custom Files - Sweet 'n Sassy
## Food Truck & Catering Business

This folder contains all the custom WordPress files and configuration documents for your Sweet 'n Sassy website.

---

## 📁 Files Overview

### **Configuration Documents:**

1. **`THEME_CONFIGURATION_PLAN.md`**
   - Recommended WordPress theme (Astra)
   - Required plugins list
   - Theme setup instructions
   - Color scheme and typography settings
   - Performance optimization checklist

2. **`SITE_STRUCTURE.md`**
   - Complete page structure and content recommendations
   - Menu organization
   - WooCommerce product categories
   - SEO considerations
   - Implementation checklist

### **Code Files:**

3. **`custom-style.css`**
   - Complete custom CSS styling
   - Brand colors and typography
   - Responsive navigation
   - Food gallery styling
   - WooCommerce product styling
   - Mobile-optimized layouts
   - Form styling
   - Hero section styles

4. **`functions.php`**
   - Custom image sizes (menu items, hero, gallery)
   - WooCommerce customization
   - Food Truck Locations custom post type
   - Custom meta fields for locations (date, time, address, coordinates)
   - Performance optimizations
   - Widget areas
   - Helper functions

---

## 🚀 Quick Start Guide

### Step 1: Install Theme
1. Install **Astra** theme (recommended)
2. Follow instructions in `THEME_CONFIGURATION_PLAN.md`

### Step 2: Add Custom Code
1. **Add CSS:**
   - Go to **Appearance → Customize → Additional CSS**
   - Copy and paste contents of `custom-style.css`
   - OR create a child theme and add to `style.css`

2. **Add Functions:**
   - Go to **Appearance → Theme Editor → functions.php**
   - Copy and paste contents of `functions.php`
   - OR create a child theme and add to `functions.php`
   - ⚠️ **IMPORTANT:** Always use a child theme in production!

### Step 3: Create Pages
1. Follow the structure in `SITE_STRUCTURE.md`
2. Create all 7 required pages
3. Set up menus and navigation

### Step 4: Set Up WooCommerce
1. Install WooCommerce plugin
2. Create product categories
3. Add products with images from `../wordpress-assets/food-photos/`

### Step 5: Configure Custom Post Type
1. The Food Truck Locations post type is automatically registered
2. Go to **Locations → Add New** in WordPress admin
3. Add location entries with date, time, address, coordinates

---

## 🎨 Brand Colors

The CSS uses these brand colors (defined in `:root` variables):

- **Primary:** `#D4A574` (Warm Gold)
- **Secondary:** `#8B4513` (Saddle Brown)
- **Accent:** `#FF6B35` (Vibrant Orange)
- **Dark:** `#2C2C2C` (Text Color)
- **Light:** `#F8F6F3` (Backgrounds)

---

## 📐 Custom Image Sizes

The `functions.php` file registers these custom image sizes:

- **menu-item:** 400x400px (square, cropped)
- **menu-item-thumb:** 200x200px (square, cropped)
- **hero-image:** 1920x800px (wide, cropped)
- **hero-image-mobile:** 768x400px (mobile hero)
- **gallery-large:** 1920x1080px (uncropped)
- **gallery-medium:** 800x600px (cropped)
- **gallery-thumb:** 300x300px (cropped)
- **food-showcase:** 600x800px (portrait, cropped)
- **location-image:** 1200x600px (wide, cropped)
- **recipe-image:** 1200x675px (cropped)

---

## 🗺️ Food Truck Locations Custom Post Type

### Features:
- Custom post type: "Food Truck Locations"
- Custom fields:
  - Date
  - Start Time
  - End Time
  - Address
  - Latitude
  - Longitude
  - Phone (optional)

### Usage:
1. Go to **Locations → Add New** in WordPress admin
2. Fill in location details
3. Use helper function `sweetnsassy_format_location_datetime($post_id)` to display formatted date/time
4. Use `sweetnsassy_get_location_meta($post_id, 'address')` to get location data

### Display Example:
```php
<?php
$args = array(
    'post_type' => 'food_truck_location',
    'posts_per_page' => 10,
    'meta_key' => '_location_date',
    'orderby' => 'meta_value',
    'order' => 'ASC',
    'meta_query' => array(
        array(
            'key' => '_location_date',
            'value' => date('Y-m-d'),
            'compare' => '>='
        )
    )
);
$locations = new WP_Query($args);

if ($locations->have_posts()) {
    while ($locations->have_posts()) {
        $locations->the_post();
        $date_time = sweetnsassy_format_location_datetime(get_the_ID());
        $address = sweetnsassy_get_location_meta(get_the_ID(), 'address');
        // Display location...
    }
}
?>
```

---

## 🛒 WooCommerce Customizations

### Changes Made:
- Products per row: 3
- Products per page: 12
- "Add to Cart" button text changed to "Order Now"
- Custom product image sizes
- Theme support for WooCommerce gallery features

### Product Setup:
1. Create products in **Products → Add New**
2. Assign to categories (Appetizers, Entrees, etc.)
3. Set featured image from `../wordpress-assets/food-photos/`
4. Add description, price, inventory
5. Publish

---

## ⚡ Performance Optimizations

The `functions.php` includes:

- ✅ Removed emoji scripts
- ✅ Removed unnecessary header links
- ✅ Disabled XML-RPC
- ✅ Disabled WordPress embeds
- ✅ Limited post revisions (3 max)
- ✅ Increased memory limit (256M)
- ✅ Enabled lazy loading

**Additional Recommendations:**
- Install caching plugin (WP Rocket or W3 Total Cache)
- Use CDN (Cloudflare)
- Optimize images (Smush or ShortPixel)
- Enable GZIP compression

---

## 📱 Mobile Responsiveness

All CSS includes mobile breakpoints:

- **Desktop:** 1024px+
- **Tablet:** 768px - 1024px
- **Mobile:** < 768px
- **Small Mobile:** < 480px

The navigation automatically converts to hamburger menu on mobile.

---

## 🔧 Customization Tips

### Change Colors:
Edit the CSS variables in `custom-style.css`:
```css
:root {
    --color-primary: #D4A574;
    --color-secondary: #8B4513;
    --color-accent: #FF6B35;
    /* etc. */
}
```

### Change Fonts:
Update the font variables or enqueue different Google Fonts in `functions.php`.

### Add More Image Sizes:
Add to `sweetnsassy_image_sizes()` function in `functions.php`.

---

## ⚠️ Important Notes

1. **Child Theme:** Always use a child theme in production to preserve customizations during theme updates.

2. **Backup:** Always backup your site before making changes.

3. **Testing:** Test all functionality after adding custom code:
   - Forms work correctly
   - Images display properly
   - Mobile responsiveness
   - WooCommerce ordering flow
   - Location tracker functionality

4. **Updates:** Keep WordPress, themes, and plugins updated for security.

---

## 📚 Additional Resources

- **WordPress Codex:** https://codex.wordpress.org/
- **Astra Theme Docs:** https://wpastra.com/docs/
- **WooCommerce Docs:** https://woocommerce.com/documentation/
- **Google Maps API:** https://developers.google.com/maps/documentation

---

## 🆘 Troubleshooting

### CSS Not Loading:
- Check if CSS is added to Additional CSS or child theme
- Clear cache (browser and WordPress cache)
- Check for CSS syntax errors

### Custom Post Type Not Showing:
- Go to **Settings → Permalinks** and click "Save Changes" to flush rewrite rules

### Images Not Displaying:
- Regenerate thumbnails using "Regenerate Thumbnails" plugin
- Check image paths are correct
- Verify images are uploaded to Media Library

### WooCommerce Issues:
- Ensure WooCommerce is installed and activated
- Check that theme supports WooCommerce
- Verify product images are set

---

## ✅ Pre-Launch Checklist

- [ ] All pages created and published
- [ ] Menu structure set up
- [ ] WooCommerce products added
- [ ] Images uploaded and assigned
- [ ] Forms tested and working
- [ ] Location tracker configured
- [ ] Mobile responsiveness tested
- [ ] SEO plugin configured
- [ ] Analytics installed (Google Analytics)
- [ ] SSL certificate active (HTTPS)
- [ ] Backup system configured
- [ ] Contact information verified
- [ ] Social media links added
- [ ] Performance optimized
- [ ] Security plugin installed

---

**Created for:** Sweet 'n Sassy Food Truck & Catering  
**Date:** February 2025  
**Version:** 1.0
