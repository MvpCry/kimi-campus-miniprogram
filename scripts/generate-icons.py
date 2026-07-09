from PIL import Image, ImageDraw
import os

os.makedirs('images', exist_ok=True)

def create_icon(name, color, draw_fn, size=(48, 48)):
    img = Image.new('RGBA', size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    draw_fn(draw, size, color)
    img.save(f'images/{name}.png')

def home(draw, size, color):
    w, h = size
    points = [
        (w*0.2, h*0.45), (w*0.5, h*0.2), (w*0.8, h*0.45),
        (w*0.75, h*0.45), (w*0.75, h*0.8), (w*0.55, h*0.8),
        (w*0.55, h*0.6), (w*0.45, h*0.6), (w*0.45, h*0.8),
        (w*0.25, h*0.8), (w*0.25, h*0.45)
    ]
    draw.polygon(points, fill=color, outline=color)

def category(draw, size, color):
    w, h = size
    draw.rectangle([w*0.15, h*0.15, w*0.45, h*0.45], fill=color)
    draw.rectangle([w*0.55, h*0.15, w*0.85, h*0.45], fill=color)
    draw.rectangle([w*0.15, h*0.55, w*0.45, h*0.85], fill=color)
    draw.rectangle([w*0.55, h*0.55, w*0.85, h*0.85], fill=color)

def message(draw, size, color):
    w, h = size
    draw.rounded_rectangle([w*0.1, h*0.2, w*0.9, h*0.75], radius=6, fill=color)
    draw.polygon([(w*0.35, h*0.75), (w*0.25, h*0.9), (w*0.5, h*0.75)], fill=color)

def profile(draw, size, color):
    w, h = size
    draw.ellipse([w*0.3, h*0.12, w*0.7, h*0.45], fill=color)
    draw.pieslice([w*0.1, h*0.38, w*0.9, h*1.1], start=0, end=180, fill=color)

create_icon('tab-home', '#64748B', home)
create_icon('tab-category', '#64748B', category)
create_icon('tab-message', '#64748B', message)
create_icon('tab-profile', '#64748B', profile)
create_icon('tab-home-active', '#7C3AED', home)
create_icon('tab-category-active', '#7C3AED', category)
create_icon('tab-message-active', '#7C3AED', message)
create_icon('tab-profile-active', '#7C3AED', profile)

# 默认头像
img = Image.new('RGBA', (120, 120), (233, 213, 255, 255))
draw = ImageDraw.Draw(img)
draw.ellipse([30, 24, 90, 72], fill=(124, 58, 237, 255))
draw.pieslice([12, 60, 108, 156], start=0, end=180, fill=(124, 58, 237, 255))
img.save('images/avatar-default.png')

print('Icons created')
