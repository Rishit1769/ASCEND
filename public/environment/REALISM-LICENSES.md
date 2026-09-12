# Realism pass assets

## Outdoor HDR sky

- File: `kloofendal_48d_partly_cloudy_2k.hdr`
- Author: Greg Zaal / Poly Haven.
- Source: https://polyhaven.com/a/kloofendal_48d_partly_cloudy
- Download: https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kloofendal_48d_partly_cloudy_2k.hdr
- License: CC0, https://polyhaven.com/license
- Size: 6,480,797 bytes; 2048 x 1024.
- MD5: `72b472b131798b3eb5fc67fce3ab672e`
- Used for photographed cloud detail and the sky-derived lighting capture. The photographed ground is masked out at the horizon.

## Water normal texture

- File: `waternormals.jpg`
- Source: Three.js r186 example assets, https://github.com/mrdoob/three.js/blob/r186/examples/textures/waternormals.jpg
- Download: https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/textures/waternormals.jpg
- Repository license: MIT, https://github.com/mrdoob/three.js/blob/r186/LICENSE
- Size: 248,813 bytes; 1024 x 1024.
- MD5: `4418dde3f6abc21dc32506acf5f5b093`
- Treated as non-color normal data, sampled twice with different scales, directions and speeds.

### Three.js license notice

The MIT License

Copyright (c) 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Re-fetch

Run `npm run assets:realism`. The HDRI checksum is verified before writing. Existing environment GLB attribution remains in `README.md`.
