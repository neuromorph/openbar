/* extension.js
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

/* exported init */

const { Clutter, Gio, GObject, St, Pango } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


// ConnectManager class to manage connections for events to trigger Openbar updatestyle
// This class is from Floating Panel extension (Thanks Aylur!)
class ConnectManager{
    constructor(list = []){
        this.connections = [];

        list.forEach(c => {
            let [obj, signal, callback] = c;
            this.connect(obj, signal, callback);
        });
    }

    connect(obj, signal, callback){
        this.connections.push({
            id: obj.connect(signal, callback),
            obj : obj
        })
    }

    disconnectAll(){
        this.connections.forEach(c => {
            c.obj.disconnect(c.id);
        })
    }
}


// Openbar Extension main class
class Extension {
    constructor() {
        this._settings = null;
        this._connections = null;
        this.eventIds = {};
        this.panelEventIds = [];
    }

    resetStyle(panel) {

        panel.set_style(null);
        panel.remove_style_class_name('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        for(const box of panelBoxes) {
            for(const btn of box) {
                if(btn.child instanceof PanelMenu.Button) {
                    btn.child.set_style(null);
                    btn.child.menu.box?.set_style(null);

                    this.eventIds[btn]?.forEach(event => {
                        event[0]?.disconnect(event[1]);
                        // log(event[0], event[1]);
                    });
                }
            }
        }
        this.eventIds = {};

        this.panelEventIds.forEach(event => {
            event[0]?.disconnect(event[1]);
            // log(event[0], event[1]);
        });
        this.panelEventIds = [];
        
    }

    updatePanelStyle(panel) {
        this.updateTimeoutId = setTimeout(() => {this.updateStyle(panel);}, 100);
    }

    updateStyle(panel) {
        if(!this._settings)
            return;

        let overview = this._settings.get_boolean('overview');
        if(!overview && panel.has_style_pseudo_class('overview'))
            return this.resetStyle(panel);

        // Get the settings values
        let bartype = this._settings.get_string('bartype');
        let bgcolor = this._settings.get_strv('bgcolor');
        let gradient = this._settings.get_boolean('gradient');
        let grDirection = this._settings.get_string('gradient-direction');
        let bgcolor2 = this._settings.get_strv('bgcolor2');
        let bgalpha = this._settings.get_double('bgalpha');
        let fgcolor = this._settings.get_strv('fgcolor');
        let fgalpha = this._settings.get_double('fgalpha');
        let borderColor = this._settings.get_strv('bcolor');
        let balpha = this._settings.get_double('balpha');
        let borderWidth = this._settings.get_double('bwidth');
        let borderRadius = this._settings.get_double('bradius');
        let bordertype = this._settings.get_string('bordertype');
        let highlightColor = this._settings.get_strv('hcolor');
        let halpha = this._settings.get_double('halpha');
        let menufgColor = this._settings.get_strv('mfgcolor');
        let mfgalpha = this._settings.get_double('mfgalpha');
        let menubgColor = this._settings.get_strv('mbgcolor');
        let mbgalpha = this._settings.get_double('mbgalpha');
        let menubColor = this._settings.get_strv('mbcolor');
        let mbalpha = this._settings.get_double('mbalpha');
        let islandsColor = this._settings.get_strv('iscolor');
        let isalpha = this._settings.get_double('isalpha');
        let neon = this._settings.get_boolean('neon');
        let shadow = this._settings.get_boolean('shadow');
        let font = this._settings.get_string("font");
        let height = this._settings.get_double('height');
        let margin = this._settings.get_double('margin');

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

        const hred = parseInt(parseFloat(highlightColor[0]) * 255);
        const hgreen = parseInt(parseFloat(highlightColor[1]) * 255);
        const hblue = parseInt(parseFloat(highlightColor[2]) * 255);

        const mfgred = parseInt(parseFloat(menufgColor[0]) * 255);
        const mfggreen = parseInt(parseFloat(menufgColor[1]) * 255);
        const mfgblue = parseInt(parseFloat(menufgColor[2]) * 255);

        const mbgred = parseInt(parseFloat(menubgColor[0]) * 255);
        const mbggreen = parseInt(parseFloat(menubgColor[1]) * 255);
        const mbgblue = parseInt(parseFloat(menubgColor[2]) * 255);

        const mbred = parseInt(parseFloat(menubColor[0]) * 255);
        const mbgreen = parseInt(parseFloat(menubColor[1]) * 255);
        const mbblue = parseInt(parseFloat(menubColor[2]) * 255);
    
    
        this.resetStyle(panel);
        panel.add_style_class_name('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        const onEvents = ['enter-event', 'key-focus-in'];
        const offEvents = ['leave-event', 'key-focus-out'];
        let style, panelStyle, btnStyle, fontStyle, startColor, menuStyle, highlightStyle, islandStyle;       

        // Create the style string (applies dynamically to either the panel or the panel buttons as per bar type)
        style = `
            color: rgba(${fgred},${fggreen},${fgblue},${fgalpha});  
            border: ${borderWidth}px ${bordertype} rgba(${bred},${bgreen},${bblue},${balpha}); 
            border-radius: ${borderRadius}px;
            height: ${height}px !important;
        `;
        // if (bordertype == 'double')
        //     style += ` outline: ${borderWidth}px ${bordertype} rgba(${bred},${bgreen},${bblue},${balpha}); `

        panelStyle = ` background-color: rgba(${bgred},${bggreen},${bgblue},${bgalpha}) !important; `;
        menuStyle = ` color: rgba(${mfgred},${mfggreen},${mfgblue},${mfgalpha}); 
                        background-color: rgba(${mbgred},${mbggreen},${mbgblue},${mbgalpha});  
                        border-color: rgba(${mbred},${mbgreen},${mbblue},${mbalpha});`;
        highlightStyle = ` background-color: rgba(${hred},${hgreen},${hblue},${halpha}); `;

        // Add font style to panelstyle
        if (font != ""){
            let fontDesc = Pango.font_description_from_string(font); 
            let fontFamily = fontDesc.get_family();
            let fontSize = fontDesc.get_size() / Pango.SCALE;
            let fontWeight;
            try{
              fontWeight = fontDesc.get_weight();
            }catch(e){
              fontWeight = Math.round(fontWeight/100)*100;
            }
            fontStyle = ` font-family: ${fontFamily};  font-size: ${fontSize}px; font-weight: ${fontWeight}; `; 
        }
        else
            fontStyle = '';
        panelStyle += fontStyle;
    
        // Add the neon and shadow styles if enabled
        // Box shadow not working with rectangular box (for smaller radius), why??
        // Fix: Negative/low spread to try to contain it in that range. Range depends on bar height
        let radThreshold = Math.ceil((height/10.0 - 1)*5) - 1;
        if (neon) {           
            if (borderRadius < radThreshold) {
                style += `               
                    box-shadow: 0px 0px 6px -1px rgba(${bred},${bgreen},${bblue},0.55);
                `;
            }
            else {
                style += `               
                    box-shadow: 0px 0px 7px 3px rgba(${bred},${bgreen},${bblue},0.55);
                `;
            }
        }
    
        if (shadow) {
            if (borderRadius < radThreshold) {
                panelStyle += `
                    box-shadow: 0px 2px 6px 4px rgba(0, 0, 0, 0.16);
                `;
            }
            else {
                panelStyle += `
                    box-shadow: 0px 2px 6px 8px rgba(0, 0, 0, 0.16);
                `;
            }
        }

        // Add gradient style
        if (gradient) {
            if(bartype == 'Islands')
                startColor = `rgba(${isred},${isgreen},${isblue},${isalpha})`;
            else
                startColor = `rgba(${bgred},${bggreen},${bgblue},${bgalpha})`;
            style += ` 
                background-color: transparent;
                background-gradient-start: ${startColor};  
                background-gradient-end: rgba(${bgred2},${bggreen2},${bgblue2},${bgalpha}); 
                background-gradient-direction: ${grDirection}; 
            `;
        }

        if(bartype == 'Mainland') {
            style += `
                margin: none;
                padding: 1px;
            `;
            btnStyle = ` margin: 0px 2px; color: rgba(${fgred},${fggreen},${fgblue},${fgalpha});`; // Need color for btns
        }
        if(bartype == 'Floating') {
            style += `
                margin: ${margin}px ${2*margin}px;
                padding: 1px;
            `;
            btnStyle = ` margin: 0px 2px; color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}); `; // Need color for btns
        }
        if(bartype == 'Islands') {
            style += `
                margin: 0px 3px;
                padding: 1px;
            `;
            islandStyle = ` background-color: rgba(${isred},${isgreen},${isblue},${isalpha}); `;

            panel.set_style( panelStyle + ` margin: ${margin}px; height: ${height}px; `);  

            for(const box of panelBoxes) {
                for(const btn of box) {
                    if(btn.child instanceof PanelMenu.Button) {
                        btn.child.set_style(style + islandStyle);
                        btn.child.menu.box?.set_style(menuStyle);

                        this.eventIds[btn] = [];
                        onEvents.forEach(event => {
                            let eventId = btn.child.connect(event, () => {
                                btn.child.set_style(style + highlightStyle); //hcolor
                            });
                            this.eventIds[btn].push([btn.child, eventId]);
                        });
                        offEvents.forEach(event => {
                            let eventId = btn.child.connect(event, () => {
                                btn.child.set_style(style + islandStyle); //bgcolor
                            });
                            this.eventIds[btn].push([btn.child, eventId]);
                        });

                        let menuEventId = btn.child.menu.connect('open-state-changed', (actor, open) => { //menu open close
                            if(open)
                                btn.child.set_style(style + highlightStyle);
                            else
                                btn.child.set_style(style + islandStyle); 
                        });
                        this.eventIds[btn].push([btn.child.menu, menuEventId]);

                    }
                }
            }

            offEvents.forEach(event => {
                let eventId = panel.connect(event, () => {  //panel leave event
                    for(const box of panelBoxes) {
                        for(const btn of box) {
                            if(btn.child instanceof PanelMenu.Button) {
                                btn.child.set_style(style + islandStyle);
                            }
                        }
                    }
                });
                this.panelEventIds.push([panel, eventId]);
            });
            
        }
        else {
            // Apply the style to the panel
            panel.set_style(panelStyle + style);
            
            for(const box of panelBoxes) {
                for(const btn of box) {
                    if(btn.child instanceof PanelMenu.Button) { 
                        btnStyle += ` border-radius: ${Math.max(borderRadius, 5)}px; border-width: 0px;`;
                        btn.child.set_style(btnStyle);
                        btn.child.menu.box?.set_style(menuStyle);

                        this.eventIds[btn] = [];
                        onEvents.forEach(event => {
                            let eventId = btn.child.connect(event, () => {
                                btn.child.set_style(btnStyle + highlightStyle); //hcolor
                            });
                            this.eventIds[btn].push([btn.child, eventId]);
                        });
                        offEvents.forEach(event => {
                            let eventId = btn.child.connect(event, () => {
                                btn.child.set_style(btnStyle + ` background-color: transparent; `); 
                            });
                            this.eventIds[btn].push([btn.child, eventId]);
                        });

                        let eventId = btn.child.menu.connect('open-state-changed', (actor, open) => {  //menu open close
                            if(open)
                                btn.child.set_style(btnStyle + highlightStyle);
                            else
                                btn.child.set_style(btnStyle + ` background-color: transparent; `); 
                        });
                        this.eventIds[btn].push([btn.child.menu, eventId]);

                    }
                }
            }

            offEvents.forEach(event => {
                let eventId = panel.connect(event, () => {  //panel leave event
                    for(const box of panelBoxes) {
                        for(const btn of box) {
                            if(btn.child instanceof PanelMenu.Button) {
                                btn.child.set_style(btnStyle + ` background-color: transparent; `);
                            }
                        }
                    }
                });
                this.panelEventIds.push([panel, eventId]);
            });
        }

        // log(panel.style);
        // log(style);
    }

    // TODO: 
    // Debug 'length property isn't a number' warning
    // Tally the events being captured with the panel buttons 

    enable() {

        this._settings = ExtensionUtils.getSettings(); 

        // Get the top panel
        let panel = Main.panel;

        // Connect to the settings changes
        this._settings.connect('changed', () => {
            this.updatePanelStyle(panel);
        });

        this._connections = new ConnectManager([
            [ Main.overview, 'hidden', this.updatePanelStyle.bind(this, panel) ],
            [ Main.overview, 'shown', this.updatePanelStyle.bind(this, panel) ],
            [ Main.sessionMode, 'updated', this.updatePanelStyle.bind(this, panel) ],
            [ global.window_manager, 'switch-workspace', this.updatePanelStyle.bind(this, panel) ],
            [ panel._leftBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
            [ panel._centerBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
            [ panel._rightBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
            // [ global.window_group, 'actor-added', this._onWindowAdded.bind(this) ],
            // [ global.window_group, 'actor-removed', this._onWindowRemoved.bind(this) ]
        ]);

        // Apply the initial style
        this.updatePanelStyle(panel);
    }

    disable() {
        // Get the top panel
        let panel = Main.panel;

        // Reset the style and disconnect onEvents and offEvents
        this.resetStyle(panel);

        this._settings = null;

        this._connections.disconnectAll();
        this._connections = null;

        if(this.updateTimeoutId) {
            clearTimeout(this.updateTimeoutId);
        }
        this.updateTimeoutId = null;        

    }
    
}

function init() {
    return new Extension();
}
 
