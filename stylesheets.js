/* stylesheets.js
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

/* exported reloadStyle() */

import Gio from 'gi://Gio';
import Pango from 'gi://Pango';

// Called separately for R,G and B. Moves startColor towards or away from endColor
function colorMix(startColor, endColor, factor) {
    let color = startColor + factor*(endColor - startColor);
    color = (color < 0)? 0: (color>255)? 255: parseInt(color);
    return color;
}

// Blend 2 colors: similar to 'Shade' comment below
function colorBlend(c0, c1, p) {
    var i=parseInt,r=Math.round,P=1-p,[a,b,c,d]=c0.split(","),[e,f,g,h]=c1.split(","),x=d||h,j=x?","+(!d?h:!h?d:r((parseFloat(d)*P+parseFloat(h)*p)*1000)/1000+")"):")";
    return"rgb"+(x?"a(":"(")+r(i(a[3]=="a"?a.slice(5):a.slice(4))*P+i(e[3]=="a"?e.slice(5):e.slice(4))*p)+","+r(i(b)*P+i(f)*p)+","+r(i(c)*P+i(g)*p)+j;
}

// Shade darken/lighten (e.g. p=0.2): rgb(Math.round(parseInt(r)*0.8 + 255*0.2)),...(Lighten: take 0.8 of C and add 0.2 of white, Darken: just take 0.8 of C)
function colorShade(c, p) {
    var i=parseInt,r=Math.round,[a,b,c,d]=c.split(","),P=p<0,t=P?0:255*p,P=P?1+p:1-p;
    return"rgb"+(d?"a(":"(")+r(i(a[3]=="a"?a.slice(5):a.slice(4))*P+t)+","+r(i(b)*P+t)+","+r(i(c)*P+t)+(d?","+d:")");
}

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

// Check if Dark or Light color as per HSP threshold
function getBgDark(r, g, b) {
    let hsp = getHSP(r, g, b);
    if(hsp > 175)
        return false;
    else
        return true;
}

function saveToggleSVG(toggleOn, obar, Me) {
    let svg, svgpath, svgcolor;
    if(toggleOn) {
        svg = `
        <svg viewBox="0 0 48 26" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0 -291.18)">
        <rect y="291.18" width="48" height="26" rx="13" ry="13" fill="#REPLACE"/>
        <rect x="24" y="294.18" width="22" height="22" rx="11" ry="11" fill-opacity=".2"/>
        <rect x="24" y="293.18" width="22" height="22" rx="11" ry="11" fill="#fff"/>
        </g>
        </svg>
        `;

        svgpath = Me.path + '/media/toggle-on.svg';
        svgcolor = obar.msHex;
    }
    else {
        svg = `
        <svg width="48" height="26" xmlns="http://www.w3.org/2000/svg">
        <rect style="fill:#REPLACE;fill-opacity:1;stroke:none;stroke-width:1;marker:none" width="48" height="26" x="-48" ry="13" fill="#3081e3" rx="13" transform="scale(-1 1)"/>
        <rect ry="11" rx="11" y="3" x="-24" height="22" width="22" style="fill:#000;fill-opacity:.2;stroke:none;stroke-width:.999999;marker:none" fill="#f8f7f7" transform="scale(-1 1)"/>
        <rect ry="11" rx="11" y="2" x="-24" height="22" width="22" style="fill:#fff;fill-opacity:1;stroke:none;stroke-width:.999999;marker:none" fill="#f8f7f7" transform="scale(-1 1)"/>
        </svg>
        `;

        svgpath = Me.path + '/media/toggle-off.svg';
        svgcolor = obar.smbgHex;
    }
    
    svg = svg.replace(`#REPLACE`, svgcolor);
   
    let file = Gio.File.new_for_path(svgpath);
    let bytearray = new TextEncoder().encode(svg);

    if (bytearray.length) {
        let output = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let outputStream = Gio.BufferedOutputStream.new_sized(output, 4096);
        outputStream.write_all(bytearray, null);
        outputStream.close(null);
    }
    else {
      console.log("Failed to write toggle-on/off.svg file: " + svgpath);
    }

}

function saveCheckboxSVG(checked, obar, Me) {
    let svg, svgpath, svgcolor;
    if(checked) {
        svg = `
        <svg width="24" height="24" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
        <filter id="filter946" x="-.094335" y="-.12629" width="1.1887" height="1.2526" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="0.39306292"/>
        </filter>
        <linearGradient id="linearGradient866" x1="11" x2="11" y1="21" y2="4" gradientUnits="userSpaceOnUse">
        <stop stop-color="#000000" stop-opacity=".35" offset="0"/>
        <stop stop-color="#000000" stop-opacity=".1" offset="1"/>
        </linearGradient>
        </defs>
        <rect x="4" y="4" width="16" height="16" fill="none"/>
        <rect x="2" y="2" width="20" height="20" rx="4" ry="4" opacity=".12"/>
        <rect x="3" y="3" width="18" height="18" rx="3" ry="3" fill="#REPLACE"/>
        <rect x="3" y="3" width="18" height="18" rx="3" ry="3" fill="#ffffff" opacity=".1"/>
        <rect x="3" y="4" width="18" height="17" rx="3" ry="3" fill="url(#linearGradient866)"/>
        <rect transform="rotate(45)" x="13.79" y="1.1834" width="3" height="1" fill-opacity="0"/>
        <path d="m15.806 9.1937c-0.30486 0-0.60961 0.1158-0.84321 0.3494l-4.2161 4.2161-1.7633-1.761c-0.42502-0.42502-1.1424-0.39264-1.6095 0.07454-0.46719 0.46718-0.50189 1.1869-0.076923 1.6119l2.6066 2.6042 0.0768 0.07686c0.42502 0.42502 1.1424 0.39032 1.6095-0.07686l5.0593-5.0593c0.46719-0.46719 0.46719-1.2192 0-1.6865-0.2336-0.2336-0.53836-0.3494-0.84321-0.3494z" fill="#000000" filter="url(#filter946)" opacity=".15"/>
        <path d="m15.806 8.2653c-0.30486 0-0.60961 0.1158-0.84321 0.3494l-4.2161 4.2161-1.7633-1.761c-0.42502-0.42502-1.1424-0.39264-1.6095 0.07454-0.46719 0.46718-0.50189 1.1869-0.076923 1.6119l2.6066 2.6042 0.0768 0.07686c0.42502 0.42502 1.1424 0.39032 1.6095-0.07686l5.0593-5.0593c0.46719-0.46719 0.46719-1.2192 0-1.6865-0.2336-0.2336-0.53836-0.3494-0.84321-0.3494z" fill="#ffffff"/>
        </svg>
        `;

        svgpath = Me.path + '/media/checkbox-on.svg';
        svgcolor = obar.msHex;
    }
    else {
        svg = `
        <svg width="24" height="24" fill="#000000" opacity=".54" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" ry="4" color="#000000" opacity=".12" stroke-width="1.25" style="paint-order:fill markers stroke"/>
        <rect x="3" y="3" width="18" height="18" rx="3" ry="3" color="#000000" fill="#REPLACE" stroke-width="1.2857" style="paint-order:fill markers stroke"/>
        </svg>
        `;

        svgpath = Me.path + '/media/checkbox-off.svg';
        svgcolor = obar.smbgHex;
    }
    
    svg = svg.replace(`#REPLACE`, svgcolor);
   
    let file = Gio.File.new_for_path(svgpath);
    let bytearray = new TextEncoder().encode(svg);

    if (bytearray.length) {
        let output = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let outputStream = Gio.BufferedOutputStream.new_sized(output, 4096);
        outputStream.write_all(bytearray, null);
        outputStream.close(null);
    }
    else {
      console.log("Failed to write checkbox-on/off.svg file: " + svgpath);
    }

}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

// Generate stylesheet string and save stylesheet file
function saveStylesheet(obar, Me) {

    let bartype = obar._settings.get_string('bartype');
    let boxcolor = obar._settings.get_strv('boxcolor');
    let boxalpha = obar._settings.get_double('boxalpha');
    let bgcolor = obar._settings.get_strv('bgcolor');
    let gradient = obar._settings.get_boolean('gradient');
    let grDirection = obar._settings.get_string('gradient-direction');
    let bgcolor2 = obar._settings.get_strv('bgcolor2');
    let bgalpha = obar._settings.get_double('bgalpha');
    let bgalpha2 = obar._settings.get_double('bgalpha2');
    let fgcolor = obar._settings.get_strv('fgcolor');
    let fgalpha = obar._settings.get_double('fgalpha');
    let borderColor = obar._settings.get_strv('bcolor');
    let balpha = obar._settings.get_double('balpha');
    let borderWidth = obar._settings.get_double('bwidth');
    let borderRadius = obar._settings.get_double('bradius');
    let bordertype = obar._settings.get_string('bordertype');
    let shcolor = obar._settings.get_strv('shcolor');
    let shalpha = obar._settings.get_double('shalpha');
    let islandsColor = obar._settings.get_strv('iscolor');
    let isalpha = obar._settings.get_double('isalpha');
    let neon = obar._settings.get_boolean('neon');
    let shadow = obar._settings.get_boolean('shadow');      
    let font = obar._settings.get_string("font");
    let height = obar._settings.get_double('height');
    let margin = obar._settings.get_double('margin');
    let hColor = obar._settings.get_strv('hcolor');
    let hAlpha = obar._settings.get_double('halpha');
    let hPad = obar._settings.get_double('hpad');
    let vPad = obar._settings.get_double('vpad');
    let hovereffect = obar._settings.get_boolean('heffect');
    let mfgColor = obar._settings.get_strv('mfgcolor');
    let mfgAlpha = obar._settings.get_double('mfgalpha');
    let mbgColor = obar._settings.get_strv('mbgcolor');
    let mbgAlpha = obar._settings.get_double('mbgalpha');
    let mbColor = obar._settings.get_strv('mbcolor');
    let mbAlpha = obar._settings.get_double('mbalpha');
    let mhColor = obar._settings.get_strv('mhcolor');
    let mhAlpha = obar._settings.get_double('mhalpha');
    let mshColor = obar._settings.get_strv('mshcolor');
    let mshAlpha = obar._settings.get_double('mshalpha');
    let msColor = obar._settings.get_strv('mscolor');
    let msAlpha = obar._settings.get_double('msalpha');
    let smbgColor = obar._settings.get_strv('smbgcolor');
    // let smbgAlpha = obar._settings.get_double('smbgalpha');
    let smbgOverride = obar._settings.get_boolean('smbgoverride');
    let bgcolorWMax = obar._settings.get_strv('bgcolor-wmax');
    let bgalphaWMax = obar._settings.get_double('bgalpha-wmax');
    let custMarginWmax = obar._settings.get_boolean('cust-margin-wmax');
    let marginWMax = obar._settings.get_double('margin-wmax');
    let neonWMax = obar._settings.get_boolean('neon-wmax');
    let borderWMax = obar._settings.get_boolean('border-wmax');
    let menuRadius = obar._settings.get_double('menu-radius');
    let notifRadius = obar._settings.get_double('notif-radius');
    let qtoggleRadius = obar._settings.get_double('qtoggle-radius');
    let sliderHeight = obar._settings.get_double('slider-height');
    let sliHandBorder = obar._settings.get_double('handle-border');
    let mbgGradient = obar._settings.get_boolean('mbg-gradient');
    let autofgBar = obar._settings.get_boolean('autofg-bar');
    let autofgMenu = obar._settings.get_boolean('autofg-menu');
    let widthTop = obar._settings.get_boolean('width-top');
    let widthBottom = obar._settings.get_boolean('width-bottom');
    let widthLeft = obar._settings.get_boolean('width-left');
    let widthRight = obar._settings.get_boolean('width-right');
    let radiusTopLeft = obar._settings.get_boolean('radius-topleft');
    let radiusTopRight = obar._settings.get_boolean('radius-topright');
    let radiusBottomLeft = obar._settings.get_boolean('radius-bottomleft');
    let radiusBottomRight = obar._settings.get_boolean('radius-bottomright');

    let fgred = parseInt(parseFloat(fgcolor[0]) * 255);
    let fggreen = parseInt(parseFloat(fgcolor[1]) * 255);
    let fgblue = parseInt(parseFloat(fgcolor[2]) * 255);

    const bgred = parseInt(parseFloat(bgcolor[0]) * 255);
    const bggreen = parseInt(parseFloat(bgcolor[1]) * 255);
    const bgblue = parseInt(parseFloat(bgcolor[2]) * 255);

    const boxred = parseInt(parseFloat(boxcolor[0]) * 255);
    const boxgreen = parseInt(parseFloat(boxcolor[1]) * 255);
    const boxblue = parseInt(parseFloat(boxcolor[2]) * 255);

    const bgred2 = parseInt(parseFloat(bgcolor2[0]) * 255);
    const bggreen2 = parseInt(parseFloat(bgcolor2[1]) * 255);
    const bgblue2 = parseInt(parseFloat(bgcolor2[2]) * 255);

    const bgredwmax = parseInt(parseFloat(bgcolorWMax[0]) * 255);
    const bggreenwmax = parseInt(parseFloat(bgcolorWMax[1]) * 255);
    const bgbluewmax = parseInt(parseFloat(bgcolorWMax[2]) * 255);

    const isred = parseInt(parseFloat(islandsColor[0]) * 255);
    const isgreen = parseInt(parseFloat(islandsColor[1]) * 255);
    const isblue = parseInt(parseFloat(islandsColor[2]) * 255);

    const bred = parseInt(parseFloat(borderColor[0]) * 255);
    const bgreen = parseInt(parseFloat(borderColor[1]) * 255);
    const bblue = parseInt(parseFloat(borderColor[2]) * 255);

    const shred = parseInt(parseFloat(shcolor[0]) * 255);
    const shgreen = parseInt(parseFloat(shcolor[1]) * 255);
    const shblue = parseInt(parseFloat(shcolor[2]) * 255);

    const hred = parseInt(parseFloat(hColor[0]) * 255);
    const hgreen = parseInt(parseFloat(hColor[1]) * 255);
    const hblue = parseInt(parseFloat(hColor[2]) * 255);

    let mfgred = parseInt(parseFloat(mfgColor[0]) * 255);
    let mfggreen = parseInt(parseFloat(mfgColor[1]) * 255);
    let mfgblue = parseInt(parseFloat(mfgColor[2]) * 255);

    const mbgred = parseInt(parseFloat(mbgColor[0]) * 255);
    const mbggreen = parseInt(parseFloat(mbgColor[1]) * 255);
    const mbgblue = parseInt(parseFloat(mbgColor[2]) * 255);

    const mbred = parseInt(parseFloat(mbColor[0]) * 255);
    const mbgreen = parseInt(parseFloat(mbColor[1]) * 255);
    const mbblue = parseInt(parseFloat(mbColor[2]) * 255);

    const mhred = parseInt(parseFloat(mhColor[0]) * 255);
    const mhgreen = parseInt(parseFloat(mhColor[1]) * 255);
    const mhblue = parseInt(parseFloat(mhColor[2]) * 255);

    const mshred = parseInt(parseFloat(mshColor[0]) * 255);
    const mshgreen = parseInt(parseFloat(mshColor[1]) * 255);
    const mshblue = parseInt(parseFloat(mshColor[2]) * 255);

    const msred = parseInt(parseFloat(msColor[0]) * 255);
    const msgreen = parseInt(parseFloat(msColor[1]) * 255);
    const msblue = parseInt(parseFloat(msColor[2]) * 255);
    // Save menu selection hex for use in toggle on svg
    obar.msHex = rgbToHex(msred, msgreen, msblue);
    obar.msHex = obar.msHex + parseInt(parseFloat(msAlpha)*255).toString(16);

    const pbg = `rgba(${bgred},${bggreen},${bgblue},${bgalpha})`; // panel bg color
    const phg = `rgba(${hred},${hgreen},${hblue},1.0)`; // panel highlight color
    const phbg = colorBlend(pbg, phg, hAlpha); // panel highlight blended bg color
    const isbg = `rgba(${isred},${isgreen},${isblue},${isalpha})`; // island bg color
    const ihbg = colorBlend(isbg, phg, hAlpha); // island highlight blended bg color


    const mbg = `rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha})`; // menu bg
    const mfg = `rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha})`; // menu fg
    const mhg = `rgba(${mhred},${mhgreen},${mhblue},${mhAlpha})`; // menu highlight
    const msc = `rgba(${msred},${msgreen},${msblue},${msAlpha})`; // menu selection/accent

    // Two ways to mix colors, currently both in use
    // Menu highlight fg color
    let mhfgred = colorMix(mfgred, mhred, -0.12);
    let mhfggreen = colorMix(mfggreen, mhgreen, -0.12);
    let mhfgblue = colorMix(mfgblue, mhblue, -0.12);
    let mhfg = colorBlend(mfg, mhg, -0.18);

    // Sub/Secondary menu color -
    let smbg, smbgred, smbggreen, smbgblue;
    // Manual Override: If 'override' enabled, submenu color with user defined values
    if(smbgOverride) {
        smbgred = parseInt(parseFloat(smbgColor[0]) * 255);
        smbggreen = parseInt(parseFloat(smbgColor[1]) * 255);
        smbgblue = parseInt(parseFloat(smbgColor[2]) * 255);
        smbg = `rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha})`;
    }
    else {
    // Auto-generated: go from bgcolor move towards white/black based on bgcolor darkness
        const lightrgba = `rgba(${255},${255},${255},${1.0})`;
        const darkrgba = `rgba(${0},${0},${0},${1.0})`;
        let bgdark = getBgDark(mbgred, mbggreen, mbgblue);
        let smbgTarget = bgdark? lightrgba: darkrgba;
        let [rTarget, gTarget, bTarget] = bgdark? [255,255,255]: [0,0,0];
        smbgred = colorMix(mbgred, rTarget, 0.18);
        smbggreen = colorMix(mbggreen, gTarget, 0.18);
        smbgblue = colorMix(mbgblue, bTarget, 0.18);
        smbg = colorBlend(mbg, smbgTarget, 0.18);
    }

    // Save smbg hex for use in toggle off svg
    obar.smbgHex = rgbToHex(smbgred, smbggreen, smbgblue);
    obar.smbgHex = obar.smbgHex + parseInt(parseFloat(mbgAlpha)*255).toString(16);
    
    // Submenu highlight bg color (notifications pane)
    const mhg1 = `rgba(${mhred},${mhgreen},${mhblue},1)`; // menu highlight with 1 alpha
    const smhbg = colorBlend(smbg, mhg1, mhAlpha); // sub menu blended highlight bg 

    // Menu selection highlight color
    const mshg = colorBlend(msc, mhg, 0.3);

    ///// FG COLORS for BAR and MENU
    let hfgred, hfggreen, hfgblue;
    if(autofgBar) {
        // Bar auto fg color
        if(getBgDark(bgred, bggreen, bgblue))
            fgred = fggreen = fgblue = 255;
        else
            fgred = fggreen = fgblue = 0;

        // Bar highlight auto fg color
        const hbgred = bgred*(1-hAlpha) + hred*hAlpha;
        const hbggreen = bggreen*(1-hAlpha) + hgreen*hAlpha;
        const hbgblue = bgblue*(1-hAlpha) + hblue*hAlpha;
        if(getBgDark(hbgred, hbggreen, hbgblue))
            hfgred = hfggreen = hfgblue = 255;
        else
            hfgred = hfggreen = hfgblue = 0;
    }
    else { // Manual overrides
        hfgred = fgred;
        hfggreen = fggreen;
        hfgblue = fgblue;
    }

    // Set menu auto FG colors as per background OR else set as per user override
    let smfgred, smfggreen, smfgblue, smhfgred, smhfggreen, smhfgblue, amfgred, amfggreen, amfgblue, amhfgred, amhfggreen, amhfgblue;
    if(autofgMenu) {
        // Menu auto fg color
        if(getBgDark(mbgred, mbggreen, mbgblue)) {
            mfgred = mfggreen = mfgblue = 255;
        }
        else
            mfgred = mfggreen = mfgblue = 25;

        // Menu highlight auto fg color
        const mhbgred = mbgred*(1-mhAlpha) + mhred*mhAlpha;
        const mhbggreen = mbggreen*(1-mhAlpha) + mhgreen*mhAlpha;
        const mhbgblue = mbgblue*(1-mhAlpha) + mhblue*mhAlpha;
        if(getBgDark(mhbgred, mhbggreen, mhbgblue))
            mhfgred = mhfggreen = mhfgblue = 255;
        else
            mhfgred = mhfggreen = mhfgblue = 0;

        // Sub menu auto fg color
        if(getBgDark(smbgred, smbggreen, smbgblue))
            smfgred = smfggreen = smfgblue = 255;
        else
            smfgred = smfggreen = smfgblue = 25;

        // Sub menu highlight auto fg color
        const smhbgred = smbgred*(1-mhAlpha) + mhred*mhAlpha;
        const smhbggreen = smbggreen*(1-mhAlpha) + mhgreen*mhAlpha;
        const smhbgblue = smbgblue*(1-mhAlpha) + mhblue*mhAlpha;
        if(getBgDark(smhbgred, smhbggreen, smhbgblue))
            smhfgred = smhfggreen = smhfgblue = 255;
        else
            smhfgred = smhfggreen = smhfgblue = 0;

        // Menu/Submenu active auto fg color
        if(getBgDark(msred, msgreen, msblue))
            amfgred = amfggreen = amfgblue = 255;
        else
            amfgred = amfggreen = amfgblue = 20;

        // Menu/Submenu active highlight auto fg color    
        const amhbgred = msred*(1-mhAlpha) + mhred*mhAlpha;
        const amhbggreen = msgreen*(1-mhAlpha) + mhgreen*mhAlpha;
        const amhbgblue = msblue*(1-mhAlpha) + mhblue*mhAlpha;
        if(getBgDark(amhbgred, amhbggreen, amhbgblue))
            amhfgred = amhfggreen = amhfgblue = 255;
        else
            amhfgred = amhfggreen = amhfgblue = 0;
    }
    else { // Manual overrides
        smfgred = mfgred;
        smfggreen = mfggreen;
        smfgblue = mfgblue;
        smhfgred = mhfgred;
        smhfggreen = mhfggreen;
        smhfgblue = mhfgblue;
        amfgred = mfgred;
        amfggreen = mfggreen;
        amfgblue = mfgblue;
        amhfgred = mhfgred;
        amhfggreen = mhfggreen;
        amhfgblue = mhfgblue;
    }


    let fgStyle, panelStyle, btnStyle, btnContainerStyle, borderStyle, radiusStyle, fontStyle, 
    islandStyle, dotStyle, neonStyle, gradientStyle, triLeftStyle, triBothStyle, triRightStyle, 
    triMidStyle, triMidNeonStyle, btnHoverStyle;      

    // style that applies dynamically to either the panel or the panel buttons as per bar type
    borderStyle = 
    ` border: 0px ${bordertype} rgba(${bred},${bgreen},${bblue},${balpha}); `;
    if(widthTop) borderStyle += ` border-top-width: ${borderWidth}px; `;
    if(widthRight) borderStyle += ` border-right-width: ${borderWidth}px; `;
    if(widthBottom) borderStyle += ` border-bottom-width: ${borderWidth}px; `;
    if(widthLeft) borderStyle += ` border-left-width: ${borderWidth}px; `;
    
    radiusStyle = 
    ` border-radius: 0px; `;
    let rTopLeft, rTopRight, rBottomLeft, rBottomRight;
    rTopLeft = radiusTopLeft? borderRadius: 0;
    rTopRight = radiusTopRight? borderRadius: 0;
    rBottomLeft = radiusBottomLeft? borderRadius: 0;
    rBottomRight = radiusBottomRight? borderRadius: 0;
    radiusStyle += ` border-radius: ${rTopLeft}px ${rTopRight}px ${rBottomRight}px ${rBottomLeft}px; `;

    // if (bordertype == 'double') // Radius not supported on outline
    //     style += ` outline: ${borderWidth}px ${bordertype} rgba(${bred},${bgreen},${bblue},${balpha}); `;

    // foreground style needed for both panel and buttons (all bar types)
    fgStyle =
    ` color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}); `;
    
    // panel style for panel only (all bar types)
    panelStyle = 
    ` background-color: rgba(${bgred},${bggreen},${bgblue},${bgalpha}) !important; 
      height: ${height}px !important; `;

    panelStyle += 
    ` ${radiusStyle} `;

    // button style for buttons only (all bar types)
    btnStyle = 
    ` margin: 0px; height: ${height}px !important; `;

    // island style for buttons (only island bar type)
    islandStyle = 
    ` background-color: rgba(${isred},${isgreen},${isblue},${isalpha}); `;
    
    // Triland style for left end btn of box (only triland bar type)
    triLeftStyle = 
    ` border-radius: ${borderRadius}px 0px 0px ${borderRadius}px; `;
    // Triland style for single btn box (only triland bar type)
    triBothStyle = 
    ` ${radiusStyle} `;
    // Triland style for right end btn of box (only triland bar type)
    triRightStyle = 
    ` border-radius: 0px ${borderRadius}px ${borderRadius}px 0px; `;
    // Triland style for middle btns of box (only triland bar type)
    triMidStyle = 
    ` border-radius: 0px; `;

    // Workspace dots style
    dotStyle = 
    ` background-color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}) !important; `;

    // Add font style to panelstyle (works on all bar types)
    if (font != ""){
        let font_desc = Pango.font_description_from_string(font); 
        let font_family = font_desc.get_family();
        let font_style_arr = ['normal', 'oblique', 'italic'];
        let font_style = font_style_arr[font_desc.get_style()];
        let font_stretch_arr = ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'];
        let font_stretch = font_stretch_arr[font_desc.get_stretch()];
        let font_size = font_desc.get_size() / Pango.SCALE;
        let font_weight;
        try{
            font_weight = font_desc.get_weight();
        }catch(e){
            font_weight = Math.round(font_weight/100)*100;
        }
        fontStyle = 
        `   font-size: ${font_size}pt; 
            font-weight: ${font_weight};
            font-family: "${font_family}"; 
            font-style: ${font_style}; 
            font-stretch: ${font_stretch}; 
            font-variant: normal; `; 
    }
    else
        fontStyle = '';

    panelStyle += 
    ` ${fontStyle} `;

    // Box shadow not working with rectangular box (for smaller radius), why Gnome??
    // Fix: Negative/low spread to try to contain it in that range. Range depends on bar height
    // padmod: modify formula to account for container padding in islands/trilands
    let padmod = (bartype == 'Mainland' || bartype == 'Floating')? -2: vPad;
    let radThreshold = Math.ceil(((height-2*padmod)/10.0 - 1)*5) ; 

    // Add the neon style if enabled
    if (neon) {
        let spread;           
        if(borderRadius <= radThreshold) {
            spread = gradient? -3: 0;               
        }
        else
            spread = 2;

        neonStyle =               
        ` box-shadow: 0px 0px 4px ${spread}px rgba(${bred},${bgreen},${bblue},0.55); `;
        
        spread = gradient? -3: 0; 
        triMidNeonStyle = 
        ` box-shadow: 0px 0px 4px ${spread}px rgba(${bred},${bgreen},${bblue},0.55); `;
    }
    else {
        neonStyle = ``; 
        triMidNeonStyle = ``;
    }
    triMidStyle += triMidNeonStyle;

    // Panel hover/focus style
    let triMidNeonHoverStyle = ``;
    if(hovereffect) {
        btnHoverStyle = 
        ` border: ${height/10.0}px solid rgba(${hred},${hgreen},${hblue},${hAlpha}) !important; `;
        if(neon && (bartype == 'Islands' || bartype == 'Trilands')) {
            btnHoverStyle += neonStyle.replace(`${bred},${bgreen},${bblue}`, `${hred},${hgreen},${hblue}`); 
            triMidNeonHoverStyle += triMidNeonStyle.replace(`${bred},${bgreen},${bblue}`, `${hred},${hgreen},${hblue}`);
        }
    }
    else {
        if(bartype == 'Mainland' || bartype == 'Floating')
            btnHoverStyle = 
            ` background-color: ${phbg} !important; `;
        else
            btnHoverStyle = 
            ` background-color: ${ihbg} !important; `;
    }
    if(bartype == 'Mainland' || bartype == 'Floating' || !neon) {
        btnHoverStyle += ` box-shadow: none !important; `;
    }

    // Add panel shadow if enabled. Use alpha to decide offset, blur, spread and alpha
    if (shadow) {
        if (borderRadius < radThreshold) {
            panelStyle += 
            ` box-shadow: 0px ${shalpha*20}px ${2+shalpha*30}px ${2+shalpha*20}px rgba(${shred},${shgreen},${shblue}, ${shalpha}); `;
        }
        else {
            panelStyle += 
            ` box-shadow: 0px ${shalpha*20}px ${2+shalpha*30}px ${2+shalpha*40}px rgba(${shred},${shgreen},${shblue}, ${shalpha}); `;
        }
    }
    else {
        panelStyle += 
        ` box-shadow: none; `;
    }

    // Add gradient to style if enabled
    if (gradient) {
        let startColor, endColor;
        if(bartype == 'Islands' || bartype == 'Trilands') {
            startColor = `rgba(${isred},${isgreen},${isblue},${isalpha})`;
        }
        else {
            startColor = `rgba(${bgred},${bggreen},${bgblue},${bgalpha})`;                
        }
        endColor = `rgba(${bgred2},${bggreen2},${bgblue2},${bgalpha2})`;
        gradientStyle  = 
        ` background-gradient-start: ${startColor};  
          background-gradient-end: ${endColor}; 
          background-gradient-direction: ${grDirection}; `;

        islandStyle = ``;
    }
    else
        gradientStyle = ``;

    // Candybar style 
    let candyalpha = obar._settings.get_double('candyalpha');
    let candyStyleArr = [];
    for(let i=1; i<=8; i++) {
        let candyColor = obar._settings.get_strv('candy'+i);
        let cred = parseInt(parseFloat(candyColor[0]) * 255);
        let cgreen = parseInt(parseFloat(candyColor[1]) * 255);
        let cblue = parseInt(parseFloat(candyColor[2]) * 255);
        let calpha = candyalpha;
        let candyStyle = `background-color: rgba(${cred},${cgreen},${cblue},${calpha});`;
        candyStyleArr.push(candyStyle);
    }

    
    if(bartype == 'Mainland') {
        panelStyle += 
        ` margin: 0px; border-radius: 0px; `;         
    }
    if(bartype == 'Floating') {
        panelStyle += 
        ` margin: ${margin}px ${3*margin}px; `;
    }
    if(bartype == 'Islands' || bartype == 'Trilands') {
        panelStyle += 
        ` margin: ${margin}px ${1.5*margin}px;  
          padding: 0px ${vPad}px;       
          ${fgStyle} `;  

        btnStyle += 
        ` ${borderStyle} 
          ${radiusStyle}
          ${fgStyle}
          ${islandStyle}
          ${gradientStyle}
          ${neonStyle} `;

        btnContainerStyle = 
        ` padding: ${vPad}px ${hPad}px;
          margin: 0px 0px;
          border-radius: ${borderRadius+borderWidth}px;
           `;
    }
    else {
        panelStyle += 
        ` ${fgStyle}
          ${borderStyle}
          ${gradientStyle}
          ${neonStyle} 
          padding: 0px ${vPad}px; `;
        
        btnStyle += 
        ` ${fgStyle}
          border-radius: ${Math.max(borderRadius, 5)}px; 
          border-width: 0px; `;

        btnContainerStyle = 
        ` padding: ${borderWidth+vPad}px ${borderWidth+hPad}px;
          margin: 0px 0px;
          border-radius: ${borderRadius+borderWidth}px; `; 
    }
    
    let heightWMax;
    if(custMarginWmax) {
        heightWMax = height + 2*marginWMax;
    }
    else {
        heightWMax = height + 2*margin;
        marginWMax = margin;
    }

    let menuContentStyle =
    `   box-shadow: 0 5px 10px 0 rgba(${mshred},${mshgreen},${mshblue},${mshAlpha}) !important; /* menu shadow */
        border: 1px solid rgba(${mbred},${mbgreen},${mbblue},${mbAlpha}) !important; /* menu border */
        /* add menu font */
        background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}); /* menu bg */
        color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}); /* menu fg */ 
        border-radius: ${menuRadius}px; `;
    
    if(mbgGradient) {
        menuContentStyle +=
        `   box-shadow: none !important;
            background-image: url(media/menu.svg);
            background-repeat: no-repeat;
            background-size: cover; `;
    }


    // Create Stylesheet string to write to file
    let stylesheet = `
    /* stylesheet.css
    * This file is autogenerated. Do Not Edit.
    *
    * SPDX-License-Identifier: GPL-2.0-or-later
    * author: neuromorph
    */
    `;
    
    // Panel and buttons styles
    stylesheet += `
    
        #panelBox.openbar {
           background-color: rgba(${boxred},${boxgreen},${boxblue},${boxalpha}) !important;
        }
    
        #panel.openbar {
            ${panelStyle}
        }
        #panel.openbar:windowmax {
            background-color: rgba(${bgredwmax},${bggreenwmax},${bgbluewmax},${bgalphaWMax}) !important;
            border-radius: 0px;
            border-color: rgba(${bgredwmax},${bggreenwmax},${bgbluewmax},${bgalphaWMax}) !important;
            box-shadow: none;
            margin: 0px;
            height: ${heightWMax}px !important;
        }

        #panel.openbar .button-container {
            ${btnContainerStyle}
        }
        #panel.openbar:windowmax .button-container {
            margin: ${marginWMax}px 0px;
        }

        #panel.openbar .panel-button {
            ${btnStyle}
            color: rgba(${fgred},${fggreen},${fgblue},${fgalpha});
        }
        #panel.openbar:windowmax .panel-button {
            ${borderWMax? '': 'border-color: transparent;'}
            ${neonWMax? '': 'box-shadow: none;'}                
        }

        #panel.openbar .panel-button.candy1 {
            ${candyStyleArr[0]}
        }
        #panel.openbar .panel-button.candy2 {
            ${candyStyleArr[1]}
        }
        #panel.openbar .panel-button.candy3 {
            ${candyStyleArr[2]}
        }
        #panel.openbar .panel-button.candy4 {
            ${candyStyleArr[3]}
        }
        #panel.openbar .panel-button.candy5 {
            ${candyStyleArr[4]}
        }
        #panel.openbar .panel-button.candy6 {
            ${candyStyleArr[5]}
        }
        #panel.openbar .panel-button.candy7 {
            ${candyStyleArr[6]}
        }
        #panel.openbar .panel-button.candy8 {
            ${candyStyleArr[7]}
        }

        #panel.openbar .panel-button:hover, #panel.openbar .panel-button:focus, #panel.openbar .panel-button:active, #panel.openbar .panel-button:checked {
            ${btnHoverStyle}
            color: rgba(${hfgred},${hfggreen},${hfgblue},${fgalpha});
        }

        #panel.openbar .panel-button.clock-display .clock {
            color: rgba(${fgred},${fggreen},${fgblue},${fgalpha});
        }
        #panel.openbar .panel-button:hover.clock-display .clock, #panel.openbar .panel-button:focus.clock-display .clock,
        #panel.openbar .panel-button:active.clock-display .clock, #panel.openbar .panel-button:checked.clock-display .clock {
            color: rgba(${hfgred},${hfggreen},${hfgblue},1.0);
        }
        #panel.openbar .panel-button.clock-display .clock, #panel.openbar .panel-button:hover.clock-display .clock,
        #panel.openbar .panel-button:active.clock-display .clock, #panel.openbar .panel-button:overview.clock-display .clock, 
        #panel.openbar .panel-button:focus.clock-display .clock, #panel.openbar .panel-button:checked.clock-display .clock {
            background-color: transparent;
            box-shadow: none;
        }

        #panel.openbar .panel-button.screen-recording-indicator {
            transition-duration: 150ms;
            font-weight: bold;
            background-color: rgba(224, 27, 36, 0.8);
        }
        #panel.openbar .panel-button.screen-sharing-indicator {
            transition-duration: 150ms;
            font-weight: bold;
            background-color: rgba(255, 90, 0, 0.9); 
        }

        #panel.openbar .workspace-dot {
            ${dotStyle}
        }
        
        #panel.openbar .trilands:left-child {
            ${triLeftStyle}
        }
        #panel.openbar .trilands:right-child {
            ${triRightStyle}
        }
        #panel.openbar .trilands:one-child {
            ${triBothStyle}
        }
        #panel.openbar .trilands:mid-child {
            ${triMidStyle}
        }
        #panel.openbar:windowmax .trilands:mid-child {
            ${neonWMax? '': 'box-shadow: none;'}
        }
        #panel.openbar .trilands:mid-child:hover, #panel.openbar .trilands:mid-child:focus, #panel.openbar .trilands:mid-child:active, #panel.openbar .trilands:mid-child:checked {
            ${triMidNeonHoverStyle}
        }
        
    `;

    // Menu styles
    stylesheet += `

        .openmenu.popup-menu {
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
        }

        .openmenu.popup-menu-content, .openmenu.candidate-popup-content {
            ${menuContentStyle}
        }
    `;

    stylesheet += `
        .openmenu.popup-menu-item {
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
        }
        .openmenu.popup-menu-item:focus, .openmenu.popup-menu-item:hover, .openmenu.popup-menu-item:selected {
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1.0) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            transition-duration: 0ms !important;
        }

        .openmenu.popup-menu-item:checked, .openmenu.popup-menu-item:checked:active {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.popup-menu-item:checked:focus, .openmenu.popup-menu-item:checked:hover, .openmenu.popup-menu-item:checked:selected,
        .openmenu.popup-menu-item:checked:active:focus, .openmenu.popup-menu-item:checked:active:hover, .openmenu.popup-menu-item:checked:active:selected {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
            box-shadow: none !important;
            background-color: ${mshg} !important;
        }
          
        .openmenu.popup-menu-item:active, .openmenu.popup-menu-item.selected:active {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.popup-menu-item:active:hover, .openmenu.popup-menu-item:active:focus, 
        .openmenu.popup-menu-item.selected:active:hover, .openmenu.popup-menu-item.selected:active:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
            background-color: ${mshg} !important;
        }

    `;
        // rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha})
    stylesheet += `
        .openmenu.popup-sub-menu {
            background-color: ${smbg} !important;
            border: none;
            box-shadow: none;
        }
        
        .openmenu.popup-sub-menu .popup-menu-item {
            margin: 0px;
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha});
        }
        
        .openmenu.popup-sub-menu .popup-menu-item:focus, 
        .openmenu.popup-sub-menu .popup-menu-item:hover, 
        .openmenu.popup-sub-menu .popup-menu-item:selected {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1.0) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }
        
        .openmenu.popup-sub-menu .popup-menu-item:active, 
        .openmenu.popup-sub-menu .popup-submenu-menu-item:active, 
        .openmenu.popup-sub-menu .popup-submenu-menu-item:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.popup-sub-menu .popup-menu-item:active:hover, .openmenu.popup-sub-menu .popup-menu-item:active:focus, 
        .openmenu.popup-sub-menu .popup-submenu-menu-item:active:hover, .openmenu.popup-sub-menu .popup-submenu-menu-item:active:focus,
        .openmenu.popup-sub-menu .popup-submenu-menu-item:checked:hover, .openmenu.popup-sub-menu .popup-submenu-menu-item:checked:focus {
            background-color: ${mshg} !important;
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
        }
    
    
        .openmenu.popup-menu-section .popup-sub-menu {
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
            border: none;
            box-shadow: none;
        }
        .openmenu.popup-menu-section .popup-sub-menu .popup-menu-item {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha});
        }
        .openmenu.popup-menu-section .popup-sub-menu .popup-menu-item:hover, .openmenu.popup-menu-section .popup-sub-menu .popup-menu-item:focus,
        .openmenu.popup-menu-section .popup-sub-menu .popup-menu-item:selected {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1.0) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }

        .openmenu.popup-menu-section .popup-menu-item {
            margin: 0px;
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
        }
        .openmenu.popup-menu-section .popup-menu-item:focus, .openmenu.popup-menu-section .popup-menu-item:hover, 
        .openmenu.popup-menu-section .popup-menu-item:selected {
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1.0) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }
        .openmenu.popup-menu-section .popup-menu-item:active, 
        .openmenu.popup-menu-section .popup-submenu-menu-item:active, 
        .openmenu.popup-menu-section .popup-submenu-menu-item:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.popup-menu-section .popup-menu-item:active:hover, .openmenu.popup-menu-section .popup-menu-item:active:focus, 
        .openmenu.popup-menu-section .popup-submenu-menu-item:active:hover, .openmenu.popup-menu-section .popup-submenu-menu-item:active:focus, 
        .openmenu.popup-menu-section .popup-submenu-menu-item:checked:hover, .openmenu.popup-menu-section .popup-submenu-menu-item:checked:focus {
            background-color: ${mshg} !important;
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
        }

        .openmenu.popup-menu-item .toggle-switch:checked {
            color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
        }
        .openmenu.popup-menu-item .button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},1.0) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
        }
        .openmenu.popup-menu-item .button:hover, .openmenu.popup-menu-item .button:focus, .openmenu.popup-menu-item .button:selected {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1.0) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            border-color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
        }
        .openmenu .slider{ 
            color: rgba(255,255,255,0.9) !important;
            -barlevel-height: ${sliderHeight}px;
            -slider-handle-border-width: ${sliHandBorder}px;
            -slider-handle-border-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            -barlevel-background-color: rgba(${colorMix(smbgred, mbgred, -0.2)},${colorMix(smbggreen, mbggreen, -0.2)},${colorMix(smbgblue, mbgblue, -0.2)},${mbgAlpha}) !important;
            -barlevel-active-background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;  
        }
        .openmenu.popup-separator-menu-item .popup-separator-menu-item-separator, .openmenu.popup-separator-menu-item .popup-sub-menu .popup-separator-menu-item-separator {
            background-color: rgba(${mbred},${mbgreen},${mbblue},0.75) !important;
        }

    `;

    // rgba(${mhred},${mhgreen},${mhblue},${mhAlpha})
    stylesheet += `
        .openmenu.message-list-placeholder {
            color: rgba(${mfgred},${mfggreen},${mfgblue},0.5) !important;
        }
        .openmenu.message, .openmenu.notification-banner {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
        }
        .openmenu.message:hover, .openmenu.message:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important; /* 0.9*mhAlpha */
        }
        .openmenu.message:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},0.5) !important;
        }
        .openmenu.message .message-title {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        .openmenu.message .message-source-icon, .openmenu.message .message-source-title {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        .openmenu.message .message-body {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        .openmenu.message .event-time {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        .openmenu.message:hover .message-source-icon, .openmenu.message:focus .message-source-icon,
        .openmenu.message:hover .message-title, .openmenu.message:focus .message-title,
        .openmenu.message:hover .message-source-title, .openmenu.message:focus .message-source-title,
        .openmenu.message:hover .message-body, .openmenu.message:focus .message-body,
        .openmenu.message:hover .event-time, .openmenu.message:focus .event-time {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
        }
        .openmenu.message .button, .openmenu.message .message-close-button, .openmenu.message .message-expand-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
        }
        .openmenu.message .button:hover, .openmenu.message .button:focus,
        .openmenu.message .message-close-button:hover, .openmenu.message .message-close-button:focus,
        .openmenu.message .message-expand-button:hover, .openmenu.message .message-expand-button:focus {
            background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
        }
        .openmenu.message .message-media-control {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        .openmenu.message .message-media-control:hover, .openmenu.message .message-media-control:focus {
            background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1) !important;
        }
        .openmenu.message .message-media-control:insensitive {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.5}) !important;
        }
        .openmenu.message .media-message-cover-icon .fallback {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
        }
        .openmenu.dnd-button {
            border-color: rgba(${mbgred},${mbggreen},${mbgblue},0.5) !important;
            border-radius: 50px;
        }
        .openmenu.dnd-button:hover {
            border-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }
        .openmenu.dnd-button:focus {
            border-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            box-shadow: none;
        }        
        .openmenu .toggle-switch {
            background-image: url(media/toggle-off.svg);
            background-color: transparent !important;
        }
        .openmenu .toggle-switch:checked {
            background-image: url(media/toggle-on.svg);
            background-color: transparent !important;
        }
        .openmenu .check-box StBin {
            background-image: url(media/checkbox-off.svg);
        }
        .openmenu .check-box:checked StBin {
            background-image: url(media/checkbox-on.svg);
        }
        .openmenu .check-box:focus StBin, .openmenu .check-box:focus:checked StBin {
            border-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }        
        .openmenu.message-list-clear-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
        }
        .openmenu.message-list-clear-button:hover, .openmenu.message-list-clear-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important; /* 0.9*mhAlpha */
        }
        .openmenu.message-list-clear-button:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},0.5) !important;
        }


        .openmenu.datemenu-today-button .date-label, .openmenu.datemenu-today-button .day-label {
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.25}) !important;
        } 
        .openmenu.datemenu-today-button:hover, .openmenu.datemenu-today-button:focus {
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;  /* 0.9*mhAlpha */
            border-radius: ${notifRadius}px;
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1) !important;
        }

        .openmenu.calendar {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
        }
        .openmenu.calendar .calendar-month-header .pager-button,
        .openmenu.calendar .calendar-month-header .pager-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${0.5*mbgAlpha}) !important;
        }
        .openmenu.calendar .calendar-month-header .pager-button:hover,
        .openmenu.calendar .calendar-month-header .pager-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }
        .openmenu.calendar .calendar-month-label {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${0.5*mbgAlpha}) !important;
        }
        .openmenu.calendar-day-heading  {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${0.5*mbgAlpha}) !important;
        }
        .openmenu.calendar-day-heading:focus  {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        .openmenu.calendar-day {
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${0.5*mbgAlpha}) !important;
        }
        .openmenu.calendar-weekday, .openmenu.calendar-work-day {
            color: rgba(${smfgred},${smfggreen},${smfgblue},1) !important;
            font-weight: normal;
        }
        .openmenu.calendar-nonwork-day, .openmenu.calendar-weekend {
            color: rgba(${smfgred},${smfggreen},${smfgblue},0.7) !important;
            font-weight: normal;
        }
        .openmenu.calendar-other-month-day, .openmenu.calendar-other-month {
            color: rgba(${smfgred},${smfggreen},${smfgblue},0.5) !important;
            font-weight: normal;
        }
        .openmenu.calendar-other-month-day:hover, .openmenu.calendar-other-month-day:focus, .openmenu.calendar-other-month-day:selected,
        .openmenu.calendar-other-month:hover, .openmenu.calendar-other-month:focus, .openmenu.calendar-other-month:selected,
        .openmenu.calendar-nonwork-day:hover, .openmenu.calendar-nonwork-day:focus, .openmenu.calendar-nonwork-day:selected,
        .openmenu.calendar-work-day:hover, .openmenu.calendar-work-day:focus, .openmenu.calendar-work-day:selected,
        .openmenu.calendar-weekday:hover, .openmenu.calendar-weekday:focus, .openmenu.calendar-weekday:selected,
        .openmenu.calendar-weekend:hover, .openmenu.calendar-weekend:focus, .openmenu.calendar-weekend:selected  {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }
        .openmenu.calendar-other-month-day:focus, .openmenu.calendar-other-month-day:selected,
        .openmenu.calendar-other-month:focus, .openmenu.calendar-other-month:selected,
        .openmenu.calendar-nonwork-day:focus, .openmenu.calendar-nonwork-day:selected,
        .openmenu.calendar-work-day:focus, .openmenu.calendar-work-day:selected,
        .openmenu.calendar-weekday:focus, .openmenu.calendar-weekday:selected,
        .openmenu.calendar-weekend:focus, .openmenu.calendar-weekend:selected  {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        .openmenu.calendar .calendar-today, .openmenu.calendar .calendar-today:selected {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.calendar .calendar-today:hover, .openmenu.calendar .calendar-today:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
            background-color: ${mshg} !important;
        }
        .openmenu.calendar .calendar-today:selected, .openmenu.calendar .calendar-today:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        .openmenu.calendar-week-number {
            font-weight: bold;
            font-feature-settings: "tnum";
            background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha*0.7}) !important;
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.8}) !important;
        }

        .openmenu.events-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
        }
        .openmenu.events-button:hover, .openmenu.events-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        .openmenu.events-button:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        .openmenu.events-button .events-list {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }            
        .openmenu.events-button .events-title {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.9}) !important;
        }            
        .openmenu.events-button .event-time, .openmenu.events-button .event-placeholder {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        .openmenu.events-button:hover .events-list, .openmenu.events-button:focus .events-list,
        .openmenu.events-button:hover .events-title, .openmenu.events-button:focus .events-title,
        .openmenu.events-button:hover .event-time, .openmenu.events-button:focus .event-time,
        .openmenu.events-button:hover .event-placeholder, .openmenu.events-button:focus .event-placeholder {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
        }
        
        .openmenu.world-clocks-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
        }
        .openmenu.world-clocks-button:hover, .openmenu.world-clocks-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        .openmenu.world-clocks-button:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        .openmenu.world-clocks-button .world-clocks-header, .openmenu.world-clocks-button .world-clocks-timezone {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.9}) !important;
        }
        .openmenu.world-clocks-button .world-clocks-city, .openmenu.world-clocks-button .world-clocks-time {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        .openmenu.world-clocks-button:hover .world-clocks-header, .openmenu.world-clocks-button:focus .world-clocks-header,
        .openmenu.world-clocks-button:hover .world-clocks-timezone, .openmenu.world-clocks-button:focus .world-clocks-timezone,
        .openmenu.world-clocks-button:hover .world-clocks-city, .openmenu.world-clocks-button:focus .world-clocks-city,
        .openmenu.world-clocks-button:hover .world-clocks-time, .openmenu.world-clocks-button:focus .world-clocks-time {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
        }
       
        .openmenu.weather-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
        }
        .openmenu.weather-button:hover, .openmenu.weather-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        .openmenu.weather-button:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        .openmenu.weather-button .weather-header {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        .openmenu.weather-button .weather-header.location {
            font-weight: normal;
        }
        .openmenu.weather-button .weather-forecast-time {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        .openmenu.weather-button:hover .weather-header, .openmenu.weather-button:focus .weather-header,
        .openmenu.weather-button:hover .weather-header.location, .openmenu.weather-button:focus .weather-header.location,
        .openmenu.weather-button:hover .weather-forecast-time, .openmenu.weather-button:focus .weather-forecast-time {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
        }
    `;

    stylesheet += `
        .openmenu.quick-slider .slider{                
            color: rgba(255,255,255,0.9) !important;
            -barlevel-height: ${sliderHeight}px;
            -slider-handle-border-width: ${sliHandBorder}px;
            -slider-handle-border-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            -barlevel-background-color: rgba(${colorMix(smbgred, mbgred, -0.2)},${colorMix(smbggreen, mbggreen, -0.2)},${colorMix(smbgblue, mbgblue, -0.2)},${mbgAlpha}) !important;
            -barlevel-active-background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }

        .openmenu.quick-toggle {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            box-shadow: none;
            border-radius: ${qtoggleRadius}px;
        }
        .openmenu.quick-toggle:hover, .openmenu.quick-toggle:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }   
        .openmenu.quick-toggle:checked, .openmenu.quick-toggle:checked:active, .openmenu.quick-toggle .button:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.quick-toggle:checked:hover, .openmenu.quick-toggle:checked:focus, 
        .openmenu.quick-toggle:checked:active:hover, .openmenu.quick-toggle:checked:active:focus, 
        .openmenu.quick-toggle .button:checked:hover, .openmenu.quick-toggle .button:checked:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1) !important;
            background-color: ${mshg} !important;
        }

        .openmenu.quick-menu-toggle .quick-toggle {
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            box-shadow: none;
        }
        .openmenu.quick-menu-toggle .quick-toggle:hover, .openmenu.quick-menu-toggle .quick-toggle:focus {
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        .openmenu.quick-menu-toggle .quick-toggle:checked, 
        .openmenu.quick-menu-toggle .quick-toggle:active {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            box-shadow: none;
        }
        .openmenu.quick-menu-toggle .quick-toggle:checked:hover, .openmenu.quick-menu-toggle .quick-toggle:checked:focus, 
        .openmenu.quick-menu-toggle .quick-toggle:active:hover, .openmenu.quick-menu-toggle .quick-toggle:active:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1) !important;
            background-color: ${mshg} !important;
        }
        
        .openmenu.quick-menu-toggle .quick-toggle-arrow {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }
        /* adjust borders in expandable menu button */
        .openmenu.quick-menu-toggle .quick-toggle-arrow:ltr {
            border-radius: 0 ${qtoggleRadius}px ${qtoggleRadius}px 0;
        }
        .openmenu.quick-menu-toggle .quick-toggle-arrow:rtl {
            border-radius: ${qtoggleRadius}px 0 0 ${qtoggleRadius}px;
        }
        /* adjust borders if quick toggle has expandable menu button (quick-toggle-arrow)[44+] */
        .openmenu.quick-menu-toggle .quick-toggle:ltr { border-radius: ${qtoggleRadius}px 0 0 ${qtoggleRadius}px; }
        .openmenu.quick-menu-toggle .quick-toggle:rtl { border-radius: 0 ${qtoggleRadius}px ${qtoggleRadius}px 0; }
        /* if quick toggle has no expandable menu button (quick-toggle-arrow)[44+] */
        .openmenu.quick-menu-toggle .quick-toggle:last-child {
            border-radius: ${qtoggleRadius}px;
        }
        .openmenu.quick-menu-toggle .quick-toggle-arrow:hover, .openmenu.quick-menu-toggle .quick-toggle-arrow:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }
        .openmenu.quick-menu-toggle .quick-toggle-arrow:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha*1.2}) !important;
        }
        .openmenu.quick-menu-toggle .quick-toggle-arrow:checked:hover, .openmenu.quick-menu-toggle .quick-toggle-arrow:checked:focus {
            background-color: ${mshg} !important;
        }

        .openmenu.quick-toggle-menu {
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
        }
        .openmenu.quick-toggle-menu .popup-menu-item {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        .openmenu.quick-toggle-menu .popup-menu-item:hover, .openmenu.quick-toggle-menu .popup-menu-item:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }

        .openmenu.quick-toggle-menu .popup-menu-item:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha*1.2}) !important;
        }            
        .openmenu.quick-toggle-menu .popup-menu-item:checked:focus, .openmenu.quick-toggle-menu .popup-menu-item:checked:hover, 
        .openmenu.quick-toggle-menu .popup-menu-item:checked:selected {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1) !important;
            background-color: ${mshg} !important;
        }
        .openmenu.quick-toggle-menu .header .title, .openmenu.quick-toggle-menu .header .subtitle  {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        .openmenu.quick-toggle-menu .header .icon {
            color: rgba(${amfgred},${amfggreen},${amfgblue},${mfgAlpha}) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }


        .openmenu.quick-settings-system-item .icon-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }
        .openmenu.quick-settings .icon-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }
        .openmenu.quick-settings .button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }
        .openmenu.quick-settings .button:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }        
        .openmenu.background-app-item .icon-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }

        .openmenu.quick-settings-system-item .icon-button:hover, .openmenu.quick-settings-system-item .icon-button:focus,
        .openmenu.quick-settings .icon-button:hover, .openmenu.quick-settings .icon-button:focus,
        .openmenu.quick-settings .button:hover, .openmenu.quick-settings .button:focus,
        .openmenu.background-app-item .icon-button:hover, .openmenu.background-app-item .icon-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        
        .openmenu.quick-settings .button:checked:hover, .openmenu.quick-settings .button:checked:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1) !important;
            background-color: ${mshg} !important;
        }

        .openmenu.quick-settings-system-item .power-item:checked {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.nm-network-item:checked, .openmenu.nm-network-item:active {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }          
        .openmenu.bt-device-item:checked {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.keyboard-brightness-level .button:checked {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        .openmenu.background-apps-quick-toggle:checked {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
    `;
    
    let stylepath = Me.path + '/stylesheet.css';
    let file = Gio.File.new_for_path(stylepath);
    let bytearray = new TextEncoder().encode(stylesheet);

    if (bytearray.length) {
        let output = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let outputStream = Gio.BufferedOutputStream.new_sized(output, 4096);
        outputStream.write_all(bytearray, null);
        outputStream.close(null);
    }
    else {
      console.log("Failed to write stylsheet file: " + stylepath);
    }

    if(obar.msSVG) {
        saveToggleSVG(true, obar, Me); 
        saveCheckboxSVG(true, obar, Me);
        obar.msSVG = false;
    }

    if(obar.bgSVG) {
        saveToggleSVG(false, obar, Me);
        saveCheckboxSVG(false, obar, Me);
        obar.bgSVG = false;
    }

}

export function reloadStyle(obar, Me) { 
    const importExport = obar._settings.get_boolean('import-export');
    const pauseStyleReload = obar._settings.get_boolean('pause-reload');
    if(importExport || pauseStyleReload)
        return;
    // console.log('reloadStyle called with ImportExport false, Pause false');
    // Save stylesheet from string to css file
    saveStylesheet(obar, Me);
    // Cause stylesheet to reload by toggling 'reloadstyle'
    let reloadstyle = obar._settings.get_boolean('reloadstyle');
    if(reloadstyle)
        obar._settings.set_boolean('reloadstyle', false);
    else
        obar._settings.set_boolean('reloadstyle', true);
}
