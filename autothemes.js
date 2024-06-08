/* autothemes.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * author: neuromorph
 */

/* exported autoApplyBGPalette() onModeChange() */

const DEBUG = false;

function dlog(...args) {
    if(DEBUG) {
        console.log(...args);
    }
}

// Brightness of color in terms of HSP value
function getHSP(color, g, b) {
    let r;
    if(g)
        r = color;
    else
        [r, g, b] = [color[0], color[1], color[2]];
    // HSP equation for perceived brightness from http://alienryderflex.com/hsp.html
    let hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );
    return hsp;
}

function compareHSP(A, B) {
    let hspA = getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2]));
    let hspB = getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2]));

    return (hspA < hspB)? -1 : (hspA > hspB)? 1 : 0;
}

// Move color A towards or away from B by factor. Based on simplified formula from getColorDist() below
function colorMove(A, B, factor) {
    let [r1, g1, b1] = [parseInt(A[0]), parseInt(A[1]), parseInt(A[2])];
    let [r2, g2, b2] = [parseInt(B[0]), parseInt(B[1]), parseInt(B[2])];
    
    let r = (r2 - r1); 
    let g = (g2 - g1); 
    let b = (b2 - b1);
    if(r==0 && factor < 0)
        r = factor*255;
    if(g==0 && factor < 0)
        g = factor*255;
    if(b==0 && factor < 0)
        b = factor*255;

    let rmean = (r1 + r2)/2;
    let rFactor = Math.sqrt((512 + rmean)/ 256);
    let gFactor = 2;
    let bFactor = Math.sqrt((767 - rmean)/ 256);
    let sumFactor = rFactor + gFactor + bFactor;

    let rMove = r * factor * rFactor / sumFactor;
    let gMove = g * factor * gFactor / sumFactor;
    let bMove = b * factor * bFactor / sumFactor;

    let newR = (r1 + rMove);
    let newG = (g1 + gMove);
    let newB = (b1 + bMove);
    newR = newR>255? 255 : newR<0? 0 : parseInt(newR);
    newG = newG>255? 255 : newG<0? 0 : parseInt(newG);
    newB = newB>255? 255 : newB<0? 0 : parseInt(newB);

    // dlog('COLOR MOVE - ' + A + ' - ' + B + ' - ' + newR + ' ' + newG + ' ' + newB);
    return [String(newR), String(newG), String(newB)];
}

function getColorDist(A, B) {
    let [r1, g1, b1] = [parseInt(A[0]), parseInt(A[1]), parseInt(A[2])];
    let [r2, g2, b2] = [parseInt(B[0]), parseInt(B[1]), parseInt(B[2])];

    let rmean = (r1 + r2)/2;
    let r = r1 - r2;
    let g = g1 - g2;
    let b = b1 - b2;
    // Approx color distance based on http://www.compuphase.com/cmetric.htm, range: 0-765
    let dist =  Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
    // dlog('COLOR DIST - ' + A + ' , ' + B + ' - ' + dist);
    return dist/3; // range: 0-255
}

function getColorfulness(color) {
    // We consider greater difference between the R, G, B values to indicate colorfulness
    // while similar values for R,G,B to indicate greyscale
    let [r, g, b] = [parseInt(color[0]), parseInt(color[1]), parseInt(color[2])];
    let colorfulness = Math.max(r, g, b) - Math.min(r, g, b);
    return colorfulness;
}
function compareColorfulness(A, B) {
    let colorDistA = getColorfulness(A);
    let colorDistB = getColorfulness(B);
    return (colorDistA < colorDistB)? -1 : (colorDistA > colorDistB)? 1 : 0;
}

// Compare colorfulness using saturation
function compareSaturation(A, B) {
    // Convert the colors into HSL to sort by Saturation
    let hslA = rgbToHsl(A);
    let hslB = rgbToHsl(B);
    return (hslA[1] < hslB[1])? -1 : (hslA[1] > hslB[1])? 1 : 0;
}

function compareLightness(A, B) {
    // Convert the colors into HSL to sort by Lightness
    let hslA = rgbToHsl(A);
    let hslB = rgbToHsl(B);
    return (hslA[2] < hslB[2])? -1 : (hslA[2] > hslB[2])? 1 : 0;
}

function getStrv(strInt) {
    // Color settings are stored as RGB in range 0-1 so we convert from 0-255
    let [r, g, b] = [parseInt(strInt[0]), parseInt(strInt[1]), parseInt(strInt[2])];
    return [String(r/255), String(g/255), String(b/255)];
}

function getRGBStr(str255) {
    let rgb = `rgb(${str255[0]}, ${str255[1]}, ${str255[2]})`;
    return rgb;
}

// Converts RGB to HSL
function rgbToHsl(rgb) {
    let [r, g, b] = [rgb[0]/255, rgb[1]/255, rgb[2]/255];
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if(max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l]; // h, s, l in range 0 - 1
}

// Converts HSL to RGB
function hslToRgb(hsl) {
    let [h, s, l] = hsl;
    let r, g, b;
  
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
  
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
  
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
  
    return [r * 255, g * 255, b * 255];
}

// Convert RGB to CIELAB
function rgbToLab(rgbColor) {
    const [r, g, b] = rgbColor.map(val => {
        val /= 255;
        return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    const x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
    const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
    const z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;

    const epsilon = 0.008856; // 6/29
    const kappa = 903.3; // 24389/27

    const fx = x > epsilon ? Math.pow(x, 1 / 3) : (kappa * x + 16) / 116;
    const fy = y > epsilon ? Math.pow(y, 1 / 3) : (kappa * y + 16) / 116;
    const fz = z > epsilon ? Math.pow(z, 1 / 3) : (kappa * z + 16) / 116;

    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bb = 200 * (fy - fz);

    return [L, a, bb];
}

// Compute distance between two colors in CIELAB space (OLD, check ΔE00 below)
function colorDistance(color1, color2) {
    const lab1 = rgbToLab(color1);
    const lab2 = rgbToLab(color2);

    const deltaL = lab1[0] - lab2[0];
    const deltaA = lab1[1] - lab2[1];
    const deltaB = lab1[2] - lab2[2];

    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

// Calculate CIELAB color difference 2000 (ΔE00)
function colorDistance2000(color1, color2) {
    const lab1 = rgbToLab(color1);
    const lab2 = rgbToLab(color2);

    const deltaL = lab2[0] - lab1[0];
    const meanL = (lab1[0] + lab2[0]) / 2;

    const C1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2]);
    const C2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2]);
    const meanC = (C1 + C2) / 2;

    const G = 0.5 * (1 - Math.sqrt(Math.pow(meanC, 7) / (Math.pow(meanC, 7) + Math.pow(25, 7))));

    const a1Prime = (1 + G) * lab1[1];
    const a2Prime = (1 + G) * lab2[1];

    const C1Prime = Math.sqrt(a1Prime * a1Prime + lab1[2] * lab1[2]);
    const C2Prime = Math.sqrt(a2Prime * a2Prime + lab2[2] * lab2[2]);
    const meanCPrime = (C1Prime + C2Prime) / 2;

    const h1Prime = (Math.atan2(lab1[2], a1Prime) * 180) / Math.PI + (lab1[2] < 0 ? 360 : 0);
    const h2Prime = (Math.atan2(lab2[2], a2Prime) * 180) / Math.PI + (lab2[2] < 0 ? 360 : 0);
    
    let deltaHPrime;
    if (Math.abs(h1Prime - h2Prime) <= 180) {
        deltaHPrime = h2Prime - h1Prime;
    } else if (h2Prime <= h1Prime) {
        deltaHPrime = h2Prime - h1Prime + 360;
    } else {
        deltaHPrime = h2Prime - h1Prime - 360;
    }

    const deltaHPrimeMean = (Math.abs(h1Prime - h2Prime) <= 180) ? h1Prime + h2Prime / 2 : (h1Prime + h2Prime + 360) / 2;

    const T = 1 - 0.17 * Math.cos((deltaHPrimeMean - 30) * (Math.PI / 180)) + 0.24 * Math.cos(2 * deltaHPrimeMean * (Math.PI / 180)) + 0.32 * Math.cos((3 * deltaHPrimeMean + 6) * (Math.PI / 180)) - 0.20 * Math.cos((4 * deltaHPrimeMean - 63) * (Math.PI / 180));
    const deltaTheta = 30 * Math.exp(-((deltaHPrimeMean - 275) / 25) * ((deltaHPrimeMean - 275) / 25));
    const R_C = 2 * Math.sqrt(Math.pow(meanCPrime, 7) / (Math.pow(meanCPrime, 7) + Math.pow(25, 7)));
    const S_L = 1 + (0.015 * Math.pow(meanL - 50, 2)) / Math.sqrt(20 + Math.pow(meanL - 50, 2));
    const S_C = 1 + 0.045 * meanCPrime;
    const S_H = 1 + 0.015 * meanCPrime * T;

    const R_Term = -Math.sin((2 * deltaTheta) * (Math.PI / 180)) * R_C;

    const L_Diff = deltaL / (S_L);
    const C_Diff = (C1Prime - C2Prime) / (S_C);
    const H_Diff = (deltaHPrime - R_Term) / (S_H);

    return Math.sqrt(L_Diff * L_Diff + C_Diff * C_Diff + H_Diff * H_Diff);
}


// Add tint to RGB color
function addTint(rgbColor, amount) {
    const [r, g, b] = rgbColor.map(val => val + (255 - val) * amount);
    return [r, g, b];
}

// Add shade to RGB color - modified (grey)
function addShade(rgbColor, amount, target=0) {
    const [r, g, b] = rgbColor.map(val => val + (target - val) * amount);
    return [r, g, b];
}

// Add tone to RGB color
function addTone(rgbColor, amount) {
    const [r, g, b] = rgbColor.map(val => val + (128 - val) * amount);
    return [r, g, b];
}

// Convert RGB color to pastel color
function addPastel(rgbColor, amount) {
    const hslColor = rgbToHsl(rgbColor);

    // Decrease saturation and increase lightness
    const pastelHslColor = [hslColor[0], hslColor[1] * amount, hslColor[2] * (1 + (1 - amount) / 2)];

    // Convert pastel HSL color back to RGB
    const pastelRgbColor = hslToRgb(pastelHslColor);

    return pastelRgbColor;
}

// Calculate relative luminance
function relativeLuminance(color) {
    const [r, g, b] = color.map(val => {
        val /= 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio between two colors
function contrastRatio(color1, color2) {
    const luminance1 = relativeLuminance(color1);
    const luminance2 = relativeLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05); // Adding 0.05 to prevent division by zero
}


// Auto-Theming: Select colors from color palette as per theme & dark/light mode
// Manipulate colors, as needed, for better contrast and readability (except for 'True Color')
export function autoApplyBGPalette(obar, requestMode) {
    const importExport = obar._settings.get_boolean('import-export');
    if(importExport)
        return;
    
    // dlog('autoApply caller trace ' + autoApplyBGPalette.caller, requestMode);
    
    // Pause stylesheet reloading, while auto-theme settings are updated, to prevent multiple style reloads
    obar._settings.set_boolean('pause-reload', true);

    let themeDark = obar._settings.get_string('autotheme-dark');
    let themeLight = obar._settings.get_string('autotheme-light');
    let currentMode = obar._intSettings.get_string('color-scheme');
    // If no auto-theme is set for requested mode, return
    if((themeDark == 'Select Theme' && requestMode == 'dark') ||
        (themeLight == 'Select Theme' && requestMode == 'light'))
        return;

    // Save autotheme, to be applied, as 'theme' 
    let theme;
    if(requestMode == 'dark')
        theme = themeDark;
    else
        theme = themeLight;
        
    // const toRGBArray = rgbStr => rgbStr.match(/\d+/g);

    let prominentArr = [], paletteArr = [];
    let colorCounts = [], colorTotal = 0;
    // Get pixel count for each color in palette
    for(let i=1; i<=12; i++) {
        let count = obar._settings.get_int('count'+i);
        colorCounts.push(count);
        colorTotal += count;
    }
    // Convert colorCounts to percentages
    let colorPercents = colorCounts.map(count => (count/colorTotal)*100);

    // Add palette colors to paletteArr
    for(let i=1; i<=12; i++) {
        let [r, g, b] = obar._settings.get_strv('palette'+i);
        [r, g, b] = [parseInt(r), parseInt(g), parseInt(b)];
        paletteArr.push([[r, g, b], colorPercents[i-1]]);
    }

    // dlog('paletteArr:', paletteArr);

    // Find prominent colors in palette (top 90% pixel count)
    let prominentPercents = 0, prominentIdx = 0;
    for(let i=0; i<12; i++) {
        prominentPercents += paletteArr[i][1];
        if(prominentPercents >= 90) {
            prominentIdx = i;
            break;
        }
    }
    // dlog('prominentIdx:', prominentIdx);
    let minIdx = 4;
    if(theme == 'Dark' || theme == 'Light')
        minIdx = 5;
    if(theme == 'Pastel')
        minIdx = 6;
    if(prominentIdx < minIdx)
        prominentIdx = minIdx;
    prominentArr = paletteArr.slice(0, prominentIdx+1);

    // Compute Expectation for Saturation and Lightness of prominent colors in Image
    let promSatExpected = 0, promLightExpected = 0;
    prominentArr.forEach(color => {
        let [h, s, l] = rgbToHsl(color[0]);
        promSatExpected += s * color[1]/100;
        promLightExpected += l * color[1]/100;
    })
    promSatExpected *= 100;
    promLightExpected *= 100;
    // dlog('promSatExpected:', promSatExpected, 'promLightExpected:', promLightExpected);


    //== Theme Parameters for Color Selection ==//
    // Default values apply to 'True Color' theme. For other themes, override params as needed
    // (theme == 'Color' OR 'Dark'): Prefer - MBG: dark, SMBG: a bit lighter, Accent: prominent and colorful
    // (theme == 'Pastel' OR 'Light'): Prefer - MBG: light, SMBG: a bit darker (bit more saturated), Accent: prominent and colorful
    // High/Low values are used for color comparison, to filter colors
    // Close values are outer bounds and used to filter colors when nothing found in the High/Low range
    // Target values are used to compute distance from desired color (dist is used to compute a score)
    // Min/Max values are used to modify the color to bring light/sat values in this range

    // TRUE COLOR THEME
    let MBG_LIGHT_LOW = 6;
    let MBG_LIGHT_LOW_CLOSE = 5;
    let MBG_LIGHT_TARGET = 8;
    let MBG_LIGHT_HIGH = 70;
    let MBG_LIGHT_HIGH_CLOSE = 75;
    let MBG_SAT_HIGH = 75;
    let MBG_SAT_TARGET = 45;
    let MBG_SAT_MULT = 0;
    let MBG_PROM_LOW = 1;
    let MBG_PROM_LOW_CLOSE = 0.75;
    let MBG_LIGHT_MIN = 0;
    let MBG_LIGHT_MAX = 0;
    let MBG_SAT_MIN = 0;
    let MBG_SAT_MAX = 0;
    let MBG_SAT_DND_MIN = 0;
    let MBG_ACC_CONTRAST_MULT = 5;

    let SMBG_LIGHT_LOW = 9;
    let SMBG_LIGHT_LOW_CLOSE = 8;
    let SMBG_LIGHT_HIGH = 75;
    let SMBG_LIGHT_HIGH_CLOSE = 80;
    let SMBG_SAT_HIGH = 80;
    let SMBG_SAT_TARGET = 50;
    let SMBG_SAT_MULT = 0;
    let SMBG_PROM_LOW = 1;
    let SMBG_PROM_LOW_CLOSE = 0.75;
    let SMBG_MBG_DIST_LOW = 10;
    let SMBG_MBG_DIST_HIGH = 120;
    let SMBG_MBG_DIST_TARGET = 40;
    let SMBG_MBG_DIST_MULT = 0.5;
    let SMBG_MBG_CONTRAST_LOW = 1.05;
    let SMBG_MBG_CONTRAST_HIGH = 10;
    let SMBG_LIGHT_MIN = 0;
    let SMBG_LIGHT_MAX = 0;
    let SMBG_SAT_MIN = 0;
    let SMBG_SAT_MAX = 0;
    let SMBG_SAT_DND_MIN = 0;
    let SMBG_MBG_CONTRAST_MULT = 5;
    let SMBG_ACC_CONTRAST_MULT = 5;

    let ACCENT_LIGHT_LOW = 35;
    let ACCENT_LIGHT_LOW_CLOSE = 20;
    let ACCENT_LIGHT_HIGH = 90;
    let ACCENT_LIGHT_TARGET = 70;
    let ACCENT_SAT_LOW = 35;
    let ACCENT_PROM_LOW = 2;
    let ACCENT_MBG_DIST_LOW = 12;
    let ACCENT_MBG_DIST_HIGH = 150;
    let ACCENT_SMBG_DIST_LOW = 12;
    let ACCENT_SMBG_DIST_HIGH = 150;
    let ACCENT_MBG_CONTRAST_LOW = 1.05;
    let ACCENT_MBG_CONTRAST_HIGH = 20;
    let ACCENT_SMBG_CONTRAST_LOW = 1.05;
    let ACCENT_SMBG_CONTRAST_HIGH = 20;
    let ACCENT_LIGHT_MAX = 70;
    let ACCENT_LIGHT_MIN = 40;
    let ACCENT_SAT_MAX = 75;
    let ACCENT_SAT_MIN = 65;
    let ACCENT_SAT_TARGET = 75;
    let ACCENT_SAT_DND_MIN = 10;

    let BAR_LIGHT_LOW = 5;
    let BAR_LIGHT_HIGH = MBG_LIGHT_HIGH;
    // let BAR_LIGHT_EVADE = 60; // prefer very dark or very light to contrast with FG
    let BAR_LIGHT_EVADE = currentMode == 'prefer-dark'? 100: 0;
    let BAR_SAT_HIGH = 90;
    let BAR_MBG_DIST_HIGH = 65; // keep similar to MBG color

    let BORDER_LIGHT_LOW = 60;
    let BORDER_LIGHT_HIGH = 100;
    let BORDER_NEON_SAT_LOW = 50;
    let BORDER_NEON_SAT_DND_MIN = 10;

    // DARK THEME
    if(theme == 'Dark') {
        MBG_LIGHT_HIGH = 60;
        MBG_LIGHT_TARGET = 6;
        MBG_SAT_HIGH = 80;

        MBG_LIGHT_MIN = 12; //15
        MBG_LIGHT_MAX = 20; //25
        MBG_SAT_MIN = 15;
        MBG_SAT_MAX = 25;
        MBG_SAT_DND_MIN = 10;

        SMBG_LIGHT_HIGH = 60;
        SMBG_SAT_HIGH = 80;

        SMBG_LIGHT_MIN = 17; //25
        SMBG_LIGHT_MAX = 25; //35
        SMBG_SAT_MIN = 20;
        SMBG_SAT_MAX = 30;
        SMBG_SAT_DND_MIN = 10;

        ACCENT_LIGHT_MAX = 70;
        ACCENT_LIGHT_MIN = 35; //40
        ACCENT_LIGHT_TARGET = 70;
        ACCENT_SAT_MAX = 75; //75
        ACCENT_SAT_MIN = 50; //65 60
        ACCENT_SAT_TARGET = 70;
        ACCENT_SAT_DND_MIN = 10;

        BAR_LIGHT_LOW = 0;
        BAR_LIGHT_HIGH = MBG_LIGHT_HIGH;
        BAR_LIGHT_EVADE = 100;
    }

    // LIGHT THEME
    if(theme == 'Light') {
        // ACCENT_LIGHT_LOW = 35;
        ACCENT_LIGHT_LOW_CLOSE = 30;
        ACCENT_LIGHT_HIGH = 95; //90
        ACCENT_LIGHT_TARGET = 80;
        ACCENT_LIGHT_MAX = 85; //80
        ACCENT_LIGHT_MIN = 50; //????
        ACCENT_SAT_MAX = 85;
        ACCENT_SAT_MIN = 65;
        ACCENT_SAT_TARGET = 80;
        ACCENT_SAT_DND_MIN = -1;

        MBG_PROM_LOW_CLOSE = 0.35;
        MBG_LIGHT_LOW = 30;
        MBG_LIGHT_LOW_CLOSE = 12;
        MBG_LIGHT_TARGET = 65; //65
        MBG_LIGHT_HIGH = 95;
        MBG_LIGHT_HIGH_CLOSE = 100;
        MBG_SAT_HIGH = 80;
        // MBG_PROM_LOW = 1;
        MBG_LIGHT_MIN = 90; // 80
        MBG_LIGHT_MAX = 100;
        MBG_SAT_MIN = 10;
        MBG_SAT_MAX = 15;
        MBG_SAT_DND_MIN = 0;
        MBG_ACC_CONTRAST_MULT = 0.5;

        SMBG_PROM_LOW_CLOSE = 0.35;
        SMBG_LIGHT_LOW = 30; // 30
        SMBG_LIGHT_LOW_CLOSE = 10;
        SMBG_LIGHT_HIGH = 95; // 85
        SMBG_LIGHT_HIGH_CLOSE = 97; //90
        SMBG_SAT_HIGH = 90;

        SMBG_LIGHT_MIN = 80; // 75
        SMBG_LIGHT_MAX = 95; // 85
        SMBG_SAT_MIN = 10; // 15
        SMBG_SAT_MAX = 25; // 20
        SMBG_SAT_DND_MIN = 0;
        SMBG_ACC_CONTRAST_MULT = 0.5;
        SMBG_MBG_CONTRAST_MULT = 0.5;

        SMBG_MBG_DIST_TARGET = 40;

        BAR_LIGHT_LOW = MBG_LIGHT_LOW;
        BAR_LIGHT_HIGH = MBG_LIGHT_HIGH;
        BAR_LIGHT_EVADE = 0;

    }

    // PASTEL THEME
    if(theme == 'Pastel') {
        // ACCENT_LIGHT_LOW = 35;
        ACCENT_LIGHT_LOW_CLOSE = 30;
        ACCENT_LIGHT_HIGH = 85; //90
        ACCENT_LIGHT_TARGET = 70;
        ACCENT_LIGHT_MAX = 75;
        ACCENT_LIGHT_MIN = 55;
        ACCENT_SAT_MAX = 70; // 85
        ACCENT_SAT_MIN = 50; // 65
        ACCENT_SAT_TARGET = 75;
        ACCENT_SAT_DND_MIN = -1;

        MBG_PROM_LOW_CLOSE = 0.35;
        MBG_LIGHT_LOW = 25;
        MBG_LIGHT_LOW_CLOSE = 12;
        MBG_LIGHT_TARGET = 60; // **65**
        MBG_LIGHT_HIGH = 85;
        MBG_LIGHT_HIGH_CLOSE = 90;
        MBG_SAT_HIGH = 90;
        MBG_SAT_TARGET = 30;
        MBG_SAT_MULT = 1.15;
        // MBG_PROM_LOW = 1;
        MBG_LIGHT_MIN = 70; //40
        MBG_LIGHT_MAX = 80; // 75
        MBG_SAT_MIN = 15; //20
        MBG_SAT_MAX = 25; //30
        MBG_SAT_DND_MIN = 0;
        MBG_ACC_CONTRAST_MULT = 4;

        SMBG_PROM_LOW_CLOSE = 0.35;
        SMBG_LIGHT_LOW = 20;
        SMBG_LIGHT_LOW_CLOSE = 12;
        SMBG_LIGHT_HIGH = 85;
        SMBG_LIGHT_HIGH_CLOSE = 90;
        SMBG_SAT_HIGH = 90;
        SMBG_SAT_TARGET = 40;
        SMBG_SAT_MULT = 1.15;

        SMBG_LIGHT_MIN = 80; //50
        SMBG_LIGHT_MAX = 90;
        SMBG_SAT_MIN = 22; //25
        SMBG_SAT_MAX = 34; //35
        SMBG_SAT_DND_MIN = 0;
        SMBG_ACC_CONTRAST_MULT = 4;
        SMBG_MBG_CONTRAST_MULT = 4;
        SMBG_MBG_DIST_TARGET = 65;
        SMBG_MBG_DIST_MULT = 0.75;

        BAR_LIGHT_LOW = MBG_LIGHT_LOW;
        BAR_LIGHT_HIGH = MBG_LIGHT_HIGH;
        // BAR_LIGHT_EVADE = 60;

    }


    let minTotal, best, closest, promLen, paletteLen;

    // ACCENT COLOR SELECTION
    best = null, closest = null; 
    promLen = prominentArr.length;
    paletteLen = paletteArr.length;
    let accentColor, bestAccent = 1000, bestAccentIdx=0, closestAccent=1000, closestAccentIdx=0;

    let overrideAccent = obar._settings.get_boolean('accent-override'); // Manual override for Accent color
    if(!overrideAccent) {
        for(let i=0, promColor; i<promLen; i++) {
            promColor = prominentArr[i][0];
            let [hue, sat, light] = rgbToHsl(promColor).map((x) => x*100);
            // dlog('\nAccent Color', promColor, 'HSL', hue, sat, light);

            let accentProm = prominentArr[i][1];
            // Min total means: prefer larger negative components and smaller positive ones
            minTotal = -1.35*accentProm + 1.15*Math.abs(sat-ACCENT_SAT_TARGET) + Math.abs(light-ACCENT_LIGHT_TARGET);
            // dlog('light', light, 'sat', sat, 'accentProm', accentProm);


            if( light > ACCENT_LIGHT_LOW && light < ACCENT_LIGHT_HIGH && 
                accentProm > ACCENT_PROM_LOW &&
                sat > ACCENT_SAT_LOW)
            {                
                best = minTotal;
                // dlog('best', best);
                if(bestAccent > best) {
                    bestAccent = best;
                    bestAccentIdx = i;
                }
            }
            if(!best) {
                closest = minTotal;
                // dlog('closest', closest);
                if(closestAccent > closest && light > ACCENT_LIGHT_LOW_CLOSE && accentProm > ACCENT_PROM_LOW) {
                    closestAccent = closest;
                    closestAccentIdx = i;
                }
            }
        }
        if(best) {
            accentColor = paletteArr[bestAccentIdx][0]; 
            // dlog('Best Accent Color', accentColor, bestAccentIdx);
            paletteArr.splice(bestAccentIdx, 1);
            if(bestAccentIdx < promLen)
                prominentArr.splice(bestAccentIdx, 1);
        }
        else {
            accentColor = paletteArr[closestAccentIdx][0]; 
            // dlog('Closest Accent Color', accentColor, closestAccentIdx);
            paletteArr.splice(closestAccentIdx, 1);
            if(closestAccentIdx < promLen)
                prominentArr.splice(closestAccentIdx, 1);
        }
    }
    else {
        accentColor = obar._settings.get_strv('accent-color').map((x) => parseFloat(x)*255);
    }

    if(theme != 'Color') {
        // Adjust light and sat if too low or too high

        let [hue, sat, light] = rgbToHsl(accentColor).map((x) => x*100);
        let [ogHue, ogSat, ogLight] = [hue, sat, light];
        let accentSatMin = false;

        if(sat > ACCENT_SAT_DND_MIN && sat < ACCENT_SAT_MIN) {
            sat = Math.min(ACCENT_SAT_MIN, 3*sat); 
            // dlog(`\nsat < ${ACCENT_SAT_MIN}, Setting sat to ${sat}`);
            accentSatMin = true;
        }
        else if(sat > ACCENT_SAT_MAX) {
            sat = ACCENT_SAT_MAX; 
            // dlog(`\nsat > ${ACCENT_SAT_MAX}, Setting sat to ${ACCENT_SAT_MAX}`);
        }
        else if(sat >= ACCENT_SAT_MIN && sat <= ACCENT_SAT_MAX) {
            sat = sat - 0.35*(sat - (ACCENT_SAT_MIN + ACCENT_SAT_MAX)/2);
        }
        
        if(light < ACCENT_LIGHT_MIN) { 
            if(accentSatMin)
                light = light + 0.5*(ACCENT_LIGHT_MIN - light);
            else
                light = ACCENT_LIGHT_MIN; 
            // dlog(`\nlight < ${ACCENT_LIGHT_MIN}, Setting light to ${light}`);
        }
        else if(light > ACCENT_LIGHT_MAX) { 
            light = ACCENT_LIGHT_MAX; 
            // dlog(`\nlight > ${ACCENT_LIGHT_MAX}, Setting light to ${ACCENT_LIGHT_MAX}`);

        }
        else if(light >= ACCENT_LIGHT_MIN && light <= ACCENT_LIGHT_MAX) {
            light = light - 0.35*(light - (ACCENT_LIGHT_MIN + ACCENT_LIGHT_MAX)/2);
        }

        // Some colors (Hues) can be too bright so reduce their sat if needed
        if(hue >= 50*100/360 && hue <= 160*100/360) { // bright Green
            let hueSat = 45 + 2.5*Math.abs(hue - 90*100/360)/10; 
            // dlog('Sat', sat, 'HueSat', hueSat);
            if(sat > hueSat) 
                sat = hueSat;
        }
        if(hue >= 290*100/360 && hue <= 330*100/360) { // bright Pink
            let hueSat = 50 + 3*Math.abs(hue - 300*100/360)/10;
            if(sat > hueSat) 
                sat = hueSat;
        }

        accentColor = hslToRgb([hue, sat, light].map((x) => x/100));
        // Too dark colors are percieved as Blackish and too light as Whitish by user, however,
        // Increasing sat/light for too dark can result in random color due to amplification of 
        // difference between R, G, B values. Set them back to grayscale.
        if(ogSat < 2 || ogLight < 6 || (ogSat <18 && ogLight < 18)) {
            if(theme == 'Dark') {                
                let rgb = Math.max(accentColor[0], accentColor[1], accentColor[2]);
                accentColor = [rgb, rgb, rgb];
            }            
            if(theme == 'Light') {
                let rgb = Math.min(accentColor[0], accentColor[1], accentColor[2]);
                accentColor = [rgb, rgb, rgb];
            }
        }
        // accentColor = addTint(accentColor, 0.10);

        // dlog('Accent color (light/sat): ', accentColor, sat, light);
    }


    // MENU BG COLOR SELECTION
    let mbgColor, closestMbg=1000, closestMbgIdx=0, bestMbg=1000, bestMbgIdx=0;;
    best = null, closest = null;
    promLen = prominentArr.length;
    
    for(let i=0, promColor; i<promLen; i++) {
        promColor = prominentArr[i][0];
        let [hue, sat, light] = rgbToHsl(promColor).map((x) => x*100); 
        // dlog('\nMenuBG Color', promColor, 'HSL', hue, sat, light);
        let mbgProm = prominentArr[i][1];
        let mbgAccentDist = colorDistance2000(promColor, accentColor);
        let mbgAccentContrast = contrastRatio(promColor, accentColor);
        
        minTotal = -1.15*mbgProm + MBG_SAT_MULT*Math.abs(sat-MBG_SAT_TARGET) + 1.15*Math.abs(light-MBG_LIGHT_TARGET) + (mbgAccentDist<40? 0.75*Math.abs(40-mbgAccentDist): 0) + MBG_ACC_CONTRAST_MULT*Math.abs(3-mbgAccentContrast);
        // dlog('mbgMinTotal', minTotal, 'light', 0.25*light, 'sat', sat, 'mbgProminence', mbgProm, 'mbgAccentDist', mbgAccentDist, 'mbgAccentContrast', mbgAccentContrast);

        if(light < MBG_LIGHT_HIGH && light > MBG_LIGHT_LOW && sat < MBG_SAT_HIGH &&
            (mbgProm > MBG_PROM_LOW) &&
            mbgAccentDist > ACCENT_MBG_DIST_LOW && mbgAccentDist < ACCENT_MBG_DIST_HIGH &&
            mbgAccentContrast > ACCENT_MBG_CONTRAST_LOW && mbgAccentContrast < ACCENT_MBG_CONTRAST_HIGH) {
            best = minTotal;
            // dlog('best', best);
            if(bestMbg > best) {
                bestMbg = best;
                bestMbgIdx = i;
            }
        }
        if(!best) {
            closest = minTotal;
            if(closestMbg > closest && light > MBG_LIGHT_LOW_CLOSE && light < MBG_LIGHT_HIGH_CLOSE && mbgProm > MBG_PROM_LOW_CLOSE) {
                closestMbg = closest;
                closestMbgIdx = i;
                // dlog('closest', closest);
            }
        }
    }
    if(best) {
        mbgColor = prominentArr[bestMbgIdx][0];  
        // dlog('Best MenuBG Color', mbgColor, bestMbgIdx);        
        prominentArr.splice(bestMbgIdx, 1);
        paletteArr.splice(bestMbgIdx, 1);
    }
    else {
        mbgColor = prominentArr[closestMbgIdx][0]; 
        // dlog('Closest MenuBG Color', mbgColor, closestMbgIdx);
        prominentArr.splice(closestMbgIdx, 1);
        paletteArr.splice(closestMbgIdx, 1);
    }
    

    // Sub-Menu BG COLOR SELECTION
    let smbgColor, bestSmbg=1000, bestSmbgIdx=0, closestSmbg=1000, closestSmbgIdx=0;
    best = null, closest = null;
    promLen = prominentArr.length;

    for(let i=0, promColor; i<promLen; i++) {
        promColor = prominentArr[i][0];
        let [hue, sat, light] = rgbToHsl(promColor).map((x) => x*100); 
        // dlog('\nSMBG Color', promColor, 'HSL', hue, sat, light);

        let smbgMbgDist = colorDistance2000(promColor, mbgColor);
        let smbgMbgContrast = contrastRatio(promColor, mbgColor);
        let smbgProm = prominentArr[i][1];
        let smbgAccentDist = colorDistance2000(promColor, accentColor);
        let smbgAccentContrast = contrastRatio(promColor, accentColor);

        minTotal = -1.55*smbgProm + SMBG_SAT_MULT*Math.abs(sat - SMBG_SAT_TARGET) + SMBG_MBG_DIST_MULT*(smbgMbgDist<2*SMBG_MBG_DIST_TARGET? Math.abs(SMBG_MBG_DIST_TARGET-smbgMbgDist): SMBG_MBG_DIST_TARGET) + SMBG_MBG_CONTRAST_MULT*Math.abs(3-smbgMbgContrast) + (smbgAccentDist<40? 0.75*(40-smbgAccentDist): 0) + SMBG_ACC_CONTRAST_MULT*Math.abs(3-smbgAccentContrast) ;
        // dlog('light', light, 'sat', sat, 'smbgMbgDist', (smbgMbgDist), 'smbgMbgContrast', (smbgMbgContrast), 'smbgProm', smbgProm, 'smbgAccentDist', (smbgAccentDist), 'smbgAccentContrast', (smbgAccentContrast));

        if( light > SMBG_LIGHT_LOW && light < SMBG_LIGHT_HIGH &&
            sat < SMBG_SAT_HIGH && (smbgProm > SMBG_PROM_LOW) &&
            smbgMbgDist > SMBG_MBG_DIST_LOW && smbgMbgDist < SMBG_MBG_DIST_HIGH &&
            smbgMbgContrast > SMBG_MBG_CONTRAST_LOW && smbgMbgContrast < SMBG_MBG_CONTRAST_HIGH &&
            smbgAccentDist > ACCENT_SMBG_DIST_LOW && smbgAccentDist < ACCENT_SMBG_DIST_HIGH &&
            smbgAccentContrast > ACCENT_SMBG_CONTRAST_LOW && smbgAccentContrast < ACCENT_SMBG_CONTRAST_HIGH) {
            best = minTotal;
            // dlog('best', best);
            if(bestSmbg > best) {
                bestSmbg = best;
                bestSmbgIdx = i;
            }
        }
        if(!best) {
            closest = minTotal;
            if(closestSmbg > closest && light > SMBG_LIGHT_LOW_CLOSE && light < SMBG_LIGHT_HIGH_CLOSE && smbgProm > SMBG_PROM_LOW_CLOSE) {
                closestSmbg = closest;
                closestSmbgIdx = i;
                // dlog('closest', closest);
            }
        }
    }
    if(best) {
        smbgColor = prominentArr[bestSmbgIdx][0]; 
        // dlog('Best SMBG Color', smbgColor, bestSmbgIdx);
        prominentArr.splice(bestSmbgIdx, 1);
        paletteArr.splice(bestSmbgIdx, 1);
    }
    else {
        smbgColor = prominentArr[closestSmbgIdx][0]; 
        // dlog('Closest SMBG Color', smbgColor, closestSmbgIdx);
        prominentArr.splice(closestSmbgIdx, 1);
        paletteArr.splice(closestSmbgIdx, 1);
    }

    // Prefer darker Menu BG color for Dark and Color themes
    if(getHSP(smbgColor) < getHSP(mbgColor) && (theme == 'Dark' || theme == 'Color')) {
        [smbgColor, mbgColor] = [mbgColor, smbgColor];
        // dlog('========= Swapped MBG - SMBG =========');
    }
    // Prefer lighter Menu BG color for Light and Pastel themes
    if(getHSP(smbgColor) > getHSP(mbgColor) && (theme == 'Light' || theme == 'Pastel')) {
        [smbgColor, mbgColor] = [mbgColor, smbgColor];
        // dlog('========= Swapped MBG - SMBG =========');
    }

    // Adapt MBG color to be within theme MIN MAX bounds (except for 'True Color')
    if(theme != 'Color') {
        let [hue, sat, light] = rgbToHsl(mbgColor).map((x) => x*100);
        let [ogHue, ogSat, ogLight] = [hue, sat, light]; // save original values for later
        let mbgLightMax = false;
        if(light > MBG_LIGHT_MAX) {
            // dlog(`\nMBG light > ${MBG_LIGHT_MAX}, Setting light to ${MBG_LIGHT_MAX}`);
            light = MBG_LIGHT_MAX;
            mbgLightMax = true;
        }
        else if(light < MBG_LIGHT_MIN) {
            // dlog(`\nMBG light < ${MBG_LIGHT_MIN}, Setting light to ${MBG_LIGHT_MIN}`);
            light = MBG_LIGHT_MIN;
        }
        else if(light >= MBG_LIGHT_MIN && light <= MBG_LIGHT_MAX) {
            light = (MBG_LIGHT_MIN + MBG_LIGHT_MAX)/2;
        }

        if(sat > MBG_SAT_DND_MIN && sat < MBG_SAT_MIN) {
            // dlog(`\nMBG sat < ${MBG_SAT_MIN}, Setting sat to ${MBG_SAT_MIN}`);
            sat = sat>0? Math.min(4*sat, MBG_SAT_MIN): MBG_SAT_MIN/2;
        }
        else if(sat > MBG_SAT_MAX && !mbgLightMax) { // 35
            // dlog(`\nMBG sat > ${MBG_SAT_MAX}, Setting sat to ${MBG_SAT_MAX}`);
            sat = MBG_SAT_MAX;
        }
        else if(sat >= MBG_SAT_MIN && sat <= MBG_SAT_MAX) {
            sat = (MBG_SAT_MIN + MBG_SAT_MAX)/2;
            // dlog('MBG sat set to avg of min-max', sat);
        }

        mbgColor = hslToRgb([hue, sat, light].map((x) => x/100));

        // Original blackish colors: remove R,G,B difference amplification and bring back to grayscale
        if(ogSat < 2 || ogLight < 6 || (ogSat <18 && ogLight < 18)) {
            let rgb;
            if(theme == 'Dark')
                rgb = Math.min(mbgColor[0], mbgColor[1], mbgColor[2]);
            if(theme == 'Light' || theme == 'Pastel')
                rgb = Math.max(mbgColor[0], mbgColor[1], mbgColor[2]);
            if(rgb) mbgColor = [rgb, rgb, rgb];
        }

        if(theme == 'Dark')
            mbgColor = addShade(mbgColor, 0.15);
        if(theme == 'Light')
            mbgColor = addTint(mbgColor, 0.15);
        if(theme == 'Pastel') {
            if(hue < 0.08 || hue > 0.58) {
                mbgColor = addTint(mbgColor, 0.16);
            }
            else {
                mbgColor = addShade(mbgColor, 0.08);
            }
        }
        
        // dlog('MenuBG color (moderated): ', mbgColor);
    }

    // Adapt SMBG color to be within theme MIN MAX bounds (except for 'True Color')
    if(theme != 'Color') {
        let [hue, sat, light] = rgbToHsl(smbgColor).map((x) => x*100);
        let [ogHue, ogSat, ogLight] = [hue, sat, light];
        let smbgLightMax = false, smbgLightMin = false;
        if(light > SMBG_LIGHT_MAX) {
            // dlog(`\nlight > ${SMBG_LIGHT_MAX}, Setting light to ${SMBG_LIGHT_MAX}`);
            light = SMBG_LIGHT_MAX;
            smbgLightMax = true;
        }
        else if(light < SMBG_LIGHT_MIN) {
            // dlog(`\nlight < ${SMBG_LIGHT_MIN}, Setting light to ${SMBG_LIGHT_MIN}`);
            light = SMBG_LIGHT_MIN;
            smbgLightMin = true;
        }
        else if(light >= SMBG_LIGHT_MIN && light <= SMBG_LIGHT_MAX) {
            light = (SMBG_LIGHT_MIN + SMBG_LIGHT_MAX)/2;
        }
        if(sat > SMBG_SAT_DND_MIN && sat < SMBG_SAT_MIN) { // 40
            // dlog(`\nsat < ${SMBG_SAT_MIN}, Setting sat to ${SMBG_SAT_MIN}`);
            sat = sat>0? Math.min(4*sat, SMBG_SAT_MIN): SMBG_SAT_MIN/2; // SMBG_SAT_MIN;
        }
        else if(sat > SMBG_SAT_MAX) { // 50
            // dlog(`\nsat > ${SMBG_SAT_MAX}, Setting sat to ${SMBG_SAT_MAX}`);
            sat = SMBG_SAT_MAX;
        }
        else if(sat >= SMBG_SAT_MIN && sat <= SMBG_SAT_MAX) {
            sat = (SMBG_SAT_MIN + SMBG_SAT_MAX)/2;
        }

        smbgColor = hslToRgb([hue, sat, light].map((x) => x/100));

        // Original blackish colors: remove R,G,B difference amplification and bring back to grayscale
        if(ogSat < 2 || ogLight < 6 || (ogSat <18 && ogLight < 18)) {
            let rgb;
            if(theme == 'Dark')
                rgb = Math.max(smbgColor[0], smbgColor[1], smbgColor[2]);
            if(theme == 'Light' || theme == 'Pastel')
                rgb = Math.min(smbgColor[0], smbgColor[1], smbgColor[2]);
            if(rgb) smbgColor = [rgb, rgb, rgb];
        }

        if(theme == 'Dark') {
            let shadeTarget = smbgLightMin? 0: 40;
            smbgColor = addShade(smbgColor, 0.15, shadeTarget);
        }
        if(theme == 'Light') {
            smbgColor = addTint(smbgColor, 0.15);
        }
        if(theme == 'Pastel') {
            if(hue < 0.08 || hue > 0.58) {
                smbgColor = addTint(smbgColor, 0.16); //0.1
            }
            else {
                smbgColor = addShade(smbgColor, 0.08); //0.1
            }
        }

        // dlog('SMBG Color (moderated)', smbgColor);
    }

    // Adjust SMBG lightness if MBG-SMBG are too close
    // If SMBG is darker than MBG, make it even darker or if lighter then make even lighter
    if(theme != 'Color') {
        let mbgSmbgColorDist = colorDistance2000(mbgColor, smbgColor);
        // dlog('MBG-SMBG Color Distance ', mbgSmbgColorDist);
        if(mbgSmbgColorDist < 30) {
            let [mh, ms, ml] = rgbToHsl(mbgColor);
            let [sh, ss, sl] = rgbToHsl(smbgColor);
            // dlog('SMBG Color (before moderated)', smbgColor);
            if(sl < ml)
                smbgColor = addShade(smbgColor, (30 - mbgSmbgColorDist)/250); //150
            else
                smbgColor = addTint(smbgColor, (30 - mbgSmbgColorDist)/150);
            // dlog('SMBG Color (dist moderated)', smbgColor);
        }
    }

    // All themes
    // Adjust saturation and lightness of Accent color if Accent is too close OR too far from to MBG or SMBG
    if(theme != 'None') {
        let accentMbgColDist = colorDistance2000(accentColor, mbgColor); 
        // dlog('Accent-MBG Color Distance', accentMbgColDist);
        let accentSmbgColDist = colorDistance2000(accentColor, smbgColor); 
        // dlog('Accent-SMBG Color Distance', accentSmbgColDist);
        if(accentMbgColDist < 25 || accentSmbgColDist < 25) {
            // dlog('Accent color too close to MBG or SMBG ', accentColor);
            let lThresh, sThresh, lThreshMax = 0.3, sThreshMin = 0.25, sThreshMax = 0.25;
            if(theme == 'Color') {
                lThresh = 0.1;
                sThresh = 0.05;
            }
            else {
                lThresh = 0.15;
                sThresh = 0.1;
            }
            let [mh, ms, ml] = rgbToHsl(mbgColor);
            let [sh, ss, sl] = rgbToHsl(smbgColor);
            let [ah, as, al] = rgbToHsl(accentColor);
            let minL = Math.min(ml, sl);
            let maxL = Math.max(ml, sl);
            let minS = Math.min(ms, ss);
            let maxS = Math.max(ms, ss);    

            if(al < minL && minL - al < lThresh) {
                // dlog('al<minL: ' + al + ' - ' + minL + ' - ' + lThresh);
                al = minL - lThresh;
                // dlog('al<minL new: ' + al);
            }
            else if(al > maxL && al - maxL < lThresh) {
                // dlog('al>maxL: ' + al + ' - ' + maxL + ' - ' + lThresh);
                al = maxL + lThresh;
                // dlog('al>maxL new: ' + al);
            }
            else if(al > maxL && al - maxL > lThreshMax) {
                // dlog('al>maxL+lThreshMax: ' + al + ' - ' + maxL + ' - ' + lThreshMax);
                al = maxL + 0.65*(al - maxL);
                // dlog('al>maxL+lThreshMax new: ' + al);
            }
            else if(al >= minL && al <= maxL) {
                // dlog('al min+max / 2: ' + al);
                al = (minL + maxL)/2;
                // dlog('new al = min+max / 2: ' + al);
            }

            if(as < minS && minS - as < sThresh) {
                // dlog('as<minS: ' + as + '  ' + minS + '  ' + sThresh);
                as = minS - sThresh;
                // dlog('as<minS new: ' + as);
            }
            else if(as < minS && minS - as > sThreshMin) {
                // dlog('as<minS+sThreshMin: ' + as + '  ' + minS + '  ' + sThreshMin);
                as = as + 0.5*(minS - as - sThreshMin);
                // dlog('as<minS+sThreshMin new: ' + as);
            }
            else if(as > maxS && as - maxS < sThresh) {
                // dlog('as>maxS: ' + as + '  ' + maxS + '  ' + sThresh);
                as = maxS + sThresh;
                // dlog('as>maxS new: ' + as);
            }
            else if(as > maxS && as - maxS > sThreshMax) {
                // dlog('as>maxS+sThreshMax: ' + as + '  ' + maxS + '  ' + sThreshMax);
                as = as - 0.5*(as - maxS - sThreshMax);
                // dlog('as>maxS+sThreshMax new: ' + as);
            }
            else if(as >= minS && as <= maxS) {
                // dlog('as min+max / 2: ' + as + '  ' + minS + '  ' + maxS);
                as = (minS + maxS)/2;
                // dlog('new as = min+max / 2: ' + as);
            }

            accentColor = hslToRgb([ah, as, al]);
        
            // dlog('Accent Color (dist moderated)', accentColor);
        }
    }
     

    // BAR BG COLOR SELECTION
    best = null, closest = null;
    let barBgColor, bestBar = 1000, bestBarIdx=0, closestBarBg=1000, closestBarBgIdx=0;
    paletteLen = paletteArr.length;

    for(let i=0, paletteColor; i<paletteLen; i++) {
        paletteColor = paletteArr[i][0];
        let barProm = paletteArr[i][1];
        let [hue, sat, light] = rgbToHsl(paletteColor).map((x) => x*100); 
        // dlog('Bar Color', paletteColor, 'HSL', hue, sat, light);
        let barMbgDist = colorDistance2000(paletteColor, mbgColor); 
        // dlog('barMbgDist', barMbgDist);

        minTotal = -2.5*Math.abs(light-BAR_LIGHT_EVADE) + 1.35*barMbgDist + 0.25*sat - 1.5*barProm;
        // -1.5 +1 + 0.25 -2

        if(light > BAR_LIGHT_LOW && light < BAR_LIGHT_HIGH && barMbgDist < BAR_MBG_DIST_HIGH && sat < BAR_SAT_HIGH) {
            best = minTotal;
            // dlog('best', best);
            if(bestBar > best) {
                bestBar = best;
                bestBarIdx = i;
            }
        }
        if(!best) {
            closest = minTotal;
            // dlog('closest', closest);
            if(closestBarBg > closest) {
                closestBarBg = closest;
                closestBarBgIdx = i;
            }
        }
    }
    if(best) {
        barBgColor = paletteArr[bestBarIdx][0]; 
        // dlog('Best Bar BG Color', barBgColor, bestBarIdx);
        paletteArr.splice(bestBarIdx, 1);
    }
    else {
        barBgColor = paletteArr[closestBarBgIdx][0]; 
        // dlog('Closest Bar BG Color', barBgColor, closestBarBgIdx);
        paletteArr.splice(closestBarBgIdx, 1);
    }

    // Push Bar BG towards lighter or darker end to get enough contrast with FG text
    let barHSP = getHSP(barBgColor); 
    // dlog('barHSP', barHSP);
    if(barHSP > 155 && barHSP < 200) {
        barBgColor = addTint(barBgColor, 0.22);
        // dlog('Tint Bar BG Color', barBgColor);
    }
    else if(barHSP <= 155 && barHSP > 100) {
        barBgColor = addShade(barBgColor, 0.22);
        // dlog('Shade Bar BG Color', barBgColor);
    }

    // Add hard limits on Bar BG lightness for Dark and Light themes
    if(theme == 'Dark') {
        let [hue, sat, light] = rgbToHsl(barBgColor).map((x) => x*100); 
        if(light > 40) {
            light = 40;
            // dlog('light > 40, set to 40');
        }
        barBgColor = hslToRgb([hue, sat, light].map((x) => x/100));
        barBgColor = addShade(barBgColor, 0.15);
    }
    if(theme == 'Light') {
        let [hue, sat, light] = rgbToHsl(barBgColor).map((x) => x*100); 
        if(light < 80) {
            light = 80;
            // dlog('light < 80, set to 80');
        }
        barBgColor = hslToRgb([hue, sat, light].map((x) => x/100));
        barBgColor = addTint(barBgColor, 0.25); // TEST FOR LIGHT THEME - WAS 0.25 , NEED TO RESET????
    }


    // BORDER = NEON = SHADOW COLOR SELECTION (for BAR)
    let neon = obar._settings.get_boolean('neon');
    let barBorderPalette, barLightTarget;
    if(requestMode == 'dark') {
        barBorderPalette = paletteArr.slice(0).map(x => x[0]).sort(compareLightness).reverse(); // Sort for Light colors
        barLightTarget = BORDER_LIGHT_HIGH;
    }
    else {
        barBorderPalette = paletteArr.slice(0).map(x => x[0]).sort(compareSaturation).reverse(); // Sort for Colorful colors
        barLightTarget = BORDER_LIGHT_LOW;
    }
    let barBorderColor, closestBarBorder=1000, closestBarBorderIdx=0, borderSat, closestBorderSat, borderLight, closestBorderLight;
    
    if(neon) {
        for(let i=0, paletteColor; i<barBorderPalette.length; i++) {
            paletteColor = barBorderPalette[i];
            let [hue, sat, light] = rgbToHsl(paletteColor).map((x) => x*100); 
            // dlog('Bar Border Color', paletteColor, 'HSL', hue, sat, light);
            let barBorderIdx = paletteArr.map(x => x[0]).indexOf(paletteColor);

            if(sat > BORDER_NEON_SAT_LOW && light > BORDER_LIGHT_LOW && light < BORDER_LIGHT_HIGH) {
                barBorderColor = paletteColor;
                borderSat = sat;
                borderLight = light;
                paletteArr.splice(barBorderIdx, 1);
                // dlog('Found Neon Bar Border Color: ', barBorderColor, i);
                break;
            }
            let closest = 1.25*Math.abs(light-barLightTarget) - sat;
            if(closestBarBorder > closest) {
                closestBarBorder = closest;
                closestBarBorderIdx = barBorderIdx;
                closestBorderSat = sat;
                closestBorderLight = light;
            }
        }
        if(!barBorderColor) {
            barBorderColor = paletteArr[closestBarBorderIdx][0];
            paletteArr.splice(closestBarBorderIdx, 1);
            borderSat = closestBorderSat;
            borderLight = closestBorderLight;
            // dlog('Use Closest Neon Bar Border: ', barBorderColor, closestBarBorderIdx);
        }
        let [h, s, l] = rgbToHsl(barBorderColor);
        if(borderSat < BORDER_NEON_SAT_LOW && borderSat > BORDER_NEON_SAT_DND_MIN) {
            s = s*1.2;            
        }
        if(borderLight < BORDER_LIGHT_LOW) {
            l = l*1.2;
        }
        barBorderColor = hslToRgb([h, s, l]);
        // dlog('Saturate Bar Border Color (Neon On): ', barBorderColor);
    }
    else {
        barBorderColor = barBorderPalette[0];
        paletteArr.splice(paletteArr.map(x => x[0]).indexOf(barBorderColor), 1);
        // dlog('Use Lightest Bar Border (Neon Off): ', barBorderColor, 0);
    }


    // SET WMAX BAR BG COLOR
    let wmaxBarBgColor;
    let hBarHint = obar._settings.get_int('headerbar-hint')/100;
    if(requestMode == 'light') {
        wmaxBarBgColor = [hBarHint*accentColor[0] + (1-hBarHint)*235, 
                          hBarHint*accentColor[1] + (1-hBarHint)*235, 
                          hBarHint*accentColor[2] + (1-hBarHint)*235];
    }
    else {
        wmaxBarBgColor = [hBarHint*accentColor[0] + (1-hBarHint)*30,
                          hBarHint*accentColor[1] + (1-hBarHint)*30,
                          hBarHint*accentColor[2] + (1-hBarHint)*30];
    }


    // MENU BORDER = SHADOW COLOR SELECTION (for MENU)
    let menuBorderPalette;
    if(requestMode == 'light')
        menuBorderPalette = paletteArr.slice(0).map(x => x[0]).sort(compareLightness); // Sort for Dark colors
    else
        menuBorderPalette = paletteArr.slice(0).map(x => x[0]).sort(compareLightness).reverse(); // Sort for Light colors
    let menuBorderColor = menuBorderPalette[0];
    paletteArr.splice(paletteArr.map(x => x[0]).indexOf(menuBorderColor), 1);
    // dlog('Use Lightest Menu Border: ', menuBorderColor, 0);    
        

    let bgcolorWmax, bgcolor, bgalpha, iscolor, isalpha, bgcolor2, shcolor, hcolor, halpha, bcolor, balpha, 
    mbgcolor, mbgalpha, smbgcolor, smbgalpha, mbcolor, mbalpha, mhcolor, mhalpha, mshcolor, mshalpha, mscolor, msalpha;

    let bartype = obar._settings.get_string('bartype');
    let autobgAlpha = obar._settings.get_boolean('auto-bgalpha');

    // BAR
    bgcolor = getStrv(barBgColor);
    if(bartype == 'Mainland' || bartype == 'Floating') {
        bgalpha = 0.95;
    }
    else {
        bgalpha = 0;
    }
    iscolor = getStrv(barBgColor); 
    isalpha = 0.95;
    bgcolor2 = getStrv(smbgColor);
    bcolor = getStrv(barBorderColor);
    // hcolor = getStrv(barHighlight);
    shcolor = getStrv(barBorderColor);
    bgcolorWmax = getStrv(wmaxBarBgColor);

    // MENU
    mbgcolor = getStrv(mbgColor); 
    smbgcolor = getStrv(smbgColor); 
    mbcolor = getStrv(menuBorderColor);
    // mhcolor = getStrv(menuHighlight);
    mshcolor = getStrv(menuBorderColor);
    mscolor = getStrv(accentColor);

    // Update settings for bar and menu
    
    // BAR
    if(bartype == 'Trilands' || bartype == 'Islands')
        obar._settings.set_boolean('shadow', false);
    if(autobgAlpha) {
        obar._settings.set_double('boxalpha', 0);
        obar._settings.set_double('bgalpha', bgalpha);
        obar._settings.set_double('isalpha', isalpha);
    }
    obar._settings.set_double('fgalpha', 1.0);
    // obar._settings.set_boolean('autofg-bar', true);
    obar._settings.set_boolean('autohg-bar', true);

    // MENU
    obar._settings.set_double('mfgalpha', 1.0);
    // obar._settings.set_boolean('autofg-menu', true);
    obar._settings.set_boolean('autohg-menu', true);

    let colorKeys = ['boxcolor', 'bgcolor', 'bgcolor2', 'iscolor', 'shcolor', 'bcolor', 'bgcolor-wmax', 
                    'mbgcolor', 'smbgcolor', 'mbcolor', 'mshcolor', 'mscolor', 'winbcolor'];
    let colors = [bgcolor, bgcolor, bgcolor2, iscolor, shcolor, bcolor, bgcolorWmax, 
                    mbgcolor, smbgcolor, mbcolor, mshcolor, mscolor, mscolor];

    for(let i = 0; i < colorKeys.length; i++) {
        obar._settings.set_strv(requestMode+'-'+colorKeys[i], colors[i]);
        if((requestMode == 'dark' && currentMode == 'prefer-dark') || 
            (requestMode == 'light' && currentMode != 'prefer-dark'))
            obar._settings.set_strv(colorKeys[i], colors[i]);
    }

    // GTK Window
    // obar._settings.set_strv('winbcolor', mscolor);
    
    // Mark auto-theme is applied for font weight and trigger style reload 
    obar._settings.set_boolean('autotheme-font', true);
    obar._settings.set_boolean('pause-reload', false);
    triggerStyleReload(obar);
}

export function onModeChange(obar) {
    const importExport = obar._settings.get_boolean('import-export');
    if(importExport)
        return;
    
    // Pause stylesheet reloading, while auto-theme settings are updated, to prevent multiple style reloads
    obar._settings.set_boolean('pause-reload', true);

    let currentMode = obar._intSettings.get_string('color-scheme');
    obar._settings.set_string('color-scheme', currentMode); // Save mode for preferences
    let prefix = (currentMode == 'prefer-dark') ? 'dark-' : 'light-';
    let colorKeys = ['boxcolor', 'bgcolor', 'bgcolor2', 'iscolor', 'shcolor', 'bcolor', 'bgcolor-wmax', 'accent-color', 'winbcolor',
                    'mbgcolor', 'smbgcolor', 'mbcolor', 'mshcolor', 'mscolor', 'fgcolor', 'hcolor', 'mfgcolor', 'mhcolor'];
    for(let i = 0; i < colorKeys.length; i++) {
        obar._settings.set_strv(colorKeys[i], obar._settings.get_strv(prefix+colorKeys[i]));
        // dlog('saving to key: ', colorKeys[i], ' from key ', prefix+colorKeys[i]);
    }

    obar._settings.set_boolean('pause-reload', false);
    triggerStyleReload(obar);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
}
  
// Find Yaru theme with Accent color closest to theme accent color
export function getClosestYaruTheme(obar) {
    let yaruThemes = ['default', 'bark', 'sage', 'olive', 'viridian', 'prussiangreen', 'blue', 'purple', 'magenta', 'red'];
    let yaruAccentsHex = ['#E95420', '#787859', '#657B69', '#4B8501', '#03875B', '#308280', '#0073E5', '#7764D8', '#B34CB3', '#DA3450'];
    let yaruAccents = yaruAccentsHex.map(x => hexToRgb(x));

    let themeAccent = obar._settings.get_strv('mscolor');
    themeAccent = [parseInt(parseFloat(themeAccent[0])*255), 
                    parseInt(parseFloat(themeAccent[1])*255), 
                    parseInt(parseFloat(themeAccent[2])*255)];

    let closest = 1000;
    let closestTheme = 'default';
    for(let i = 0; i < yaruAccents.length; i++) {
        let dist = colorDistance2000(themeAccent, yaruAccents[i]);
        if(dist < closest) {
            closest = dist;
            closestTheme = yaruThemes[i];
        }
    }

    return closestTheme;
}

function triggerStyleReload(obar) {
    // Cause stylesheet to save and reload on Enable by toggling 'trigger-reload'
    let triggerReload = obar._settings.get_boolean('trigger-reload');
    if(triggerReload)
        obar._settings.set_boolean('trigger-reload', false);
    else
        obar._settings.set_boolean('trigger-reload', true);
}
