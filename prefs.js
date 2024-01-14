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

import {ExtensionPreferences, gettext as _, pgettext} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

//-----------------------------------------------

export default class OpenbarPreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        let prefs = new OpenbarPrefs();
        prefs.fillOpenbarPrefs(window, this);
    }

}
//-----------------------------------------------

class OpenbarPrefs {

    colorMix(startColor, endColor, factor) {
        let color = startColor + factor*(endColor - startColor);
        color = (color < 0)? 0: (color>255)? 255: parseInt(color);
        return color;
    }

    colorBlend(c0,c1,p) {
        var i=parseInt,r=Math.round,P=1-p,[a,b,c,d]=c0.split(","),[e,f,g,h]=c1.split(","),x=d||h,j=x?","+(!d?h:!h?d:r((parseFloat(d)*P+parseFloat(h)*p)*1000)/1000+")"):")";
        return"rgb"+(x?"a(":"(")+r(i(a[3]=="a"?a.slice(5):a.slice(4))*P+i(e[3]=="a"?e.slice(5):e.slice(4))*p)+","+r(i(b)*P+i(f)*p)+","+r(i(c)*P+i(g)*p)+j;
    }

    getBgDark(r, g, b) {
        // HSP equation for perceived brightness from http://alienryderflex.com/hsp.html
        let hsp = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
        );
        if(hsp > 127.5)
            return false;
        else
            return true;
    }

    saveStylesheet() {

        let bartype = this._settings.get_string('bartype');
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

        const fgred = parseInt(parseFloat(fgcolor[0]) * 255);
        const fggreen = parseInt(parseFloat(fgcolor[1]) * 255);
        const fgblue = parseInt(parseFloat(fgcolor[2]) * 255);

        const bgred = parseInt(parseFloat(bgcolor[0]) * 255);
        const bggreen = parseInt(parseFloat(bgcolor[1]) * 255);
        const bgblue = parseInt(parseFloat(bgcolor[2]) * 255);

        const bgred2 = parseInt(parseFloat(bgcolor2[0]) * 255);
        const bggreen2 = parseInt(parseFloat(bgcolor2[1]) * 255);
        const bgblue2 = parseInt(parseFloat(bgcolor2[2]) * 255);

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

        const pbg = `rgba(${bgred},${bggreen},${bgblue},${bgalpha})`; // panel bg color
        const phg = `rgba(${hred},${hgreen},${hblue},1.0)`; // panel highlight color
        const phbg = this.colorBlend(pbg, phg, hAlpha); // panel highlight blended bg color
        const isbg = `rgba(${isred},${isgreen},${isblue},${isalpha})`; // island bg color
        const ihbg = this.colorBlend(isbg, phg, hAlpha); // island highlight blended bg color


        const mbg = `rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha})`; // menu bg
        const mfg = `rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha})`; // menu fg
        const mhg = `rgba(${mhred},${mhgreen},${mhblue},${mhAlpha})`; // menu highlight
        const msc = `rgba(${msred},${msgreen},${msblue},${msAlpha})`; // menu selection/active

        // Two ways to mix colors, currently both in use
        // Menu highlight fg color
        const mhfgred = this.colorMix(mfgred, mhred, -0.12);
        const mhfggreen = this.colorMix(mfggreen, mhgreen, -0.12);
        const mhfgblue = this.colorMix(mfgblue, mhblue, -0.12);
        const mhfg = this.colorBlend(mfg, mhg, -0.18);

        // Submenu color: from bgcolor move towards white/black based on bgcolor darkness
        const lightrgba = `rgba(${255},${255},${255},${1.0})`;
        const darkrgba = `rgba(${0},${0},${0},${1.0})`;
        let bgdark = this.getBgDark(mbgred, mbggreen, mbgblue);
        let smbgTarget = bgdark? lightrgba: darkrgba;
        let [rTarget, gTarget, bTarget] = bgdark? [255,255,255]: [0,0,0];
        const smbgred = this.colorMix(mbgred, rTarget, 0.18);
        const smbggreen = this.colorMix(mbggreen, gTarget, 0.18);
        const smbgblue = this.colorMix(mbgblue, bTarget, 0.18);
        const smbg = this.colorBlend(mbg, smbgTarget, 0.18);
        
        // Submenu highlight bg color (notifications pane)
        const mhg1 = `rgba(${mhred},${mhgreen},${mhblue},1)`; // menu highlight with 1 alpha
        const smhbg = this.colorBlend(smbg, mhg1, mhAlpha); // sub menu blended highlight bg 
        
        // Menu selection fg color
        // const msfg = this.colorBlend(mfg, msc, -0.2);

        // Menu selection highlight color
        const mshg = this.colorBlend(msc, mhg, 0.3);

        let fgStyle, panelStyle, btnStyle, btnContainerStyle, borderStyle, radiusStyle, fontStyle, 
        islandStyle, dotStyle, neonStyle, gradientStyle, triLeftStyle, triBothStyle, triRightStyle, 
        triNoneStyle, triNoneNeonStyle, btnHoverStyle;      

        // style that applies dynamically to either the panel or the panel buttons as per bar type
        borderStyle = 
        ` border: ${borderWidth}px ${bordertype} rgba(${bred},${bgreen},${bblue},${balpha}); `;
        
        radiusStyle = 
        ` border-radius: ${borderRadius}px; `;

        // if (bordertype == 'double')
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
        triNoneStyle = 
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
            ` font-family: ${font_family}; 
              font-style: ${font_style}; 
              font-stretch: ${font_stretch}; 
              font-size: ${font_size}px; 
              font-weight: ${font_weight}; `; 
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
            triNoneNeonStyle = 
            ` box-shadow: 0px 0px 4px ${spread}px rgba(${bred},${bgreen},${bblue},0.55); `;
        }
        else {
            neonStyle = ``; 
            triNoneNeonStyle = ``;
        }
        triNoneStyle += triNoneNeonStyle;

        // Panel hover/focus style
        let triNoneNeonHoverStyle = ``;
        if(hovereffect) {
            btnHoverStyle = 
            ` border: ${height/10.0}px solid rgba(${hred},${hgreen},${hblue},${hAlpha}) !important; `;
            if(neon && (bartype == 'Islands' || bartype == 'Trilands')) {
                btnHoverStyle += neonStyle.replace(`${bred},${bgreen},${bblue}`, `${hred},${hgreen},${hblue}`); 
                triNoneNeonHoverStyle += triNoneNeonStyle.replace(`${bred},${bgreen},${bblue}`, `${hred},${hgreen},${hblue}`);
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
              margin: 0 1px;
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
              margin: 0 0px;
              border-radius: ${borderRadius+borderWidth}px; `; 
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
               
            }
        
            #panel.openbar {
                ${panelStyle}
            }

            #panel.openbar .button-container {
                ${btnContainerStyle}
            }

            #panel.openbar .panel-button {
                ${btnStyle}
            }

            #panel.openbar .panel-button:hover, #panel.openbar .panel-button:focus, #panel.openbar .panel-button:active, #panel.openbar .panel-button:checked {
                ${btnHoverStyle}
            }

            #panel.openbar .panel-button:hover.clock-display .clock {
                background-color: transparent;
                box-shadow: none;
            }
            
            #panel.openbar .panel-button:active.clock-display .clock, #panel.openbar .panel-button:overview.clock-display .clock, 
            #panel.openbar .panel-button:focus.clock-display .clock, #panel.openbar .panel-button:checked.clock-display .clock {
                background-color: transparent;
                box-shadow: none;
            }

            #panel.openbar .workspace-dot {
                ${dotStyle}
            }

            #panel.openbar .trilands:left {
                ${triLeftStyle}
            }
            #panel.openbar .trilands:right {
                ${triRightStyle}
            }
            #panel.openbar .trilands:both {
                ${triBothStyle}
            }
            #panel.openbar .trilands:none {
                ${triNoneStyle}
            }
            #panel.openbar .trilands:none:hover, #panel.openbar .trilands:none:focus, #panel.openbar .trilands:none:active, #panel.openbar .trilands:none:checked {
                ${triNoneNeonHoverStyle}
            }
            
        `;

        // Menu styles
        stylesheet += `
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
            }
            .openmenu .slider{     
                color: rgba(${msred},${msgreen},${msblue},${msAlpha*1.5}) !important;
                -barlevel-background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*0.9}) !important;
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
            .openmenu.message {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
            }
            .openmenu.message .message-body {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.75}) !important;
            }
            .openmenu.message .event-time {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.75}) !important;
            }
            .openmenu.message .message-close-button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
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
                border-color: ${smbg} !important;
            }
            .openmenu.dnd-button:hover, .openmenu.dnd-button:focus {
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
                color: rgba(${msred},${msgreen},${msblue},${msAlpha*1.5}) !important;
                -barlevel-background-color: rgba(${smbgred},${smbggreen},${smbgblue},${mbgAlpha*0.9}) !important;
                -barlevel-active-background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;                  
            }

            .openmenu.quick-toggle {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
                background-color: ${smbg} !important;
                box-shadow: none;
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
            .openmenu.quick-settings .icon-button, .openmenu.quick-settings .button {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.2}) !important;
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

    triggerStyleReload() {
        // Save stylesheet from string to css file
        this.saveStylesheet();
        // Cause stylesheet to reload by toggling 'reloadstyle'
        let reloadstyle = this._settings.get_boolean('reloadstyle');
        if(reloadstyle)
            this._settings.set_boolean('reloadstyle', false);
        else
            this._settings.set_boolean('reloadstyle', true);
    }

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

        // Add palette removes default array so add it back first
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

    rgbToHex(r, g, b) {
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    }

    createPalette(window, paletteBox1, paletteBox2, clipboard) {
        for(let i=1; i<=12; i++) {
            let paletteColor = this._settings.get_strv('palette'+i);
            let hexCol = this.rgbToHex(paletteColor[0],paletteColor[1],paletteColor[2]);
            let paletteLbl = new Gtk.Label({
                label: `<span bgcolor="${hexCol}" font_size="150%">          </span>`,
                sensitive: false,
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

    fillOpenbarPrefs(window, openbar) {

        window.set_title(_("Open Bar 🍹"));
        window.default_height = 800;
        window.default_width = 650;

        window.paletteButtons = [];
        window.colorButtons = [];

        this.openbar = openbar;
        // Get the settings object
        this._settings = openbar.getSettings();
        let settEvents = ['changed::bartype', 'changed::font', 'changed::gradient', 
        'changed::gradient-direction', 'changed::shadow', 'changed::neon', 'changed::heffect']; 
        settEvents.forEach(event => {
            this._settings.connect(event, () => {this.triggerStyleReload();});
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
            label: `<span size="large"><b>Top Bar Customization</b></span>\n\n<span size="small" underline="none">${_('Version:')} ${this.openbar.metadata.version}  |  <a href="${this.openbar.metadata.url}">Home</a>  |  © <a href="https://extensions.gnome.org/accounts/profile/neuromorph">neuromorph</a>  |  <a href="https://www.buymeacoffee.com/neuromorph"> ☕      </a></span>`,
            // halign: Gtk.Align.CENTER,
            use_markup: true,
        });
        prefsWidget.attach(titleLabel, 1, rowNo, 1, 1);

        rowNo += 1;

        // Background Palette
        const paletteprop = new Gtk.Expander({
            label: `<b>COLOR PALETTE</b>`,
            expanded: false,
            use_markup: true,
        });
        let palettegrid = this.createGridWidget();

        let rowbar = 1;

        let paletteLabel = new Gtk.Label({
            label: `<span><b>Desktop Background Color Palette</b></span>\n\n<span size="small" allow_breaks="true">The palette will auto-refresh upon changing the background. It is available in each color \nbutton popup under the default palette. You may click a color below to copy its hex value.</span>`,
            use_markup: true,
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
        // In case palette computation took longer, trigger update as per settings-change
        // Note - this event will not trigger if new value of palette1 and 9 is same as old value (rare)
        this._settings.connect('changed::palette1', () => {
            this.updatePalette(window, false);
        });
        this._settings.connect('changed::palette9', () => {
            this.updatePalette(window, false);
        });
        this.triggerBackgroundPalette(window);
        
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

        let barType = this.createComboboxWidget([["Mainland", _("Mainland")], ["Floating", _("Floating")], ["Trilands", _("Trilands")], ["Islands", _("Islands")]]);
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

        barprop.set_child(bargrid);
        prefsWidget.attach(barprop, 1, rowNo, 2, 1);

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

        //Gradient direction
        let grDirecLbl = new Gtk.Label({
            label: 'Gradient Direction',
            halign: Gtk.Align.START,
        });
        bggrid.attach(grDirecLbl, 1, rowbar, 1, 1);

        let grDirection = this.createComboboxWidget([["horizontal", _("Horizontal")], ["vertical", _("Vertical")]]);
        bggrid.attach(grDirection, 2, rowbar, 1, 1);

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
            label: 'Selected/Active Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menusColorLabel, 1, rowbar, 1, 1);

        let menusColorChooser = this.createColorWidget(window, 'Menu Selected/Active Color', 'Selected/Active color for the menu items', 'mscolor');
        menugrid.attach(menusColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu selection alpha scale
        let msAlphaLbl = new Gtk.Label({
            label: 'Active Alpha',
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

        // Add menu style apply/remove buttons
        const removeMenuLabel = new Gtk.Label({
            use_markup: true,
            label: `<span color="#fa6555">${_("Reset Menu Styles")}</span>`, 
        });
        const removeMenuBtn = new Gtk.Button({
            child: removeMenuLabel,
            margin_top: 25,
            tooltip_text: _("Reset the style settings for Menu"),
            halign: Gtk.Align.END,
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
            label: `<span color="#05c6d1">${_("Apply Menu Styles")}</span>`, 
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
            'overview',
            overviewSwitch,
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
        // this._settings.bind(
        //     'menustyle',
        //     menuSwitch,
        //     'active',
        //     Gio.SettingsBindFlags.DEFAULT
        // );
        
    }

}