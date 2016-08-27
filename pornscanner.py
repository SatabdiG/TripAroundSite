#!python2

import os, glob
from PIL import Image
import sys

im = Image.open(sys.argv[1])
im = im.crop((int(im.size[0]*0.2), int(im.size[1]*0.2), im.size[0]-int(im.size[0]*0.2), im.size[1]-int(im.size[1]*0.2)))
skin = sum([count for count, rgb in im.getcolors(im.size[0]*im.size[1]) if rgb[0]>60 and rgb[1]<(rgb[0]*0.85) and rgb[2]<(rgb[0]*0.7) and rgb[1]>(rgb[0]*0.4) and rgb[2]>(rgb[0]*0.2)])
skin_percent = (float(skin)/float(im.size[0]*im.size[1]))* 100
skin_percent
is_porn = int(float(skin_percent))>int(float(sys.argv[2]))

print(sys.argv[2])
print skin_percent


if is_porn ==True:
	print(True)
else:
	print(False)



