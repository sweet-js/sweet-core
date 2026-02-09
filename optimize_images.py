#!/usr/bin/env python3
"""
Image Analysis and Optimization Script for Sweet 'n Sassy WordPress Site
"""

import subprocess
import shutil
from pathlib import Path
import json

# Paths
source_dir = Path('/Users/alburtonjr/My Drive/SweetnSassy/Sweet & Sassy Images')
logo_dir = Path('/Users/alburtonjr/My Drive/SweetnSassy/Logo')
output_base = Path('/Users/alburtonjr/My Drive/SweetnSassy/sweet-core/wordpress-assets')

# Image categories and their optimization settings
CATEGORIES = {
    'logos': {
        'folder': 'logos',
        'max_width': 500,
        'quality': 90,
        'format': 'png'  # Keep PNG for logos with transparency
    },
    'favicon': {
        'folder': 'favicon',
        'max_width': 512,
        'quality': 90,
        'format': 'png'
    },
    'menu': {
        'folder': 'menu',
        'max_width': 1920,
        'quality': 85,
        'format': 'jpg'
    },
    'food-photos': {
        'folder': 'food-photos',
        'max_width': 1920,
        'quality': 85,
        'format': 'jpg'
    },
    'hero': {
        'folder': 'hero',
        'max_width': 2560,
        'quality': 85,
        'format': 'jpg'
    },
    'general': {
        'folder': 'general',
        'max_width': 1920,
        'quality': 85,
        'format': 'jpg'
    }
}

def get_image_info(img_path):
    """Get image dimensions and file size"""
    try:
        result = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(img_path)], 
                              capture_output=True, text=True)
        width = height = None
        for line in result.stdout.split('\n'):
            if 'pixelWidth' in line:
                width = int(line.split()[-1])
            elif 'pixelHeight' in line:
                height = int(line.split()[-1])
        
        size_bytes = img_path.stat().st_size
        return {
            'width': width,
            'height': height,
            'size_bytes': size_bytes,
            'size_mb': size_bytes / (1024 * 1024)
        }
    except Exception as e:
        print(f"Error getting info for {img_path}: {e}")
        return None

def categorize_image(filename, path):
    """Categorize image based on filename and path"""
    filename_lower = filename.lower()
    
    # Favicon - check first before logo check
    if 'favicon' in filename_lower:
        return 'favicon'
    
    # Logo files
    if any(x in filename_lower for x in ['logo', 'sweetnsassy', 'sweet', 'sassy']):
        return 'logos'
    
    # Menu files
    if 'menu' in filename_lower:
        return 'menu'
    
    # Food truck images
    if any(x in filename_lower for x in ['foodtruck', 'truck', 'rear']):
        return 'hero'
    
    # Food photos (IMG_ prefixed files are likely food photos)
    if filename.startswith('IMG_') or filename.startswith('img_'):
        return 'food-photos'
    
    # Screenshots
    if 'screenshot' in filename_lower:
        return 'general'
    
    # Social media images
    if filename.startswith('459275932'):
        return 'food-photos'
    
    # Default
    return 'general'

def optimize_image(source_path, dest_path, category_config):
    """Optimize image using sips"""
    try:
        # Get source dimensions
        info = get_image_info(source_path)
        if not info:
            return False
        
        width = info['width']
        max_width = category_config['max_width']
        
        # Calculate new dimensions if needed
        if width > max_width:
            ratio = max_width / width
            new_height = int(info['height'] * ratio)
            resize_arg = f"{max_width}x{new_height}"
        else:
            resize_arg = None
        
        # Determine output format
        output_format = category_config['format']
        if output_format == 'jpg':
            output_format = 'jpeg'
        
        # Create destination directory if needed
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Use sips to optimize
        cmd = ['sips', '-s', 'format', output_format]
        
        if resize_arg:
            cmd.extend(['--resampleHeightWidthMax', str(max_width)])
        
        # Set quality for JPEG
        if output_format == 'jpeg':
            cmd.extend(['-s', 'formatOptions', str(category_config['quality'])])
        
        cmd.extend(['--out', str(dest_path), str(source_path)])
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return True
        else:
            print(f"Warning: sips optimization failed for {source_path}: {result.stderr}")
            # Fallback: just copy the file
            shutil.copy2(source_path, dest_path)
            return True
            
    except Exception as e:
        print(f"Error optimizing {source_path}: {e}")
        # Fallback: just copy
        try:
            shutil.copy2(source_path, dest_path)
            return True
        except:
            return False

def process_images():
    """Process all images"""
    analysis = {
        'logos': [],
        'favicon': [],
        'menu': [],
        'food-photos': [],
        'hero': [],
        'general': []
    }
    
    # Process main images folder
    extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']
    image_files = []
    for ext in extensions:
        image_files.extend(source_dir.glob(ext))
    
    for img_path in image_files:
        filename = img_path.name
        category = categorize_image(filename, img_path)
        
        info = get_image_info(img_path)
        if not info:
            continue
        
        category_config = CATEGORIES[category]
        dest_folder = output_base / category_config['folder']
        
        # Create optimized filename
        base_name = img_path.stem
        # For logos and favicon, keep PNG format if original is PNG
        if category in ['logos', 'favicon'] and img_path.suffix.lower() == '.png':
            ext = 'png'
        else:
            ext = category_config['format']
            if ext == 'jpg':
                ext = 'jpeg'
        dest_filename = f"{base_name}.{ext}"
        dest_path = dest_folder / dest_filename
        
        # Optimize and copy
        print(f"Processing {filename} -> {category}/{dest_filename}")
        success = optimize_image(img_path, dest_path, category_config)
        
        if success:
            dest_info = get_image_info(dest_path)
            analysis[category].append({
                'original': filename,
                'optimized': dest_filename,
                'original_size_mb': round(info['size_mb'], 2),
                'optimized_size_mb': round(dest_info['size_mb'], 2) if dest_info else None,
                'original_dimensions': f"{info['width']}x{info['height']}",
                'optimized_dimensions': f"{dest_info['width']}x{dest_info['height']}" if dest_info else None,
                'reduction': f"{round((1 - (dest_info['size_mb'] / info['size_mb'])) * 100, 1)}%" if dest_info else None
            })
    
    # Process Logo folder
    for img_path in logo_dir.glob('*.PNG'):
        filename = img_path.name
        category = 'logos'
        
        info = get_image_info(img_path)
        if not info:
            continue
        
        category_config = CATEGORIES[category]
        dest_folder = output_base / category_config['folder']
        
        base_name = img_path.stem
        dest_filename = f"{base_name}.png"
        dest_path = dest_folder / dest_filename
        
        print(f"Processing {filename} -> {category}/{dest_filename}")
        success = optimize_image(img_path, dest_path, category_config)
        
        if success:
            dest_info = get_image_info(dest_path)
            analysis[category].append({
                'original': filename,
                'optimized': dest_filename,
                'original_size_mb': round(info['size_mb'], 2),
                'optimized_size_mb': round(dest_info['size_mb'], 2) if dest_info else None,
                'original_dimensions': f"{info['width']}x{info['height']}",
                'optimized_dimensions': f"{dest_info['width']}x{dest_info['height']}" if dest_info else None,
                'reduction': f"{round((1 - (dest_info['size_mb'] / info['size_mb'])) * 100, 1)}%" if dest_info else None
            })
    
    # Process menu subfolder
    menu_subfolder = source_dir / 'Food truck menu Custom Private'
    if menu_subfolder.exists():
        for img_path in menu_subfolder.glob('*.jpeg'):
            filename = img_path.name
            category = 'menu'
            
            info = get_image_info(img_path)
            if not info:
                continue
            
            category_config = CATEGORIES[category]
            dest_folder = output_base / category_config['folder']
            
            base_name = img_path.stem
            dest_filename = f"{base_name}.jpg"
            dest_path = dest_folder / dest_filename
            
            print(f"Processing {filename} -> {category}/{dest_filename}")
            success = optimize_image(img_path, dest_path, category_config)
            
            if success:
                dest_info = get_image_info(dest_path)
                analysis[category].append({
                    'original': filename,
                    'optimized': dest_filename,
                    'original_size_mb': round(info['size_mb'], 2),
                    'optimized_size_mb': round(dest_info['size_mb'], 2) if dest_info else None,
                    'original_dimensions': f"{info['width']}x{info['height']}",
                    'optimized_dimensions': f"{dest_info['width']}x{dest_info['height']}" if dest_info else None,
                    'reduction': f"{round((1 - (dest_info['size_mb'] / info['size_mb'])) * 100, 1)}%" if dest_info else None
                })
    
    # Save analysis
    analysis_path = output_base / 'image_analysis.json'
    with open(analysis_path, 'w') as f:
        json.dump(analysis, f, indent=2)
    
    return analysis

if __name__ == '__main__':
    print("Starting image optimization...")
    analysis = process_images()
    print("\nOptimization complete!")
    print(f"\nAnalysis saved to: {output_base / 'image_analysis.json'}")
