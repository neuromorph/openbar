/* prefs.js
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

/* exported init fillPreferencesWindow*/

import Adw from 'gi://Adw'; 
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import GLib from 'gi://GLib';

import {ExtensionPreferences, gettext as _, pgettext} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
const SCHEMA_PATH = '/org/gnome/shell/extensions/openbar/';

//-----------------------------------------------

export default class OpenbarPreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        let prefs = new OpenbarPrefs();
        prefs.fillOpenbarPrefs(window, this);
    }

}
//-----------------------------------------------

class OpenbarPrefs {

    // Called separately for R,G and B. Moves startColor towards or away from endColor
    colorMix(startColor, endColor, factor) {
        let color = startColor + factor*(endColor - startColor);
        color = (color < 0)? 0: (color>255)? 255: parseInt(color);
        return color;
    }

    // Blend 2 colors: similar to 'Shade' comment below
    colorBlend(c0, c1, p) {
        var i=parseInt,r=Math.round,P=1-p,[a,b,c,d]=c0.split(","),[e,f,g,h]=c1.split(","),x=d||h,j=x?","+(!d?h:!h?d:r((parseFloat(d)*P+parseFloat(h)*p)*1000)/1000+")"):")";
        return"rgb"+(x?"a(":"(")+r(i(a[3]=="a"?a.slice(5):a.slice(4))*P+i(e[3]=="a"?e.slice(5):e.slice(4))*p)+","+r(i(b)*P+i(f)*p)+","+r(i(c)*P+i(g)*p)+j;
    }

    // Shade darken/lighten (e.g. p=0.2): rgb(Math.round(parseInt(r)*0.8 + 255*0.2)),...(Lighten: take 0.8 of C and add 0.2 of white, Darken: just take 0.8 of C)
    colorShade(c, p) {
        var i=parseInt,r=Math.round,[a,b,c,d]=c.split(","),P=p<0,t=P?0:255*p,P=P?1+p:1-p;
        return"rgb"+(d?"a(":"(")+r(i(a[3]=="a"?a.slice(5):a.slice(4))*P+t)+","+r(i(b)*P+t)+","+r(i(c)*P+t)+(d?","+d:")");
    }
    
    // Brightness of color in terms of HSP value
    getHSP(r, g, b) {
        // HSP equation for perceived brightness from http://alienryderflex.com/hsp.html
        let hsp = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
        );
        return hsp;
    }

    // Check if Dark or Light color as per HSP threshold
    getBgDark(r, g, b) {
        let hsp = this.getHSP(r, g, b);
        if(hsp > 127.5)
            return false;
        else
            return true;
    }

    // Generate stylesheet string and save stylesheet file
    saveStylesheet() {

        let bartype = this._settings.get_string('bartype');
        let position = this._settings.get_string('position');
        let bgcolor = this._settings.get_strv('bgcolor');
        let gradient = this._settings.get_boolean('gradient');
        let grDirection = this._settings.get_string('gradient-direction');
        let bgcolor2 = this._settings.get_strv('bgcolor2');
        let bgalpha = this._settings.get_double('bgalpha');
        let bgalpha2 = this._settings.get_double('bgalpha2');
        let fgcolor = this._settings.get_strv('fgcolor');
        let fgalpha = this._settings.get_double('fgalpha');
        let borderColor = this._settings.get_strv('bcolor');
        let balpha = this._settings.get_double('balpha');
        let borderWidth = this._settings.get_double('bwidth');
        let borderRadius = this._settings.get_double('bradius');
        let bordertype = this._settings.get_string('bordertype');
        let shcolor = this._settings.get_strv('shcolor');
        let shalpha = this._settings.get_double('shalpha');
        let islandsColor = this._settings.get_strv('iscolor');
        let isalpha = this._settings.get_double('isalpha');
        let neon = this._settings.get_boolean('neon');
        let shadow = this._settings.get_boolean('shadow');      
        let font = this._settings.get_string("font");
        let height = this._settings.get_double('height');
        let margin = this._settings.get_double('margin');
        let hColor = this._settings.get_strv('hcolor');
        let hAlpha = this._settings.get_double('halpha');
        let hPad = this._settings.get_double('hpad');
        let vPad = this._settings.get_double('vpad');
        let hovereffect = this._settings.get_boolean('heffect');
        let mfgColor = this._settings.get_strv('mfgcolor');
        let mfgAlpha = this._settings.get_double('mfgalpha');
        let mbgColor = this._settings.get_strv('mbgcolor');
        let mbgAlpha = this._settings.get_double('mbgalpha');
        let mbColor = this._settings.get_strv('mbcolor');
        let mbAlpha = this._settings.get_double('mbalpha');
        let mhColor = this._settings.get_strv('mhcolor');
        let mhAlpha = this._settings.get_double('mhalpha');
        let mshColor = this._settings.get_strv('mshcolor');
        let mshAlpha = this._settings.get_double('mshalpha');
        let msColor = this._settings.get_strv('mscolor');
        let msAlpha = this._settings.get_double('msalpha');
        let smbgColor = this._settings.get_strv('smbgcolor');
        // let smbgAlpha = this._settings.get_double('smbgalpha');
        let smbgOverride = this._settings.get_boolean('smbgoverride');
        let bgcolorWMax = this._settings.get_strv('bgcolor-wmax');
        let bgalphaWMax = this._settings.get_double('bgalpha-wmax');
        let marginWMax = this._settings.get_double('margin-wmax');
        let neonWMax = this._settings.get_boolean('neon-wmax');
        let borderWMax = this._settings.get_boolean('border-wmax');
        let qtoggleRadius = this._settings.get_double('qtoggle-radius');
        let sliderHeight = this._settings.get_double('slider-height');

        const fgred = parseInt(parseFloat(fgcolor[0]) * 255);
        const fggreen = parseInt(parseFloat(fgcolor[1]) * 255);
        const fgblue = parseInt(parseFloat(fgcolor[2]) * 255);

        const bgred = parseInt(parseFloat(bgcolor[0]) * 255);
        const bggreen = parseInt(parseFloat(bgcolor[1]) * 255);
        const bgblue = parseInt(parseFloat(bgcolor[2]) * 255);

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

        const mfgred = parseInt(parseFloat(mfgColor[0]) * 255);
        const mfggreen = parseInt(parseFloat(mfgColor[1]) * 255);
        const mfgblue = parseInt(parseFloat(mfgColor[2]) * 255);

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
        this.msHex = this.rgbToHex(msred, msgreen, msblue);
        this.msHex = this.msHex + parseInt(parseFloat(msAlpha)*255).toString(16);

        const pbg = `rgba(${bgred},${bggreen},${bgblue},${bgalpha})`; // panel bg color
        const phg = `rgba(${hred},${hgreen},${hblue},1.0)`; // panel highlight color
        const phbg = this.colorBlend(pbg, phg, hAlpha); // panel highlight blended bg color
        const isbg = `rgba(${isred},${isgreen},${isblue},${isalpha})`; // island bg color
        const ihbg = this.colorBlend(isbg, phg, hAlpha); // island highlight blended bg color


        const mbg = `rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha})`; // menu bg
        const mfg = `rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha})`; // menu fg
        const mhg = `rgba(${mhred},${mhgreen},${mhblue},${mhAlpha})`; // menu highlight
        const msc = `rgba(${msred},${msgreen},${msblue},${msAlpha})`; // menu selection/accent

        // Two ways to mix colors, currently both in use
        // Menu highlight fg color
        const mhfgred = this.colorMix(mfgred, mhred, -0.12);
        const mhfggreen = this.colorMix(mfggreen, mhgreen, -0.12);
        const mhfgblue = this.colorMix(mfgblue, mhblue, -0.12);
        const mhfg = this.colorBlend(mfg, mhg, -0.18);

        // Sub/Secondary menu color -
        // Auto-generated: go from bgcolor move towards white/black based on bgcolor darkness
        const lightrgba = `rgba(${255},${255},${255},${1.0})`;
        const darkrgba = `rgba(${0},${0},${0},${1.0})`;
        let bgdark = this.getBgDark(mbgred, mbggreen, mbgblue);
        let smbgTarget = bgdark? lightrgba: darkrgba;
        let [rTarget, gTarget, bTarget] = bgdark? [255,255,255]: [0,0,0];
        let smbgred = this.colorMix(mbgred, rTarget, 0.18);
        let smbggreen = this.colorMix(mbggreen, gTarget, 0.18);
        let smbgblue = this.colorMix(mbgblue, bTarget, 0.18);
        let smbg = this.colorBlend(mbg, smbgTarget, 0.18);
        // Manual Override: If 'override' enabled, submenu color with user defined values
        if(smbgOverride) {
            smbgred = parseInt(parseFloat(smbgColor[0]) * 255);
            smbggreen = parseInt(parseFloat(smbgColor[1]) * 255);
            smbgblue = parseInt(parseFloat(smbgColor[2]) * 255);
            smbg = `rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha})`;
        }
        // Save smbg hex for use in toggle off svg
        this.smbgHex = this.rgbToHex(smbgred, smbggreen, smbgblue);
        this.smbgHex = this.smbgHex + parseInt(parseFloat(mbgAlpha)*255).toString(16);
        
        // Submenu highlight bg color (notifications pane)
        const mhg1 = `rgba(${mhred},${mhgreen},${mhblue},1)`; // menu highlight with 1 alpha
        const smhbg = this.colorBlend(smbg, mhg1, mhAlpha); // sub menu blended highlight bg 
        
        // Menu selection fg color
        // const msfg = this.colorBlend(mfg, msc, -0.2);

        // Menu selection highlight color
        const mshg = this.colorBlend(msc, mhg, 0.3);

        let fgStyle, panelStyle, btnStyle, btnContainerStyle, borderStyle, radiusStyle, fontStyle, 
        islandStyle, dotStyle, neonStyle, gradientStyle, triLeftStyle, triBothStyle, triRightStyle, 
        triMidStyle, triMidNeonStyle, btnHoverStyle;      

        // style that applies dynamically to either the panel or the panel buttons as per bar type
        borderStyle = 
        ` border: ${borderWidth}px ${bordertype} rgba(${bred},${bgreen},${bblue},${balpha}); `;
        
        radiusStyle = 
        ` border-radius: ${borderRadius}px; `;

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
        ` margin: 0px; padding: 0px; height: ${height}px !important; `;

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
        let candyalpha = this._settings.get_double('candyalpha');
        let candyStyleArr = [];
        for(let i=1; i<=8; i++) {
            let candyColor = this._settings.get_strv('candy'+i);
            let cred = parseInt(parseFloat(candyColor[0]) * 255);
            let cgreen = parseInt(parseFloat(candyColor[1]) * 255);
            let cblue = parseInt(parseFloat(candyColor[2]) * 255);
            let calpha = candyalpha;
            let candyStyle = `background-color: rgba(${cred},${cgreen},${cblue},${calpha});`;
            candyStyleArr.push(candyStyle);
        }


        if(bartype == 'Mainland') {
            panelStyle += 
            ` margin: 0px; `;         
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

        let boxPtrStyle;
        if(position == 'Bottom') {
            boxPtrStyle = `
            -arrow-rise: -10px; `;
        }
        else {
            boxPtrStyle = ``;
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

            /*#panelBox.openbar {
                
            }*/
        
            #panel.openbar {
                ${panelStyle}
            }
            #panel.openbar:windowmax {
                background-color: rgba(${bgredwmax},${bggreenwmax},${bgbluewmax},${bgalphaWMax}) !important;
                border-radius: 0px;
                border-color: rgba(${bgredwmax},${bggreenwmax},${bgbluewmax},${bgalphaWMax}) !important;
                box-shadow: none;
                margin: 0px;
                height: ${height + 2*marginWMax}px !important;
            }

            #panel.openbar .button-container {
                ${btnContainerStyle}
            }
            #panel.openbar:windowmax .button-container {
                margin: ${marginWMax}px 0px;
            }

            #panel.openbar .panel-button {
                ${btnStyle}
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
            }

            #panel.openbar .panel-button.clock-display .clock, #panel.openbar .panel-button:hover.clock-display .clock {
                background-color: transparent;
                box-shadow: none;
            }
            
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
            .openmenu.popup-menu-boxpointer {
                ${boxPtrStyle}
            }

            .openmenu.popup-menu {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
            }

            .openmenu.popup-menu-content, .openmenu.candidate-popup-content {
                box-shadow: 0 5px 10px 0 rgba(${mshred},${mshgreen},${mshblue},${mshAlpha}) !important; /* menu shadow */
                border: 1px solid rgba(${mbred},${mbgreen},${mbblue},${mbAlpha}) !important; /* menu border */
                /* add menu font */
                background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}); /* menu bg */
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}); /* menu fg */ 
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
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }
            .openmenu.popup-menu-item:checked:focus, .openmenu.popup-menu-item:checked:hover, .openmenu.popup-menu-item:checked:selected,
            .openmenu.popup-menu-item:checked:active:focus, .openmenu.popup-menu-item:checked:active:hover, .openmenu.popup-menu-item:checked:active:selected {
                color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1.0) !important;
                box-shadow: none !important;
                background-color: ${mshg} !important;
            }
              
            .openmenu.popup-menu-item:active, .openmenu.popup-menu-item.selected:active {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }
            .openmenu.popup-menu-item:active:hover, .openmenu.popup-menu-item:active:focus, 
            .openmenu.popup-menu-item.selected:active:hover, .openmenu.popup-menu-item.selected:active:focus {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
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
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
            }
            
            .openmenu.popup-sub-menu .popup-menu-item:focus, 
            .openmenu.popup-sub-menu .popup-menu-item:hover, 
            .openmenu.popup-sub-menu .popup-menu-item:selected {
                color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1.0) !important;
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            }
            
            .openmenu.popup-sub-menu .popup-menu-item:active, 
            .openmenu.popup-sub-menu .popup-submenu-menu-item:active, 
            .openmenu.popup-sub-menu .popup-submenu-menu-item:checked {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }
            .openmenu.popup-sub-menu .popup-menu-item:active:hover, .openmenu.popup-sub-menu .popup-menu-item:active:focus, 
            .openmenu.popup-sub-menu .popup-submenu-menu-item:active:hover, .openmenu.popup-sub-menu .popup-submenu-menu-item:active:focus,
            .openmenu.popup-sub-menu .popup-submenu-menu-item:checked:hover, .openmenu.popup-sub-menu .popup-submenu-menu-item:checked:focus {
                background-color: ${mshg} !important;
            }
        
        
            .openmenu.popup-menu-section .popup-sub-menu {
                background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
                border: none;
                box-shadow: none;
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
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }
            .openmenu.popup-menu-section .popup-menu-item:active:hover, .openmenu.popup-menu-section .popup-menu-item:active:focus, 
            .openmenu.popup-menu-section .popup-submenu-menu-item:active:hover, .openmenu.popup-menu-section .popup-submenu-menu-item:active:focus, 
            .openmenu.popup-menu-section .popup-submenu-menu-item:checked:hover, .openmenu.popup-menu-section .popup-submenu-menu-item:checked:focus {
                background-color: ${mshg} !important;
            }

            .openmenu.popup-menu-item .toggle-switch:checked {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
            }
            .openmenu.popup-menu-item .button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
            }
            .openmenu.popup-menu-item .button:hover, .openmenu.popup-menu-item .button:focus, .openmenu.popup-menu-item .button:selected {
                color: rgba(${mhfgred},${mhfggreen},${mhfgblue},1.0) !important;
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
                border-color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha});
            }
            .openmenu .slider{     
                color: rgba(255,255,255,0.9) !important;
                -barlevel-height: ${sliderHeight}px;
                -slider-handle-border-width: 3px;
                -slider-handle-border-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
                -barlevel-background-color: rgba(${0.8*smbgred+0.2*mfgred},${0.8*smbggreen+0.2*mfggreen},${0.8*smbgblue+0.2*mfgblue},${mbgAlpha}) !important;
                -barlevel-active-background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;            
            }
            .openmenu.popup-separator-menu-item .popup-separator-menu-item-separator, .openmenu.popup-separator-menu-item .popup-sub-menu .popup-separator-menu-item-separator {
                background-color: rgba(${mbred},${mbgreen},${mbblue},0.75) !important;
            }

        `;

        // rgba(${mhred},${mhgreen},${mhblue},${mhAlpha})
        stylesheet += `
            .openmenu.notification-banner {
                background-color: ${smbg} !important;
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.message-list-placeholder {
                color: rgba(${mfgred},${mfggreen},${mfgblue},0.5) !important;
            }
            .openmenu.message {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
            }
            .openmenu.message .message-title {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.message .message-body {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.85}) !important;
            }
            .openmenu.message .event-time {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.85}) !important;
            }
            .openmenu.message .button, .openmenu.message .message-close-button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
            }
            .openmenu.message .button:hover, .openmenu.message .button:focus,
            .openmenu.message .message-close-button:hover, .openmenu.message .message-close-button:focus {
                background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
            }
            .openmenu.message:hover, .openmenu.message:focus {
                color: ${mhfg} !important;
                background-color: ${smhbg} !important; /* 0.9*mhAlpha */
            }
            .openmenu.message .message-media-control {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.message .message-media-control:hover, .openmenu.message .message-media-control:focus {
                background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
            }
            .openmenu.message .message-media-control:insensitive {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.5}) !important;
            }
            .openmenu.message .media-message-cover-icon .fallback {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha}) !important;
            }
            .openmenu.dnd-button {
                border-color: rgba(${mbgred},${mbggreen},${mbgblue},0.5) !important;
            }
            .openmenu.dnd-button:hover, .openmenu.dnd-button:focus {
                border-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            }
            .openmenu .toggle-switch {
                background-image: url(media/toggle-off.svg);
            }
            .openmenu .toggle-switch:checked {
                background-image: url(media/toggle-on.svg);
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
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
            }
            .openmenu.message-list-clear-button:hover, .openmenu.message-list-clear-button:focus {
                color: ${mhfg} !important;
                background-color: ${smhbg} !important; /* 0.9*mhAlpha */
            }


            .openmenu.datemenu-today-button .date-label, .openmenu.datemenu-today-button .day-label {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.25}) !important;
            } 
            .openmenu.datemenu-today-button:hover, .openmenu.datemenu-today-button:focus {
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;  /* 0.9*mhAlpha */
            }

            .openmenu.calendar {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
            }
            .openmenu.calendar .calendar-month-header .pager-button,
            .openmenu.calendar .calendar-month-header .pager-button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.calendar .calendar-month-header .pager-button:hover,
            .openmenu.calendar .calendar-month-header .pager-button:focus {
                color: ${mhfg} !important;
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            }
            .openmenu.calendar .calendar-month-label {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.calendar-day-heading  {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.calendar-day-heading:focus  {
                color: ${mhfg} !important;
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            }
            .openmenu.calendar-weekday, .openmenu.calendar-work-day {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1) !important;
                font-weight: normal;
            }
            .openmenu.calendar-nonwork-day, .openmenu.calendar-weekend {
                color: rgba(${mfgred},${mfggreen},${mfgblue},0.7) !important;
                font-weight: normal;
            }
            .openmenu.calendar-other-month-day, .openmenu.calendar-other-month {
                color: rgba(${mfgred},${mfggreen},${mfgblue},0.5) !important;
                font-weight: normal;
            }
            .openmenu.calendar-other-month-day:hover, .openmenu.calendar-other-month-day:focus, .openmenu.calendar-other-month-day:selected,
            .openmenu.calendar-other-month:hover, .openmenu.calendar-other-month:focus, .openmenu.calendar-other-month:selected,
            .openmenu.calendar-nonwork-day:hover, .openmenu.calendar-nonwork-day:focus, .openmenu.calendar-nonwork-day:selected,
            .openmenu.calendar-work-day:hover, .openmenu.calendar-work-day:focus, .openmenu.calendar-work-day:selected,
            .openmenu.calendar-weekday:hover, .openmenu.calendar-weekday:focus, .openmenu.calendar-weekday:selected,
            .openmenu.calendar-weekend:hover, .openmenu.calendar-weekend:focus, .openmenu.calendar-weekend:selected  {
                color: ${mhfg} !important;
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            }
            .openmenu.calendar .calendar-today, .openmenu.calendar .calendar-today:selected {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }
            .openmenu.calendar .calendar-today:hover, .openmenu.calendar .calendar-today:focus {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: ${mshg} !important;
            }
            .openmenu.calendar-week-number {
                font-weight: bold;
                font-feature-settings: "tnum";
                background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha*0.7}) !important;
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.8}) !important;
            }


            .openmenu.events-button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
            }
            .openmenu.events-button:hover, .openmenu.events-button:focus {
                color: ${mhfg} !important;
                background-color: ${smhbg} !important;
            }
            .openmenu.events-button .events-list {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }            
            .openmenu.events-button .events-title {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.9}) !important;
            }            
            .openmenu.events-button .event-time {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.85}) !important;
            }
            
            .openmenu.world-clocks-button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
            }
            .openmenu.world-clocks-button:hover, .openmenu.world-clocks-button:focus {
                color: ${mhfg} !important;
                background-color: ${smhbg} !important;
            }
            .openmenu.world-clocks-button .world-clocks-header, .openmenu.world-clocks-button .world-clocks-timezone {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.9}) !important;
            }
            .openmenu.world-clocks-button .world-clocks-city, .openmenu.world-clocks-button .world-clocks-time {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.85}) !important;
            }
           
            .openmenu.weather-button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
            }
            .openmenu.weather-button:hover, .openmenu.weather-button:focus {
                color: ${mhfg} !important;
                background-color: ${smhbg} !important;
            }
            .openmenu.weather-button .weather-header {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.weather-button .weather-header.location {
                font-weight: normal;
            }
            .openmenu.weather-button .weather-forecast-time {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.85}) !important;
            }
        `;

        stylesheet += `
            .openmenu.quick-slider .slider{
                color: rgba(255,255,255,0.9) !important;
                -barlevel-height: ${sliderHeight}px;
                -slider-handle-border-width: 3px;
                -slider-handle-border-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
                -barlevel-background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
                -barlevel-active-background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;                  
            }

            .openmenu.quick-toggle {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
                box-shadow: none;
                border-radius: ${qtoggleRadius}px;
            }
            .openmenu.quick-toggle:hover, .openmenu.quick-toggle:focus {
                color: ${mhfg} !important;
                background-color: ${smhbg} !important;
            }   
            .openmenu.quick-toggle:checked, .openmenu.quick-toggle:checked:active, .openmenu.quick-toggle .button:checked {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }
            .openmenu.quick-toggle:checked:hover, .openmenu.quick-toggle:checked:focus, 
            .openmenu.quick-toggle:checked:active:hover, .openmenu.quick-toggle:checked:active:focus, 
            .openmenu.quick-toggle .button:checked:hover, .openmenu.quick-toggle .button:checked:focus {
                color: ${mhfg} !important;
                background-color: ${mshg} !important;
            }

            .openmenu.quick-menu-toggle .quick-toggle {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
                box-shadow: none;
            }
            .openmenu.quick-menu-toggle .quick-toggle:hover, .openmenu.quick-menu-toggle .quick-toggle:focus {
                color: ${mhfg} !important;
                background-color: ${smhbg} !important;
            }
            .openmenu.quick-menu-toggle .quick-toggle:checked, 
            .openmenu.quick-menu-toggle .quick-toggle:active {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
                box-shadow: none;
            }
            .openmenu.quick-menu-toggle .quick-toggle:checked:hover, .openmenu.quick-menu-toggle .quick-toggle:checked:focus, 
            .openmenu.quick-menu-toggle .quick-toggle:active:hover, .openmenu.quick-menu-toggle .quick-toggle:active:focus {
                color: ${mhfg} !important;
                background-color: ${mshg} !important;
            }
            
            .openmenu.quick-menu-toggle .quick-toggle-arrow {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
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
                color: ${mhfg} !important;
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            }
            .openmenu.quick-menu-toggle .quick-toggle-arrow:checked {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha*1.2}) !important;
            }
            .openmenu.quick-menu-toggle .quick-toggle-arrow:checked:hover, .openmenu.quick-menu-toggle .quick-toggle-arrow:checked:focus {
                background-color: ${mshg} !important;
            }

            .openmenu.quick-toggle-menu {
                background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha}) !important;
            }
            .openmenu.quick-toggle-menu .popup-menu-item {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.quick-toggle-menu .popup-menu-item:hover, .openmenu.quick-toggle-menu .popup-menu-item:focus {
                color: ${mhfg} !important;
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            }

            .openmenu.quick-toggle-menu .popup-menu-item:checked {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha*1.2}) !important;
            }            
            .openmenu.quick-toggle-menu .popup-menu-item:checked:focus, .openmenu.quick-toggle-menu .popup-menu-item:checked:hover, 
            .openmenu.quick-toggle-menu .popup-menu-item:checked:selected {
                color: ${mhfg} !important;
                background-color: ${mshg} !important;
            }
            .openmenu.quick-toggle-menu .header .title, .openmenu.quick-toggle-menu .header .subtitle  {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.quick-toggle-menu .header .icon {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }


            .openmenu.quick-settings-system-item .icon-button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.2}) !important;
                background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
            }
            .openmenu.quick-settings .icon-button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.2}) !important;
            }
            .openmenu.quick-settings .button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.2}) !important;
                background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*1.2}) !important;
            }
            .openmenu.quick-settings .button:checked {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.2}) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }

            .openmenu.quick-settings-system-item .icon-button:hover, .openmenu.quick-settings-system-item .icon-button:focus,
            .openmenu.quick-settings .icon-button:hover, .openmenu.quick-settings .icon-button:focus,
            .openmenu.quick-settings .button:hover, .openmenu.quick-settings .button:focus {
                color: ${mhfg} !important;
                background-color: ${smhbg} !important;
            }
            
            .openmenu.quick-settings .button:checked:hover, .openmenu.quick-settings .button:checked:focus {
                color: ${mhfg} !important;
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
        
        let stylepath = this.openbar.path + '/stylesheet.css';
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

    }

    // Save stylesheet to file and trigger: reload from extension.js
    triggerStyleReload() { 
        if(this.onImportExport)
            return;
        console.log('triggerStyleReload called with onImportExport false');
        // Save stylesheet from string to css file
        this.saveStylesheet();
        // Cause stylesheet to reload by toggling 'reloadstyle'
        let reloadstyle = this._settings.get_boolean('reloadstyle');
        if(reloadstyle)
            this._settings.set_boolean('reloadstyle', false);
        else
            this._settings.set_boolean('reloadstyle', true);
    }

    // Trigger stylesheet save and reload with timeout to cancel quick-successive triggers
    setTimeoutStyleReload() {
        if(this.timeoutId)
            clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            this.timeoutId = null;
            this.triggerStyleReload();
        }, 300);
    }

    createComboboxWidget(options) {
        let comboBox = new Gtk.ComboBoxText({halign: Gtk.Align.END});
        options.forEach(option => {
            comboBox.append(option[0], option[1]);
        });
        // comboBox.connect('changed', () => {this.setTimeoutStyleReload();});
        return comboBox;
    }

    hexToRGBA(hex) {
        let bigint = parseInt(hex, 16);
        let r = ((bigint >> 16) & 255) / 255;
        let g = ((bigint >> 8) & 255) / 255;
        let b = (bigint & 255) / 255;
      
        let rgba = new Gdk.RGBA({
            red: r, 
            green: g, 
            blue: b, 
            alpha: 1.0
        });
        return rgba;
    } 

    createDefaultPaletteArray() {
        const  defaultHexColors = [
            "99c1f1", "62a0ea", "3584e4", "1c71d8", "1a5fb4", /* Blue */
            "8ff0a4", "57e389", "33d17a", "2ec27e", "26a269", /* Green */
            "f9f06b", "f8e45c", "f6d32d", "f5c211", "e5a50a", /* Yellow */
            "ffbe6f", "ffa348", "ff7800", "e66100", "c64600", /* Orange */
            "f66151", "ed333b", "e01b24", "c01c28", "a51d2d", /* Red */
            "dc8add", "c061cb", "9141ac", "813d9c", "613583", /* Purple */
            "cdab8f", "b5835a", "986a44", "865e3c", "63452c", /* Brown */
            "ffffff", "f6f5f4", "deddda", "c0bfbc", "9a9996", /* Light */
            "77767b", "5e5c64", "3d3846", "241f31", "000000"  /* Dark */
        ];
        
        let defaultPaletteArray = [];
        for(const hex of defaultHexColors) {
            defaultPaletteArray.push(this.hexToRGBA(hex));
        }
        // Save default palette array to use when bgPalette is updated
        this.defaultPaletteArray = defaultPaletteArray;
        
        return defaultPaletteArray;
    }

    createBgPaletteArray() {
        let rgbaArray = [];
        for(let i=1; i<=12; i++) {
            let paletteColor = this._settings.get_strv('palette'+i);
            let rgba = new Gdk.RGBA();
            rgba.red = parseFloat(paletteColor[0])/255;
            rgba.green = parseFloat(paletteColor[1])/255;
            rgba.blue = parseFloat(paletteColor[2])/255;
            rgba.alpha = 1.0;
            rgbaArray.push(rgba);
        }
        return rgbaArray;
    }

    createColorWidget(window, title, tooltip_text="", gsetting) {
        let color = new Gtk.ColorButton({
            title: title,
            halign: Gtk.Align.END,
            tooltip_text: tooltip_text,
        });

        let colorArray = this._settings.get_strv(gsetting);
        let rgba = new Gdk.RGBA();
        rgba.red = parseFloat(colorArray[0]);
        rgba.green = parseFloat(colorArray[1]);
        rgba.blue = parseFloat(colorArray[2]);
        rgba.alpha = 1.0;
        color.set_rgba(rgba);

        color.connect('color-set', (widget) => {
            rgba = widget.get_rgba();
            this._settings.set_strv(gsetting, [
                rgba.red.toString(),
                rgba.green.toString(),
                rgba.blue.toString(),
            ]);
            this.triggerStyleReload();
        });

        // Update widget when setting is changed (from import file)
        this._settings.connect(`changed::${gsetting}`, () => {
            const colorArray = this._settings.get_strv(gsetting);
            const rgba = color.get_rgba();
            rgba.red = parseFloat(colorArray[0]);
            rgba.green = parseFloat(colorArray[1]);
            rgba.blue = parseFloat(colorArray[2]);
            rgba.alpha = 1.0;
            color.set_rgba(rgba);
        });

        // Add-palette removes existing default array so add it back first
        let defaultArray = this.createDefaultPaletteArray();
        let bgPaletteArray = this.createBgPaletteArray();
        color.add_palette(Gtk.Orientation.VERTICAL, 5, defaultArray);
        color.add_palette(Gtk.Orientation.HORIZONTAL, 6, bgPaletteArray);

        window.colorButtons.push(color);

        return color;
    }

    createScaleWidget(lower, upper, step_increment, digits, tooltip_text='') {
        let scale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: lower,
                upper: upper,
                step_increment: step_increment,
            }),
            digits: digits,
            draw_value: true,
            value_pos: Gtk.PositionType.RIGHT,
            width_request: 50,
            hexpand: true,
            tooltip_text: tooltip_text,
        });
        scale.connect('change-value', () => {this.setTimeoutStyleReload();});
        return scale;
    }

    createSwitchWidget(tooltip_text='') {
        let gtkswitch = new Gtk.Switch({
            halign: Gtk.Align.END,
            tooltip_text: tooltip_text,
        });
        // gtkswitch.connect('state-set', () => {this.setTimeoutStyleReload();});
        return gtkswitch;
    }

    createGridWidget() {
        let grid = new Gtk.Grid({
            margin_top: 14,
            margin_bottom: 14,
            margin_start: 14,
            margin_end: 14,
            column_spacing: 12,
            row_spacing: 12,
            orientation: Gtk.Orientation.VERTICAL,
        });
        return grid;
    }

    createSeparatorWidget() {
        let separator = new Gtk.Separator({
            orientation: Gtk.Orientation.HORIZONTAL,
            hexpand: true,
            margin_bottom: 8,
            margin_top: 8,
        });
        return separator;
    }

    compareHSP(A, B) {
        let hspA = this.getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2]));
        let hspB = this.getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2]));

        return (hspA < hspB)? -1 : (hspA > hspB)? 1 : 0;
    }

    // Move color A towards or away from B by factor. Based on simplified formula from getColorDist() below
    colorMove(A, B, factor) {
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

        log('COLOR MOVE - ' + A + ' - ' + B + ' - ' + newR + ' ' + newG + ' ' + newB);
        return [String(newR), String(newG), String(newB)];
    }

    getColorDist(A, B) {
        let [r1, g1, b1] = [parseInt(A[0]), parseInt(A[1]), parseInt(A[2])];
        let [r2, g2, b2] = [parseInt(B[0]), parseInt(B[1]), parseInt(B[2])];

        let rmean = (r1 + r2)/2;
        let r = r1 - r2;
        let g = g1 - g2;
        let b = b1 - b2;
        // Approx color distance based on http://www.compuphase.com/cmetric.htm, range: 0-765
        let dist =  Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
        log('COLOR DIST - ' + B + ' - ' + dist);
        return dist;
    }

    compareColorfulness(A, B) {
        // We consider greater difference between the R, G, B values to indicate colorfulness
        // while similar values for R,G,B to indicate greyscale
        let [r, g, b] = [parseInt(A[0]), parseInt(A[1]), parseInt(A[2])];
        let colorDistA = Math.max(r, g, b) - Math.min(r, g, b);
        [r, g, b] = [parseInt(B[0]), parseInt(B[1]), parseInt(B[2])];
        let colorDistB = Math.max(r, g, b) - Math.min(r, g, b);
        return (colorDistA < colorDistB)? -1 : (colorDistA > colorDistB)? 1 : 0;
    }

    getStrv(strInt) {
        // Color settings are stored as RGB in range 0-1 so we convert from 0-255
        let [r, g, b] = [parseInt(strInt[0]), parseInt(strInt[1]), parseInt(strInt[2])];
        return [String(r/255), String(g/255), String(b/255)];
    }

    getRGBStr(str255) {
        let rgb = `rgb(${str255[0]}, ${str255[1]}, ${str255[2]})`;
        return rgb;
    }

    // Auto-Theming: Select colors from color palettes as per theme/variation
    // Manipulate colors for better contrast and readability, as needed
    autoApplyBGPalette() {
        // log('autoApplyBGPalette: onImportExport ' + this.onImportExport);
        // log('autoApply caller ' + this.autoApplyBGPalette.caller);
        if(this.onImportExport)
            return;
        
        // log('autoApply caller ' + this.autoApplyBGPalette.caller);

        let red = ['255', '0', '0'];
        let white = ['255', '255', '255'];
        let darkgrey = ['50', '50', '50'];
        let black = ['0', '0', '0'];
        let iters = 6;
        let delta = 0.06;
        let theme = this._settings.get_string('autotheme');
        let variation = this._settings.get_string('variation');

        if(theme == 'Select Theme' || variation == 'Select Variation')
            return;

        // const toRGBArray = rgbStr => rgbStr.match(/\d+/g);

        let prominentArr = [], paletteArr = [];
        let allArr = [];
        for(let i=1; i<=18; i++) {
            if(i<=6) {
                prominentArr.push(this._settings.get_strv('prominent'+i));
                allArr.push(this._settings.get_strv('prominent'+i));
            }
            else {
                paletteArr.push(this._settings.get_strv('palette'+(i-6)));
                allArr.push(this._settings.get_strv('palette'+(i-6)));
            }
        }
        let prominentRaw1 = prominentArr[0];
        let prominentRaw2 = prominentArr[1];

        // Sort prominentArr as per the HSP (brightness) [slice(0) to copy array]
        let prominentHSP = prominentArr.slice(0).sort(this.compareHSP.bind(this));
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
        let allColorful = paletteArr.slice(0).sort(this.compareColorfulness);
        let colorful1, colorful2, colorful3;
        
        let l = allColorful.length;
        let c1c2HCandidates;
        let overrideAccent = this._settings.get_boolean('accent-override');
        // If accent override enabled, set user specified color as accent and mark top 2 colorful colors as highlight candidates
        if(overrideAccent) {
            colorful1 = this._settings.get_strv('accent-color');
            colorful1 = [parseFloat(colorful1[0])*255, parseFloat(colorful1[1])*255, parseFloat(colorful1[2])*255];
            colorful1 = [parseInt(colorful1[0]).toString(), parseInt(colorful1[1]).toString(), parseInt(colorful1[2]).toString()];
            c1c2HCandidates = [allColorful[l-1], allColorful[l-2]];
        }
        else {  
            // Select Accent from two colors with highest colorfulness, as the one that is closer to Red and is bright
            // and next color as Highlight candidate for bar and menu      
            if(this.getColorDist(allColorful[l-1], red) - this.getHSP(parseInt(allColorful[l-1][0]), parseInt(allColorful[l-1][1]), parseInt(allColorful[l-1][2])) <= 
                this.getColorDist(allColorful[l-2], red) - this.getHSP(parseInt(allColorful[l-2][0]), parseInt(allColorful[l-2][1]), parseInt(allColorful[l-2][2]))) {
                colorful1 = allColorful[l-1];
                colorful2 = allColorful[l-2];
            }
            else {
                colorful1 = allColorful[l-2];
                colorful2 = allColorful[l-1];
            }

            log('COLORFUL-10 ' + colorful1);
            // Dealta Factor logic (everywhere): 
            // Compute distance from threshold as percentage (e.g. (180-c1Hsp)/180 )
            // Add one to it (e.g. if % dist is 0.25 make it 1.25. 1+(180-c1Hsp)/180) = 2-c1Hsp/180
            // Then multiply delta with it (e.g. delta*1.25)

            // Lighten accent color if its brightness is lower than threshold
            for(let i=0; i<iters; i++) {
                let c1Hsp = this.getHSP(parseInt(colorful1[0]), parseInt(colorful1[1]), parseInt(colorful1[2]));
                log('COLORFUL1 HSP ' + c1Hsp);
                if(c1Hsp < 180) {            
                    colorful1 = this.colorMove(colorful1, white, delta*(2-c1Hsp/180));
                    log('COLORFUL-11 ' + colorful1);
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
            let distA = this.getColorDist(A, colorful1) + btFactor*this.getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2]));// + 1*Math.abs(this.getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2])) - 165);
            let distB = this.getColorDist(B, colorful1) + btFactor*this.getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2]));// + 1*Math.abs(this.getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2])) - 165);
            return (distA > distB)? -1 : (distA < distB)? 1 : 0;
        });
        colorful2 = highlightCandidates[0];
        log('COLORFUL2 dist to Coloful1 ' + this.getColorDist(colorful2, colorful1));
        log('COLORFUL2 HSP ' + this.getHSP(parseInt(colorful2[0]), parseInt(colorful2[1]), parseInt(colorful2[2])));

        // Bar Highlight color should be away from bar BG color with brightness as per btFactor
        highlightCandidates.splice(0, 1);
        highlightCandidates.sort((A,B) => {
            let distA = this.getColorDist(A, prominent1) + btFactor*this.getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2]));// + 1*Math.abs(this.getHSP(parseInt(A[0]), parseInt(A[1]), parseInt(A[2])) - 165);
            let distB = this.getColorDist(B, prominent1) + btFactor*this.getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2]));// + 1*Math.abs(this.getHSP(parseInt(B[0]), parseInt(B[1]), parseInt(B[2])) - 165);
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
            let accentDistA = this.getColorDist(A, colorful1);
            let highlightDistA = this.getColorDist(A, colorful2);
            let fgDistA = this.getColorDist(A, fgCol);
            let accentDistB = this.getColorDist(B, colorful1);
            let highlightDistB = this.getColorDist(B, colorful2);
            let fgDistB = this.getColorDist(B, fgCol);
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
            if(this.getColorDist(menuBGCandidates[i], colorful1) < threshold || 
                this.getColorDist(menuBGCandidates[i], colorful2) < threshold || 
                this.getColorDist(menuBGCandidates[i], fgCol) < threshold) {
                menuBGCandidates.splice(i, 1);
                i--;
            }
        }
        log('Filtered menuBGCandidates ' + menuBGCandidates);        

        let assignedMenuBG = false, assignedSubMenuBG = false;
        if(menuBGCandidates.length >= 2) {
            menuBGCandidates.sort(compareColrDist.bind(this));
            prominent2 = menuBGCandidates[0]; // Menu BG
            prominent3 = menuBGCandidates[1]; // Sub Menu BG

            // In case both prominent2 and prominent3 are too close to each other
            // change prominent3 to next in line that works
            for(const c of menuBGCandidates) {
                if(this.getColorDist(c, prominent2) > 75) {
                    prominent3 = c; log('New Prominent 3 ' + prominent3);
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
            log('PROM-DARK 2 and/or 3 Not found !!');
            menuBGCandidates = prominentHSP.slice(1); 
            if(assignedMenuBG)
                menuBGCandidates.splice(menuBGCandidates.indexOf(prominent2), 1);
            log('Again menuBGCandidates ' + menuBGCandidates);
            let mBGCandidates = menuBGCandidates.concat(paletteArr);
            menuBGCandidates = mBGCandidates.slice(0);

            for(let i=0; i<menuBGCandidates.length; i++) {
                if(this.getColorDist(menuBGCandidates[i], colorful1) < threshold || 
                    this.getColorDist(menuBGCandidates[i], colorful2) < threshold || 
                    this.getColorDist(menuBGCandidates[i], white) < threshold) {
                    menuBGCandidates.splice(i, 1);
                    i--;
                }
            }
            if(menuBGCandidates.length >= 2) {
                menuBGCandidates.sort(compareColrDist.bind(this));
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
                    if(this.getColorDist(c, prominent2) > 75) {
                        prominent3 = c; log('New Else Prominent 3 ' + prominent3);
                        break;
                    }
                }

                assignedMenuBG = true;
                assignedSubMenuBG = true;
            }
            else {
                log('LAST RESORTT!! Check Logic Dark2');
                menuBGCandidates = mBGCandidates.slice(0);
                menuBGCandidates.sort(compareColrDist.bind(this));

                prominent2 = menuBGCandidates[0];
                prominent3 = menuBGCandidates[1];

                // menuBGCandidates = [prominent2].concat(menuBGCandidates.slice(2));
                menuBGCandidates = menuBGCandidates.slice(1);
                for(const c of menuBGCandidates) {
                    if(this.getColorDist(c, prominent2) > 75 && this.getColorDist(c, colorful2) > 75) {
                        prominent3 = c; log('New Last Prominent 3 ' + prominent3);
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
                let c1Dist = this.getColorDist(prominent2, colorful1); // accent
                if(c1Dist < threshold) {               
                    prominent2 = this.colorMove(prominent2, colorful1, -delta*(2-c1Dist/threshold));
                    log('PROM_DARK2 accent ' + prominent2);
                }

                let c2Dist = this.getColorDist(prominent2, colorful2); // highlight
                if(c2Dist < 100) {               
                    prominent2 = this.colorMove(prominent2, colorful2, -delta*(2-c2Dist/100));
                    log('PROM_DARK2 highlight ' + prominent2);
                }

                let prom3Dist = this.getColorDist(prominent2, prominent3); // smbg
                if(prom3Dist < 75) {               
                    prominent2 = this.colorMove(prominent2, prominent3, -delta*(2-prom3Dist/75));
                    log('PROM_DARK2 sub ' + prominent2);
                }

                let pDark2Hsp = this.getHSP(parseInt(prominent2[0]), parseInt(prominent2[1]), parseInt(prominent2[2]));
                log('prominent2 HSP ' + pDark2Hsp);
                if(pDark2Hsp < 50) {               
                    prominent2 = this.colorMove(prominent2, white, delta*(2-pDark2Hsp/50));
                    log('prominent2-White1 ' + prominent2);
                }
                if(pDark2Hsp > 175) {               
                    prominent2 = this.colorMove(prominent2, white, -delta*(pDark2Hsp)/175);
                    log('prominent2-White2 ' + prominent2);
                }
            }
            
            // Adjust SMBG color prominent3 as needed
            for(let i=0; i<iters; i++) {
                let c1Dist = this.getColorDist(prominent3, colorful1); // accent
                if(c1Dist < threshold) {               
                    prominent3 = this.colorMove(prominent3, colorful1, -delta*(2-c1Dist/threshold));
                    log('PROM_DARK3 accent ' + prominent3);
                }

                let c2Dist = this.getColorDist(prominent3, colorful2); // highlight
                if(c2Dist < 100) {               
                    prominent3 = this.colorMove(prominent3, colorful2, -delta*(2-c2Dist/100));
                    log('PROM_DARK3 highlight ' + prominent3);
                }

                let prom2Dist = this.getColorDist(prominent3, prominent2); // mbg
                if(prom2Dist < 75) {               
                    prominent3 = this.colorMove(prominent3, prominent2, -delta*(2-prom2Dist/75));
                    log('PROM_DARK3 sub ' + prominent3);
                }
                
                let pDark3Hsp = this.getHSP(parseInt(prominent3[0]), parseInt(prominent3[1]), parseInt(prominent3[2]));
                log('prominent3 HSP ' + pDark3Hsp);

                if(pDark3Hsp < 50) {               
                    prominent3 = this.colorMove(prominent3, white, delta*(2-pDark3Hsp/50));
                    log('prominent3-White1 ' + prominent3);
                }
                if(pDark3Hsp > 175) {               
                    prominent3 = this.colorMove(prominent3, white, -delta*(pDark3Hsp)/175);
                    log('prominent3-White2 ' + prominent3);
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
                let prom2Dist = this.getColorDist(prominent3, prominent2);
                if(prom2Dist < 75) {               
                    prominent3 = this.colorMove(prominent3, prominent2, -delta*(2-prom2Dist/75));
                    log('PROM_DARK3 sub ' + prominent3);
                }
                let prom3Dist = this.getColorDist(prominent2, prominent3);
                if(prom3Dist < 75) {               
                    prominent2 = this.colorMove(prominent2, prominent3, -delta*(2-prom3Dist/75));
                    log('PROM_DARK2 sub ' + prominent2);
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
                let prom2Dist = this.getColorDist(prominent3, prominent2);
                if(prom2Dist < 75) {               
                    prominent3 = this.colorMove(prominent3, prominent2, -delta*(2-prom2Dist/75));
                    log('PROM_DARK3 sub ' + prominent3);
                }
                let prom3Dist = this.getColorDist(prominent2, prominent3);
                if(prom3Dist < 75) {               
                    prominent2 = this.colorMove(prominent2, prominent3, -delta*(2-prom3Dist/75));
                    log('PROM_DARK2 sub ' + prominent2);
                }
            }
        }
        
        // HIGHLIGHTS
        delta = 0.06;
        log('COLORFUL-20 ' + colorful2);
        // Adjust Menu Highlight colorful2 as needed
        for(let i=0; i<iters; i++) {
            let c1Dist = this.getColorDist(colorful2, colorful1);
            if(c1Dist < 100) {               
                colorful2 = this.colorMove(colorful2, colorful1, -delta*(2-c1Dist/100));
                log('COLORFUL-21 ' + colorful2);
            }
            let pDark2Dist = this.getColorDist(colorful2, prominent2);           
            if(pDark2Dist < 100) {               
                colorful2 = this.colorMove(colorful2, prominent2, -delta*(2-pDark2Dist/100)); 
                log('COLORFUL-22 ' + colorful2);
            }
            let pDark3Dist = this.getColorDist(colorful2, prominent3);
            if(pDark3Dist < 100) {               
                colorful2 = this.colorMove(colorful2, prominent3, -delta*(2-pDark3Dist/100));
                log('COLORFUL-23 ' + colorful2);
            }

            let c2Hsp = this.getHSP(parseInt(colorful2[0]), parseInt(colorful2[1]), parseInt(colorful2[2]));
            if(theme == 'Light') { // Light theme
                if(c2Hsp < 150) {               
                    colorful2 = this.colorMove(colorful2, white, 2*delta*(2-c2Hsp/150));
                    log('COLORFUL-24 ' + colorful2);
                }
            }
            else { // Non-Light theme
                if(c2Hsp < 100) {               
                    colorful2 = this.colorMove(colorful2, white, delta*(2-c2Hsp/100));
                    log('COLORFUL-24 ' + colorful2);
                }           
                log('COLORFUL2 HSP ' + c2Hsp);
                if(c2Hsp > 200) {               
                    colorful2 = this.colorMove(colorful2, white, -delta*(c2Hsp)/200);
                    log('COLORFUL-25 ' + colorful2);
                }
            }
        }
        
        log('COLORFUL-30 ' + colorful3);
        for(let i=0; i<iters; i++) {
            let pDark1Dist = this.getColorDist(colorful3, prominent1);
            if(pDark1Dist < 100) {               
                colorful3 = this.colorMove(colorful3, prominent1, -delta*(2-pDark1Dist/100));
                log('COLORFUL-31 ' + colorful3);
            }
            
            let c3Hsp = this.getHSP(parseInt(colorful3[0]), parseInt(colorful3[1]), parseInt(colorful3[2]));
            if(theme == 'Light') { // Light theme
                if(c3Hsp < 150) {               
                    colorful3 = this.colorMove(colorful3, white, 2*delta*(2-c3Hsp/150));
                    log('COLORFUL-32 ' + colorful3);
                }
            }
            else { // Non-Light theme
                log('COLORFUL3 HSP ' + this.getHSP(parseInt(colorful3[0]), parseInt(colorful3[1]), parseInt(colorful3[2])));
                if(c3Hsp < 100) {               
                    colorful3 = this.colorMove(colorful3, white, delta*(2-c3Hsp/100));
                    log('COLORFUL-32 ' + colorful3);
                }
                if(c3Hsp > 200) {               
                    colorful3 = this.colorMove(colorful3, white, -delta*(c3Hsp)/200);
                    log('COLORFUL-33 ' + colorful3);
                }
            }
        }

        // BORDER & SHADOW
        let allHSP = allArr.slice(0).sort(this.compareHSP.bind(this));
        if(theme == 'Light')
            allHSP = allHSP.reverse();
        let allHSP1 = allHSP[17]; // Bar border color
        let allHSP2 = allHSP[16]; // Menu border and shadow color

        // Move Bar border color towards fg color for high contrast border
        for(let i=0; i<iters; i++) {
            if(this.getColorDist(allHSP1, fgCol) > 90) {               
                allHSP1 = this.colorMove(allHSP1, fgCol, 2*delta);
                log('allHSP1 ' + allHSP1);
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
        hcolor, halpha, bradius, bwidth, bcolor, balpha, mfgcolor, mfgalpha, mbgcolor, mbgalpha, smbgcolor, smbgalpha, mbcolor, 
        mbalpha, mhcolor, mhalpha, mshcolor, mshalpha, mscolor, msalpha;

        let bartype = this._settings.get_string('bartype');
        
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
        bgcolor = this.getStrv(prominent1);
        if(bartype == 'Mainland') {
            bgalpha = 0.9;
            bradius = 0;
            bwidth = 0;
        }
        else if(bartype == 'Floating') {
            bgalpha = 0.9;
            bradius = 50;
            bwidth = 2;
        }
        else {
            bgalpha = 0;
            bradius = 50;
            bwidth = 2;
        }
        iscolor = this.getStrv(prominent1);
        isalpha = 0.9;
        bgcolor2 = ['0.5', '0.5', '0.5'];
        bgalpha2 = 0.9;
        bcolor = this.getStrv(allHSP1);
        balpha = 0.7;
        hcolor = this.getStrv(colorful3);
        halpha = 0.8;
        shcolor = this.getStrv(allHSP1);
        shalpha = 0.16;
        bgcolorWmax = this.getStrv(bgwmax);
        bgalphaWmax = 0.9;

        // MENU
        mfgalpha = 1.0; 
        mbgcolor = this.getStrv(prominent2);
        mbgalpha = 0.95;
        smbgcolor = this.getStrv(prominent3);
        smbgalpha = 0.95;
        mbcolor = this.getStrv(allHSP2);
        mbalpha = 0.6;
        mhcolor = this.getStrv(colorful2);
        mhalpha = 0.7;
        mshcolor = this.getStrv(allHSP2);
        mshalpha = 0.16;
        mscolor = this.getStrv(colorful1);
        msalpha = 0.9;

        // Update settings for bar and menu
        if(bartype == 'Trilands' || bartype == 'Islands')
            this._settings.set_boolean('shadow', false);
        this._settings.set_strv('fgcolor', fgcolor);
        this._settings.set_double('fgalpha', fgalpha);
        this._settings.set_strv('bgcolor', bgcolor);
        this._settings.set_double('bgalpha', bgalpha);
        this._settings.set_strv('bgcolor2', bgcolor2);
        this._settings.set_double('bgalpha2', bgalpha2);
        this._settings.set_strv('iscolor', iscolor);
        this._settings.set_double('isalpha', isalpha);
        this._settings.set_strv('shcolor', shcolor);
        this._settings.set_double('shalpha', shalpha);
        this._settings.set_double('bradius', bradius);
        this._settings.set_double('bwidth', bwidth);
        this._settings.set_strv('bcolor', bcolor);
        this._settings.set_double('balpha', balpha);
        this._settings.set_strv('hcolor', hcolor);
        this._settings.set_double('halpha', halpha);
        this._settings.set_strv('bgcolor-wmax', bgcolorWmax);
        this._settings.set_double('bgalpha-wmax', bgalphaWmax);

        this._settings.set_strv('mfgcolor', mfgcolor);
        this._settings.set_double('mfgalpha', mfgalpha);
        this._settings.set_strv('mbgcolor', mbgcolor);
        this._settings.set_double('mbgalpha', mbgalpha);
        this._settings.set_strv('smbgcolor', smbgcolor);
        this._settings.set_double('smbgalpha', smbgalpha);
        this._settings.set_strv('mbcolor', mbcolor);
        this._settings.set_double('mbalpha', mbalpha);
        this._settings.set_strv('mhcolor', mhcolor);
        this._settings.set_double('mhalpha', mhalpha);
        this._settings.set_strv('mshcolor', mshcolor);
        this._settings.set_double('mshalpha', mshalpha);
        this._settings.set_strv('mscolor', mscolor);
        this._settings.set_double('msalpha', msalpha);
    }

    rgbToHex(r, g, b) {
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    }

    createPalette(window, paletteBox1, paletteBox2, clipboard) {
        for(let i=1; i<=12; i++) {
            let paletteColor = this._settings.get_strv('palette'+i);
            let hexCol = this.rgbToHex(paletteColor[0],paletteColor[1],paletteColor[2]);
            let paletteLbl = new Gtk.Label({
                label: `<span bgcolor="${hexCol}" font_size="150%">       </span>`,
                sensitive: true,
                use_markup: true,
            });
            let paletteBtn = new Gtk.Button({
                child: paletteLbl,
                sensitive: true,
                tooltip_text: hexCol,
            });        
            paletteBtn.connect('clicked', () => {
                let hexCol = paletteLbl.label.match(/bgcolor="(.*?)" font/i)[1];
                clipboard.set(hexCol);
            });
            i<=6? paletteBox1.append(paletteBtn): paletteBox2.append(paletteBtn);
            window.paletteButtons.push(paletteBtn);
        }
    }

    createCandyPalette(window, paletteBox) {
        for(let i=1; i<=8; i++) {            
            let candyColor = this.createColorWidget(window, 'Candybar Color', '', 'candy'+i);
            paletteBox.append(candyColor);
        }
    }

    updatePalette(window, grey=false) {
        let i = 1;
        window.paletteButtons.forEach(btn => {
            let paletteColor = grey? ['125','125','125'] : this._settings.get_strv('palette'+i);
            let hexCol = this.rgbToHex(paletteColor[0],paletteColor[1],paletteColor[2]);
            btn.child.label = `<span bgcolor="${hexCol}" font_size="150%">       </span>`;
            btn.tooltip_text = hexCol;
            i++;
        });

        if(!grey) {
            window.colorButtons.forEach(color => {
                let defaultArray = this.defaultPaletteArray;
                let bgPaletteArray = this.createBgPaletteArray();
                color.add_palette(Gtk.Orientation.VERTICAL, 0, null);
                color.add_palette(Gtk.Orientation.VERTICAL, 5, defaultArray);
                color.add_palette(Gtk.Orientation.HORIZONTAL, 6, bgPaletteArray);
            });
        }
    }

    triggerBackgroundPalette(window) {
        if(this.onImportExport)
            return;

        // Gray out the palette
        this.updatePalette(window, true);
        // Trigger backgroundPalette() by toggling 'bgpalette'
        let bgpalette = this._settings.get_boolean('bgpalette');
        if(bgpalette)
            this._settings.set_boolean('bgpalette', false);
        else
            this._settings.set_boolean('bgpalette', true);
        // Update palette once it is updated in settings
        setTimeout(() => {this.updatePalette(window, false)}, 500);
    }

    saveToggleSVG(toggleOn) {
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

            svgpath = this.openbar.path + '/media/toggle-on.svg';
            svgcolor = this.msHex;
        }
        else {
            svg = `
            <svg width="48" height="26" xmlns="http://www.w3.org/2000/svg">
            <rect style="fill:#REPLACE;fill-opacity:1;stroke:none;stroke-width:1;marker:none" width="48" height="26" x="-48" ry="13" fill="#3081e3" rx="13" transform="scale(-1 1)"/>
            <rect ry="11" rx="11" y="3" x="-24" height="22" width="22" style="fill:#000;fill-opacity:.2;stroke:none;stroke-width:.999999;marker:none" fill="#f8f7f7" transform="scale(-1 1)"/>
            <rect ry="11" rx="11" y="2" x="-24" height="22" width="22" style="fill:#fff;fill-opacity:1;stroke:none;stroke-width:.999999;marker:none" fill="#f8f7f7" transform="scale(-1 1)"/>
            </svg>
            `;

            svgpath = this.openbar.path + '/media/toggle-off.svg';
            svgcolor = this.smbgHex;
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

    saveCheckboxSVG(checked) {
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

            svgpath = this.openbar.path + '/media/checkbox-on.svg';
            svgcolor = this.msHex;
        }
        else {
            svg = `
            <svg width="24" height="24" fill="#000000" opacity=".54" version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="4" ry="4" color="#000000" opacity=".12" stroke-width="1.25" style="paint-order:fill markers stroke"/>
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3" color="#000000" fill="#REPLACE" stroke-width="1.2857" style="paint-order:fill markers stroke"/>
            </svg>
            `;

            svgpath = this.openbar.path + '/media/checkbox-off.svg';
            svgcolor = this.smbgHex;
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

    fillOpenbarPrefs(window, openbar) {

        window.set_title(_("Open Bar 🍹"));
        window.default_height = 800;
        window.default_width = 700;

        window.paletteButtons = [];
        window.colorButtons = [];

        this.openbar = openbar;
        this.onImportExport = false;
        // Get the settings object
        this._settings = openbar.getSettings();
        // Connect settings to update/save/reload stylesheet
        let settEvents = ['bartype', 'position', 'font', 'gradient', 'border-wmax', 'neon-wmax',
        'gradient-direction', 'shadow', 'neon', 'heffect', 'smbgoverride', 'savestyle']; 
        settEvents.forEach(event => {
            this._settings.connect('changed::'+event, () => {this.triggerStyleReload();});
        });
        // Connect settings to save toggle-switch and checkbox SVGs
        this._settings.connect('changed::mscolor', () => {
            setTimeout(() => {this.saveToggleSVG(true); 
                              this.saveCheckboxSVG(true);}, 400);
        });
        ['mbgcolor', 'smbgcolor', 'smbgoverride'].forEach(setting => {
            this._settings.connect('changed::'+setting, () => {
                setTimeout(() => {this.saveToggleSVG(false); 
                                  this.saveCheckboxSVG(false);}, 400);
            });
        });

        // Refresh auto-theme on background change, if refresh enabled and auto-theme set
        this._settings.connect('changed::bg-change', () => {
            let theme = this._settings.get_string('autotheme');
            let variation = this._settings.get_string('variation');
            if(!this._settings.get_boolean('autotheme-refresh') || theme == 'Select Theme' || variation == 'Select Variation')
                return;
            setTimeout(() => {
                this.autoApplyBGPalette();
                this.triggerStyleReload();
            }, 200);
        });
        // Refresh auto-theme on accent-override switch change, if auto-theme set
        this._settings.connect('changed::accent-override', () => {
            let theme = this._settings.get_string('autotheme');
            let variation = this._settings.get_string('variation');
            if(theme == 'Select Theme' || variation == 'Select Variation')
                return;
            setTimeout(() => {                
                this.autoApplyBGPalette();
                this.triggerStyleReload();
            }, 200);
        });

        this.timeoutId = null;

        const settingsPage = new Adw.PreferencesPage({
            name: 'settings',
            title: _('Settings'),
            icon_name: 'emblem-system-symbolic',
        });
        window.add(settingsPage);

        const settingsGroup = new Adw.PreferencesGroup();
        settingsPage.add(settingsGroup);


        let prefsWidget = this.createGridWidget();

        let rowNo = 1;
        // Add a logo image
        const aboutImage = new Gtk.Image({
            file: this.openbar.path + "/media/openbar.jpg",
            vexpand: false,
            hexpand: false,
            pixel_size: 100,
            margin_bottom: 15,
            halign: Gtk.Align.END,
        });
        prefsWidget.attach(aboutImage, 2, rowNo, 1, 1);

        // Add a title label
        let titleLabel = new Gtk.Label({
            label: `<span size="large"><b>Top Bar Customization</b></span>\n\n<span size="small" underline="none" color="#eeae42"><b>${_('Version:')} ${this.openbar.metadata.version}  |  <a href="${this.openbar.metadata.url}">Home</a>  |  © <a href="https://extensions.gnome.org/accounts/profile/neuromorph">neuromorph</a>  |  <a href="${this.openbar.metadata.url}">☆ Star</a>  |  <a href="https://www.buymeacoffee.com/neuromorph"> ☕      </a></b></span>`,
            // halign: Gtk.Align.CENTER,
            use_markup: true,
        });
        prefsWidget.attach(titleLabel, 1, rowNo, 1, 1);

        rowNo += 1;

        // Auto Theme and Background Palette
        const paletteprop = new Gtk.Expander({
            label: `<b>AUTO THEMING</b>`,
            expanded: false,
            use_markup: true,
        });
        let palettegrid = this.createGridWidget();

        let rowbar = 1;

        let autoThemeLabel = new Gtk.Label({
            label: `<span><b>Automatic Themes and Variations</b></span>\n\n<span size="small" allow_breaks="true">Note: Select desired bar properties in 'Bar Props' below before applying a theme.\nThemes below are auto-generated from Desktop Background. \nSelect a theme and its variation (default or alt) and click 'Apply'.</span>`,
            use_markup: true,
            halign: Gtk.Align.START,
        });
        palettegrid.attach(autoThemeLabel, 1, rowbar, 2, 1);

        rowbar += 1; 

        const themeBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 5,
            margin_top: 5,
            margin_bottom: 5,
            halign: Gtk.Align.CENTER,
            homogeneous: true,
        });

        let themeType = this.createComboboxWidget([ ["Select Theme", _("Select Theme")], ["Color", _("Color")], ["Dark", _("Dark")], ["Light", _("Light")]]);
        themeType.set_active_id(this._settings.get_string('autotheme'));
        themeBox.append(themeType);

        let themeVariation = this.createComboboxWidget([ ["Select Variation", _("Select Variation")], ["Default", _("Default")], ["Alt", _("Alt")]]);
        themeVariation.set_active_id(this._settings.get_string('variation'));
        themeBox.append(themeVariation);       

        const applyThemeBtn = new Gtk.Button({
            label: 'Apply',
            tooltip_text: 'Apply/ Refresh selected theme and variation'
        });
        themeBox.append(applyThemeBtn);

        palettegrid.attach(themeBox, 1, rowbar, 2, 1);

        rowbar += 1;

        let applyThemeErrLbl = new Gtk.Label({
            label: ``,
            sensitive: false,
            halign: Gtk.Align.CENTER,
            use_markup: true,
        });
        palettegrid.attach(applyThemeErrLbl, 1, rowbar, 2, 1);

        applyThemeBtn.connect('clicked', () => {
            // this.triggerBackgroundPalette(window);
            let theme = themeType.get_active_id();
            let variation = themeVariation.get_active_id();
            if(theme == 'Select Theme' || variation == 'Select Variation') {
                applyThemeErrLbl.label = `<span color="#ff8c00">Please select a theme and a variation to apply.</span>`;
                applyThemeErrLbl.sensitive = true;
                setTimeout(() => { applyThemeErrLbl.label = ``;
                                    applyThemeErrLbl.sensitive = false;}, 3000);
                return;
            }
            this._settings.set_string('autotheme', theme);
            this._settings.set_string('variation', variation);
            this.autoApplyBGPalette();
            this.triggerStyleReload();
        });
        
        rowbar += 1;

        let autoThemeChgLabel = new Gtk.Label({
            label: `<span>Auto Refresh theme on Background change</span>`,
            use_markup: true,
            halign: Gtk.Align.START,
        });
        palettegrid.attach(autoThemeChgLabel, 1, rowbar, 1, 1);

        let autoThemeChgSwitch = this.createSwitchWidget();
        palettegrid.attach(autoThemeChgSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Secondary menu color Override
        // Add a secondary color override switch
        let autosmbgOLbl = new Gtk.Label({
            label: `Alternate Secondary Menu BG Color (auto)`,
            halign: Gtk.Align.START,
        });
        palettegrid.attach(autosmbgOLbl, 1, rowbar, 1, 1);

        let autosmbgOSwitch = this.createSwitchWidget('Auto-Theme will choose alternate secondary color instead of deriving from BG color');
        palettegrid.attach(autosmbgOSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add an accent color override switch
        let accentOLbl = new Gtk.Label({
            label: `Override Auto theme Accent Color`,
            halign: Gtk.Align.START,
        });
        palettegrid.attach(accentOLbl, 1, rowbar, 1, 1);

        let accentOSwitch = this.createSwitchWidget();
        palettegrid.attach(accentOSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a accent override color chooser
        let accentOColorLabel = new Gtk.Label({
            label: 'Accent Color (override)',
            halign: Gtk.Align.START,
        });
        palettegrid.attach(accentOColorLabel, 1, rowbar, 1, 1);

        let accentOColorChooser = this.createColorWidget(window, 'Auto Theme Accent Color', 'Select preferred accent color', 'accent-color');
        palettegrid.attach(accentOColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;


        let paletteLabel = new Gtk.Label({
            label: `<span><b>Desktop Background Color Palette</b></span>\n\n<span size="small" allow_breaks="true">The palette will auto-refresh upon changing the background. It is available in each color \nbutton popup under the default palette. It is shown here only for reference (visual feedback).</span>`,
            use_markup: true,
            margin_top: 15,
        });
        palettegrid.attach(paletteLabel, 1, rowbar, 2, 1);
        
        rowbar += 1;

        let getPaletteLabel = new Gtk.Label({
            label: `<span>Manual trigger to get/ refresh the palette</span>`,
            use_markup: true,
            halign: Gtk.Align.START,
        });
        palettegrid.attach(getPaletteLabel, 1, rowbar, 1, 1);

        const getPaletteBtn = new Gtk.Button({
            label: `🔄 Get`,
            halign: Gtk.Align.END,
            tooltip_text: 'Generate/ Refresh Color Palette from desktop background'
        });
        getPaletteBtn.connect('clicked', () => {
            this.triggerBackgroundPalette(window);
        });
        // In case palette computation took longer, trigger the update as per settings-change
        // Note - this event will not trigger if new value of palette1 and 12 is same as old value (rare)
        this._settings.connect('changed::palette1', () => {
            this.updatePalette(window, false);
        });
        this._settings.connect('changed::palette12', () => {
            this.updatePalette(window, false);
        });
        // this.triggerBackgroundPalette(window);
        
        palettegrid.attach(getPaletteBtn, 2, rowbar, 1, 1);

        rowbar += 1;

        const paletteBox1 = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 5,
            margin_top: 5,
            margin_bottom: 1,
            halign: Gtk.Align.CENTER,
            homogeneous: true,
        });
        const paletteBox2 = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 5,
            margin_top: 1,
            margin_bottom: 1,
            halign: Gtk.Align.CENTER,
            homogeneous: true,
        });
        
        let clipboard = Gdk.Display.get_default().get_clipboard();

        this.createPalette(window, paletteBox1, paletteBox2, clipboard);

        palettegrid.attach(paletteBox1, 1, rowbar, 2, 1);
        rowbar += 1;
        palettegrid.attach(paletteBox2, 1, rowbar, 2, 1);

        paletteprop.set_child(palettegrid);
        prefsWidget.attach(paletteprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator0 = this.createSeparatorWidget();
        prefsWidget.attach(separator0, 1, rowNo, 2, 1);

        //////////////////////////////////////////////////////////////////////////////////

        rowNo += 1;

        // BAR PROPERTIES
        const barprop = new Gtk.Expander({
            label: `<b>BAR PROPS</b>`,
            expanded: false,
            use_markup: true,
        });
        let bargrid = this.createGridWidget();

        rowbar = 1;

        //Type of bar
        let barTypeLbl = new Gtk.Label({
            label: 'Type of Bar',
            halign: Gtk.Align.START,
        });
        bargrid.attach(barTypeLbl, 1, rowbar, 1, 1);

        let barType = this.createComboboxWidget([ ["Mainland", _("Mainland")], ["Floating", _("Floating")], ["Trilands", _("Trilands")], ["Islands", _("Islands")]]);
        bargrid.attach(barType, 2, rowbar, 1, 1);

        rowbar += 1;
        
        //Position of bar
        let barPosLbl = new Gtk.Label({
            label: 'Position of Bar',
            halign: Gtk.Align.START,
        });
        bargrid.attach(barPosLbl, 1, rowbar, 1, 1);

        let barPos = this.createComboboxWidget([ ["Top", _("Top")], ["Bottom", _("Bottom")] ]);
        bargrid.attach(barPos, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a bar height scale
        let heightLabel = new Gtk.Label({
            label: 'Bar Height',
            halign: Gtk.Align.START,
        });
        bargrid.attach(heightLabel, 1, rowbar, 1, 1);

        let height = this.createScaleWidget(0, 100, 1, 0);
        bargrid.attach(height, 2, rowbar, 1, 1);

        rowbar += 1;
        
        // Add a bar margin scale
        let marginLabel = new Gtk.Label({
            label: 'Bar Margins',
            halign: Gtk.Align.START,
        });
        bargrid.attach(marginLabel, 1, rowbar, 1, 1);

        let margin = this.createScaleWidget(0, 50, 0.2, 1, 'Not applicable for Mainland');
        bargrid.attach(margin, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add an overview switch
        let overviewLabel = new Gtk.Label({
            label: 'Apply in Overview',
            halign: Gtk.Align.START,
        });
        bargrid.attach(overviewLabel, 1, rowbar, 1, 1);

        let overviewSwitch = this.createSwitchWidget();
        bargrid.attach(overviewSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a notification popups switch
        let notificationsLabel = new Gtk.Label({
            label: 'Apply to Notification Pop-ups',
            halign: Gtk.Align.START,
        });
        bargrid.attach(notificationsLabel, 1, rowbar, 1, 1);

        let notificationsSwitch = this.createSwitchWidget();
        bargrid.attach(notificationsSwitch, 2, rowbar, 1, 1);

        barprop.set_child(bargrid);
        prefsWidget.attach(barprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator01 = this.createSeparatorWidget();
        prefsWidget.attach(separator01, 1, rowNo, 2, 1);

        //////////////////////////////////////////////////////////////////////////////////

        rowNo += 1;

        // WMAX BAR PROPERTIES
        const barpropwmax = new Gtk.Expander({
            label: `<b>BAR PROPS: WINDOW-MAX</b>`,
            expanded: false,
            use_markup: true,
        });
        let bargridwmax = this.createGridWidget();

        rowbar = 1;

        // Add a WMax Bar label
        let wmaxBarLabel = new Gtk.Label({
            use_markup: true,
            label: `<span size="small" allow_breaks="true">When enabled, following properties will apply to the Bar when a window is maximized</span>`,
            halign: Gtk.Align.START,
        });
        bargridwmax.attach(wmaxBarLabel, 1, rowbar, 2, 1);

        rowbar += 1;

        // Add a WMax Bar switch
        let wmaxLabel = new Gtk.Label({
            label: 'Enable Window-Max Bar',
            halign: Gtk.Align.START,
        });
        bargridwmax.attach(wmaxLabel, 1, rowbar, 1, 1);

        let wmaxSwitch = this.createSwitchWidget();
        bargridwmax.attach(wmaxSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a WMax BG Color button
        let wmaxBgLabel = new Gtk.Label({
            label: 'Bar BG Color (WMax)',
            halign: Gtk.Align.START,
        });
        bargridwmax.attach(wmaxBgLabel, 1, rowbar, 1, 1);

        let wmaxBg = this.createColorWidget(window, 'Background Color', 'Background color for the WMax bar', 'bgcolor-wmax');
        bargridwmax.attach(wmaxBg, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a WMax BG Alpha scale
        let wmaxAlphaLabel = new Gtk.Label({
            label: 'BG Alpha (WMax)',
            halign: Gtk.Align.START,
        });
        bargridwmax.attach(wmaxAlphaLabel, 1, rowbar, 1, 1);

        let wmaxAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bargridwmax.attach(wmaxAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a bar margin scale
        let wmaxmarginLabel = new Gtk.Label({
            label: 'Bar Margins (WMax)',
            halign: Gtk.Align.START,
        });
        bargridwmax.attach(wmaxmarginLabel, 1, rowbar, 1, 1);

        let wmaxmargin = this.createScaleWidget(0, 50, 0.2, 1, 'Not applicable for Mainland');
        bargridwmax.attach(wmaxmargin, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a WMax border switch
        let wmaxBorderLabel = new Gtk.Label({
            label: 'Keep Border (Tri/Islands)',
            halign: Gtk.Align.START,
        });
        bargridwmax.attach(wmaxBorderLabel, 1, rowbar, 1, 1);

        let wmaxBorderSwitch = this.createSwitchWidget();
        bargridwmax.attach(wmaxBorderSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a WMax neon switch
        let wmaxNeonLabel = new Gtk.Label({
            label: 'Keep Neon Glow (Tri/Islands)',
            halign: Gtk.Align.START,
        });
        bargridwmax.attach(wmaxNeonLabel, 1, rowbar, 1, 1);

        let wmaxNeonSwitch = this.createSwitchWidget();
        bargridwmax.attach(wmaxNeonSwitch, 2, rowbar, 1, 1);

        barpropwmax.set_child(bargridwmax);
        prefsWidget.attach(barpropwmax, 1, rowNo, 2, 1);


        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator1 = this.createSeparatorWidget();
        prefsWidget.attach(separator1, 1, rowNo, 2, 1);

        //////////////////////////////////////////////////////////////////////////////////
        rowNo += 1;
        const fgprop = new Gtk.Expander({
            label: `<b>FRONT BAR</b>`,
            expanded: false,
            use_markup: true,
        });

        let fggrid = this.createGridWidget();

        rowbar = 1;

        // Add a foreground color chooser
        let fgColorLbl = new Gtk.Label({
            label: 'FG Color',
            halign: Gtk.Align.START,
        });
        fggrid.attach(fgColorLbl, 1, rowbar, 1, 1);

        let fgColor = this.createColorWidget(window, 'Foreground Color', 'Foreground color for the bar', 'fgcolor');
        fggrid.attach(fgColor, 2, rowbar, 1, 1);

        rowbar += 1;
        // Add a foreground alpha scale
        let fgAlphaLbl = new Gtk.Label({
            label: 'FG Alpha',
            halign: Gtk.Align.START,
        });
        fggrid.attach(fgAlphaLbl, 1, rowbar, 1, 1);

        let fgAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        fggrid.attach(fgAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a font button
        let fontLabel = new Gtk.Label({
            label: 'Panel Font',
            halign: Gtk.Align.START,
        });
        fggrid.attach(fontLabel, 1, rowbar, 1, 1);

        const fontBtn = new Gtk.FontButton({
            use_font: true,
            tooltip_text: _("Font for Panel text"),
            valign: Gtk.Align.CENTER,
            hexpand: true,
        });
        let font = this._settings.get_string('font');
        if (font == ""){
            let defaultFont = fontBtn.get_font();
            this._settings.set_string('default-font', defaultFont);
            font = this._settings.get_string('default-font');
        }
        fontBtn.set_font(font);
        let obar = this;
        fontBtn.connect(
            "font-set",
            function (w) {
                var value = w.get_font();
                obar._settings.set_string('font', value);
                // obar.triggerStyleReload();
            }
        );

        // Update font widget when font changed from settings (due to import file)
        this._settings.connect('changed::font', () => {
            let font = obar._settings.get_string('font');
            fontBtn.set_font(font);
        });

        fggrid.attach(fontBtn, 2, rowbar, 1, 1);

        const resetFontBtn = new Gtk.Button({
            label: '↺',
            width_request: 10,
            tooltip_text: _("Reset to default font"),
            valign: Gtk.Align.CENTER, 
            halign: Gtk.Align.END
        }); 
        resetFontBtn.get_style_context().add_class('circular');
        resetFontBtn.connect('clicked', () => {
            obar._settings.reset('font');
            fontBtn.set_font(obar._settings.get_string('default-font'));
            obar.triggerStyleReload();
        });
        fggrid.attach(resetFontBtn, 3, rowbar, 1, 1);

        fgprop.set_child(fggrid);
        prefsWidget.attach(fgprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator2 = this.createSeparatorWidget();
        prefsWidget.attach(separator2, 1, rowNo, 2, 1);
        
        ///////////////////////////////////////////////////////////////////
        rowNo += 1;
        const bgprop = new Gtk.Expander({
            label: `<b>BACK BAR</b>`,
            expanded: false,
            use_markup: true,
        });
        let bggrid = this.createGridWidget();

        rowbar = 1;

        // Add a background color chooser
        let bgColorLbl = new Gtk.Label({
            label: 'Bar BG Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(bgColorLbl, 1, rowbar, 1, 1);

        let bgColor = this.createColorWidget(window, 'Background Color', 'Background or gradient start color for the bar', 'bgcolor');
        bggrid.attach(bgColor, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a background alpha scale
        let bgAlphaLbl = new Gtk.Label({
            label: 'BG Alpha',
            halign: Gtk.Align.START,
        });
        bggrid.attach(bgAlphaLbl, 1, rowbar, 1, 1);

        let bgAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bggrid.attach(bgAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a Islands color chooser
        let islandsColorLabel = new Gtk.Label({
            label: 'Tri/Islands BG Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(islandsColorLabel, 1, rowbar, 1, 1);

        let islandsColorChooser = this.createColorWidget(window, 'Islands/Trilands Background Color', 'Background or gradient start color for Islands/Trilands', 'iscolor');
        bggrid.attach(islandsColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a Islands alpha scale
        let isAlphaLbl = new Gtk.Label({
            label: 'Tri/Islands Alpha',
            halign: Gtk.Align.START,
        });
        bggrid.attach(isAlphaLbl, 1, rowbar, 1, 1);

        let isAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bggrid.attach(isAlpha, 2, rowbar, 1, 1);
        
        rowbar += 1;

        // Add a gradient switch
        let gradientLbl = new Gtk.Label({
            label: 'BG Gradient',
            halign: Gtk.Align.START,
        });
        bggrid.attach(gradientLbl, 1, rowbar, 1, 1);

        let gradient = this.createSwitchWidget();
        bggrid.attach(gradient, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a gradient color chooser
        let grColorLbl = new Gtk.Label({
            label: 'Gradient End Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(grColorLbl, 1, rowbar, 1, 1);

        let grColor = this.createColorWidget(window, 'Gradient End Color', 'Second color of gradient', 'bgcolor2');
        bggrid.attach(grColor, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a gradient 2 alpha scale
        let grAlphaLbl = new Gtk.Label({
            label: 'Gradient End Alpha',
            halign: Gtk.Align.START,
        });
        bggrid.attach(grAlphaLbl, 1, rowbar, 1, 1);

        let grAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bggrid.attach(grAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Gradient direction
        let grDirecLbl = new Gtk.Label({
            label: 'Gradient Direction',
            halign: Gtk.Align.START,
        });
        bggrid.attach(grDirecLbl, 1, rowbar, 1, 1);

        let grDirection = this.createComboboxWidget([["horizontal", _("Horizontal")], ["vertical", _("Vertical")]]);
        bggrid.attach(grDirection, 2, rowbar, 1, 1);

        rowbar += 1;

        // Candybar color palette
        let candybarLbl = new Gtk.Label({
            label: 'Apply Candybar Pallete',
            halign: Gtk.Align.START,
        });
        bggrid.attach(candybarLbl, 1, rowbar, 1, 1);

        // Add a candybar switch
        let candybar = this.createSwitchWidget();
        bggrid.attach(candybar, 2, rowbar, 1, 1);
        
        rowbar += 1;

        // Add canybar color pallete in box
        const candyPaletteBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 5,
            margin_top: 5,
            margin_bottom: 1,
            halign: Gtk.Align.CENTER,
            homogeneous: true,
        });
        this.createCandyPalette(window, candyPaletteBox);
        bggrid.attach(candyPaletteBox, 1, rowbar, 2, 1);

        rowbar += 1;

        // Add a candybar alpha scale
        let candyAlphaLbl = new Gtk.Label({
            label: 'Candy BG Alpha',
            halign: Gtk.Align.START,
        });
        bggrid.attach(candyAlphaLbl, 1, rowbar, 1, 1);

        let candyAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bggrid.attach(candyAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a shadow switch
        let shadowLabel = new Gtk.Label({
            label: `Panel Shadow`,
            halign: Gtk.Align.START,
        });
        bggrid.attach(shadowLabel, 1, rowbar, 1, 1);

        let shadowSwitch = this.createSwitchWidget();
        bggrid.attach(shadowSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a panel shadow color chooser
        let shColorLabel = new Gtk.Label({
            label: 'Shadow Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(shColorLabel, 1, rowbar, 1, 1);

        let shColorChooser = this.createColorWidget(window, 'Panel Shadow Color', 'Shadow color for the Panel. Choose light color for dark theme and dark for light.', 'shcolor');
        bggrid.attach(shColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a panel shadow alpha and spread scale
        let shAlphaLbl = new Gtk.Label({
            label: 'Shadow Spread',
            halign: Gtk.Align.START,
        });
        bggrid.attach(shAlphaLbl, 1, rowbar, 1, 1);

        let shAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bggrid.attach(shAlpha, 2, rowbar, 1, 1);

        bgprop.set_child(bggrid);
        prefsWidget.attach(bgprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator3 = this.createSeparatorWidget();
        prefsWidget.attach(separator3, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////

        rowNo += 1;

        const hprop = new Gtk.Expander({
            label: `<b>HIGHLIGHTS</b>`,
            expanded: false,
            use_markup: true,
        });
        let hgrid = this.createGridWidget();

        rowbar = 1;

        // Add a highlight color chooser
        let highlightColorLabel = new Gtk.Label({
            label: 'Highlight Color',
            halign: Gtk.Align.START,
        });
        hgrid.attach(highlightColorLabel, 1, rowbar, 1, 1);

        let highlightColorChooser = this.createColorWidget(window, 'Highlight Color', 'Highlight color for hover, focus etc.', 'hcolor');
        // highlightColorChooser.connect('color-set', () => {
        //     this.triggerStyleReload();
        // });
        hgrid.attach(highlightColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a highlight alpha scale
        let hgAlphaLbl = new Gtk.Label({
            label: 'Highlight Alpha',
            halign: Gtk.Align.START,
        });
        hgrid.attach(hgAlphaLbl, 1, rowbar, 1, 1);

        let hgAlpha = this.createScaleWidget(0, 1, 0.05, 2);
        hgrid.attach(hgAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a hover with border effect switch
        let hEffectLabel = new Gtk.Label({
            label: `Highlight with Border`,
            halign: Gtk.Align.START,
        });
        hgrid.attach(hEffectLabel, 1, rowbar, 1, 1);

        let hEffectSwitch = this.createSwitchWidget();
        hgrid.attach(hEffectSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a horizontal button-padding scale
        let hBtnPadLbl = new Gtk.Label({
            label: 'Horizontal Padding',
            halign: Gtk.Align.START,
        });
        hgrid.attach(hBtnPadLbl, 1, rowbar, 1, 1);

        let hBtnPad = this.createScaleWidget(0, 30, 0.5, 1, 'Horizontal padding for panel buttons/highlights');
        hgrid.attach(hBtnPad, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a vertical button-padding scale
        let vBtnPadLbl = new Gtk.Label({
            label: 'Vertical Padding',
            halign: Gtk.Align.START,
        });
        hgrid.attach(vBtnPadLbl, 1, rowbar, 1, 1);

        let vBtnPad = this.createScaleWidget(0, 30, 0.5, 1, 'Vertical padding for panel buttons/highlights');
        hgrid.attach(vBtnPad, 2, rowbar, 1, 1);

        hprop.set_child(hgrid);
        prefsWidget.attach(hprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        
        rowNo += 1

        let separator4 = this.createSeparatorWidget();
        prefsWidget.attach(separator4, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////

        rowNo += 1;

        const bprop = new Gtk.Expander({
            label: `<b>BORDER</b>`,
            expanded: false,
            use_markup: true,
        });
        let bgrid = this.createGridWidget();

        rowbar = 1;

        // //Type of border
        // let borderTypeLbl = new Gtk.Label({
        //     label: 'Type of Border',
        //     halign: Gtk.Align.START,
        // });
        // bgrid.attach(borderTypeLbl, 1, rowbar, 1, 1);

        // let borderType = new Gtk.ComboBoxText({halign: Gtk.Align.END});
        // borderType.append("solid", _("Solid"));
        // borderType.append("double", _("Double"));
        // borderType.append("dashed", _("Dashed"));
        // bgrid.attach(borderType, 2, rowbar, 1, 1);

        // rowbar += 1;

        // Add a border width scale
        let borderWidthLabel = new Gtk.Label({
            label: 'Width',
            halign: Gtk.Align.START,
        });
        bgrid.attach(borderWidthLabel, 1, rowbar, 1, 1);

        let borderWidthScale = this.createScaleWidget(0, 10, 0.1, 1);
        bgrid.attach(borderWidthScale, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a border radius scale
        let bRadiuslbl = new Gtk.Label({
            label: 'Radius',
            halign: Gtk.Align.START,
        });
        bgrid.attach(bRadiuslbl, 1, rowbar, 1, 1);

        let bRadius = this.createScaleWidget(0, 50, 1, 0);
        bgrid.attach(bRadius, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a border color chooser
        let borderColorLabel = new Gtk.Label({
            label: 'Color',
            halign: Gtk.Align.START,
        });
        bgrid.attach(borderColorLabel, 1, rowbar, 1, 1);

        let borderColorChooser = this.createColorWidget(window, 'Border Color', 'Border Color', 'bcolor');
        bgrid.attach(borderColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a Border alpha scale
        let bAlphaLbl = new Gtk.Label({
            label: 'Alpha',
            halign: Gtk.Align.START,
        });
        bgrid.attach(bAlphaLbl, 1, rowbar, 1, 1);

        let bAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bgrid.attach(bAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a neon switch
        let neonLbl = new Gtk.Label({
            label: `Neon Glow`,
            halign: Gtk.Align.START,
        });
        bgrid.attach(neonLbl, 1, rowbar, 1, 1);

        let neon = this.createSwitchWidget('Select bright/neon color for border and dark-opaque background');
        bgrid.attach(neon, 2, rowbar, 1, 1);

        bprop.set_child(bgrid);
        prefsWidget.attach(bprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator5 = this.createSeparatorWidget();
        prefsWidget.attach(separator5, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////

        rowNo += 1;
        const menuprop = new Gtk.Expander({
            label: `<b>MENUS</b>`,
            expanded: false,
            use_markup: true,
        });
        let menugrid = this.createGridWidget();

        rowbar = 1;

        // Add Menu style apply / remove info 
        let menuInfoLabel = new Gtk.Label({
            use_markup: true,
            label: `<span allow_breaks="true">Click on Apply / Reset buttons below to Enable / Disable Menu styles. \nOnce enabled, setting-changes will apply immediately.</span>`,
            halign: Gtk.Align.START,
        });
        menugrid.attach(menuInfoLabel, 1, rowbar, 2, 1);

        // rowbar += 2;
        //
        // let menuSwitch = this.createSwitchWidget();
        // menugrid.attach(menuSwitch, 2, rowbar, 1, 1);

        rowbar += 3;

        // Add a menu FG color chooser
        let menuFGColorLabel = new Gtk.Label({
            label: 'FG Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menuFGColorLabel, 1, rowbar, 1, 1);

        let menuFGColorChooser = this.createColorWidget(window, 'Menu Foreground Color', 'Foreground color for the dropdown menus', 'mfgcolor');
        menugrid.attach(menuFGColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu FG alpha scale
        let mfgAlphaLbl = new Gtk.Label({
            label: 'FG Alpha',
            halign: Gtk.Align.START,
        });
        menugrid.attach(mfgAlphaLbl, 1, rowbar, 1, 1);

        let mfgAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        menugrid.attach(mfgAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu BG color chooser
        let menuBGColorLabel = new Gtk.Label({
            label: 'BG Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menuBGColorLabel, 1, rowbar, 1, 1);

        let menuBGColorChooser = this.createColorWidget(window, 'Menu Background Color', 'Background color for the dropdown menus', 'mbgcolor');
        menugrid.attach(menuBGColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu BG alpha scale
        let mbgAlphaLbl = new Gtk.Label({
            label: 'BG Alpha',
            halign: Gtk.Align.START,
        });
        menugrid.attach(mbgAlphaLbl, 1, rowbar, 1, 1);

        let mbgAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        menugrid.attach(mbgAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Secondary menu color Override
        // Add an override switch
        let smbgOLbl = new Gtk.Label({
            label: `Override Secondary?`,
            halign: Gtk.Align.START,
        });
        menugrid.attach(smbgOLbl, 1, rowbar, 1, 1);

        let smbgOSwitch = this.createSwitchWidget('Override Secondary Menu BG Color?');
        menugrid.attach(smbgOSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a secondary menu BG color chooser
        let smenuBGColorLabel = new Gtk.Label({
            label: 'Override Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(smenuBGColorLabel, 1, rowbar, 1, 1);

        let smenuBGColorChooser = this.createColorWidget(window, 'Secondary Menu Background Color', 'Secondary background color override for the dropdown menus', 'smbgcolor');
        menugrid.attach(smenuBGColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu Border color chooser
        let menubColorLabel = new Gtk.Label({
            label: 'Border Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menubColorLabel, 1, rowbar, 1, 1);

        let menubColorChooser = this.createColorWidget(window, 'Menu Border Color', 'Border color for the dropdown menus', 'mbcolor');
        menugrid.attach(menubColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu border alpha scale
        let mbAlphaLbl = new Gtk.Label({
            label: 'Border Alpha',
            halign: Gtk.Align.START,
        });
        menugrid.attach(mbAlphaLbl, 1, rowbar, 1, 1);

        let mbAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        menugrid.attach(mbAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu highlight color chooser
        let menuhColorLabel = new Gtk.Label({
            label: 'Highlight Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menuhColorLabel, 1, rowbar, 1, 1);

        let menuhColorChooser = this.createColorWidget(window, 'Menu Highlight Color', 'Highlight color for hover/focus on menu items', 'mhcolor');
        menugrid.attach(menuhColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu highlight alpha scale
        let mhAlphaLbl = new Gtk.Label({
            label: 'Highlight Alpha',
            halign: Gtk.Align.START,
        });
        menugrid.attach(mhAlphaLbl, 1, rowbar, 1, 1);

        let mhAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        menugrid.attach(mhAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu selection color chooser
        let menusColorLabel = new Gtk.Label({
            label: 'Accent Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menusColorLabel, 1, rowbar, 1, 1);

        let menusColorChooser = this.createColorWidget(window, 'Menu Active/Accent Color', 'Selected/Active color for the menu items', 'mscolor');
        menugrid.attach(menusColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu selection alpha scale
        let msAlphaLbl = new Gtk.Label({
            label: 'Accent Alpha',
            halign: Gtk.Align.START,
        });
        menugrid.attach(msAlphaLbl, 1, rowbar, 1, 1);

        let msAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        menugrid.attach(msAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu shadow color chooser
        let menushColorLabel = new Gtk.Label({
            label: 'Shadow Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menushColorLabel, 1, rowbar, 1, 1);

        let menushColorChooser = this.createColorWidget(window, 'Menu Shadow Color', 'Shadow color for the dropdown menus. Choose light color for dark theme and dark for light.', 'mshcolor');
        menugrid.attach(menushColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu shadow alpha scale
        let mshAlphaLbl = new Gtk.Label({
            label: 'Shadow Alpha',
            halign: Gtk.Align.START,
        });
        menugrid.attach(mshAlphaLbl, 1, rowbar, 1, 1);

        let mshAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        menugrid.attach(mshAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a slider height scale
        let mSliderHtLbl = new Gtk.Label({
            label: 'Slider Height',
            halign: Gtk.Align.START,
        });
        menugrid.attach(mSliderHtLbl, 1, rowbar, 1, 1);

        let mSliderHt = this.createScaleWidget(1, 30, 1, 0);
        menugrid.attach(mSliderHt, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a Quick Toggle buttons radius scale
        let qToggleRadLbl = new Gtk.Label({
            label: 'Quick Toggle Radius',
            halign: Gtk.Align.START,
        });
        menugrid.attach(qToggleRadLbl, 1, rowbar, 1, 1);

        let qToggleRad = this.createScaleWidget(0, 50, 1, 0);
        menugrid.attach(qToggleRad, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add menu style apply/remove buttons
        const removeMenuLabel = new Gtk.Label({
            use_markup: true,
            label: `<span color="#fa6555">${_("Reset Menu Styles")}</span>`, 
        });
        const removeMenuBtn = new Gtk.Button({
            child: removeMenuLabel,
            margin_top: 25,
            tooltip_text: _("Reset the style settings for Menu"),
            halign: Gtk.Align.START,
        });
        removeMenuBtn.connect('clicked', () => {
            this._settings.set_boolean('menustyle', false);
            // Trigger updateStyles() by toggling 'removestyle'
            let removestyle = this._settings.get_boolean('removestyle');
            if(removestyle)
                this._settings.set_boolean('removestyle', false);
            else
                this._settings.set_boolean('removestyle', true);
        });
        menugrid.attach(removeMenuBtn, 1, rowbar, 1, 1);

        const applyMenuLabel = new Gtk.Label({
            use_markup: true,
            label: `<span color="#03c4d0">${_("Apply Menu Styles")}</span>`, 
        });
        const applyMenuBtn = new Gtk.Button({
            child: applyMenuLabel,
            margin_top: 25,
            tooltip_text: _("Apply the style settings for Menu"),
            halign: Gtk.Align.END,
        });
        applyMenuBtn.connect('clicked', () => {
            // Save stylesheet and trigger reload
            this.triggerStyleReload();
            // Apply menustyle
            this._settings.set_boolean('menustyle', true);

        });
        menugrid.attach(applyMenuBtn, 1, rowbar, 2, 1);


        menuprop.set_child(menugrid);
        prefsWidget.attach(menuprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator6 = this.createSeparatorWidget();
        prefsWidget.attach(separator6, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////

        rowNo += 1;

        // Add buttons to Import Settings and Export Settings
        const importLabel = new Gtk.Label({
            use_markup: true,
            label: `<span>${_("Import Settings")}</span>`, 
        });
        const importBtn = new Gtk.Button({
            child: importLabel,
            margin_top: 25,
            tooltip_text: _("Import theme-settings from a file"),
            halign: Gtk.Align.START,
        });
        importBtn.connect('clicked', () => {
            this.importSettings(window);
        });
        prefsWidget.attach(importBtn, 1, rowNo, 1, 1);

        const exportLabel = new Gtk.Label({
            use_markup: true,
            label: `<span>${_("Export Settings")}</span>`, 
        });
        const exportBtn = new Gtk.Button({
            child: exportLabel,
            margin_top: 25,
            tooltip_text: _("Export current theme-settings to a file"),
            halign: Gtk.Align.END,
        });
        exportBtn.connect('clicked', () => {
            this.exportSettings(window);
        });
        prefsWidget.attach(exportBtn, 2, rowNo, 1, 1);


        settingsGroup.add(prefsWidget);

        ///////////////////////////////////////////////////////////////////////



        // Bind the settings to the widgets
        this._settings.bind(
            'bartype',
            barType,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'position',
            barPos,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'height',
            height.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'margin',
            margin.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'fgalpha',
            fgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'bgalpha',
            bgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'gradient',
            gradient,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'bgalpha2',
            grAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'gradient-direction',
            grDirection,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'halpha',
            hgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'hpad',
            hBtnPad.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'vpad',
            vBtnPad.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'heffect',
            hEffectSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'isalpha',
            isAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        // this._settings.bind(
        //     'bordertype',
        //     borderType,
        //     'active-id',
        //     Gio.SettingsBindFlags.DEFAULT
        // );
        this._settings.bind(
            'bradius',
            bRadius.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'bwidth',
            borderWidthScale.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'balpha',
            bAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'neon',
            neon,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'shadow',
            shadowSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'shalpha',
            shAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'set-overview',
            overviewSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'set-notifications',
            notificationsSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'mfgalpha',
            mfgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'mbgalpha',
            mbgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'smbgoverride',
            smbgOSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'mbalpha',
            mbAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'mhalpha',
            mhAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'msalpha',
            msAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'mshalpha',
            mshAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'candybar',
            candybar,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'candyalpha',
            candyAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'wmaxbar',
            wmaxSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'margin-wmax',
            wmaxmargin.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'bgalpha-wmax',
            wmaxAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'border-wmax',
            wmaxBorderSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'neon-wmax',
            wmaxNeonSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'autotheme-refresh',
            autoThemeChgSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'smbgoverride',
            autosmbgOSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'accent-override',
            accentOSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'qtoggle-radius',
            qToggleRad.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'slider-height',
            mSliderHt.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        // this._settings.bind(
        //     'menustyle',
        //     menuSwitch,
        //     'active',
        //     Gio.SettingsBindFlags.DEFAULT
        // );
        
    }

    importSettings(window) {
        let fileChooser = new Gtk.FileChooserDialog({
            title: _("Import Settings Profile"),
            action: Gtk.FileChooserAction.OPEN,
            transient_for: window,
        });
        fileChooser.add_button(_("Cancel"), Gtk.ResponseType.CANCEL);
        fileChooser.add_button(_("Open"), Gtk.ResponseType.ACCEPT);
          
        fileChooser.connect('response', (self, response) => {   
          if (response == Gtk.ResponseType.ACCEPT) {
            this.onImportExport = true;
            // Save current BG uri since the one in imported file maybe old/invalid
            let bguri = this._settings.get_string('bguri');
            // Save prominent and palette colors from the current/valid background
            let currentPaletteArr = [];
            for(let i=1; i<=18; i++) {
                if(i<=6) {
                    currentPaletteArr.push(this._settings.get_strv('prominent'+i));
                }
                else {
                    currentPaletteArr.push(this._settings.get_strv('palette'+(i-6)));
                }
            }
            // Load settings from file
            let filePath = fileChooser.get_file().get_path();
            if (filePath && GLib.file_test(filePath, GLib.FileTest.EXISTS)) {
                let file = Gio.File.new_for_path(filePath);

                let [success_, pid_, stdin, stdout, stderr] =
                GLib.spawn_async_with_pipes(
                    null,
                    ['dconf', 'load', SCHEMA_PATH],
                    null,
                    GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                    null
                );

                stdin = new Gio.UnixOutputStream({fd: stdin, close_fd: true});
                GLib.close(stdout);
                GLib.close(stderr);

                stdin.splice(file.read(null),
                    Gio.OutputStreamSpliceFlags.CLOSE_SOURCE | Gio.OutputStreamSpliceFlags.CLOSE_TARGET, null);

                // Replace BG uri with saved uri and update background palette
                this._settings.set_string('bguri', bguri);

                // Restore background palettes
                for(let i=1; i<=18; i++) {
                    if(i<=6) {
                        this._settings.set_strv('prominent'+i, currentPaletteArr[i-1]);
                    }
                    else {
                        this._settings.set_strv('palette'+(i-6), currentPaletteArr[i-1]);
                    }
                }

                setTimeout(() => {
                    this.onImportExport = false;
                    
                   
                    // Trigger stylesheet reload to apply new settings
                    this.triggerStyleReload();
                    // Update and Save SVGs
                    this.saveToggleSVG(true); 
                    this.saveToggleSVG(false); 
                    this.saveCheckboxSVG(true);
                    this.saveCheckboxSVG(false);                    
                }, 2000);
                
            }
          }
          fileChooser.destroy();
        });

        fileChooser.show();      
    }

    exportSettings(window) {
        let fileChooser = new Gtk.FileChooserDialog({
            title: _("Export Settings Profile"),
            action: Gtk.FileChooserAction.SAVE,
            transient_for: window,
        });
        fileChooser.add_button(_("Cancel"), Gtk.ResponseType.CANCEL);
        fileChooser.add_button(_("Save"), Gtk.ResponseType.ACCEPT);
          
        fileChooser.connect('response', (self, response) => {   
          if (response == Gtk.ResponseType.ACCEPT) {
            this.onImportExport = true;
            let filePath = fileChooser.get_file().get_path();
            const file = Gio.file_new_for_path(filePath);
            const raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
            const out = Gio.BufferedOutputStream.new_sized(raw, 4096);

            // Settings not updated by user (default) aren't caught by dconf, so force update
            let keys = this._settings.list_keys(); 
            keys.forEach(k => { 
                let value = this._settings.get_value(k);
                this._settings.set_value(k, value); //log('Key-Value: '+k+':'+value);
            });

            out.write_all(GLib.spawn_command_line_sync(`dconf dump ${SCHEMA_PATH}`)[1], null);
            out.close(null);
            setTimeout(() => {this.onImportExport = false}, 1000);
          }
          fileChooser.destroy();
        });

        fileChooser.show();
    }

}
