<?php
/**
 * Sweet 'n Sassy WordPress Functions
 * Food Truck & Catering Business
 * 
 * Add this code to your theme's functions.php file
 * Or create a child theme and add it there
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/* ============================================
   THEME SETUP
   ============================================ */

function sweetnsassy_setup() {
    // Add theme support for various features
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('custom-logo');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    
    // Add support for WooCommerce
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'sweetnsassy'),
        'footer' => __('Footer Menu', 'sweetnsassy'),
    ));
}
add_action('after_setup_theme', 'sweetnsassy_setup');

/* ============================================
   CUSTOM IMAGE SIZES
   ============================================ */

function sweetnsassy_image_sizes() {
    // Menu item images (square format for products)
    add_image_size('menu-item', 400, 400, true);
    
    // Menu item thumbnail (smaller square)
    add_image_size('menu-item-thumb', 200, 200, true);
    
    // Hero images (wide format)
    add_image_size('hero-image', 1920, 800, true);
    add_image_size('hero-image-mobile', 768, 400, true);
    
    // Gallery images (various sizes)
    add_image_size('gallery-large', 1920, 1080, false);
    add_image_size('gallery-medium', 800, 600, true);
    add_image_size('gallery-thumb', 300, 300, true);
    
    // Food photo showcase (portrait)
    add_image_size('food-showcase', 600, 800, true);
    
    // Location/food truck images
    add_image_size('location-image', 1200, 600, true);
    
    // Blog/recipe images
    add_image_size('recipe-image', 1200, 675, true);
}
add_action('after_setup_theme', 'sweetnsassy_image_sizes');

// Add custom image size names to media library
function sweetnsassy_custom_image_sizes($sizes) {
    return array_merge($sizes, array(
        'menu-item' => __('Menu Item', 'sweetnsassy'),
        'menu-item-thumb' => __('Menu Item Thumbnail', 'sweetnsassy'),
        'hero-image' => __('Hero Image', 'sweetnsassy'),
        'gallery-large' => __('Gallery Large', 'sweetnsassy'),
        'gallery-medium' => __('Gallery Medium', 'sweetnsassy'),
        'gallery-thumb' => __('Gallery Thumbnail', 'sweetnsassy'),
        'food-showcase' => __('Food Showcase', 'sweetnsassy'),
        'location-image' => __('Location Image', 'sweetnsassy'),
        'recipe-image' => __('Recipe Image', 'sweetnsassy'),
    ));
}
add_filter('image_size_names_choose', 'sweetnsassy_custom_image_sizes');

/* ============================================
   WOOCOMMERCE CUSTOMIZATION
   ============================================ */

// Remove WooCommerce default styles (use theme styles instead)
function sweetnsassy_remove_woocommerce_styles() {
    // Uncomment if you want to remove default WooCommerce styles
    // wp_dequeue_style('woocommerce-general');
    // wp_dequeue_style('woocommerce-layout');
    // wp_dequeue_style('woocommerce-smallscreen');
}
// add_action('wp_enqueue_scripts', 'sweetnsassy_remove_woocommerce_styles', 99);

// Customize WooCommerce product image sizes
function sweetnsassy_woocommerce_image_dimensions() {
    $single = array(
        'width'  => 600,
        'height' => 600,
        'crop'   => 1,
    );
    $thumbnail = array(
        'width'  => 300,
        'height' => 300,
        'crop'   => 1,
    );
    $gallery_thumbnail = array(
        'width'  => 150,
        'height' => 150,
        'crop'   => 1,
    );
    
    update_option('woocommerce_single_image_width', $single['width']);
    update_option('woocommerce_thumbnail_image_width', $thumbnail['width']);
    update_option('woocommerce_gallery_thumbnail_image_width', $gallery_thumbnail['width']);
}
add_action('after_setup_theme', 'sweetnsassy_woocommerce_image_dimensions');

// Change number of products per row
function sweetnsassy_products_per_row() {
    return 3; // 3 products per row
}
add_filter('loop_shop_columns', 'sweetnsassy_products_per_row');

// Change number of products per page
function sweetnsassy_products_per_page() {
    return 12;
}
add_filter('loop_shop_per_page', 'sweetnsassy_products_per_page', 20);

// Customize "Add to Cart" button text
function sweetnsassy_add_to_cart_text() {
    return __('Order Now', 'sweetnsassy');
}
add_filter('woocommerce_product_add_to_cart_text', 'sweetnsassy_add_to_cart_text');
add_filter('woocommerce_product_single_add_to_cart_text', 'sweetnsassy_add_to_cart_text');

/* ============================================
   CUSTOM POST TYPE: FOOD TRUCK LOCATIONS
   ============================================ */

function sweetnsassy_register_location_post_type() {
    $labels = array(
        'name'                  => _x('Food Truck Locations', 'Post Type General Name', 'sweetnsassy'),
        'singular_name'         => _x('Location', 'Post Type Singular Name', 'sweetnsassy'),
        'menu_name'             => __('Locations', 'sweetnsassy'),
        'name_admin_bar'        => __('Location', 'sweetnsassy'),
        'archives'              => __('Location Archives', 'sweetnsassy'),
        'attributes'            => __('Location Attributes', 'sweetnsassy'),
        'parent_item_colon'     => __('Parent Location:', 'sweetnsassy'),
        'all_items'             => __('All Locations', 'sweetnsassy'),
        'add_new_item'          => __('Add New Location', 'sweetnsassy'),
        'add_new'               => __('Add New', 'sweetnsassy'),
        'new_item'              => __('New Location', 'sweetnsassy'),
        'edit_item'             => __('Edit Location', 'sweetnsassy'),
        'update_item'           => __('Update Location', 'sweetnsassy'),
        'view_item'             => __('View Location', 'sweetnsassy'),
        'view_items'            => __('View Locations', 'sweetnsassy'),
        'search_items'          => __('Search Location', 'sweetnsassy'),
        'not_found'             => __('Not found', 'sweetnsassy'),
        'not_found_in_trash'    => __('Not found in Trash', 'sweetnsassy'),
        'featured_image'        => __('Location Image', 'sweetnsassy'),
        'set_featured_image'    => __('Set location image', 'sweetnsassy'),
        'remove_featured_image' => __('Remove location image', 'sweetnsassy'),
        'use_featured_image'    => __('Use as location image', 'sweetnsassy'),
        'insert_into_item'      => __('Insert into location', 'sweetnsassy'),
        'uploaded_to_this_item' => __('Uploaded to this location', 'sweetnsassy'),
        'items_list'            => __('Locations list', 'sweetnsassy'),
        'items_list_navigation' => __('Locations list navigation', 'sweetnsassy'),
        'filter_items_list'     => __('Filter locations list', 'sweetnsassy'),
    );
    
    $args = array(
        'label'                 => __('Location', 'sweetnsassy'),
        'description'           => __('Food truck locations and schedule', 'sweetnsassy'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'excerpt'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'        => 20,
        'menu_icon'             => 'dashicons-location-alt',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
    );
    
    register_post_type('food_truck_location', $args);
}
add_action('init', 'sweetnsassy_register_location_post_type', 0);

/* ============================================
   CUSTOM FIELDS FOR LOCATIONS (Using Meta Box)
   ============================================ */

// Add custom meta boxes for location details
function sweetnsassy_location_meta_boxes() {
    add_meta_box(
        'location_details',
        __('Location Details', 'sweetnsassy'),
        'sweetnsassy_location_meta_box_callback',
        'food_truck_location',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'sweetnsassy_location_meta_boxes');

function sweetnsassy_location_meta_box_callback($post) {
    wp_nonce_field('sweetnsassy_location_meta_box', 'sweetnsassy_location_meta_box_nonce');
    
    $date = get_post_meta($post->ID, '_location_date', true);
    $start_time = get_post_meta($post->ID, '_location_start_time', true);
    $end_time = get_post_meta($post->ID, '_location_end_time', true);
    $address = get_post_meta($post->ID, '_location_address', true);
    $latitude = get_post_meta($post->ID, '_location_latitude', true);
    $longitude = get_post_meta($post->ID, '_location_longitude', true);
    $phone = get_post_meta($post->ID, '_location_phone', true);
    
    ?>
    <table class="form-table">
        <tr>
            <th><label for="location_date"><?php _e('Date', 'sweetnsassy'); ?></label></th>
            <td><input type="date" id="location_date" name="location_date" value="<?php echo esc_attr($date); ?>" class="regular-text" /></td>
        </tr>
        <tr>
            <th><label for="location_start_time"><?php _e('Start Time', 'sweetnsassy'); ?></label></th>
            <td><input type="time" id="location_start_time" name="location_start_time" value="<?php echo esc_attr($start_time); ?>" class="regular-text" /></td>
        </tr>
        <tr>
            <th><label for="location_end_time"><?php _e('End Time', 'sweetnsassy'); ?></label></th>
            <td><input type="time" id="location_end_time" name="location_end_time" value="<?php echo esc_attr($end_time); ?>" class="regular-text" /></td>
        </tr>
        <tr>
            <th><label for="location_address"><?php _e('Address', 'sweetnsassy'); ?></label></th>
            <td><textarea id="location_address" name="location_address" rows="3" class="large-text"><?php echo esc_textarea($address); ?></textarea></td>
        </tr>
        <tr>
            <th><label for="location_latitude"><?php _e('Latitude', 'sweetnsassy'); ?></label></th>
            <td><input type="text" id="location_latitude" name="location_latitude" value="<?php echo esc_attr($latitude); ?>" class="regular-text" placeholder="e.g., 40.7128" /></td>
        </tr>
        <tr>
            <th><label for="location_longitude"><?php _e('Longitude', 'sweetnsassy'); ?></label></th>
            <td><input type="text" id="location_longitude" name="location_longitude" value="<?php echo esc_attr($longitude); ?>" class="regular-text" placeholder="e.g., -74.0060" /></td>
        </tr>
        <tr>
            <th><label for="location_phone"><?php _e('Phone (Optional)', 'sweetnsassy'); ?></label></th>
            <td><input type="tel" id="location_phone" name="location_phone" value="<?php echo esc_attr($phone); ?>" class="regular-text" /></td>
        </tr>
    </table>
    <?php
}

function sweetnsassy_save_location_meta_box($post_id) {
    if (!isset($_POST['sweetnsassy_location_meta_box_nonce'])) {
        return;
    }
    
    if (!wp_verify_nonce($_POST['sweetnsassy_location_meta_box_nonce'], 'sweetnsassy_location_meta_box')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    if (isset($_POST['location_date'])) {
        update_post_meta($post_id, '_location_date', sanitize_text_field($_POST['location_date']));
    }
    
    if (isset($_POST['location_start_time'])) {
        update_post_meta($post_id, '_location_start_time', sanitize_text_field($_POST['location_start_time']));
    }
    
    if (isset($_POST['location_end_time'])) {
        update_post_meta($post_id, '_location_end_time', sanitize_text_field($_POST['location_end_time']));
    }
    
    if (isset($_POST['location_address'])) {
        update_post_meta($post_id, '_location_address', sanitize_textarea_field($_POST['location_address']));
    }
    
    if (isset($_POST['location_latitude'])) {
        update_post_meta($post_id, '_location_latitude', sanitize_text_field($_POST['location_latitude']));
    }
    
    if (isset($_POST['location_longitude'])) {
        update_post_meta($post_id, '_location_longitude', sanitize_text_field($_POST['location_longitude']));
    }
    
    if (isset($_POST['location_phone'])) {
        update_post_meta($post_id, '_location_phone', sanitize_text_field($_POST['location_phone']));
    }
}
add_action('save_post', 'sweetnsassy_save_location_meta_box');

/* ============================================
   PERFORMANCE OPTIMIZATIONS
   ============================================ */

// Remove unnecessary WordPress features
function sweetnsassy_remove_unnecessary_features() {
    // Remove emoji scripts
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    
    // Remove unnecessary header links
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'wp_shortlink_wp_head');
    
    // Remove REST API link
    remove_action('wp_head', 'rest_output_link_wp_head');
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    
    // Disable XML-RPC
    add_filter('xmlrpc_enabled', '__return_false');
    
    // Remove jQuery migrate (if not needed)
    // Uncomment if you're sure your theme/plugins don't need it
    // function sweetnsassy_remove_jquery_migrate($scripts) {
    //     if (!is_admin() && isset($scripts->registered['jquery'])) {
    //         $script = $scripts->registered['jquery'];
    //         if ($script->deps) {
    //             $script->deps = array_diff($script->deps, array('jquery-migrate'));
    //         }
    //     }
    // }
    // add_action('wp_default_scripts', 'sweetnsassy_remove_jquery_migrate');
}
add_action('init', 'sweetnsassy_remove_unnecessary_features');

// Disable WordPress embeds
function sweetnsassy_disable_embeds() {
    wp_deregister_script('wp-embed');
}
add_action('wp_footer', 'sweetnsassy_disable_embeds');

// Limit post revisions
if (!defined('WP_POST_REVISIONS')) {
    define('WP_POST_REVISIONS', 3);
}

// Increase memory limit if needed
if (!defined('WP_MEMORY_LIMIT')) {
    define('WP_MEMORY_LIMIT', '256M');
}

// Enable lazy loading for images (WordPress 5.5+)
// This is enabled by default, but we ensure it's active
add_filter('wp_lazy_loading_enabled', '__return_true');

/* ============================================
   ENQUEUE STYLES AND SCRIPTS
   ============================================ */

function sweetnsassy_enqueue_assets() {
    // Enqueue custom styles
    wp_enqueue_style(
        'sweetnsassy-custom',
        get_template_directory_uri() . '/custom-style.css',
        array(),
        '1.0.0'
    );
    
    // Enqueue Google Fonts
    wp_enqueue_style(
        'sweetnsassy-fonts',
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;600;700&family=Montserrat:wght@500;600;700&display=swap',
        array(),
        null
    );
    
    // Enqueue custom JavaScript (if needed)
    // wp_enqueue_script(
    //     'sweetnsassy-custom',
    //     get_template_directory_uri() . '/js/custom.js',
    //     array('jquery'),
    //     '1.0.0',
    //     true
    // );
}
add_action('wp_enqueue_scripts', 'sweetnsassy_enqueue_assets');

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

// Get location meta data
function sweetnsassy_get_location_meta($post_id, $key) {
    return get_post_meta($post_id, '_location_' . $key, true);
}

// Format location date and time
function sweetnsassy_format_location_datetime($post_id) {
    $date = sweetnsassy_get_location_meta($post_id, 'date');
    $start_time = sweetnsassy_get_location_meta($post_id, 'start_time');
    $end_time = sweetnsassy_get_location_meta($post_id, 'end_time');
    
    if (!$date) {
        return '';
    }
    
    $formatted_date = date_i18n('F j, Y', strtotime($date));
    $time_range = '';
    
    if ($start_time && $end_time) {
        $time_range = date('g:i A', strtotime($start_time)) . ' - ' . date('g:i A', strtotime($end_time));
    } elseif ($start_time) {
        $time_range = date('g:i A', strtotime($start_time));
    }
    
    return $formatted_date . ($time_range ? ' • ' . $time_range : '');
}

/* ============================================
   WIDGET AREAS
   ============================================ */

function sweetnsassy_widgets_init() {
    register_sidebar(array(
        'name'          => __('Sidebar', 'sweetnsassy'),
        'id'            => 'sidebar-1',
        'description'   => __('Add widgets here.', 'sweetnsassy'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ));
    
    register_sidebar(array(
        'name'          => __('Footer 1', 'sweetnsassy'),
        'id'            => 'footer-1',
        'description'   => __('Add widgets here.', 'sweetnsassy'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
    
    register_sidebar(array(
        'name'          => __('Footer 2', 'sweetnsassy'),
        'id'            => 'footer-2',
        'description'   => __('Add widgets here.', 'sweetnsassy'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
    
    register_sidebar(array(
        'name'          => __('Footer 3', 'sweetnsassy'),
        'id'            => 'footer-3',
        'description'   => __('Add widgets here.', 'sweetnsassy'),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ));
}
add_action('widgets_init', 'sweetnsassy_widgets_init');
