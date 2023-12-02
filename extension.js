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
            c.obj.disconnect(c.id)
        })
    }
}


// Openbar Extension main class
class Extension {
    constructor() {
        this._settings = null;
        this._connections = null;
        this.eventIds = [];
    }

    resetStyle(panel) {

        panel.set_style(null);
        panel.remove_style_class_name('openbar');
        // panel.remove_style_pseudo_class('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox]
        for(const box of panelBoxes) {
            for(const btn of box) {
                if(btn.child instanceof PanelMenu.Button) {
                    btn.child.set_style(null);
                    btn.child.menu.box?.set_style(null);
                    // btn.child.remove_style_pseudo_class('openbar-button');
                    // btn.remove_style_class_name('openbar-container');
                }
            }
        }

        this.eventIds.forEach(event => {
            event[0]?.disconnect(event[1]);
        });
        this.eventIds = [];
        // for(const btn of panel._leftBox) {
        //     btn.set_style(null);
        // }
        // for(const btn of panel._centerBox) {
        //     btn.set_style(null);
        // }
        // for(const btn of panel._rightBox) {
        //     btn.set_style(null);
        // }

    }

    updatePanelStyle(panel) {
        this.updateTimeoutId = setTimeout(() => {this.updateStyle(panel);}, 100);
    }

    updateStyle(panel) {

        if(panel.has_style_pseudo_class('overview'))
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
        let highlightColor = this._settings.get_strv('hcolor');
        let halpha = this._settings.get_double('halpha');
        let menuColor = this._settings.get_strv('mcolor');
        let malpha = this._settings.get_double('malpha');
        let islandsColor = this._settings.get_strv('iscolor');
        let isalpha = this._settings.get_double('isalpha');
        let neon = this._settings.get_boolean('neon');
        let shadow = this._settings.get_boolean('shadow');
        const font = this._settings.get_string("font");
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

        const mred = parseInt(parseFloat(menuColor[0]) * 255);
        const mgreen = parseInt(parseFloat(menuColor[1]) * 255);
        const mblue = parseInt(parseFloat(menuColor[2]) * 255);
    
        // log(bartype, bgcolor, bgalpha, fgcolor, borderColor, borderRadius, borderWidth, highlightColor, neon, shadow, font, height, margin, fgred, fggreen, fgblue, fgalpha, bgred, bggreen, bgblue, bred, bblue, bgreen, balpha, hred, hgreen, hblue, halpha);
    
        this.resetStyle(panel);
        panel.add_style_class_name('openbar');
        // panel.add_style_pseudo_class('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox]
        const onEvents = ['enter-event', 'key-focus-in'];
        const offEvents = ['leave-event', 'key-focus-out'];
        let style, panelStyle, btnStyle, fontStyle, panelBGStyle, menuStyle;       

        // Create the style string
        style = `
              
            border: ${borderWidth}px solid rgba(${bred},${bgreen},${bblue},${balpha}); 
            border-radius: ${borderRadius}px;
            height: ${height}px !important;
        `;

        panelStyle = ` color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}); `;
        panelBGStyle = ` background-color: rgba(${bgred},${bggreen},${bgblue},${bgalpha}) !important; `;
        menuStyle = ` background-color: rgba(${mred},${mgreen},${mblue},${malpha}); `;

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
    
        // Add the neon and shadow styles if enabled
        if (neon) {
            style += `
                box-shadow: 0px 0px 2px 2px rgba(${bred},${bgreen},${bblue},0.4);
            `;
        }
    
        if (shadow) {
            style += `
                box-shadow: 0px 1px 2px 2px rgba(0, 0, 0, 0.2);
            `;
        }

        if (gradient) {
            style += ` 
                background-color: transparent;
                background-gradient-start: rgba(${bgred},${bggreen},${bgblue},${bgalpha});  
                background-gradient-end: rgba(${bgred2},${bggreen2},${bgblue2},${bgalpha}); background-gradient-direction: ${grDirection}; 
            `;
        }

        if(bartype == 'Mainland') {
            style += `
                margin: none;
                padding: 1px;
            `;
            btnStyle = ` margin: 0px 2px; color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}); `;
        }
        if(bartype == 'Floating') {
            style += `
                margin: ${margin}px ${2*margin}px;
                padding: 1px;
            `;
            btnStyle = ` margin: 0px 2px; color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}); `;
        }
        if(bartype == 'Islands') {
            style += `
                margin: 0px 3px;
                padding: 1px;
            `;
            panelStyle = ` margin: ${margin}px; `;

            panel.set_style(panelBGStyle + panelStyle + fontStyle );  //background-color: transparent; + ` height: ${height}px; `

            for(const box of panelBoxes) {
                for(const btn of box) {
                    if(btn.child instanceof PanelMenu.Button) {
                        btn.child.set_style(style + ` background-color: rgba(${isred},${isgreen},${isblue},${isalpha}); `);
                        btn.child.menu.box?.set_style(menuStyle);
                        // btn.child.style = style;
                        // btn.child.add_style_class_name('panel-button');
                        // btn.child.add_style_pseudo_class('openbar-button');
                        onEvents.forEach(event => {
                            let eventId = btn.child.connect(event, () => {
                                btn.child.set_style(style + ` background-color: rgba(${hred},${hgreen},${hblue},${halpha}); `); //hcolor
                            });
                            this.eventIds.push([btn.child, eventId]);
                        });
                        offEvents.forEach(event => {
                            let eventId = btn.child.connect(event, () => {
                                btn.child.set_style(style + ` background-color: rgba(${isred},${isgreen},${isblue},${isalpha}); `); //bgcolor
                            });
                            this.eventIds.push([btn.child, eventId]);
                        });

                        // btn.add_style_class_name('openbar-container');
                    }
                }
            }
            

            // for(const btn of panel._centerBox) {
            //     btn.set_style(style);
            // }
            // for(const btn of panel._rightBox) {
            //     btn.set_style(style);
            // }
        }
        else {
            // Apply the style to the panel
            panel.set_style(panelBGStyle + style + fontStyle);

            for(const box of panelBoxes) {
                for(const btn of box) {
                    if(btn.child instanceof PanelMenu.Button) { //log('b radius = '+ borderRadius);
                        btnStyle += ` border-radius: ${borderRadius+4}px; border-width: 0px;`;
                        btn.child.set_style(btnStyle);
                        btn.child.menu.box?.set_style(menuStyle);

                        onEvents.forEach(event => {
                            let eventId = btn.child.connect(event, () => {
                                btn.child.set_style(btnStyle + ` background-color: rgba(${hred},${hgreen},${hblue},${halpha}); `); //hcolor
                            });
                            this.eventIds.push([btn.child, eventId]);
                        });
                        offEvents.forEach(event => {
                            let eventId = btn.child.connect(event, () => {
                                btn.child.set_style(btnStyle + ` background-color: transparent; `); 
                            });
                            this.eventIds.push([btn.child, eventId]);
                        });
                    }
                }
            }
        }

    }

    //TODO: handle active checked etc with connect to signals (ask matrix?)
    // Turn off settings code above one by one to chk what throws length property isn;t a number warning

    enable() {

        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.openbar'); 

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

        // Reset the style
        this.resetStyle(panel);
        this._settings = null;

        this._connections.disconnectAll();
        this._connections = null;

        this.updateTimeoutId = null;

    }
    
}

function init() {
    return new Extension();
}
 