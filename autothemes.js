/* autotheme.js
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

/* exported autoApplyBGPalette() */


// Brightness of color in terms of HSP value
function getHSP(r, g, b) {
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

    // console.log('COLOR MOVE - ' + A + ' - ' + B + ' - ' + newR + ' ' + newG + ' ' + newB);
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
    // console.log('COLOR DIST - ' + A + ' , ' + B + ' - ' + dist);
    return dist;
}

function compareColorfulness(A, B) {
    // We consider greater difference between the R, G, B values to indicate colorfulness
    // while similar values for R,G,B to indicate greyscale
    let [r, g, b] = [parseInt(A[0]), parseInt(A[1]), parseInt(A[2])];
    let colorDistA = Math.max(r, g, b) - Math.min(r, g, b);
    [r, g, b] = [parseInt(B[0]), parseInt(B[1]), parseInt(B[2])];
    let colorDistB = Math.max(r, g, b) - Math.min(r, g, b);
    return (colorDistA < colorDistB)? -1 : (colorDistA > colorDistB)? 1 : 0;
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

// Auto-Theming: Select colors from color palettes as per theme/variation
// Manipulate colors for better contrast and readability, as needed
export function autoApplyBGPalette(obar) {
    const importExport = obar._settings.get_boolean('import-export');
    if(importExport)
        return;
    
    // console.log('autoApply caller ' + autoApplyBGPalette.caller);
    obar._settings.set_boolean('pause-reload', true);

    let red = ['255', '0', '0'];
    let white = ['255', '255', '255'];
    let darkgrey = ['50', '50', '50'];
    let black = ['0', '0', '0'];
    let iters = 6;
    let delta = 0.06;
    let theme = obar._settings.get_string('autotheme');
    let variation = obar._settings.get_string('variation');

    if(theme == 'Select Theme' || variation == 'Select Variation')
        return;

    // const toRGBArray = rgbStr => rgbStr.match(/\d+/g);

    let prominentArr = [], paletteArr = [];
    let allArr = [];
    for(let i=1; i<=18; i++) {
        if(i<=6) {
            prominentArr.push(obar._settings.get_strv('prominent'+i));
            allArr.push(obar._settings.get_strv('prominent'+i));
        }
        else {
            paletteArr.push(obar._settings.get_strv('palette'+(i-6)));
            allArr.push(obar._settings.get_strv('palette'+(i-6)));
        }
    }
    let prominentRaw1 = prominentArr[0];
    let prominentRaw2 = prominentArr[1];

    // Sort prominentArr as per the HSP (brightness) [slice(0) to copy array]
    let prominentHSP = prominentArr.slice(0).sort(compareHSP);
    if(theme == 'Light')
        prominentHSP = prominentHSP.reverse();

    let prominent1, prominent2, prominent3;
    prominent1 = prominentHSP[0];

    // Bar BG (prominent1): Lighten or Darken as per theme
    if(theme == 'Light') { // Merge with White (50%)
        let prom1 = [0.5*parseInt(prominent1[0]) + 127, 
                        0.5*parseInt(prominent1[1]) + 127, 
                        0.5*parseInt(prominent1[2]) + 127]; 
        prominent1 = [prom1[0].toString(), prom1[1].toString(), prom1[2].toString()];
    }
    else if(theme == 'Dark') { // Merge with DarkGrey (50%)
        let prom1 = [0.5*parseInt(prominent1[0]) + 25, 
                        0.5*parseInt(prominent1[1]) + 25, 
                        0.5*parseInt(prominent1[2]) + 25]; 
        prominent1 = [prom1[0].toString(), prom1[1].toString(), prom1[2].toString()];
    }

    // Sort allArr as per the colorfulness for each color in array
    let allColorful = paletteArr.slice(0).sort(compareColorfulness);
    let colorful1, colorful2, colorful3;
    
    let l = allColorful.length;
    let c1c2HCandidates;
    let overrideAccent = obar._settings.get_boolean('accent-override');
    // If accent override enabled, set user specified color as accent and mark top 2 colorful colors as highlight candidates
    if(overrideAccent) {
        colorful1 = obar._settings.get_strv('accent-color');
        colorful1 = [parseFloat(colorful1[0])*255, parseFloat(colorful1[1])*255, parseFloat(colorful1[2])*255];
        colorful1 = [parseInt(colorful1[0]).toString(), parseInt(colorful1[1]).toString(), parseInt(colorful1[2]).toString()];
        c1c2HCandidates = [allColorful[l-1], allColorful[l-2]];
    }
    else {  
        // Select Accent from two colors with highest colorfulness, as the one that is closer to Red and is bright
        // and next color as Highlight candidate for bar and menu      
        if(getColorDist(allColorful[l-1], red) - getHSP(parseInt(allColorful[l-1][0]), parseInt(allColorful[l-1][1]), parseInt(allColorful[l-1][2])) <= 
            getColorDist(allColorful[l-2], red) - getHSP(parseInt(allColorful[l-2][0]), parseInt(allColorful[l-2][1]), parseInt(allColorful[l-2][2]))) {
            colorful1 = allColorful[l-1];
            colorful2 = allColorful[l-2];
        }
        else {
            colorful1 = allColorful[l-2];
            colorful2 = allColorful[l-1];
        }

        // Dealta Factor logic (everywhere): 
        // Compute distance from threshold as percentage (e.g. (180-c1Hsp)/180 )
        // Add one to it (e.g. if % dist is 0.25 make it 1.25. 1+(180-c1Hsp)/180) = 2-c1Hsp/180
        // Then multiply delta with it (e.g. delta*1.25)

        // Lighten accent color if its brightness is lower than threshold
        for(let i=0; i<iters; i++) {
            let c1Hsp = getHSP(parseInt(colorful1[0]), parseInt(colorful1[1]), parseInt(colorful1[2]));
            if(c1Hsp < 180) {            
                colorful1 = colorMove(colorful1, white, delta*(2-c1Hsp/180));
            }
        }
        c1c2HCandidates = [colorful2];
    }        

    // Menu and Bar highlight candidates colors (from top colorful ones)
    let highlightCandidates = c1c2HCandidates.concat([allColorful[l-3], allColorful[l-4], allColorful[l-5], allColorful[l-6]]);

    let btFactor;
    if(variation == "Default") {
        // Brighter highlight color (can lead to darker backgrounds)
        btFactor = 2;
    }
    else if(variation == "Alt") {
        // Darker highlight color (can lead to lighter backgrounds)
        btFactor = -2;
    }
    // Menu Highlight color should be away from Accent color with brightness as per btFactor
    highlightCandidates.sort((A,B) => {
        let distA = getColorDist(A, colorful1) + btFactor*getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2]));// + 1*Math.abs(getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2])) - 165);
        let distB = getColorDist(B, colorful1) + btFactor*getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2]));// + 1*Math.abs(getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2])) - 165);
        return (distA > distB)? -1 : (distA < distB)? 1 : 0;
    });
    colorful2 = highlightCandidates[0];

    // Bar Highlight color should be away from bar BG color with brightness as per btFactor
    highlightCandidates.splice(0, 1);
    highlightCandidates.sort((A,B) => {
        let distA = getColorDist(A, prominent1) + btFactor*getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2]));// + 1*Math.abs(getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2])) - 165);
        let distB = getColorDist(B, prominent1) + btFactor*getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2]));// + 1*Math.abs(getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2])) - 165);
        return (distA > distB)? -1 : (distA < distB)? 1 : 0;
    });
    colorful3 = highlightCandidates[0];

    // Identify colors for Menu BG (prominent2) and SubMBG (prominent3) such that they are:
    // at least a Min dist away from Accent (colorful1), Highlight (colorful2) and FG (white/black)
    let fgCol;
    if(theme == 'Color' || theme == 'Dark') {
        fgCol = white;
    }
    else if(theme == 'Light') {
        fgCol = black;
    }
    function compareColrDist(A, B) {
        let accentDistA = getColorDist(A, colorful1);
        let highlightDistA = getColorDist(A, colorful2);
        let fgDistA = getColorDist(A, fgCol);
        let accentDistB = getColorDist(B, colorful1);
        let highlightDistB = getColorDist(B, colorful2);
        let fgDistB = getColorDist(B, fgCol);
        let distA = Math.min(accentDistA + highlightDistA + fgDistA);
        let distB = Math.min(accentDistB + highlightDistB + fgDistB);
        return (distA > distB)? -1 : (distA < distB)? 1 : 0;
    }

    let threshold = 120;

    let menuBGCandidates = prominentHSP.slice(1);
    if(theme == 'Light' || theme == 'Dark') {
        menuBGCandidates = menuBGCandidates.concat(paletteArr);
    }
    // Filter out colors that are too close to accent, highlight or fg
    for(let i=0; i<menuBGCandidates.length; i++) {
        if(getColorDist(menuBGCandidates[i], colorful1) < threshold || 
            getColorDist(menuBGCandidates[i], colorful2) < threshold || 
            getColorDist(menuBGCandidates[i], fgCol) < threshold) {
            menuBGCandidates.splice(i, 1);
            i--;
        }
    }
    // console.log('Filtered menuBGCandidates ' + menuBGCandidates);  

    let assignedMenuBG = false, assignedSubMenuBG = false;
    if(menuBGCandidates.length >= 2) {
        menuBGCandidates.sort(compareColrDist);
        prominent2 = menuBGCandidates[0]; // Menu BG
        prominent3 = menuBGCandidates[1]; // Sub Menu BG

        // In case both prominent2 and prominent3 are too close to each other
        // change prominent3 to next in line that works
        for(const c of menuBGCandidates) {
            if(getColorDist(c, prominent2) > 75) {
                prominent3 = c;
                break;
            }
        }

        assignedMenuBG = true;
        assignedSubMenuBG = true;
    }
    else if(menuBGCandidates.length == 1) {
        prominent2 = menuBGCandidates[0];
        assignedMenuBG = true;
    }
    if(!assignedMenuBG || !assignedSubMenuBG) { 
        // console.log('PROM-DARK 2 and/or 3 Not found !!');
        menuBGCandidates = prominentHSP.slice(1); 
        if(assignedMenuBG)
            menuBGCandidates.splice(menuBGCandidates.indexOf(prominent2), 1);
        let mBGCandidates = menuBGCandidates.concat(paletteArr);
        menuBGCandidates = mBGCandidates.slice(0);

        for(let i=0; i<menuBGCandidates.length; i++) {
            if(getColorDist(menuBGCandidates[i], colorful1) < threshold || 
                getColorDist(menuBGCandidates[i], colorful2) < threshold || 
                getColorDist(menuBGCandidates[i], white) < threshold) {
                menuBGCandidates.splice(i, 1);
                i--;
            }
        }
        if(menuBGCandidates.length >= 2) {
            menuBGCandidates.sort(compareColrDist);
            if(assignedMenuBG) {
                prominent3 = menuBGCandidates[0];
            }
            else {
                prominent2 = menuBGCandidates[0];
                prominent3 = menuBGCandidates[1];
            }

            // In case both prominent2 and prominent3 are too close to each other
            // change prominent3 to next in line that works
            for(const c of menuBGCandidates) {
                if(getColorDist(c, prominent2) > 75) {
                    prominent3 = c;
                    break;
                }
            }

            assignedMenuBG = true;
            assignedSubMenuBG = true;
        }
        else {
            // console.log('LAST RESORTT!!');
            menuBGCandidates = mBGCandidates.slice(0);
            menuBGCandidates.sort(compareColrDist);

            prominent2 = menuBGCandidates[0];
            prominent3 = menuBGCandidates[1];

            menuBGCandidates = menuBGCandidates.slice(1);
            for(const c of menuBGCandidates) {
                if(getColorDist(c, prominent2) > 75 && getColorDist(c, colorful2) > 75) {
                    prominent3 = c;
                    break;
                }
            }
        }

    }

    if(theme == 'Color') {
        if(!assignedMenuBG || !assignedSubMenuBG)
            delta = 0.09;
        else
            delta = 0.06;

        // Adjust BG color prominent2 as needed
        for(let i=0; i<iters; i++) {
            let c1Dist = getColorDist(prominent2, colorful1); // accent
            if(c1Dist < threshold) {               
                prominent2 = colorMove(prominent2, colorful1, -delta*(2-c1Dist/threshold));
                // console.log('PROM_DARK2 accent ' + prominent2);
            }

            let c2Dist = getColorDist(prominent2, colorful2); // highlight
            if(c2Dist < 100) {               
                prominent2 = colorMove(prominent2, colorful2, -delta*(2-c2Dist/100));
                // console.log('PROM_DARK2 highlight ' + prominent2);
            }

            let prom3Dist = getColorDist(prominent2, prominent3); // smbg
            if(prom3Dist < 75) {               
                prominent2 = colorMove(prominent2, prominent3, -delta*(2-prom3Dist/75));
                // console.log('PROM_DARK2 sub ' + prominent2);
            }

            let pDark2Hsp = getHSP(parseInt(prominent2[0]), parseInt(prominent2[1]), parseInt(prominent2[2]));
            // console.log('prominent2 HSP ' + pDark2Hsp);
            if(pDark2Hsp < 50) {               
                prominent2 = colorMove(prominent2, white, delta*(2-pDark2Hsp/50));
                // console.log('prominent2-White1 ' + prominent2);
            }
            if(pDark2Hsp > 175) {               
                prominent2 = colorMove(prominent2, white, -delta*(pDark2Hsp)/175);
                // console.log('prominent2-White2 ' + prominent2);
            }
        }
        
        // Adjust SMBG color prominent3 as needed
        for(let i=0; i<iters; i++) {
            let c1Dist = getColorDist(prominent3, colorful1); // accent
            if(c1Dist < threshold) {               
                prominent3 = colorMove(prominent3, colorful1, -delta*(2-c1Dist/threshold));
                // console.log('PROM_DARK3 accent ' + prominent3);
            }

            let c2Dist = getColorDist(prominent3, colorful2); // highlight
            if(c2Dist < 100) {               
                prominent3 = colorMove(prominent3, colorful2, -delta*(2-c2Dist/100));
                // console.log('PROM_DARK3 highlight ' + prominent3);
            }

            let prom2Dist = getColorDist(prominent3, prominent2); // mbg
            if(prom2Dist < 75) {               
                prominent3 = colorMove(prominent3, prominent2, -delta*(2-prom2Dist/75));
                // console.log('PROM_DARK3 sub ' + prominent3);
            }
            
            let pDark3Hsp = getHSP(parseInt(prominent3[0]), parseInt(prominent3[1]), parseInt(prominent3[2]));
            // console.log('prominent3 HSP ' + pDark3Hsp);

            if(pDark3Hsp < 50) {               
                prominent3 = colorMove(prominent3, white, delta*(2-pDark3Hsp/50));
                // console.log('prominent3-White1 ' + prominent3);
            }
            if(pDark3Hsp > 175) {               
                prominent3 = colorMove(prominent3, white, -delta*(pDark3Hsp)/175);
                // console.log('prominent3-White2 ' + prominent3);
            }
        }
    }
    else if(theme == 'Light') {
        // Lighten by merging with White
        let prom2 = [0.5*parseInt(prominent2[0]) + 127, 
                        0.5*parseInt(prominent2[1]) + 127, 
                        0.5*parseInt(prominent2[2]) + 127]; 
        prominent2 = [prom2[0].toString(), prom2[1].toString(), prom2[2].toString()];

        let prom3 = [0.5*parseInt(prominent3[0]) + 127, 
                        0.5*parseInt(prominent3[1]) + 127, 
                        0.5*parseInt(prominent3[2]) + 127];
        prominent3 = [prom3[0].toString(), prom3[1].toString(), prom3[2].toString()];

        // Push MBG and SMBG away from each other
        for(let i=0; i<3; i++) {
            let prom2Dist = getColorDist(prominent3, prominent2);
            if(prom2Dist < 75) {               
                prominent3 = colorMove(prominent3, prominent2, -delta*(2-prom2Dist/75));
                // console.log('PROM_DARK3 sub ' + prominent3);
            }
            let prom3Dist = getColorDist(prominent2, prominent3);
            if(prom3Dist < 75) {               
                prominent2 = colorMove(prominent2, prominent3, -delta*(2-prom3Dist/75));
                // console.log('PROM_DARK2 sub ' + prominent2);
            }
        }
    }
    else if(theme == 'Dark') {
        // Darken by merging with Darkgrey            
        let prom2 = [0.5*parseInt(prominent2[0]) + 25, 
                        0.5*parseInt(prominent2[1]) + 25, 
                        0.5*parseInt(prominent2[2]) + 25]; 
        prominent2 = [prom2[0].toString(), prom2[1].toString(), prom2[2].toString()];

        let prom3 = [0.5*parseInt(prominent3[0]) + 25, 
                        0.5*parseInt(prominent3[1]) + 25, 
                        0.5*parseInt(prominent3[2]) + 25];
        prominent3 = [prom3[0].toString(), prom3[1].toString(), prom3[2].toString()];

        // Push MBG and SMBG away from each other
        for(let i=0; i<3; i++) {
            let prom2Dist = getColorDist(prominent3, prominent2);
            if(prom2Dist < 75) {               
                prominent3 = colorMove(prominent3, prominent2, -delta*(2-prom2Dist/75));
                // console.log('PROM_DARK3 sub ' + prominent3);
            }
            let prom3Dist = getColorDist(prominent2, prominent3);
            if(prom3Dist < 75) {               
                prominent2 = colorMove(prominent2, prominent3, -delta*(2-prom3Dist/75));
                // console.log('PROM_DARK2 sub ' + prominent2);
            }
        }
    }
    
    // HIGHLIGHTS
    delta = 0.06;
    // Adjust Menu Highlight colorful2 as needed
    for(let i=0; i<iters; i++) {
        let c1Dist = getColorDist(colorful2, colorful1);
        if(c1Dist < 100) {               
            colorful2 = colorMove(colorful2, colorful1, -delta*(2-c1Dist/100));
        }
        let pDark2Dist = getColorDist(colorful2, prominent2);           
        if(pDark2Dist < 100) {               
            colorful2 = colorMove(colorful2, prominent2, -delta*(2-pDark2Dist/100)); 
        }
        let pDark3Dist = getColorDist(colorful2, prominent3);
        if(pDark3Dist < 100) {               
            colorful2 = colorMove(colorful2, prominent3, -delta*(2-pDark3Dist/100));
        }

        let c2Hsp = getHSP(parseInt(colorful2[0]), parseInt(colorful2[1]), parseInt(colorful2[2]));
        if(theme == 'Light') { // Light theme
            if(c2Hsp < 150) {               
                colorful2 = colorMove(colorful2, white, 2*delta*(2-c2Hsp/150));
            }
        }
        else { // Non-Light theme
            if(c2Hsp < 100) {               
                colorful2 = colorMove(colorful2, white, delta*(2-c2Hsp/100));
            }           
            if(c2Hsp > 200) {               
                colorful2 = colorMove(colorful2, white, -delta*(c2Hsp)/200);
            }
        }
    }
    
    for(let i=0; i<iters; i++) {
        let pDark1Dist = getColorDist(colorful3, prominent1);
        if(pDark1Dist < 100) {               
            colorful3 = colorMove(colorful3, prominent1, -delta*(2-pDark1Dist/100));
        }
        
        let c3Hsp = getHSP(parseInt(colorful3[0]), parseInt(colorful3[1]), parseInt(colorful3[2]));
        if(theme == 'Light') { // Light theme
            if(c3Hsp < 150) {               
                colorful3 = colorMove(colorful3, white, 2*delta*(2-c3Hsp/150));
            }
        }
        else { // Non-Light theme
            if(c3Hsp < 100) {               
                colorful3 = colorMove(colorful3, white, delta*(2-c3Hsp/100));
            }
            if(c3Hsp > 200) {               
                colorful3 = colorMove(colorful3, white, -delta*(c3Hsp)/200);
            }
        }
    }

    // BORDER & SHADOW
    let allHSP = allArr.slice(0).sort(compareHSP);
    if(theme == 'Light')
        allHSP = allHSP.reverse();
    let allHSP1 = allHSP[17]; // Bar border color
    let allHSP2 = allHSP[16]; // Menu border and shadow color

    // Move Bar border color towards white (lighter seems better for both dark/light thems)
    for(let i=0; i<iters; i++) {
        if(getColorDist(allHSP1, white) > 90) {               
            allHSP1 = colorMove(allHSP1, white, 2*delta);
        }
    }

    // WMAX BAR
    let bgwmax;
    if(theme == 'Light') { // Merge with 80% white
        bgwmax = [0.2*parseInt(prominent2[0]) + 204, 
                    0.2*parseInt(prominent2[1]) + 204, 
                    0.2*parseInt(prominent2[2]) + 204]; 
        bgwmax = [bgwmax[0].toString(), bgwmax[1].toString(), bgwmax[2].toString()];
    }
    else { // Merge with 80% darkgrey
        bgwmax = [0.2*parseInt(prominent2[0]) + 20, 
                    0.2*parseInt(prominent2[1]) + 20, 
                    0.2*parseInt(prominent2[2]) + 20]; 
        bgwmax = [bgwmax[0].toString(), bgwmax[1].toString(), bgwmax[2].toString()];
    }


    let bgcolorWmax, bgalphaWmax, fgcolor, fgalpha, bgcolor, bgalpha, iscolor, isalpha, bgcolor2, bgalpha2, shcolor, shalpha, 
    hcolor, halpha, bcolor, balpha, mfgcolor, mfgalpha, mbgcolor, mbgalpha, smbgcolor, smbgalpha, mbcolor, 
    mbalpha, mhcolor, mhalpha, mshcolor, mshalpha, mscolor, msalpha;

    let bartype = obar._settings.get_string('bartype');
    
    if(fgCol == white) {
        fgcolor = ['1.0', '1.0', '1.0'];
        mfgcolor = ['1.0', '1.0', '1.0'];
    }
    else {
        fgcolor = ['0.0', '0.0', '0.0'];
        mfgcolor = ['0.0', '0.0', '0.0'];
    }

    // BAR
    fgalpha = 1.0;
    bgcolor = getStrv(prominent1);
    if(bartype == 'Mainland' || bartype == 'Floating') {
        bgalpha = 0.9;
    }
    else {
        bgalpha = 0;
    }
    iscolor = getStrv(prominent1);
    isalpha = 0.9;
    bgcolor2 = ['0.5', '0.5', '0.5'];
    bgalpha2 = 0.9;
    bcolor = getStrv(allHSP1);
    balpha = 0.6;
    hcolor = getStrv(colorful3);
    halpha = 0.75;
    shcolor = getStrv(allHSP1);
    shalpha = 0.16;
    bgcolorWmax = getStrv(bgwmax);
    bgalphaWmax = 0.9;

    // MENU
    mfgalpha = 1.0; 
    mbgcolor = getStrv(prominent2);
    mbgalpha = 0.95;
    smbgcolor = getStrv(prominent3);
    smbgalpha = 0.95;
    mbcolor = getStrv(allHSP2);
    mbalpha = 0.5;
    mhcolor = getStrv(colorful2);
    mhalpha = 0.5;
    mshcolor = getStrv(allHSP2);
    mshalpha = 0.16;
    mscolor = getStrv(colorful1);
    msalpha = 0.9;

    // Update settings for bar and menu
    if(bartype == 'Trilands' || bartype == 'Islands')
        obar._settings.set_boolean('shadow', false);
    obar._settings.set_strv('fgcolor', fgcolor);
    obar._settings.set_double('fgalpha', fgalpha);
    obar._settings.set_boolean('autofg-bar', true);
    obar._settings.set_strv('bgcolor', bgcolor);
    obar._settings.set_double('bgalpha', bgalpha);
    obar._settings.set_strv('bgcolor2', bgcolor2);
    obar._settings.set_double('bgalpha2', bgalpha2);
    obar._settings.set_strv('iscolor', iscolor);
    obar._settings.set_double('isalpha', isalpha);
    obar._settings.set_strv('shcolor', shcolor);
    obar._settings.set_double('shalpha', shalpha);
    obar._settings.set_strv('bcolor', bcolor);
    obar._settings.set_double('balpha', balpha);
    obar._settings.set_strv('hcolor', hcolor);
    obar._settings.set_double('halpha', halpha);
    obar._settings.set_strv('bgcolor-wmax', bgcolorWmax);
    obar._settings.set_double('bgalpha-wmax', bgalphaWmax);

    obar._settings.set_strv('mfgcolor', mfgcolor);
    obar._settings.set_double('mfgalpha', mfgalpha);
    obar._settings.set_boolean('autofg-menu', true);
    obar._settings.set_strv('mbgcolor', mbgcolor);
    obar._settings.set_double('mbgalpha', mbgalpha);
    obar._settings.set_strv('smbgcolor', smbgcolor);
    obar._settings.set_double('smbgalpha', smbgalpha);
    obar._settings.set_strv('mbcolor', mbcolor);
    obar._settings.set_double('mbalpha', mbalpha);
    obar._settings.set_strv('mhcolor', mhcolor);
    obar._settings.set_double('mhalpha', mhalpha);
    obar._settings.set_strv('mshcolor', mshcolor);
    obar._settings.set_double('mshalpha', mshalpha);
    obar._settings.set_strv('mscolor', mscolor);
    obar._settings.set_double('msalpha', msalpha);
    
    obar._settings.set_boolean('pause-reload', false);
    triggerStyleReload(obar);
}

function triggerStyleReload(obar) {
    // Cause stylesheet to save and reload on Enable by toggling 'trigger-reload'
    let triggerReload = obar._settings.get_boolean('trigger-reload');
    if(triggerReload)
        obar._settings.set_boolean('trigger-reload', false);
    else
        obar._settings.set_boolean('trigger-reload', true);
}
