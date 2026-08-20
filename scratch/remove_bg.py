import os
from PIL import Image

def remove_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        # Calculate saturation roughly as max - min
        saturation = max(r, g, b) - min(r, g, b)
        
        # Checkerboard is grey/white, so saturation is low.
        if saturation < 45:
            if saturation > 20:
                # Soft edge
                alpha = int(((saturation - 20) / 25.0) * 255)
                # To avoid dark gray halos, blend with white or the dominant color
                # but let's just make it partially transparent first.
                newData.append((106, 230, 168, alpha)) # Use our brand green as the base for the semi-transparent pixels to avoid gray halo
            else:
                newData.append((255, 255, 255, 0))
        else:
            # Let's also normalize the green to pure #6AE6A8 to clean up JPG artifacts
            newData.append((106, 230, 168, 255))

    img.putdata(newData)
    
    # We should also crop the image to the actual content bounding box to remove extra padding if needed, 
    # but let's just save it as is first.
    img.save(output_path, "PNG")

input_file = r"C:\Users\fifaa\.gemini\antigravity-ide\brain\771b2b7f-bc45-46aa-a9f5-13efcb788368\.user_uploaded\media_1787204845903.jpg"
out_file1 = r"public\logo-mealmate.png"

remove_bg(input_file, out_file1)
print("Background removed successfully.")
