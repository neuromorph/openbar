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
import GLib from 'gi://GLib';

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
    if(hsp > 155)
        return false;
    else
        return true;
}

// SVG for calendar event dot icon (use fg color)
function saveCalEventSVG(obar, Me) {
    let svg, svgpath, svgcolor;
    svg = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <circle style="color:#000;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;
    mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;solid-color:#000;solid-opacity:1;
    fill:#REPLACE;fill-opacity:.858;fill-rule:nonzero;stroke:none;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;
    stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;marker:none;marker-start:none;marker-mid:none;
    marker-end:none;paint-order:normal;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate" cx="16" cy="28" r="2"/>
    </svg>
    `;
    svgpath = Me.path + '/media/calendar-today.svg';
    svgcolor = obar.smfgHex;
    
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
      console.log("Failed to write calendar-today.svg file: " + svgpath);
    }

}

// SVG for toggle switch (toggle On)
function saveToggleSVG(type, obar, Me) {
    let svg, svgpath, svgFill = svgStroke = '';
    if(type == 'on') {
        svg =
        `<svg viewBox="0 0 48 26" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0 -291.18)">
                <rect y="291.18" width="48" height="26" rx="13" ry="13" style="fill:#SVGFILL;stroke:#SVGSTROKE;stroke-width:1;marker:none"/>
                <rect x="24" y="294.18" width="22" height="22" rx="11" ry="11" fill-opacity=".2"/>
                <rect x="24" y="293.18" width="22" height="22" rx="11" ry="11" fill="#fff"/>
            </g>
        </svg>`;

        svgpath = Me.path + '/media/toggle-on.svg';
        svgFill = obar.msHex;
        svgStroke = obar.msHex;
    }
        
    svg = svg.replace(`#SVGFILL`, svgFill);
    svg = svg.replace(`#SVGSTROKE`, svgStroke);
   
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

// SVG for checkbox buttons (On, On-focused, Off-focused)
function saveCheckboxSVG(type, obar, Me) {
    let svg, svgpath, svgFill = svgStroke = 'none';
    if(type == 'on') {
        svg = `
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="3" fill="#SVGFILL" stroke="#SVGSTROKE" stroke-linejoin="round" style="stroke-width:1"/>
            <path d="m20.16 7.527-1.253-1.414-.118.104-8.478 7.426-4.97-4.263-1.503 1.699 6.474 6.811z" fill="#fff" fill-rule="evenodd"/>
        </svg>
        `;

        svgpath = Me.path + '/media/checkbox-on.svg';
        svgFill = obar.msHex;
        svgStroke = obar.msHex;
    }
    else if(type == 'on-focused'){
        svg = `
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="3" fill="#SVGFILL" stroke="#SVGSTROKE" stroke-linejoin="round"/>
            <path d="m20.16 7.527-1.253-1.414-.118.104-8.478 7.426-4.97-4.263-1.503 1.699 6.474 6.811z" fill="#fff" fill-rule="evenodd"/>
        </svg>
        `;

        svgpath = Me.path + '/media/checkbox-on-focused.svg';
        svgFill = obar.msHex;
        svgStroke = obar.mhHex;
    }
    else if(type == 'off-focused'){
        svg = `
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="21" height="21" rx="3" fill="#SVGFILL" stroke="#SVGSTROKE" stroke-linejoin="round"/>
        </svg>
        `;

        svgpath = Me.path + '/media/checkbox-off-focused.svg';
        svgFill = '#aaa';
        svgStroke = obar.mhHex;
    }
    
    svg = svg.replace(`#SVGFILL`, svgFill);
    svg = svg.replace(`#SVGSTROKE`, svgStroke);
   
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

// Save Gtk stylesheet to user config dir
function saveGtkCss(obar) {
    const importExport = obar._settings.get_boolean('import-export');
    const pauseStyleReload = obar._settings.get_boolean('pause-reload');
    if(importExport || pauseStyleReload)
        return;
    console.log('saveGtkCss called with ImportExport false, Pause false');

    // Save stylesheet from string to css file
    let applyGtk = obar._settings.get_boolean('apply-gtk');
    let applyFlatpak = obar._settings.get_boolean('apply-flatpak');
    if(!applyGtk && !applyFlatpak)
        return;

    // Add hint of Accent color to Headerbar and Sidebar
    let hBarHint = obar._settings.get_int('headerbar-hint')/100;
    let sBarHint = obar._settings.get_int('sidebar-hint')/100;
    let hBarHintBd = hBarHint/2;
    let sBarHintBd = sBarHint/2;
    let sBarTransparency = obar._settings.get_boolean('sidebar-transparency');
    let accent = obar._settings.get_strv('mscolor');
    // let accAlpha = obar._settings.get_double('msalpha');
    const accRed = parseInt(parseFloat(accent[0]) * 255);
    const accGreen = parseInt(parseFloat(accent[1]) * 255);
    const accBlue = parseInt(parseFloat(accent[2]) * 255);
    
    let bgRed, bgGreen, bgBlue;
    const colorScheme = obar._intSettings.get_string('color-scheme');
    if(colorScheme == 'prefer-dark') 
        bgRed = bgGreen = bgBlue = 25;
    else
        bgRed = bgGreen = bgBlue = 225;
    
    const hbgRed = hBarHint * accRed + (1-hBarHint) * bgRed;
    const hbgGreen = hBarHint * accGreen + (1-hBarHint) * bgGreen;
    const hbgBlue = hBarHint * accBlue + (1-hBarHint) * bgBlue;
    const hbdRed = hBarHintBd * accRed + (1-hBarHintBd) * bgRed;
    const hbdGreen = hBarHintBd * accGreen + (1-hBarHintBd) * bgGreen;
    const hbdBlue = hBarHintBd * accBlue + (1-hBarHintBd) * bgBlue;

    const sbgRed = sBarHint * accRed + (1-sBarHint) * bgRed;
    const sbgGreen = sBarHint * accGreen + (1-sBarHint) * bgGreen;
    const sbgBlue = sBarHint * accBlue + (1-sBarHint) * bgBlue;
    const sbdRed = sBarHintBd * accRed + (1-sBarHintBd) * bgRed;
    const sbdGreen = sBarHintBd * accGreen + (1-sBarHintBd) * bgGreen;
    const sbdBlue = sBarHintBd * accBlue + (1-sBarHintBd) * bgBlue;

    const sbAlpha = sBarTransparency? 0.75 : 1.0;

    let hfgRed, hfgGreen, hfgBlue;
    if(getBgDark(hbgRed, hbgGreen, hbgBlue))
        hfgRed = hfgGreen = hfgBlue = 255;
    else
        hfgRed = hfgGreen = hfgBlue = 20;

    let sfgRed, sfgGreen, sfgBlue;
    if(getBgDark(sbgRed, sbgGreen, sbgBlue))
        sfgRed = sfgGreen = sfgBlue = 255;
    else
        sfgRed = sfgGreen = sfgBlue = 20;

    
    let gtkstring = `
    @define-color accent_color rgba(${accRed}, ${accGreen}, ${accBlue}, 1.0);
    @define-color accent_bg_color rgba(${accRed}, ${accGreen}, ${accBlue}, 0.65);

    @define-color headerbar_bg_color rgb(${hbgRed}, ${hbgGreen}, ${hbgBlue});
    @define-color headerbar_backdrop_color rgb(${hbdRed}, ${hbdGreen}, ${hbdBlue});

    @define-color sidebar_bg_color rgba(${sbgRed}, ${sbgGreen}, ${sbgBlue}, ${sbAlpha});
    @define-color sidebar_backdrop_color rgba(${sbdRed}, ${sbdGreen}, ${sbdBlue}, ${sbAlpha});

    @define-color secondary_sidebar_bg_color rgba(${sbgRed}, ${sbgGreen}, ${sbgBlue}, ${1.1*sbAlpha});
    @define-color secondary_sidebar_backdrop_color rgba(${sbdRed}, ${sbdGreen}, ${sbdBlue}, ${1.1*sbAlpha});    

    @define-color headerbar_fg_color rgba(${hfgRed}, ${hfgGreen}, ${hfgBlue}, 0.85);
    @define-color sidebar_fg_color rgba(${sfgRed}, ${sfgGreen}, ${sfgBlue}, 0.85);
    @define-color secondary_sidebar_fg_color rgba(${sfgRed}, ${sfgGreen}, ${sfgBlue}, 0.85);

    /*
    window {
        background-color: alpha(@window_bg_color, 0.85);
    }
    .content-pane, 
    scrolledwindow>viewport, 
    grid>box {
        background-color: alpha(@view_bg_color, 1.0);
    }
    */

    .sidebar,
    .navigation-sidebar,
    .sidebar-pane,
    .content-pane .sidebar-pane,
    .sidebar-pane .content-pane,
    scrolledwindow>viewport>list /* Gnome Tweaks */{
        background-color: @sidebar_bg_color;
    }
    .sidebar:backdrop,
    .navigation-sidebar:backdrop,
    .sidebar-pane:backdrop,
    .content-pane .sidebar-pane:backdrop,
    .sidebar-pane .content-pane:backdrop,
    scrolledwindow>viewport>list:backdrop {
        background-color: @sidebar_backdrop_color;
    }
    
    headerbar, 
    .top-bar, /* Files */
    .titlebar { 
        background-color: @headerbar_bg_color;
        background-image:none;
    } 
    headerbar:backdrop,
    .top-bar:backdrop,
    .titlebar:backdrop { 
        background-color: @headerbar_backdrop_color;
    }
    `;

    if(!applyGtk)
        gtkstring = '';

    const configDir = GLib.get_user_config_dir();
    const gtk3Dir = Gio.File.new_for_path(`${configDir}/gtk-3.0`);
    const gtk4Dir = Gio.File.new_for_path(`${configDir}/gtk-4.0`);
    [gtk3Dir, gtk4Dir].forEach(dir => {
        // console.log(dir.get_path() +'\n' + gtkstring);
        if (!dir.query_exists(null)) {
            try {
                const file = Gio.File.new_for_path(dir.get_path());
                file.make_directory_with_parents(null);
            } catch (e) {
                console.error('Error creating gtk config: ' + e);
            }
        }

        let file = Gio.File.new_for_path(dir.get_path() + '/gtk.css');
        let bytearray = new TextEncoder().encode(gtkstring);

        try {
            let output = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
            let outputStream = Gio.BufferedOutputStream.new_sized(output, 4096);
            outputStream.write_all(bytearray, null);
            outputStream.close(null);
            console.log('Saved gtk.css at: ' + dir.get_path());
        }
        catch (e) {
            console.log("Failed to write gtk.css file: " + dir.get_path() + e);
        }
    });

    // Apply override to provide flatpak apps access to Gtk config css files
    if(applyFlatpak) {
        try {
            GLib.spawn_command_line_async(
                'flatpak override --user --filesystem=xdg-config/gtk-4.0:ro --filesystem=xdg-config/gtk-3.0:ro'
            );
        } catch (e) {
            console.error(e);
        }
    } 
    else {
        try {
            GLib.spawn_command_line_async(
                'flatpak override --user --nofilesystem=xdg-config/gtk-4.0 --nofilesystem=xdg-config/gtk-3.0'
            );
        } catch (e) {
            console.error(e);
        }
    }
    
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
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
    let applyMenuShell = obar._settings.get_boolean('apply-menu-shell');
    let dbgColor = obar._settings.get_strv('dbgcolor');
    let dbgAlpha = obar._settings.get_double('dbgalpha');
    let dbRadius = obar._settings.get_double('dbradius');
    let dIconSize = obar._settings.get_double('disize');
    let dBorder = obar._settings.get_boolean('dborder');
    let dShadow = obar._settings.get_boolean('dshadow');
    let warningColor = obar._settings.get_strv('warning-color');
    let successColor = obar._settings.get_strv('success-color');
    let destructColor = obar._settings.get_strv('destruct-color');
    
    // Gnome default colors
    // destructive Dark: c01c28 (192,28,40)    Light: e01b24 (224,27,36)
    // success     Dark: 26a269 (38,162,105)   Light: 2ec27e (46,194,126)
    // warning     Dark: f6d32d (246,211,45)   Light: f5c211 (245,194,17)

    const darkMode = obar.colorScheme == 'prefer-dark';

    let warningRed = parseInt(parseFloat(warningColor[0]) * 255);
    let warningGreen = parseInt(parseFloat(warningColor[1]) * 255);
    let warningBlue = parseInt(parseFloat(warningColor[2]) * 255);

    let successRed = parseInt(parseFloat(successColor[0]) * 255);
    let successGreen = parseInt(parseFloat(successColor[1]) * 255);
    let successBlue = parseInt(parseFloat(successColor[2]) * 255);

    let destructRed = parseInt(parseFloat(destructColor[0]) * 255);
    let destructGreen = parseInt(parseFloat(destructColor[1]) * 255);
    let destructBlue = parseInt(parseFloat(destructColor[2]) * 255);

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

    const dbgred = parseInt(parseFloat(dbgColor[0]) * 255);
    const dbggreen = parseInt(parseFloat(dbgColor[1]) * 255);
    const dbgblue = parseInt(parseFloat(dbgColor[2]) * 255);

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
    // Save menu highlight hex for use in focused svg
    obar.mhHex = rgbToHex(mhred, mhgreen, mhblue);

    const mshred = parseInt(parseFloat(mshColor[0]) * 255);
    const mshgreen = parseInt(parseFloat(mshColor[1]) * 255);
    const mshblue = parseInt(parseFloat(mshColor[2]) * 255);

    const msred = parseInt(parseFloat(msColor[0]) * 255);
    const msgreen = parseInt(parseFloat(msColor[1]) * 255);
    const msblue = parseInt(parseFloat(msColor[2]) * 255);
    // Save menu selection hex for use in toggle on svg
    obar.msHex = rgbToHex(msred, msgreen, msblue);
    obar.msHex = obar.msHex + parseInt(parseFloat(msAlpha)*255).toString(16);

    // const pbg = `rgba(${bgred},${bggreen},${bgblue},${bgalpha})`; // panel bg color
    // const phg = `rgba(${hred},${hgreen},${hblue},1.0)`; // panel highlight color
    // const phbg = colorBlend(pbg, phg, hAlpha); // panel highlight blended bg color
    // const isbg = `rgba(${isred},${isgreen},${isblue},${isalpha})`; // island bg color
    // const ihbg = colorBlend(isbg, phg, hAlpha); // island highlight blended bg color


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
    let mhbg = colorBlend(mbg, mhg1, mhAlpha); // menu blended highlight bg
    let smhbg = colorBlend(smbg, mhg1, mhAlpha); // sub menu blended highlight bg 

    // Menu selection highlight color
    let mshg = colorBlend(msc, mhg, mhAlpha);

    ///// FG COLORS for BAR and MENU
    let hfgred, hfggreen, hfgblue;
    if(autofgBar) {
        // Bar auto fg color
        let dark;
        if(bartype == 'Mainland' || bartype == 'Floating')
            dark = getBgDark(bgred, bggreen, bgblue);
        else
            dark = getBgDark(isred, isgreen, isblue);
        if(dark) {
            fgred = fggreen = fgblue = 250;
            hfgred = hfggreen = hfgblue = 255;
        }
        else {
            fgred = fggreen = fgblue = 5;
            hfgred = hfggreen = hfgblue = 0;
        }
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
            mfgred = mfggreen = mfgblue = 230;
            mhfgred = mhfggreen = mhfgblue = 255;
        }
        else {
            mfgred = mfggreen = mfgblue = 25;
            mhfgred = mhfggreen = mhfgblue = 0;
        }

        // Sub menu auto fg color
        if(getBgDark(smbgred, smbggreen, smbgblue)) {
            smfgred = smfggreen = smfgblue = 230;
            smhfgred = smhfggreen = smhfgblue = 255;
        }
        else {
            smfgred = smfggreen = smfgblue = 25;
            smhfgred = smhfggreen = smhfgblue = 0;
        }

        // Accent / active auto fg color
        if(getBgDark(msred, msgreen, msblue)) {
            amfgred = amfggreen = amfgblue = 250;
            amhfgred = amhfggreen = amhfgblue = 255;
        }
        else {
            amfgred = amfggreen = amfgblue = 10;
            amhfgred = amhfggreen = amhfgblue = 0;
        }
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
    // Save submenu fg hex for use in calendar-today svg
    obar.smfgHex = rgbToHex(smfgred, smfggreen, smfgblue);


    // Auto Highlight BG colors
    let hspThresh = 155, hgColor, bgColor, bgDarkThresh = 135, bgLightThresh = 190;
    function getAutoHgColor(bgColor) { 
        let bgHsp = getHSP(bgColor[0], bgColor[1], bgColor[2]);

        if(bgHsp <= bgLightThresh) {
            let rgb = bgHsp + 50;
            // if(bgHsp < hspThresh)
            //     rgb = bgHsp + 50;
            hgColor = [rgb, rgb, rgb];
        }
        else {
            let rgb = bgHsp - 80;
            hgColor = [rgb, rgb, rgb];
        }
        log('getAutoHgColor: hgColor, bgColor, bgHsp ', hgColor, bgColor, bgHsp);

        return hgColor;
    }

    // Bar Auto Highlight
    let autohgBar = obar._settings.get_boolean('autohg-bar');
    hgColor = [hred, hgreen, hblue];
    bgColor = [bgred, bggreen, bgblue];
    if(autohgBar)
        hgColor = getAutoHgColor(bgColor);
    
    let hbgred = bgred*(1-hAlpha) + hgColor[0]*hAlpha;
    let hbggreen = bggreen*(1-hAlpha) + hgColor[1]*hAlpha;
    let hbgblue = bgblue*(1-hAlpha) + hgColor[2]*hAlpha;
    phbg = `rgba(${hbgred},${hbggreen},${hbgblue},${bgalpha})`;

    // Island Auto Highlight
    hgColor = [hred, hgreen, hblue];
    bgColor = [isred, isgreen, isblue];
    if(autohgBar)
        hgColor = getAutoHgColor(bgColor);

    let ishbgred = isred*(1-hAlpha) + hgColor[0]*hAlpha;
    let ishbggreen = isgreen*(1-hAlpha) + hgColor[1]*hAlpha;
    let ishbgblue = isblue*(1-hAlpha) + hgColor[2]*hAlpha;
    ihbg = `rgba(${ishbgred},${ishbggreen},${ishbgblue},${isalpha})`;

    // Menu Auto Highlight
    let autohgMenu = obar._settings.get_boolean('autohg-menu');
    hgColor = [mhred, mhgreen, mhblue];
    bgColor = [mbgred, mbggreen, mbgblue];
    if(autohgMenu)
        hgColor = getAutoHgColor(bgColor);

    let mhbgred = mbgred*(1-mhAlpha) + hgColor[0]*mhAlpha;
    let mhbggreen = mbggreen*(1-mhAlpha) + hgColor[1]*mhAlpha;
    let mhbgblue = mbgblue*(1-mhAlpha) + hgColor[2]*mhAlpha;
    mhbg = `rgba(${mhbgred},${mhbggreen},${mhbgblue},${mbgAlpha})`;
    
    // Sub Menu Auto Highlight
    hgColor = [mhred, mhgreen, mhblue];
    bgColor = [smbgred, smbggreen, smbgblue];
    if(autohgMenu)
        hgColor = getAutoHgColor(bgColor);   

    let smhbgred = smbgred*(1-mhAlpha) + hgColor[0]*mhAlpha;
    let smhbggreen = smbggreen*(1-mhAlpha) + hgColor[1]*mhAlpha;
    let smhbgblue = smbgblue*(1-mhAlpha) + hgColor[2]*mhAlpha;
    smhbg = `rgba(${smhbgred},${smhbggreen},${smhbgblue},${mbgAlpha})`;

    // Active/Accent Auto Highlight
    hgColor = [mhred, mhgreen, mhblue];
    bgColor = [msred, msgreen, msblue];
    if(autohgMenu)
        hgColor = getAutoHgColor(bgColor);

    let mshbgred = msred*(1-mhAlpha) + hgColor[0]*mhAlpha;
    let mshbggreen = msgreen*(1-mhAlpha) + hgColor[1]*mhAlpha;
    let mshbgblue = msblue*(1-mhAlpha) + hgColor[2]*mhAlpha;
    mshg = `rgba(${mshbgred},${mshbggreen},${mshbgblue},${msAlpha})`; //msalpha


    //== Define Styles for Bar components ==//

    let fgStyle, panelStyle, panelLabelStyle, btnStyle, btnContainerStyle, borderStyle, radiusStyle, fontStyle, 
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
        // Apply semi-bold if font weight is less than 500 when auto-theme is applied
        let autothemeApplied = obar._settings.get_boolean('autotheme-font');
        if(autothemeApplied && font_weight < 500)
            font_weight = 500;

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

    panelLabelStyle = 
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
    `   box-shadow: 0 2px 6px 0 rgba(${mshred},${mshgreen},${mshblue},${mshAlpha}) !important; /* menu shadow */
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

    // Slider
    let sliderBaseColor = `${colorMix(smbgred, mbgred, -0.2)},${colorMix(smbggreen, mbggreen, -0.2)},${colorMix(smbgblue, mbgblue, -0.2)}`;
    let sliderActiveColor = `${colorMix(msred, mbgred, -0.2)},${colorMix(msgreen, mbggreen, -0.2)},${colorMix(msblue, mbgblue, -0.2)}`;
    let bCol = mfgred > 200? 255: 0; // Slider border color
    let sliHandRadius = Math.ceil(8 - sliHandBorder/2);
    if(sliHandRadius < 4) sliHandRadius = 4;
    let sliderStyle = 
    `   color: rgba(${sliderBaseColor}, 1) !important;
        -barlevel-height: ${sliderHeight}px;
        -barlevel-border-width: 0.5px;
        -barlevel-border-color: rgba(${bCol},${bCol},${bCol},0.25) !important;
        -barlevel-active-border-color: rgba(${bCol},${bCol},${bCol},0.25) !important;
        -slider-handle-border-width: ${sliHandBorder}px;
        -slider-handle-radius: ${sliHandRadius}px;
        -slider-handle-border-color: rgba(${sliderActiveColor}, 1) !important;
        -barlevel-background-color: rgba(${sliderBaseColor}, 1) !important;
        -barlevel-active-background-color: rgba(${sliderActiveColor}, 1) !important;
        -barlevel-overdrive-color: rgba(${destructRed}, ${destructGreen}, ${destructBlue}, 1) !important;
         `;

    // Define Overview style (reset) if Disabled in Overview
    let setOverview = obar._settings.get_boolean('set-overview');
    let overviewStyle, barFgOverview, barHFgOverview, barHBgOverview;
    if(!setOverview) {
        overviewStyle = 
        `   background-color: transparent !important; 
            border-color: transparent !important; 
            box-shadow: none !important; 
            color: rgba(${smfgred},${smfggreen},${smfgblue},1.0) !important; `;
        barFgOverview = 
        `   color: rgba(${smfgred},${smfggreen},${smfgblue},1.0) !important;`;
        barHFgOverview = 
        `   color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1.0) !important;`;
        barHBgOverview = 
        `   background-color: rgba(${smhbgred},${smhbggreen},${smhbgblue},${mbgAlpha}) !important;`;
    }
    else {
        overviewStyle = ``;
        barFgOverview = ``;
        barHFgOverview = ``;
        barHBgOverview = ``;
    }

    let wmaxColorStyle, wmaxHoverStyle;
    if(bartype == 'Mainland' || bartype == 'Floating') {
        if(getBgDark(bgredwmax, bggreenwmax, bgbluewmax)) {
            wmaxColorStyle = 
            `color: rgba(250,250,250,1.0) !important;
            transition-duration: 100ms;`;
        }
        else {
            wmaxColorStyle = 
            `color: rgba(5,5,5,1.0) !important;
            transition-duration: 100ms;`;
        }
    }
    else {
        wmaxColorStyle = ``;
    }
    if(bartype == 'Mainland' || bartype == 'Floating') {
        let hgColor = getAutoHgColor([bgredwmax, bggreenwmax, bgbluewmax]);
        wmaxHoverStyle = 
        `background-color: rgba(${hgColor[0]},${hgColor[1]},${hgColor[2]},${1.2*hAlpha}) !important;
        transition-duration: 100ms;`;
    }
    else {
        wmaxHoverStyle = ``;
    }

    let unlockStyle, unlockHoverStyle;
    if(obar.main.sessionMode.isLocked) {
        unlockStyle =
        `   background-color: transparent !important; 
            border-color: transparent !important; 
            color: rgba(255,255,255,1.0) !important;
            box-shadow: none !important;
            transition-duration: 100ms;`;
    }
    else {
        unlockStyle = ``;
    }
    if(obar.main.sessionMode.isLocked) {
        unlockHoverStyle =
        `   color: rgba(255,255,255,1.0) !important;`;
    }
    else {
        unlockHoverStyle = ``;
    }
    

    let applyToShell = obar._settings.get_boolean('apply-all-shell');
    // Add/Remove .openmenu class to Restrict/Extend menu styles to the shell
    let openmenuClass = (applyMenuShell || applyToShell) ? '' : '.openmenu';
    // Placeholder for .openbar class
    let openbarClass = '.openbar';

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
    
        #panelBox${openbarClass} {
           background-color: rgba(${boxred},${boxgreen},${boxblue},${boxalpha}) !important;
        }
    
        #panel${openbarClass} {
            ${panelStyle}
            ${unlockStyle}
        }

        #panel${openbarClass} StLabel {
            ${panelLabelStyle}
        }

        #panel${openbarClass}:windowmax {
            background-color: rgba(${bgredwmax},${bggreenwmax},${bgbluewmax},${bgalphaWMax}) !important;
            border-radius: 0px;
            border-color: rgba(${bgredwmax},${bggreenwmax},${bgbluewmax},${bgalphaWMax}) !important;
            box-shadow: none;
            margin: 0px;
            height: ${heightWMax}px !important;
            ${wmaxColorStyle}        
            ${unlockStyle}
        }

        #panel${openbarClass} .button-container {
            ${btnContainerStyle}
        }
        #panel${openbarClass}:windowmax .button-container {
            margin: ${marginWMax}px 0px;
        }

        #panel${openbarClass} .panel-button {
            ${btnStyle}
            color: rgba(${fgred},${fggreen},${fgblue},${fgalpha});
            ${unlockStyle}
        }
        #panel${openbarClass}:windowmax .panel-button {
            ${borderWMax? '': 'border-color: transparent;'}
            ${neonWMax? '': 'box-shadow: none;'} 
            ${wmaxColorStyle}             
        }

        #panel${openbarClass}:overview, #panel${openbarClass}:overview .panel-button {
            ${setOverview? '': overviewStyle}
        }

        #panel${openbarClass}:overview:windowmax {
            ${overviewStyle}
        }

        #panel${openbarClass} .panel-button.candy1 {
            ${candyStyleArr[0]}
        }
        #panel${openbarClass} .panel-button.candy2 {
            ${candyStyleArr[1]}
        }
        #panel${openbarClass} .panel-button.candy3 {
            ${candyStyleArr[2]}
        }
        #panel${openbarClass} .panel-button.candy4 {
            ${candyStyleArr[3]}
        }
        #panel${openbarClass} .panel-button.candy5 {
            ${candyStyleArr[4]}
        }
        #panel${openbarClass} .panel-button.candy6 {
            ${candyStyleArr[5]}
        }
        #panel${openbarClass} .panel-button.candy7 {
            ${candyStyleArr[6]}
        }
        #panel${openbarClass} .panel-button.candy8 {
            ${candyStyleArr[7]}
        }

        #panel${openbarClass} .panel-button:hover, #panel${openbarClass} .panel-button:focus, 
        #panel${openbarClass} .panel-button:active, #panel${openbarClass} .panel-button:checked {
            ${btnHoverStyle}
            color: rgba(${hfgred},${hfggreen},${hfgblue},${fgalpha}) !important;
            ${unlockHoverStyle}
        }
        #panel${openbarClass}:windowmax .panel-button:hover, #panel${openbarClass}:windowmax .panel-button:focus, 
        #panel${openbarClass}:windowmax .panel-button:active, #panel${openbarClass}:windowmax .panel-button:checked {
            ${wmaxColorStyle}
            ${wmaxHoverStyle}
        }
        #panel${openbarClass}:overview .panel-button:hover, #panel${openbarClass}:overview .panel-button:focus, 
        #panel${openbarClass}:overview .panel-button:checked, #panel${openbarClass}:overview .panel-button:active,
        #panel${openbarClass}:overview .panel-button:overview {
            ${btnHoverStyle} 
            ${setOverview? '': barHBgOverview}
        }

        #panel${openbarClass} .panel-button.clock-display .clock {
            color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}) !important;
        }
        #panel${openbarClass}:windowmax .panel-button.clock-display .clock {
            ${wmaxColorStyle}
        }
        #panel${openbarClass}:overview .panel-button.clock-display .clock {
            ${barFgOverview}
        }
        
        #panel${openbarClass} .panel-button:hover.clock-display .clock, #panel${openbarClass} .panel-button:focus.clock-display .clock,
        #panel${openbarClass} .panel-button:active.clock-display .clock, #panel${openbarClass} .panel-button:checked.clock-display .clock {
            color: rgba(${hfgred},${hfggreen},${hfgblue},1.0) !important;
        }
        #panel${openbarClass}:windowmax .panel-button:hover.clock-display .clock, #panel${openbarClass}:windowmax .panel-button:focus.clock-display .clock,
        #panel${openbarClass}:windowmax .panel-button:active.clock-display .clock, #panel${openbarClass}:windowmax .panel-button:checked.clock-display .clock {
            ${wmaxColorStyle}
        }
        #panel${openbarClass}:overview .panel-button:hover.clock-display .clock, #panel${openbarClass}:overview .panel-button:focus.clock-display .clock,
        #panel${openbarClass}:overview .panel-button:active.clock-display .clock, #panel${openbarClass}:overview .panel-button:checked.clock-display .clock {
            ${barHFgOverview}
        }
        
        #panel${openbarClass} .panel-button.clock-display .clock, #panel${openbarClass} .panel-button:hover.clock-display .clock,
        #panel${openbarClass} .panel-button:active.clock-display .clock, #panel${openbarClass} .panel-button:overview.clock-display .clock, 
        #panel${openbarClass} .panel-button:focus.clock-display .clock, #panel${openbarClass} .panel-button:checked.clock-display .clock {
            background-color: transparent !important;
            box-shadow: none !important;
        }

        #panel${openbarClass} .panel-button.screen-recording-indicator {
            transition-duration: 150ms;
            font-weight: bold;
            background-color: rgba(${destructRed},${destructGreen},${destructBlue}, 0.8);
            box-shadow: none !important;
        }
        #panel${openbarClass} .panel-button.screen-sharing-indicator,
        #panel${openbarClass} .screencast-indicator,
        #panel${openbarClass} .remote-access-indicator {
            transition-duration: 150ms;
            font-weight: bold;
            background-color: rgba(${(destructRed+warningRed)/2},${(destructGreen+warningGreen)/2},${(destructBlue+warningBlue)/2}, 0.9); 
            box-shadow: none !important;
        }

        #panel${openbarClass} .workspace-dot {
            ${dotStyle}
        }
        
        #panel${openbarClass} .trilands:left-child {
            ${triLeftStyle}
        }
        #panel${openbarClass} .trilands:right-child {
            ${triRightStyle}
        }
        #panel${openbarClass} .trilands:one-child {
            ${triBothStyle}
        }
        #panel${openbarClass} .trilands:mid-child {
            ${triMidStyle}
        }
        #panel${openbarClass}:overview .trilands:mid-child {
            ${setOverview? '': 'box-shadow: none;'}
        }
        #panel${openbarClass}:windowmax .trilands:mid-child {
            ${neonWMax? '': 'box-shadow: none;'}
        }
        #panel${openbarClass} .trilands:mid-child:hover, #panel${openbarClass} .trilands:mid-child:focus, #panel${openbarClass} .trilands:mid-child:active, #panel${openbarClass} .trilands:mid-child:checked {
            ${triMidNeonHoverStyle}
        }
        #panel${openbarClass}:overview .trilands:mid-child:hover, #panel${openbarClass}:overview .trilands:mid-child:focus, #panel${openbarClass}:overview .trilands:mid-child:active, #panel${openbarClass}:overview .trilands:mid-child:checked {
            ${setOverview? '': 'box-shadow: none;'}
        }
    `;

    // Menu styles
    stylesheet += `

        ${openmenuClass}.popup-menu-boxpointer, ${openmenuClass}.candidate-popup-boxpointer {
            -arrow-rise: 6px; 
        }

        ${openmenuClass}.popup-menu {
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
        }

        ${openmenuClass}.popup-menu-content, ${openmenuClass}.candidate-popup-content {
            ${menuContentStyle}
        }
    `;

    stylesheet += `
        ${openmenuClass}.popup-menu-item {
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
        }
        ${openmenuClass}.popup-menu-item:focus, ${openmenuClass}.popup-menu-item:hover, ${openmenuClass}.popup-menu-item:selected {
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1.0) !important;
            background-color: ${mhbg} !important;
            transition-duration: 0ms !important;
        }

        ${openmenuClass}.popup-menu-item:checked, ${openmenuClass}.popup-menu-item:checked:active {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.popup-menu-item:checked:focus, ${openmenuClass}.popup-menu-item:checked:hover, ${openmenuClass}.popup-menu-item:checked:selected,
        ${openmenuClass}.popup-menu-item:checked:active:focus, ${openmenuClass}.popup-menu-item:checked:active:hover, ${openmenuClass}.popup-menu-item:checked:active:selected {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
            box-shadow: none !important;
            background-color: ${mshg} !important;
        }
          
        ${openmenuClass}.popup-menu-item:active, ${openmenuClass}.popup-menu-item.selected:active {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.popup-menu-item:active:hover, ${openmenuClass}.popup-menu-item:active:focus, 
        ${openmenuClass}.popup-menu-item.selected:active:hover, ${openmenuClass}.popup-menu-item.selected:active:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
            background-color: ${mshg} !important;
        }

    `;
        // rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha})
    stylesheet += `
        ${openmenuClass}.popup-sub-menu {
            background-color: ${smbg} !important;
            border: none;
            box-shadow: none;
        }
        
        ${openmenuClass}.popup-sub-menu .popup-menu-item {
            margin: 0px;
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha});
        }
        
        ${openmenuClass}.popup-sub-menu .popup-menu-item:focus, 
        ${openmenuClass}.popup-sub-menu .popup-menu-item:hover, 
        ${openmenuClass}.popup-sub-menu .popup-menu-item:selected {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1.0) !important;
            background-color: ${smhbg} !important;
        }
        
        ${openmenuClass}.popup-sub-menu .popup-menu-item:active, 
        ${openmenuClass}.popup-sub-menu .popup-submenu-menu-item:active, 
        ${openmenuClass}.popup-sub-menu .popup-submenu-menu-item:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.popup-sub-menu .popup-menu-item:active:hover, ${openmenuClass}.popup-sub-menu .popup-menu-item:active:focus, 
        ${openmenuClass}.popup-sub-menu .popup-submenu-menu-item:active:hover, ${openmenuClass}.popup-sub-menu .popup-submenu-menu-item:active:focus,
        ${openmenuClass}.popup-sub-menu .popup-submenu-menu-item:checked:hover, ${openmenuClass}.popup-sub-menu .popup-submenu-menu-item:checked:focus {
            background-color: ${mshg} !important;
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
        }
    
    
        ${openmenuClass}.popup-menu-section .popup-sub-menu {
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
            border: none;
            box-shadow: none;
        }
        ${openmenuClass}.popup-menu-section .popup-sub-menu .popup-menu-item {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha});
        }
        ${openmenuClass}.popup-menu-section .popup-sub-menu .popup-menu-item:hover, ${openmenuClass}.popup-menu-section .popup-sub-menu .popup-menu-item:focus,
        ${openmenuClass}.popup-menu-section .popup-sub-menu .popup-menu-item:selected {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1.0) !important;
            background-color: ${smhbg} !important;
        }

        ${openmenuClass}.popup-menu-section .popup-menu-item {
            margin: 0px;
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
        }
        ${openmenuClass}.popup-menu-section .popup-menu-item:focus, ${openmenuClass}.popup-menu-section .popup-menu-item:hover, 
        ${openmenuClass}.popup-menu-section .popup-menu-item:selected {
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1.0) !important;
            background-color: ${mhbg} !important;
        }
        ${openmenuClass}.popup-menu-section .popup-menu-item:active, 
        ${openmenuClass}.popup-menu-section .popup-submenu-menu-item:active, 
        ${openmenuClass}.popup-menu-section .popup-submenu-menu-item:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.popup-menu-section .popup-menu-item:active:hover, ${openmenuClass}.popup-menu-section .popup-menu-item:active:focus, 
        ${openmenuClass}.popup-menu-section .popup-submenu-menu-item:active:hover, ${openmenuClass}.popup-menu-section .popup-submenu-menu-item:active:focus, 
        ${openmenuClass}.popup-menu-section .popup-submenu-menu-item:checked:hover, ${openmenuClass}.popup-menu-section .popup-submenu-menu-item:checked:focus {
            background-color: ${mshg} !important;
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
        }

        ${openmenuClass}.popup-menu-item .toggle-switch:checked {
            color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
        }
        ${openmenuClass}.popup-menu-item .button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},1.0) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
        }
        ${openmenuClass}.popup-menu-item .button:hover, ${openmenuClass}.popup-menu-item .button:focus, ${openmenuClass}.popup-menu-item .button:selected {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1.0) !important;
            background-color: ${smhbg} !important;
            border-color: transparent !important; 
        }
        ${openmenuClass} .slider{ 
            ${sliderStyle}  
        }
        ${openmenuClass}.popup-separator-menu-item .popup-separator-menu-item-separator, ${openmenuClass}.popup-separator-menu-item .popup-sub-menu .popup-separator-menu-item-separator {
            background-color: rgba(${mbred},${mbgreen},${mbblue},0.7) !important;
        }

    `;

    // rgba(${mhred},${mhgreen},${mhblue},${mhAlpha})
    stylesheet += `
        ${openmenuClass}.message-list-placeholder {
            color: rgba(${mfgred},${mfggreen},${mfgblue},0.5) !important;
        }
        ${openmenuClass}.message {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
            box-shadow: 0 1px 1px 0 rgba(${mshred},${mshgreen},${mshblue},0.08) !important;
        }
        ${openmenuClass}.message:hover, ${openmenuClass}.message:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important; /* 0.9*mhAlpha */
        }
        ${openmenuClass}.message:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},0.5) !important;
        }
        ${openmenuClass}.message .message-title {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        ${openmenuClass}.message .message-source-icon, ${openmenuClass}.message .message-source-title {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        ${openmenuClass}.message .message-body {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        ${openmenuClass}.message .event-time {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        ${openmenuClass}.message:hover .message-source-icon, ${openmenuClass}.message:focus .message-source-icon,
        ${openmenuClass}.message:hover .message-title, ${openmenuClass}.message:focus .message-title,
        ${openmenuClass}.message:hover .message-source-title, ${openmenuClass}.message:focus .message-source-title,
        ${openmenuClass}.message:hover .message-body, ${openmenuClass}.message:focus .message-body,
        ${openmenuClass}.message:hover .event-time, ${openmenuClass}.message:focus .event-time {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
        }
        ${openmenuClass}.message .button, ${openmenuClass}.message .message-close-button, ${openmenuClass}.message .message-expand-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
        }
        ${openmenuClass}.message .button:hover, ${openmenuClass}.message .button:focus,
        ${openmenuClass}.message .message-close-button:hover, ${openmenuClass}.message .message-close-button:focus,
        ${openmenuClass}.message .message-expand-button:hover, ${openmenuClass}.message .message-expand-button:focus {
            color: rgba(${mfgred},${mfggreen},${mfgblue},1) !important;
            background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
        }
        ${openmenuClass}.message .message-media-control {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        ${openmenuClass}.message .message-media-control:hover, ${openmenuClass}.message .message-media-control:focus {
            background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1) !important;
        }
        ${openmenuClass}.message .message-media-control:insensitive {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.5}) !important;
        }
        ${openmenuClass}.message .media-message-cover-icon .fallback {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
        }
        ${openmenuClass}.dnd-button {
            border-color: rgba(${mbgred},${mbggreen},${mbgblue},0.5) !important;
            border-radius: 50px;
        }
        ${openmenuClass}.dnd-button:hover {
            border-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
        }
        ${openmenuClass}.dnd-button:focus {
            border-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            box-shadow: none;
        }        
        ${openmenuClass} .toggle-switch {
            background-image: url(media/toggle-off.svg);
            background-color: transparent !important;
        }
        ${openmenuClass} .toggle-switch:checked {
            background-image: url(media/toggle-on.svg);
            background-color: transparent !important;
        }
        ${openmenuClass} .check-box StBin {
            background-image: url(media/checkbox-off.svg);
        }
        ${openmenuClass} .check-box:checked StBin {
            background-image: url(media/checkbox-on.svg);
        }
        ${openmenuClass} .check-box:focus StBin {
            background-image: url(media/checkbox-off-focused.svg);
        }  
        ${openmenuClass} .check-box:focus:checked StBin {
            background-image: url(media/checkbox-on-focused.svg);
        }

        ${openmenuClass}.message-list-clear-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
            box-shadow: 0 1px 1px 0 rgba(${mshred},${mshgreen},${mshblue},0.08) !important;
        }
        ${openmenuClass}.message-list-clear-button:hover, ${openmenuClass}.message-list-clear-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important; /* 0.9*mhAlpha */
        }
        ${openmenuClass}.message-list-clear-button:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},0.5) !important;
        }


        ${openmenuClass}.datemenu-today-button .date-label, ${openmenuClass}.datemenu-today-button .day-label {
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.25}) !important;
        } 
        ${openmenuClass}.datemenu-today-button:hover, ${openmenuClass}.datemenu-today-button:focus {
            background-color: ${mhbg} !important;  /* 0.9*mhAlpha */
            border-radius: ${notifRadius}px;
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1) !important;
        }

        ${openmenuClass}.calendar {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
            box-shadow: 0 1px 1px 0 rgba(${mshred},${mshgreen},${mshblue},0.08) !important;
        }
        ${openmenuClass}.calendar .calendar-month-header .pager-button,
        ${openmenuClass}.calendar .calendar-month-header .pager-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${0.5*mbgAlpha}) !important;
        }
        ${openmenuClass}.calendar .calendar-month-header .pager-button:hover,
        ${openmenuClass}.calendar .calendar-month-header .pager-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        ${openmenuClass}.calendar .calendar-month-label {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${0.5*mbgAlpha}) !important;
        }
        ${openmenuClass}.calendar-day-heading  {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${0.5*mbgAlpha}) !important;
        }
        ${openmenuClass}.calendar-day-heading:focus  {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        ${openmenuClass}.calendar-day {
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${0.5*mbgAlpha}) !important;
        }
        ${openmenuClass}.calendar-weekday, ${openmenuClass}.calendar-work-day {
            color: rgba(${smfgred},${smfggreen},${smfgblue},1) !important;
            font-weight: normal;
        }
        ${openmenuClass}.calendar-nonwork-day, ${openmenuClass}.calendar-weekend {
            color: rgba(${smfgred},${smfggreen},${smfgblue},0.7) !important;
            font-weight: normal;
        }
        ${openmenuClass}.calendar-other-month-day, ${openmenuClass}.calendar-other-month {
            color: rgba(${smfgred},${smfggreen},${smfgblue},0.5) !important;
            font-weight: normal;
        }
        ${openmenuClass}.calendar-other-month-day:hover, ${openmenuClass}.calendar-other-month-day:focus, ${openmenuClass}.calendar-other-month-day:selected,
        ${openmenuClass}.calendar-other-month:hover, ${openmenuClass}.calendar-other-month:focus, ${openmenuClass}.calendar-other-month:selected,
        ${openmenuClass}.calendar-nonwork-day:hover, ${openmenuClass}.calendar-nonwork-day:focus, ${openmenuClass}.calendar-nonwork-day:selected,
        ${openmenuClass}.calendar-work-day:hover, ${openmenuClass}.calendar-work-day:focus, ${openmenuClass}.calendar-work-day:selected,
        ${openmenuClass}.calendar-weekday:hover, ${openmenuClass}.calendar-weekday:focus, ${openmenuClass}.calendar-weekday:selected,
        ${openmenuClass}.calendar-weekend:hover, ${openmenuClass}.calendar-weekend:focus, ${openmenuClass}.calendar-weekend:selected  {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        ${openmenuClass}.calendar-other-month-day:focus, ${openmenuClass}.calendar-other-month-day:selected,
        ${openmenuClass}.calendar-other-month:focus, ${openmenuClass}.calendar-other-month:selected,
        ${openmenuClass}.calendar-nonwork-day:focus, ${openmenuClass}.calendar-nonwork-day:selected,
        ${openmenuClass}.calendar-work-day:focus, ${openmenuClass}.calendar-work-day:selected,
        ${openmenuClass}.calendar-weekday:focus, ${openmenuClass}.calendar-weekday:selected,
        ${openmenuClass}.calendar-weekend:focus, ${openmenuClass}.calendar-weekend:selected  {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        ${openmenuClass}.calendar .calendar-today, ${openmenuClass}.calendar .calendar-today:selected {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.calendar .calendar-today:hover, ${openmenuClass}.calendar .calendar-today:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1.0) !important;
            background-color: ${mshg} !important;
        }
        ${openmenuClass}.calendar .calendar-today:selected, ${openmenuClass}.calendar .calendar-today:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        ${openmenuClass}.calendar .calendar-today .calendar-day-with-events, ${openmenuClass}.calendar .calendar-day-with-events {
            background-image: url("media/calendar-today.svg");
            background-size: contain;
        }
        ${openmenuClass}.calendar-week-number {
            font-weight: bold;
            font-feature-settings: "tnum";
            background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha*0.7}) !important;
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.8}) !important;
        }

        ${openmenuClass}.events-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
            box-shadow: 0 1px 1px 0 rgba(${mshred},${mshgreen},${mshblue},0.08) !important;
        }
        ${openmenuClass}.events-button:hover, ${openmenuClass}.events-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        ${openmenuClass}.events-button:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        ${openmenuClass}.events-button .events-list {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }            
        ${openmenuClass}.events-button .events-title {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.9}) !important;
        }            
        ${openmenuClass}.events-button .event-time, ${openmenuClass}.events-button .event-placeholder {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        ${openmenuClass}.events-button:hover .events-list, ${openmenuClass}.events-button:focus .events-list,
        ${openmenuClass}.events-button:hover .events-title, ${openmenuClass}.events-button:focus .events-title,
        ${openmenuClass}.events-button:hover .event-time, ${openmenuClass}.events-button:focus .event-time,
        ${openmenuClass}.events-button:hover .event-placeholder, ${openmenuClass}.events-button:focus .event-placeholder {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
        }
        
        ${openmenuClass}.world-clocks-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
            box-shadow: 0 1px 1px 0 rgba(${mshred},${mshgreen},${mshblue},0.08) !important;
        }
        ${openmenuClass}.world-clocks-button:hover, ${openmenuClass}.world-clocks-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        ${openmenuClass}.world-clocks-button:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        ${openmenuClass}.world-clocks-button .world-clocks-header, ${openmenuClass}.world-clocks-button .world-clocks-timezone {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.9}) !important;
        }
        ${openmenuClass}.world-clocks-button .world-clocks-city, ${openmenuClass}.world-clocks-button .world-clocks-time {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        ${openmenuClass}.world-clocks-button:hover .world-clocks-header, ${openmenuClass}.world-clocks-button:focus .world-clocks-header,
        ${openmenuClass}.world-clocks-button:hover .world-clocks-timezone, ${openmenuClass}.world-clocks-button:focus .world-clocks-timezone,
        ${openmenuClass}.world-clocks-button:hover .world-clocks-city, ${openmenuClass}.world-clocks-button:focus .world-clocks-city,
        ${openmenuClass}.world-clocks-button:hover .world-clocks-time, ${openmenuClass}.world-clocks-button:focus .world-clocks-time {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
        }
       
        ${openmenuClass}.weather-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            border-radius: ${notifRadius}px;
            box-shadow: 0 1px 1px 0 rgba(${mshred},${mshgreen},${mshblue},0.08) !important;
        }
        ${openmenuClass}.weather-button:hover, ${openmenuClass}.weather-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        ${openmenuClass}.weather-button:focus {
            box-shadow: inset 0 0 0 2px rgba(${msred},${msgreen},${msblue},${0.5}) !important;
        }
        ${openmenuClass}.weather-button .weather-header {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        ${openmenuClass}.weather-button .weather-header.location {
            font-weight: normal;
        }
        ${openmenuClass}.weather-button .weather-forecast-time {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*0.85}) !important;
        }
        ${openmenuClass}.weather-button:hover .weather-header, ${openmenuClass}.weather-button:focus .weather-header,
        ${openmenuClass}.weather-button:hover .weather-header.location, ${openmenuClass}.weather-button:focus .weather-header.location,
        ${openmenuClass}.weather-button:hover .weather-forecast-time, ${openmenuClass}.weather-button:focus .weather-forecast-time {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
        }
    `;

    stylesheet += `
        ${openmenuClass}.quick-slider .slider{                
            ${sliderStyle}
        }

        ${openmenuClass}.quick-toggle {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            box-shadow: none;
            border-radius: ${qtoggleRadius}px;
        }
        ${openmenuClass}.quick-toggle:hover, ${openmenuClass}.quick-toggle:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }   
        ${openmenuClass}.quick-toggle:checked, ${openmenuClass}.quick-toggle:checked:active, ${openmenuClass}.quick-toggle .button:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.quick-toggle:checked:hover, ${openmenuClass}.quick-toggle:checked:focus, 
        ${openmenuClass}.quick-toggle:checked:active:hover, ${openmenuClass}.quick-toggle:checked:active:focus, 
        ${openmenuClass}.quick-toggle .button:checked:hover, ${openmenuClass}.quick-toggle .button:checked:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1) !important;
            background-color: ${mshg} !important;
        }

        ${openmenuClass}.quick-menu-toggle .quick-toggle {
            color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            background-color: ${smbg} !important;
            box-shadow: none;
        }
        ${openmenuClass}.quick-menu-toggle .quick-toggle:hover, ${openmenuClass}.quick-menu-toggle .quick-toggle:focus {
            color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        ${openmenuClass}.quick-menu-toggle .quick-toggle:checked, 
        ${openmenuClass}.quick-menu-toggle .quick-toggle:active {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            box-shadow: none;
        }
        ${openmenuClass}.quick-menu-toggle .quick-toggle:checked:hover, ${openmenuClass}.quick-menu-toggle .quick-toggle:checked:focus, 
        ${openmenuClass}.quick-menu-toggle .quick-toggle:active:hover, ${openmenuClass}.quick-menu-toggle .quick-toggle:active:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1) !important;
            background-color: ${mshg} !important;
        }
        
        ${openmenuClass}.quick-menu-toggle .quick-toggle-arrow {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
            border-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
        }
        /* adjust borders in expandable menu button */
        ${openmenuClass}.quick-menu-toggle .quick-toggle-arrow:ltr {
            border-radius: 0 ${qtoggleRadius}px ${qtoggleRadius}px 0;
        }
        ${openmenuClass}.quick-menu-toggle .quick-toggle-arrow:rtl {
            border-radius: ${qtoggleRadius}px 0 0 ${qtoggleRadius}px;
        }
        /* adjust borders if quick toggle has expandable menu button (quick-toggle-arrow)[44+] */
        ${openmenuClass}.quick-menu-toggle .quick-toggle:ltr { border-radius: ${qtoggleRadius}px 0 0 ${qtoggleRadius}px; }
        ${openmenuClass}.quick-menu-toggle .quick-toggle:rtl { border-radius: 0 ${qtoggleRadius}px ${qtoggleRadius}px 0; }
        /* if quick toggle has no expandable menu button (quick-toggle-arrow)[44+] */
        ${openmenuClass}.quick-menu-toggle .quick-toggle:last-child {
            border-radius: ${qtoggleRadius}px;
        }
        ${openmenuClass}.quick-menu-toggle .quick-toggle-arrow:hover, ${openmenuClass}.quick-menu-toggle .quick-toggle-arrow:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        ${openmenuClass}.quick-menu-toggle .quick-toggle-arrow:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha*1.2}) !important;
        }
        ${openmenuClass}.quick-menu-toggle .quick-toggle-arrow:checked:hover, ${openmenuClass}.quick-menu-toggle .quick-toggle-arrow:checked:focus {
            background-color: ${mshg} !important;
        }

        ${openmenuClass}.quick-toggle-menu {
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
        }
        ${openmenuClass}.quick-toggle-menu .popup-menu-item {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        ${openmenuClass}.quick-toggle-menu .popup-menu-item:hover, ${openmenuClass}.quick-toggle-menu .popup-menu-item:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }

        ${openmenuClass}.quick-toggle-menu .popup-menu-item:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},1.0) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha*1.2}) !important;
        }            
        ${openmenuClass}.quick-toggle-menu .popup-menu-item:checked:focus, ${openmenuClass}.quick-toggle-menu .popup-menu-item:checked:hover, 
        ${openmenuClass}.quick-toggle-menu .popup-menu-item:checked:selected {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1) !important;
            background-color: ${mshg} !important;
        }
        ${openmenuClass}.quick-toggle-menu .header .title, ${openmenuClass}.quick-toggle-menu .header .subtitle  {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha}) !important;
        }
        ${openmenuClass}.quick-toggle-menu .header .icon {
            color: rgba(${amfgred},${amfggreen},${amfgblue},${mfgAlpha}) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }


        ${openmenuClass}.quick-settings-system-item .icon-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }
        ${openmenuClass}.quick-settings .icon-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }
        ${openmenuClass}.quick-settings .button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }
        ${openmenuClass}.quick-settings .button:checked {
            color: rgba(${amfgred},${amfggreen},${amfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }        
        ${openmenuClass}.background-app-item .icon-button {
            color: rgba(${smfgred},${smfggreen},${smfgblue},${mfgAlpha*1.2}) !important;
            background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
        }

        ${openmenuClass}.quick-settings-system-item .icon-button:hover, ${openmenuClass}.quick-settings-system-item .icon-button:focus,
        ${openmenuClass}.quick-settings .icon-button:hover, ${openmenuClass}.quick-settings .icon-button:focus,
        ${openmenuClass}.quick-settings .button:hover, ${openmenuClass}.quick-settings .button:focus,
        ${openmenuClass}.background-app-item .icon-button:hover, ${openmenuClass}.background-app-item .icon-button:focus {
            color: rgba(${smhfgred},${smhfggreen},${smhfgblue},1) !important;
            background-color: ${smhbg} !important;
        }
        
        ${openmenuClass}.quick-settings .button:checked:hover, ${openmenuClass}.quick-settings .button:checked:focus {
            color: rgba(${amhfgred},${amhfggreen},${amhfgblue},1) !important;
            background-color: ${mshg} !important;
        }

        ${openmenuClass}.quick-settings-system-item .power-item:checked {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.nm-network-item:checked, ${openmenuClass}.nm-network-item:active {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }          
        ${openmenuClass}.bt-device-item:checked {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.keyboard-brightness-level .button:checked {
            background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
        }
        ${openmenuClass}.background-apps-quick-toggle:checked {
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

    if(obar.smfgSVG) {
        saveCalEventSVG(obar, Me);
        obar.smfgSVG = false;
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
