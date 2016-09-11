#!/bin/python
# for generating a javascript file that associates gl.TEXTUREX with index X in an array

# imports
import sys

# input variable defaults
max_n = 32 # check against gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
filename = "TextureEnumArray.js"

# non-input defaults and globals
outfile = None
entry_key_base = "TextureEnumArray"
entry_value_base = "gl.TEXTURE"

# read in the arguments for max array entries and filename
if len(sys.argv) > 2:
    (max_n, filename) = sys.argv[1:]
    try:
        max_n = int(max_n)
    except ValueError:
        print("First argument must be the maximum number of array entries.")
        sys.exit(1)
else:
    print("No input arguments given, writing " + str(max_n) + " entries to file " + filename)

# try to open the file
try:
    outfile = open(filename, 'w')
except:
    print("Could not open file for writing: " + filename)
    sys.exit(1)

# encapsulate in a function so that the definitions occur AFTER gl is defined    
outfile.write("function DefineTextureEnumArray(gl) {\n")
# write the array definition
outfile.write("\t" + entry_key_base + " = [];\n\n")

# write the array entry definitions
for i in range(max_n):
    outfile.write("\t" + entry_key_base + "[" + str(i) + "] = " + entry_value_base + str(i) + ";\n")

# write the end of function brace
outfile.write("}\n")
outfile.close()
