# Food Truck Location Tracker Setup Guide
## Sweet 'n Sassy

---

## 📍 Overview

The Food Truck Locations custom post type allows you to easily manage and display your food truck schedule. This guide covers setup, usage, and display options.

---

## 🚀 Initial Setup

### Step 1: Verify Custom Post Type is Active

The custom post type is automatically registered when you add the `functions.php` code to your theme. Verify it's working:

1. Go to **WordPress Admin Dashboard**
2. Look for **"Locations"** in the left sidebar menu
3. You should see the menu item with a location pin icon

If you don't see it:
- Check that `functions.php` code is active
- Go to **Settings → Permalinks** and click "Save Changes" to flush rewrite rules
- Clear any caching

---

## ➕ Adding a New Location

### Step 2: Create a Location Entry

1. Go to **Locations → Add New**
2. **Title:** Enter location name or event name
   - Example: "Downtown Farmers Market"
   - Example: "City Park - Food Truck Friday"
   - Example: "Corporate Office - ABC Company"

3. **Content Editor:** Add description (optional)
   - Event details
   - Special notes
   - What to expect

4. **Featured Image:** Upload location photo (optional)
   - Use images from `wordpress-assets/hero/` folder
   - Or upload location-specific photos

5. **Location Details Meta Box:** Fill in all fields:
   - **Date:** Select event date (date picker)
   - **Start Time:** When truck arrives (time picker)
   - **End Time:** When truck leaves (time picker)
   - **Address:** Full street address
     - Example: "123 Main Street, City, State 12345"
   - **Latitude:** Get from Google Maps (see below)
   - **Longitude:** Get from Google Maps (see below)
   - **Phone:** Optional contact number for that location

6. **Publish:** Click "Publish" when ready

---

## 🗺️ Getting Latitude and Longitude

### Method 1: Google Maps (Easiest)

1. Go to https://www.google.com/maps
2. Search for your location address
3. Right-click on the exact location pin
4. Click the coordinates at the top (e.g., "40.7128, -74.0060")
5. Copy the numbers:
   - First number = Latitude
   - Second number = Longitude

### Method 2: Online Tools

1. Use https://www.latlong.net/
2. Enter address
3. Copy latitude and longitude

### Method 3: Google Maps Embed (Alternative)

If you don't want to use coordinates, you can embed maps using just the address (see Display Options section).

---

## 📅 Weekly Location Template

### Quick Entry Template

Use this template for quick weekly entries:

**Monday:**
- Title: "Monday - [Location Name]"
- Date: [This Monday's date]
- Time: 11:00 AM - 2:00 PM
- Address: [Address]
- Coordinates: [Lat, Long]

**Tuesday:**
- Title: "Tuesday - [Location Name]"
- Date: [This Tuesday's date]
- Time: 11:00 AM - 2:00 PM
- Address: [Address]
- Coordinates: [Lat, Long]

**Wednesday:**
- Title: "Wednesday - [Location Name]"
- Date: [This Wednesday's date]
- Time: 11:00 AM - 2:00 PM
- Address: [Address]
- Coordinates: [Lat, Long]

**Thursday:**
- Title: "Thursday - [Location Name]"
- Date: [This Thursday's date]
- Time: 11:00 AM - 2:00 PM
- Address: [Address]
- Coordinates: [Lat, Long]

**Friday:**
- Title: "Friday - [Location Name]"
- Date: [This Friday's date]
- Time: 11:00 AM - 7:00 PM
- Address: [Address]
- Coordinates: [Lat, Long]

**Saturday:**
- Title: "Saturday - [Location Name]"
- Date: [This Saturday's date]
- Time: 10:00 AM - 8:00 PM
- Address: [Address]
- Coordinates: [Lat, Long]

**Sunday:**
- Title: "Sunday - [Location Name]"
- Date: [This Sunday's date]
- Time: 10:00 AM - 6:00 PM
- Address: [Address]
- Coordinates: [Lat, Long]

---

## 🎨 Display Options

### Option 1: List View (Simple)

Display locations as a simple list on your Locations page.

**PHP Code:**
```php
<?php
$args = array(
    'post_type' => 'food_truck_location',
    'posts_per_page' => -1,
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
    echo '<div class="location-list">';
    while ($locations->have_posts()) {
        $locations->the_post();
        $date = get_post_meta(get_the_ID(), '_location_date', true);
        $start_time = get_post_meta(get_the_ID(), '_location_start_time', true);
        $end_time = get_post_meta(get_the_ID(), '_location_end_time', true);
        $address = get_post_meta(get_the_ID(), '_location_address', true);
        ?>
        <div class="location-item">
            <h3><?php the_title(); ?></h3>
            <p class="location-date"><?php echo date('F j, Y', strtotime($date)); ?></p>
            <p class="location-time"><?php echo date('g:i A', strtotime($start_time)); ?> - <?php echo date('g:i A', strtotime($end_time)); ?></p>
            <p class="location-address"><?php echo esc_html($address); ?></p>
            <a href="https://www.google.com/maps/search/?api=1&query=<?php echo urlencode($address); ?>" target="_blank" class="button">Get Directions</a>
        </div>
        <?php
    }
    echo '</div>';
    wp_reset_postdata();
}
?>
```

### Option 2: Map View (Google Maps)

Display locations on an interactive Google Map.

**Step 1: Get Google Maps API Key**

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable "Maps JavaScript API"
4. Create API key
5. Restrict API key to your domain (recommended)

**Step 2: Add API Key to WordPress**

Add to your theme's `functions.php` or use a plugin:
```php
function sweetnsassy_enqueue_google_maps() {
    wp_enqueue_script('google-maps', 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap', array(), null, true);
}
add_action('wp_enqueue_scripts', 'sweetnsassy_enqueue_google_maps');
```

**Step 3: Create Map Display**

```php
<?php
$args = array(
    'post_type' => 'food_truck_location',
    'posts_per_page' => -1,
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
?>

<div id="map" style="height: 500px; width: 100%;"></div>

<script>
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: YOUR_DEFAULT_LAT, lng: YOUR_DEFAULT_LNG}
    });
    
    var markers = [];
    var infoWindows = [];
    
    <?php
    if ($locations->have_posts()) {
        while ($locations->have_posts()) {
            $locations->the_post();
            $lat = get_post_meta(get_the_ID(), '_location_latitude', true);
            $lng = get_post_meta(get_the_ID(), '_location_longitude', true);
            $address = get_post_meta(get_the_ID(), '_location_address', true);
            $date = get_post_meta(get_the_ID(), '_location_date', true);
            $start_time = get_post_meta(get_the_ID(), '_location_start_time', true);
            $end_time = get_post_meta(get_the_ID(), '_location_end_time', true);
            ?>
            var marker = new google.maps.Marker({
                position: {lat: <?php echo $lat; ?>, lng: <?php echo $lng; ?>},
                map: map,
                title: '<?php echo esc_js(get_the_title()); ?>'
            });
            
            var infoWindow = new google.maps.InfoWindow({
                content: '<div class="map-info"><h3><?php echo esc_js(get_the_title()); ?></h3><p><?php echo esc_js($address); ?></p><p><?php echo date('F j, Y', strtotime($date)); ?> <?php echo date('g:i A', strtotime($start_time)); ?> - <?php echo date('g:i A', strtotime($end_time)); ?></p></div>'
            });
            
            marker.addListener('click', function() {
                infoWindow.open(map, marker);
            });
            
            markers.push(marker);
            infoWindows.push(infoWindow);
            <?php
        }
        wp_reset_postdata();
    }
    ?>
}
</script>
```

### Option 3: Calendar View

Use The Events Calendar plugin to display as calendar:

1. Install **The Events Calendar** plugin
2. Create events for each location
3. Link events to location posts
4. Display calendar on Locations page

### Option 4: Shortcode (Recommended)

Create a shortcode for easy display anywhere:

**Add to functions.php:**
```php
function sweetnsassy_locations_shortcode($atts) {
    $atts = shortcode_atts(array(
        'limit' => -1,
        'format' => 'list' // list, map, calendar
    ), $atts);
    
    $args = array(
        'post_type' => 'food_truck_location',
        'posts_per_page' => $atts['limit'],
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
    $output = '';
    
    if ($locations->have_posts()) {
        $output .= '<div class="food-truck-locations">';
        while ($locations->have_posts()) {
            $locations->the_post();
            $date_time = sweetnsassy_format_location_datetime(get_the_ID());
            $address = sweetnsassy_get_location_meta(get_the_ID(), 'address');
            
            $output .= '<div class="location-item">';
            $output .= '<h3>' . get_the_title() . '</h3>';
            $output .= '<p class="date-time">' . $date_time . '</p>';
            $output .= '<p class="address">' . esc_html($address) . '</p>';
            $output .= '<a href="https://www.google.com/maps/search/?api=1&query=' . urlencode($address) . '" target="_blank" class="button">Get Directions</a>';
            $output .= '</div>';
        }
        $output .= '</div>';
        wp_reset_postdata();
    } else {
        $output .= '<p>No upcoming locations scheduled.</p>';
    }
    
    return $output;
}
add_shortcode('food_truck_locations', 'sweetnsassy_locations_shortcode');
```

**Usage:**
- `[food_truck_locations]` - Display all upcoming locations
- `[food_truck_locations limit="5"]` - Display next 5 locations

---

## 📱 Mobile Optimization

### Responsive Map

Ensure maps are responsive:
```css
#map {
    width: 100%;
    height: 400px;
}

@media (max-width: 768px) {
    #map {
        height: 300px;
    }
}
```

### Mobile-Friendly List

The CSS in `custom-style.css` already includes mobile-responsive location styling.

---

## 🔄 Managing Locations

### Bulk Actions

1. Go to **Locations → All Locations**
2. Select multiple locations
3. Use bulk actions:
   - Edit (change dates/times)
   - Move to Trash
   - Export (if using export plugin)

### Updating Locations

1. Find location in **Locations → All Locations**
2. Click "Edit"
3. Update date, time, or address
4. Click "Update"

### Archiving Past Locations

Past locations automatically filter out (if using date query), but you can:
- Move to trash
- Change post status to "Draft"
- Add custom field to mark as "archived"

---

## 🎯 Best Practices

### 1. Consistent Naming
- Use clear, descriptive titles
- Include day of week if recurring
- Example: "Friday - Downtown Market"

### 2. Complete Information
- Always fill in date, time, and address
- Add coordinates for map display
- Include phone if location-specific

### 3. Regular Updates
- Update weekly schedule every Sunday
- Remove or update cancelled locations
- Add special events well in advance

### 4. Featured Images
- Use location-specific photos when possible
- Or use food truck images from `wordpress-assets/hero/`
- Helps with visual appeal

### 5. SEO
- Use descriptive titles
- Add location descriptions
- Include city/neighborhood in title

---

## 🔧 Advanced Customization

### Custom Fields

Add more fields by modifying `functions.php`:
- Weather conditions
- Special menu items
- Parking information
- Contact person

### Display Templates

Create custom templates:
1. Create `single-food_truck_location.php` in theme
2. Customize location detail page
3. Add custom styling

### Integration with WooCommerce

Link locations to orders:
- Add location selection at checkout
- Show available pickup locations
- Filter by location

---

## 📊 Example Locations Page Content

**Page Title:** "Find Our Food Truck"

**Content:**
```
<h2>Current Location</h2>
[Display current/next location prominently]

<h2>Upcoming Locations</h2>
[food_truck_locations limit="10"]

<h2>Weekly Schedule</h2>
[Display recurring weekly schedule]

<h2>Map View</h2>
[Interactive map with all locations]
```

---

## 🆘 Troubleshooting

### Locations Not Showing
- Check date is in the future
- Verify meta fields are filled
- Clear cache
- Check query arguments

### Map Not Displaying
- Verify API key is correct
- Check API restrictions
- Enable Maps JavaScript API
- Check browser console for errors

### Date/Time Format Issues
- Check date format in meta fields
- Use `date_i18n()` for localized dates
- Verify timezone settings

---

## 📚 Helper Functions Reference

### Get Location Meta
```php
$date = sweetnsassy_get_location_meta($post_id, 'date');
$start_time = sweetnsassy_get_location_meta($post_id, 'start_time');
$end_time = sweetnsassy_get_location_meta($post_id, 'end_time');
$address = sweetnsassy_get_location_meta($post_id, 'address');
$latitude = sweetnsassy_get_location_meta($post_id, 'latitude');
$longitude = sweetnsassy_get_location_meta($post_id, 'longitude');
$phone = sweetnsassy_get_location_meta($post_id, 'phone');
```

### Format Date/Time
```php
$formatted = sweetnsassy_format_location_datetime($post_id);
// Returns: "February 15, 2025 • 11:00 AM - 2:00 PM"
```

---

## ✅ Checklist

- [ ] Custom post type is active
- [ ] Can create new locations
- [ ] Meta fields are saving correctly
- [ ] Locations display on frontend
- [ ] Google Maps API key configured (if using map)
- [ ] Map displays correctly
- [ ] Mobile responsive
- [ ] "Get Directions" links work
- [ ] Past locations filter out
- [ ] Weekly schedule template created

---

**Next Steps:**
1. Create your first location entry
2. Set up Google Maps (if using map view)
3. Add shortcode to Locations page
4. Test on mobile devices
5. Create weekly schedule template
