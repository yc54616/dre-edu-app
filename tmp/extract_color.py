
from PIL import Image
from collections import Counter

def get_dominant_color(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGB")
        img = img.resize((50, 50))  # Resize for faster processing
        pixels = list(img.getdata())
        
        # Filter out white/near-white and black/near-black pixels to find the brand color
        filtered_pixels = [
            p for p in pixels 
            if not (p[0] > 240 and p[1] > 240 and p[2] > 240) and # Not white
               not (p[0] < 15 and p[1] < 15 and p[2] < 15)        # Not black
        ]
        
        if not filtered_pixels:
            return "No suitable color found"

        counts = Counter(filtered_pixels)
        most_common = counts.most_common(1)[0][0]
        return f"#{most_common[0]:02x}{most_common[1]:02x}{most_common[2]:02x}"
    except Exception as e:
        return str(e)

print(get_dominant_color("logo.png"))
