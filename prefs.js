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

import {ExtensionPreferences, gettext as _, pgettext} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

//-----------------------------------------------

// function init() {
//     ExtensionUtils.initTranslations();
// }

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

    saveStylesheet() {

        let hColor = this.settings.get_strv('hcolor');
        let hAlpha = this.settings.get_double('halpha');
        let height = this.settings.get_double('height');

        let mfgColor = this.settings.get_strv('mfgcolor');
        let mfgAlpha = this.settings.get_double('mfgalpha');
        let mbgColor = this.settings.get_strv('mbgcolor');
        let mbgAlpha = this.settings.get_double('mbgalpha');
        let mbColor = this.settings.get_strv('mbcolor');
        let mbAlpha = this.settings.get_double('mbalpha');
        let mhColor = this.settings.get_strv('mhcolor');
        let mhAlpha = this.settings.get_double('mhalpha');
        let mshColor = this.settings.get_strv('mshcolor');
        let mshAlpha = this.settings.get_double('mshalpha');
        let msColor = this.settings.get_strv('mscolor');
        let msAlpha = this.settings.get_double('msalpha');

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

        const mbg = `rgba(${mbgred},${mbggreen},${mbgblue},${mbgAlpha})`;
        const mfg = `rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha})`;
        const mhg = `rgba(${mhred},${mhgreen},${mhblue},${mhAlpha})`;
        const msc = `rgba(${msred},${msgreen},${msblue},${msAlpha})`;

        const mhfgred = this.colorMix(mfgred, mhred, -0.12);
        const mhfggreen = this.colorMix(mfggreen, mhgreen, -0.12);
        const mhfgblue = this.colorMix(mfgblue, mhblue, -0.12);

        const mhfg = this.colorBlend(mfg, mhg, -0.18);

        const smbgred = this.colorMix(mbgred, mfgred, 0.2);
        const smbggreen = this.colorMix(mbggreen, mfggreen, 0.2);
        const smbgblue = this.colorMix(mbgblue, mfgblue, 0.2);

        const smbg = this.colorBlend(mbg, mfg, 0.18);
        // const msfg = this.colorBlend(mfg, msc, -0.2);
        const mscbg = this.colorBlend(msc, mbg, -0.2);
        const mshg = this.colorBlend(msc, mhg, 0.3);

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
            #panel.openbar .panel-button {
                border-width: 0px;
            }
            /* Either uses background-color or box-shadow as per bar type */
            #panel.openbar .panel-button:hover, #panel.openbar .panel-button:focus, #panel.openbar .panel-button:active {
                background-color: rgba(${hred},${hgreen},${hblue},${hAlpha}) !important;
                box-shadow: inset 0 0 0 ${height}px rgba(${hred},${hgreen},${hblue},${hAlpha}) !important;
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
                /* background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important; 
                box-shadow: 0 0 0 0px rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important; */
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
                margin: 0;
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
                margin: 0;
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
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha*0.9}) !important;
            }
            .openmenu.message-media-control {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha}) !important;
            }
            .openmenu.message-media-control:insensitive {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*0.75}) !important;
            }
            .openmenu.media-message-cover-icon .fallback {
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
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha*0.9}) !important;
            }


            .openmenu.datemenu-today-button .date-label, .openmenu.datemenu-today-button .day-label {
                color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgAlpha*1.25}) !important;
            } 
            .openmenu.datemenu-today-button:hover, .openmenu.datemenu-today-button:focus {
                /* color: ${mscbg} !important; */
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha*0.9}) !important;
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
                /* background-color: transparent; */
                /* color: $insensitive_fg_color; */
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
                /* color: transparentize($insensitive_fg_color, 0.7) !important; */
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
            .openmenu.calendar-weekend:hover, .openmenu.calendar-weekend:focus, .openmenu.calendar-weekend:selected {
                color: ${mhfg} !important;
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
            }
            .openmenu.calendar .calendar-today, .openmenu.calendar .calendar-today:selected {
                /* color: $selected_fg_color; override weekends */
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                background-color: rgba(${msred},${msgreen},${msblue},${msAlpha}) !important;
            }
            .openmenu.calendar .calendar-today:hover, .openmenu.calendar .calendar-today:focus {
                color: rgba(${mfgred},${mfggreen},${mfgblue},1.0) !important;
                /* background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important; */
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
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
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
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
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
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
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
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
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
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
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
                background-color: rgba(${mhred},${mhgreen},${mhblue},${mhAlpha}) !important;
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
          log("Failed to write stylsheet file: " + stylepath);
        }

    }

    triggerStyleReload() {
        // Save stylesheet from string to css file
        this.saveStylesheet();
        // Cause stylesheet to reload by toggling 'reloadstyle'
        let reloadstyle = this.settings.get_boolean('reloadstyle');
        if(reloadstyle)
            this.settings.set_boolean('reloadstyle', false);
        else
            this.settings.set_boolean('reloadstyle', true);
    }

    createComboboxWidget(options) {
        let comboBox = new Gtk.ComboBoxText({halign: Gtk.Align.END});
        options.forEach(option => {
            comboBox.append(option[0], option[1]);
        });
        return comboBox;
    }

    createColorWidget(title, tooltip_text="", gsetting) {
        let color = new Gtk.ColorButton({
            title: title,
            halign: Gtk.Align.END,
            // use_alpha: true,
            tooltip_text: tooltip_text,
        });

        let colorArray = this.settings.get_strv(gsetting);
        let rgba = new Gdk.RGBA();
        rgba.red = parseFloat(colorArray[0]);
        rgba.green = parseFloat(colorArray[1]);
        rgba.blue = parseFloat(colorArray[2]);
        rgba.alpha = 1.0;
        color.set_rgba(rgba);

        color.connect('color-set', (widget) => {
            rgba = widget.get_rgba();
            this.settings.set_strv(gsetting, [
                rgba.red.toString(),
                rgba.green.toString(),
                rgba.blue.toString(),
            ]);
        });
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
        return scale;
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

    fillOpenbarPrefs(window, openbar) {

        window.set_title(_("Open Bar 🍹"));
        window.default_height = 750;
        window.default_width = 620;

        this.openbar = openbar;
        // Get the settings object
        this.settings = openbar.getSettings();

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
            pixel_size: 120,
            margin_bottom: 10,
            halign: Gtk.Align.END,
        });
        prefsWidget.attach(aboutImage, 2, rowNo, 1, 1);

        // Add a title label
        let titleLabel = new Gtk.Label({
            label: `<span><b>Top Bar Customization</b></span>\n\n<span size="small" underline="none">${_('Version:')} ${this.openbar.metadata.version}  |  <a href="${this.openbar.metadata.url}">Home</a>  |  © <a href="https://extensions.gnome.org/accounts/profile/neuromorph">neuromorph</a>  |  <a href="https://www.buymeacoffee.com/neuromorph">☕</a></span>`,
            // halign: Gtk.Align.CENTER,
            use_markup: true,
        });
        prefsWidget.attach(titleLabel, 1, rowNo, 1, 1);

        rowNo += 1;

        // BAR PROPERTIES
        const barprop = new Gtk.Expander({
            label: `<b>BAR PROPS</b>`,
            expanded: false,
            use_markup: true,
        });
        let bargrid = this.createGridWidget();

        let rowbar = 1;
        //Type of bar
        let barTypeLbl = new Gtk.Label({
            label: 'Type of Bar',
            halign: Gtk.Align.START,
        });
        bargrid.attach(barTypeLbl, 1, rowbar, 1, 1);

        let barType = this.createComboboxWidget([["Mainland", _("Mainland")], ["Floating", _("Floating")], ["Islands", _("Islands")]]);
        bargrid.attach(barType, 2, rowbar, 1, 1);

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

        // Add a overview switch
        let overviewLabel = new Gtk.Label({
            label: 'Apply in Overview',
            halign: Gtk.Align.START,
        });
        bargrid.attach(overviewLabel, 1, rowbar, 1, 1);

        let overviewSwitch = new Gtk.Switch({
            halign: Gtk.Align.END,
        });
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

        let fgColor = this.createColorWidget('Foreground Color', 'Foreground color for the bar', 'fgcolor')
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
        let font = this.settings.get_string('font');
        if (font == ""){
            let defaultFont = fontBtn.get_font();
            this.settings.set_string('default-font', defaultFont);
        }
        let sett = this.settings;
        fontBtn.connect(
            "font-set",
            function (w) {
                var value = w.get_font();
                sett.set_string('font', value);
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
            sett.reset('font');
            fontBtn.set_font(sett.get_string('default-font'));
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

        let bgColor = this.createColorWidget('Background Color', 'Background or gradient start color for the bar', 'bgcolor');
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
            label: 'Islands BG Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(islandsColorLabel, 1, rowbar, 1, 1);

        let islandsColorChooser = this.createColorWidget('Islands Background Color', 'Background or gradient start color for Islands', 'iscolor');
        bggrid.attach(islandsColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a Islands alpha scale
        let isAlphaLbl = new Gtk.Label({
            label: 'Islands Alpha',
            halign: Gtk.Align.START,
        });
        bggrid.attach(isAlphaLbl, 1, rowbar, 1, 1);

        let isAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bggrid.attach(isAlpha, 2, rowbar, 1, 1);
        
        rowbar += 1;

        // Add a gradient switch
        let gradientLbl = new Gtk.Label({
            label: 'Gradient',
            halign: Gtk.Align.START,
        });
        bggrid.attach(gradientLbl, 1, rowbar, 1, 1);

        let gradient = new Gtk.Switch({
            halign: Gtk.Align.END,
        });
        bggrid.attach(gradient, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a gradient color chooser
        let grColorLbl = new Gtk.Label({
            label: 'Gradient End Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(grColorLbl, 1, rowbar, 1, 1);

        let grColor = this.createColorWidget('Gradient End Color', 'Second color of gradient', 'bgcolor2');
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

        // Add a highlight color chooser
        let highlightColorLabel = new Gtk.Label({
            label: 'Highlight Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(highlightColorLabel, 1, rowbar, 1, 1);

        let highlightColorChooser = this.createColorWidget('Highlight Color', 'Highlight color for hover, focus etc.', 'hcolor');
        highlightColorChooser.connect('color-set', () => {
            this.triggerStyleReload();
        });
        bggrid.attach(highlightColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a highlight alpha scale
        let hgAlphaLbl = new Gtk.Label({
            label: 'Highlight Alpha',
            halign: Gtk.Align.START,
        });
        bggrid.attach(hgAlphaLbl, 1, rowbar, 1, 1);

        let hgAlpha = this.createScaleWidget(0, 1, 0.05, 2);
        hgAlpha.connect('change-value', () => {
            if(this.hgAlphaTimeoutId)
                clearTimeout(this.hgAlphaTimeoutId);
            this.hgAlphaTimeoutId = setTimeout(() => {this.triggerStyleReload();}, 300);
            
        });
        bggrid.attach(hgAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a shadow switch
        let shadowLabel = new Gtk.Label({
            label: `Panel Shadow`,
            halign: Gtk.Align.START,
        });
        bggrid.attach(shadowLabel, 1, rowbar, 1, 1);

        let shadowSwitch = new Gtk.Switch({
            halign: Gtk.Align.END,
        });
        bggrid.attach(shadowSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a panel shadow color chooser
        let shColorLabel = new Gtk.Label({
            label: 'Shadow Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(shColorLabel, 1, rowbar, 1, 1);

        let shColorChooser = this.createColorWidget('Panel Shadow Color', 'Shadow color for the Panel. Choose light color for dark theme and dark for light.', 'shcolor');
        bggrid.attach(shColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a panel shadow alpha scale
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

        let borderColorChooser = this.createColorWidget('Border Color', 'Border Color', 'bcolor');
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

        let neon = new Gtk.Switch({
            halign: Gtk.Align.END,
            tooltip_text: 'Select bright/neon color for border and dark-opaque background',
        });
        bgrid.attach(neon, 2, rowbar, 1, 1);

        bprop.set_child(bgrid);
        prefsWidget.attach(bprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator4 = this.createSeparatorWidget();
        prefsWidget.attach(separator4, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////

        rowNo += 1;
        const menuprop = new Gtk.Expander({
            label: `<b>MENU ⚗️</b>`,
            expanded: false,
            use_markup: true,
        });
        let menugrid = this.createGridWidget();

        rowbar = 1;

        // Add Menu style apply / remove info 
        let menuInfoLabel = new Gtk.Label({
            use_markup: true,
            label: `<span allow_breaks="true">Click on Apply / Reset buttons below to apply or reset \nthe changes to the default Menu styles.</span>`,
            halign: Gtk.Align.START,
        });
        menugrid.attach(menuInfoLabel, 1, rowbar, 2, 1);

        // rowbar += 2;

        // let menuSwitch = new Gtk.Switch({
        //     halign: Gtk.Align.END,
        //     tooltip_text: '⚗️ Experimental: Turn on to apply below menu styles',
        // });
        // menugrid.attach(menuSwitch, 2, rowbar, 1, 1);

        rowbar += 3;

        // Add a menu FG color chooser
        let menuFGColorLabel = new Gtk.Label({
            label: 'FG Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menuFGColorLabel, 1, rowbar, 1, 1);

        let menuFGColorChooser = this.createColorWidget('Menu Foreground Color', 'Foreground color for the dropdown menus', 'mfgcolor');
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

        let menuBGColorChooser = this.createColorWidget('Menu Background Color', 'Background color for the dropdown menus', 'mbgcolor');
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

        let menubColorChooser = this.createColorWidget('Menu Border Color', 'Border color for the dropdown menus', 'mbcolor');
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

        let menuhColorChooser = this.createColorWidget('Menu Highlight Color', 'Highlight color for hover/focus on menu items', 'mhcolor');
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

        let menusColorChooser = this.createColorWidget('Menu Selected/Active Color', 'Selected/Active color for the menu items', 'mscolor');
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

        let menushColorChooser = this.createColorWidget('Menu Shadow Color', 'Shadow color for the dropdown menus. Choose light color for dark theme and dark for light.', 'mshcolor');
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
            label: `<span color="#f44336">${_("Reset Menu Styles")}</span>`, 
        });
        const removeMenuBtn = new Gtk.Button({
            child: removeMenuLabel,
            margin_top: 25,
            tooltip_text: _("Reset the style settings for Menu"),
            halign: Gtk.Align.END,
        });
        removeMenuBtn.connect('clicked', () => {
            this.settings.set_boolean('menustyle', false);
            // Trigger updateStyles() by toggling 'removestyle'
            let removestyle = this.settings.get_boolean('removestyle');
            if(removestyle)
                this.settings.set_boolean('removestyle', false);
            else
                this.settings.set_boolean('removestyle', true);
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
            this.settings.set_boolean('menustyle', true);

        });
        menugrid.attach(applyMenuBtn, 1, rowbar, 2, 1);


        menuprop.set_child(menugrid);
        prefsWidget.attach(menuprop, 1, rowNo, 2, 1);

        settingsGroup.add(prefsWidget);

        ///////////////////////////////////////////////////////////////////////



        // Bind the settings to the widgets
        this.settings.bind(
            'bartype',
            barType,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'height',
            height.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'margin',
            margin.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'fgalpha',
            fgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'bgalpha',
            bgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'gradient',
            gradient,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'bgalpha2',
            grAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'gradient-direction',
            grDirection,
            'active-id',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'halpha',
            hgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'isalpha',
            isAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        // this.settings.bind(
        //     'bordertype',
        //     borderType,
        //     'active-id',
        //     Gio.SettingsBindFlags.DEFAULT
        // );
        this.settings.bind(
            'bradius',
            bRadius.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'bwidth',
            borderWidthScale.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'balpha',
            bAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'neon',
            neon,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'shadow',
            shadowSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'shalpha',
            shAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'overview',
            overviewSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        
        this.settings.bind(
            'mfgalpha',
            mfgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'mbgalpha',
            mbgAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'mbalpha',
            mbAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'mhalpha',
            mhAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'msalpha',
            msAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this.settings.bind(
            'mshalpha',
            mshAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        // this.settings.bind(
        //     'menustyle',
        //     menuSwitch,
        //     'active',
        //     Gio.SettingsBindFlags.DEFAULT
        // );
        
    }

}