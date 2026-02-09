# Food Truck Location Tracker Setup Guide
## Sweet n' Sassy - Knoxville, TN

---

## 📍 Overview

The Food Truck Locations custom post type allows you to easily manage and display your food truck schedule throughout the Knoxville area. This guide covers setup, usage, and display options specific to Knoxville locations.

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
   - Example: "Market Square - Friday Lunch"
   - Example: "UT Campus - Student Union"
   - Example: "Old City - First Friday"
   - Example: "Knoxville Farmers Market - Saturday"

3. **Content Editor:** Add description (optional)
   - Event details
   - Special menu items for this location
   - Parking information
   - What to expect

4. **Featured Image:** Upload location photo (optional)
   - Use images from `wordpress-assets/hero/` folder
   - Or upload location-specific photos

5. **Location Details Meta Box:** Fill in all fields:
   - **Date:** Select event date (date picker)
   - **Start Time:** When truck arrives (time picker)
   - **End Time:** When truck leaves (time picker)
   - **Address:** Full street address in Knoxville
     - Example: "Market Square, Knoxville, TN 37902"
     - Example: "1502 Cumberland Ave, Knoxville, TN 37916" (UT area)
     - Example: "100 S Central St, Knoxville, TN 37902" (Old City)
   - **Latitude:** Get from Google Maps (see below)
   - **Longitude:** Get from Google Maps (see below)
   - **Phone:** Optional contact number for that location

6. **Publish:** Click "Publish" when ready

---

## 🗺️ Getting Latitude and Longitude for Knoxville Locations

### Method 1: Google Maps (Easiest)

1. Go to https://www.google.com/maps
2. Search for your Knoxville location (e.g., "Market Square Knoxville TN")
3. Right-click on the exact location pin
4. Click the coordinates at the top (e.g., "35.9606, -83.9207")
5. Copy the numbers:
   - First number = Latitude
   - Second number = Longitude

### Popular Knoxville Locations (Reference):

- **Market Square:** 35.9606, -83.9207
- **UT Campus (Student Union):** 35.9544, -83.9294
- **Old City:** 35.9681, -83.9178
- **Knoxville Farmers Market:** 35.9606, -83.9207
- **World's Fair Park:** 35.9619, -83.9203
- **Bearden:** 35.9431, -83.9903
- **Fountain City:** 36.0128, -83.9242

---

## 📅 Weekly Location Template for Knoxville

### Quick Entry Template

Use this template for quick weekly entries in Knoxville:

**Monday:**
- Title: "Monday - [Location Name]"
- Date: [This Monday's date]
- Time: 11:00 AM - 2:00 PM
- Address: [Knoxville address]
- Coordinates: [Lat, Long]

**Tuesday:**
- Title: "Tuesday - [Location Name]"
- Date: [This Tuesday's date]
- Time: 11:00 AM - 2:00 PM
- Address: [Knoxville address]
- Coordinates: [Lat, Long]

**Wednesday:**
- Title: "Wednesday - [Location Name]"
- Date: [This Wednesday's date]
- Time: 11:00 AM - 2:00 PM
- Address: [Knoxville address]
- Coordinates: [Lat, Long]

**Thursday:**
- Title: "Thursday - [Location Name]"
- Date: [This Thursday's date]
- Time: 11:00 AM - 2:00 PM
- Address: [Knoxville address]
- Coordinates: [Lat, Long]

**Friday:**
- Title: "Friday - Market Square"
- Date: [This Friday's date]
- Time: 11:00 AM - 7:00 PM
- Address: Market Square, Knoxville, TN 37902
- Coordinates: 35.9606, -83.9207

**Saturday:**
- Title: "Saturday - Knoxville Farmers Market"
- Date: [This Saturday's date]
- Time: 9:00 AM - 1:00 PM
- Address: Market Square, Knoxville, TN 37902
- Coordinates: 35.9606, -83.9207

**Sunday:**
- Title: "Sunday - [Location Name]"
- Date: [This Sunday's date]
- Time: 12:00 PM - 6:00 PM
- Address: [Knoxville address]
- Coordinates: [Lat, Long]

---

## 🎯 Popular Knoxville Locations

### Downtown Knoxville:
- **Market Square** - Central hub, great foot traffic
- **Old City** - Arts district, First Friday events
- **Gay Street** - Business district, lunch crowd
- **World's Fair Park** - Events and festivals

### UT Knoxville Area:
- **Student Union** - High student traffic
- **Cumberland Avenue** - "The Strip" - student area
- **UT Medical Center** - Hospital staff and visitors

### Other Areas:
- **Bearden** - West Knoxville, residential
- **Fountain City** - North Knoxville
- **South Knoxville** - Ijams Nature Center area
- **West Knoxville** - Turkey Creek, shopping areas

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
    echo '<h2>Where Will We Be This Week?</h2>';
    while ($locations->have_posts()) {
        $locations->the_post();
        $date = get_post_meta(get_the_ID(), '_location_date', true);
        $start_time = get_post_meta(get_the_ID(), '_location_start_time', true);
        $end_time = get_post_meta(get_the_ID(), '_location_end_time', true);
        $address = get_post_meta(get_the_ID(), '_location_address', true);
        ?>
        <div class="location-item">
            <h3><?php the_title(); ?></h3>
            <p class="location-date"><?php echo date('l, F j, Y', strtotime($date)); ?></p>
            <p class="location-time"><?php echo date('g:i A', strtotime($start_time)); ?> - <?php echo date('g:i A', strtotime($end_time)); ?></p>
            <p class="location-address">📍 <?php echo esc_html($address); ?></p>
            <a href="https://www.google.com/maps/search/?api=1&query=<?php echo urlencode($address); ?>" target="_blank" class="button">Get Directions</a>
        </div>
        <?php
    }
    echo '</div>';
    wp_reset_postdata();
} else {
    echo '<p>Check back soon for our weekly schedule!</p>';
}
?>
```

### Option 2: Map View (Google Maps) - Knoxville Area

Display locations on an interactive Google Map centered on Knoxville.

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

**Step 3: Create Map Display (Knoxville Centered)**

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
    // Center map on Knoxville, TN
    var knoxville = {lat: 35.9606, lng: -83.9207};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: knoxville
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
                title: '<?php echo esc_js(get_the_title()); ?>',
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }
            });
            
            var infoWindow = new google.maps.InfoWindow({
                content: '<div class="map-info"><h3><?php echo esc_js(get_the_title()); ?></h3><p><?php echo esc_js($address); ?></p><p><?php echo date('l, F j', strtotime($date)); ?></p><p><?php echo date('g:i A', strtotime($start_time)); ?> - <?php echo date('g:i A', strtotime($end_time)); ?></p><a href="https://www.google.com/maps/search/?api=1&query=<?php echo urlencode($address); ?>" target="_blank">Get Directions</a></div>'
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
5. Set timezone to Eastern Time (Knoxville)

### Option 4: Shortcode (Recommended)

Create a shortcode for easy display anywhere:

**Add to functions.php:**
```php
function sweetnsassy_locations_shortcode($atts) {
    $atts = shortcode_atts(array(
        'limit' => -1,
        'format' => 'list'
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
        $output .= '<h2>Where Will We Be This Week?</h2>';
        while ($locations->have_posts()) {
            $locations->the_post();
            $date_time = sweetnsassy_format_location_datetime(get_the_ID());
            $address = sweetnsassy_get_location_meta(get_the_ID(), 'address');
            
            $output .= '<div class="location-item">';
            $output .= '<h3>' . get_the_title() . '</h3>';
            $output .= '<p class="date-time">' . $date_time . '</p>';
            $output .= '<p class="address">📍 ' . esc_html($address) . '</p>';
            $output .= '<a href="https://www.google.com/maps/search/?api=1&query=' . urlencode($address) . '" target="_blank" class="button">Get Directions</a>';
            $output .= '</div>';
        }
        $output .= '</div>';
        wp_reset_postdata();
    } else {
        $output .= '<p>Check back soon for our weekly schedule in Knoxville!</p>';
    }
    
    return $output;
}
add_shortcode('food_truck_locations', 'sweetnsassy_locations_shortcode');
```

**Usage:**
- `[food_truck_locations]` - Display all upcoming locations
- `[food_truck_locations limit="7"]` - Display next 7 locations (weekly schedule)

---

## 📱 Mobile Optimization for On-the-Go Location Checking

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
    
    .location-item {
        margin-bottom: 1rem;
        padding: 1rem;
    }
}
```

### Mobile-Friendly Features:
- Large "Get Directions" buttons
- Click-to-call phone numbers
- Easy-to-read addresses
- Current location indicator
- "Find Nearest Location" button (optional)

---

## 🔄 Managing Weekly Schedule

### Best Practices for Knoxville:

1. **Update Weekly:** Update schedule every Sunday for the upcoming week
2. **Consistent Locations:** Use recurring locations (Market Square Fridays, Farmers Market Saturdays)
3. **Special Events:** Add UT football games, festivals, First Friday events
4. **Weather Considerations:** Have backup indoor locations
5. **Holiday Schedule:** Update for holidays and special events

### Bulk Actions:

1. Go to **Locations → All Locations**
2. Select multiple locations
3. Use bulk actions:
   - Edit (change dates/times)
   - Move to Trash
   - Export (if using export plugin)

---

## 🎯 Knoxville-Specific Tips

### UT Football Games:
- Add locations near Neyland Stadium
- Extended hours on game days
- Special menu items

### First Friday (Old City):
- Monthly event - add to calendar
- Extended hours
- Special promotions

### Farmers Market:
- Every Saturday at Market Square
- Recurring location
- Early morning hours

### Downtown Events:
- Market Square events
- World's Fair Park festivals
- Gay Street events

---

## 📊 Example Locations Page Content

**Page Title:** "Find Our Food Truck in Knoxville"

**Content:**
```
<h2>Current Location</h2>
[Display current/next location prominently with map]

<h2>This Week's Schedule</h2>
[food_truck_locations limit="7"]

<h2>Popular Locations</h2>
<ul>
  <li>Market Square - Fridays</li>
  <li>Knoxville Farmers Market - Saturdays</li>
  <li>UT Campus - Weekdays</li>
  <li>Old City - First Friday</li>
</ul>

<h2>Interactive Map</h2>
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
- Verify coordinates are correct for Knoxville area

### Date/Time Format Issues
- Check date format in meta fields
- Use `date_i18n()` for localized dates
- Verify timezone settings (Eastern Time)

---

## ✅ Checklist

- [ ] Custom post type is active
- [ ] Can create new locations
- [ ] Meta fields are saving correctly
- [ ] Locations display on frontend
- [ ] Google Maps API key configured
- [ ] Map displays correctly (centered on Knoxville)
- [ ] Mobile responsive
- [ ] "Get Directions" links work
- [ ] Past locations filter out
- [ ] Weekly schedule template created
- [ ] Popular Knoxville locations added

---

**Next Steps:**
1. Create your first location entry (Market Square or Farmers Market)
2. Set up Google Maps (if using map view)
3. Add shortcode to Locations page
4. Test on mobile devices
5. Create weekly schedule template
6. Add special events (UT games, festivals)

**Knoxville Resources:**
- Market Square: https://www.knoxvillesmarketsquare.com/
- UT Campus Map: https://www.utk.edu/maps/
- Old City: https://oldcityknoxville.com/
