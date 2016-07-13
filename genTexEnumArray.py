#!/bin/python
# for generating a javascript file that associates gl.TEXTUREX with index X in an array

# imports
import sys

# input variable defaults
max_n = 50
filename = "TextureEnumArray.js"

# non-input defaults and globals
outfile = None
entry_key_base = "TextureEnumArray"
entry_value_base = "gl.TEXTURE"

if len(sys.argv) > 2:
    (max_n, filename) = sys.argv[1:]
    try:
        max_n = int(max_n)
    except ValueError:
        print("First argument must be the maximum number of array entries.")
    try:
        outfile = open(filename, 'w')
    except:
        print("Could not open file for writing: " + filename)
else:
    print("No input arguments given, writing " + max_n + " entries to file " + filename)

for i in range(max_n):
    outfile.write(entry_key_base + "[" + str(i) + "] = " + entry_value_base + str(i) + "\n")

outfile.close()
