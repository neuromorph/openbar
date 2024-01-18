// Include tinycolor2 library
const tinycolor = require('tinycolor2');

const sampleColors = ['#37395e', '#38c3bd', '#38619e', '#3679a7', '#3c4f83', '#2c80ba', '#444f84', '#306cb4', '#3b5f86', '#3b4d6f', '#446594', '#3c9ab4'];

// Function to apply tinycolor to each element in the array
function applyTinyColor(color) {
  return tinycolor(color).toString(); // Convert the color object to a string
}

// Apply tinycolor to each element in the sampleColors array
const maleableColors = sampleColors.map(applyTinyColor);

console.log(maleableColors);

// Now I want to find the two mostly contrasted colors, generally this would find a dark and light color
function findMaxContrast(colors) {
    let maxContrast = 0;
    let contrastPair = [];
  
    for (let i = 0; i < colors.length - 1; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const color1 = tinycolor(colors[i]);
        const color2 = tinycolor(colors[j]);
  
        const contrast = tinycolor.readability(color1, color2);
  
        if (contrast > maxContrast) {
          maxContrast = contrast;
          contrastPair = [colors[i], colors[j]];
        }
      }
    }
    return { contrast: maxContrast, pair: contrastPair };
  }
  
  const maxContrastResult = findMaxContrast(maleableColors);
  
  if (tinycolor(maxContrastResult.pair[0]).getBrightness() > tinycolor(maxContrastResult.pair[1]).getBrightness()) {
    var dark = maxContrastResult.pair[1];
    var light = maxContrastResult.pair[0];
  } else {
    var dark = maxContrastResult.pair[0];
    var light = maxContrastResult.pair[1];
  }

  console.log('Max Contrast Pair:', maxContrastResult.pair);
  console.log('Contrast Value:', maxContrastResult.contrast);
  
  console.log('Dark Color:', dark);
  console.log('Light Color:', light);

// Get the complementary color of the light color for the accent
const lightComplementary = tinycolor(light).complement().toString();
const accent = tinycolor(lightComplementary).toHex();
console.log('Accent Color:', `#${accent}`);

// Calculate a darker shade for the shadow using a tetrad color scheme with dark
const tetradColors = tinycolor(dark).tetrad();
const shadowAnalogous = tinycolor(tetradColors[3]).darken(10).toHex();
console.log('Shadow Color (Tetrad):', `#${shadowAnalogous}`);

// Calculate a lighter shade for the border using a triadic color scheme with dark
const triadicColors = tinycolor(dark).triad();
const borderTriadic = tinycolor(triadicColors[2]).lighten(10).toHex();
console.log('Border Color (Triadic):', `#${borderTriadic}`);

// Desaturate the accent color for the highlight/selection
const highlightSelection = tinycolor(lightComplementary).desaturate(20).toHex();
console.log('Highlight/Selection Color:', `#${highlightSelection}`);

// Max Contrast Pair: [ '#37395e', '#38c3bd' ]
// Contrast Value: 5.0850488235490925
// Dark Color: #37395e
// Light Color: #38c3bd
// Accent Color: #c2383f
// Shadow Color (Tetrad): #243e30
// Border Color (Triadic): #4d7e4a
// Highlight/Selection Color: #a95156
