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
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


// ConnectManager class to manage connections for events to trigger Openbar updatestyle
// This class is modified from Floating Panel extension (Thanks Aylur!)
class ConnectManager{
    constructor(list = []){
        this.connections = [];

        list.forEach(c => {
            let [obj, signal, callback] = c;
            this.connect(obj, signal, callback);
        });
    }

    connect(obj, signal, callback){
        let id;
        // if(signal == 'actor-removed'){
        //     id = obj.connect(signal, (container, actor) => {callback(actor)}); 
        // }
        // else if(signal == 'enter-event' || signal == 'leave-event')
        //     id = obj.connect(signal, (actor, event) => {callback(event)});
        // else
            id = obj.connect(signal, callback);
        this.connections.push({
            id: id,
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

    resetStyle(panel, disable) {

        panel.set_style(null);
        panel.remove_style_class_name('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        for(const box of panelBoxes) {
            for(const btn of box) {
                    btn.set_style(null);
                    btn.child?.set_style(null);     
                    btn.remove_style_class_name('openbutton');               
            }
        }
        
        this.applyMenuStyles(panel, false);
    }

    colorMix(startColor, endColor) {
        let color = startColor + 0.12*(endColor - startColor);
        return color;
    }


    reloadStylesheet() {
        // Unload stylesheet
        const theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        theme.unload_stylesheet(Me.stylesheet); log('unloaded ', Me.stylesheet);
        delete Me.stylesheet;

        // Check extension enabled
        // if (Me.state !== ExtensionState.ENABLED &&
        //     Me.state !== ExtensionState.ENABLING)
        //     return;

        log('loading stylehseet');
        // Load stylesheet
        try {
            const stylesheetFile = Me.dir.get_child('stylesheet.css'); log(stylesheetFile);
            theme.load_stylesheet(stylesheetFile);
            Me.stylesheet = stylesheetFile;
        } catch (e) {
            log('Error loading stylesheet: ', stylesheetFile);
            throw e;
        }
        
    }

    updatePanelStyle(panel, key) {
        this.updateTimeoutId = setTimeout(() => {this.updateStyle(panel, key);}, 100);
    }

    applyMenuClass(obj, add) {
        if(add) {
            obj.add_style_class_name('openmenu');
        }
        else {
            obj.remove_style_class_name('openmenu');
            // log('remove openmneu for ', obj);
        }
    }
    applyMenuStyles(panel, add) {
        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        for(const box of panelBoxes) {
            for(const btn of box) {
                if(btn.child instanceof PanelMenu.Button) {
                    if(btn.child.menu.box) {
                        this.applyMenuClass(btn.child.menu.box, add);

                        let menuChildren = btn.child.menu.box.get_children();
                        menuChildren.forEach(menuItem => {
                            this.applyMenuClass(menuItem, add);
                            if(menuItem.menu) {
                                this.applyMenuClass(menuItem.menu.box, add);
                                menuItem.menu.box.get_children().forEach(child => {
                                    this.applyMenuClass(child, add);
                                });
                            }
                            
                            let subChildren = menuItem.get_children();
                            subChildren.forEach(menuchild => {
                                this.applyMenuClass(menuchild, add);
                                if(menuchild.menu) {
                                    this.applyMenuClass(menuchild.menu.box, add);
                                    menuchild.menu.box.get_children().forEach(child => {
                                        this.applyMenuClass(child, add);
                                    });
                                }
                            });
            
                        });
                    }
                    
                }
            }
        }
    }

    updateStyle(panel, key) {
        if(!this._settings)
            return;

        let overview = this._settings.get_boolean('overview');
        if(!overview && panel.has_style_pseudo_class('overview'))
            return this.resetStyle(panel, false);

        if(key == 'reloadstyle') { // A toggle key to trigger update for reload stylesheet
            log('reload stylesheet');
            this.reloadStylesheet();
        }
        
        let menustyle = this._settings.get_boolean('menustyle');
        this.applyMenuStyles(panel, menustyle);

        if(key=='removestyle')  // A toggle key to trigger update for removing menu style
            log('removestyle with menustyle=', menustyle);
            
        let menuKeys = ['reloadstyle', 'removestyle', 'menustyle', 'mfgcolor', 'mfgalpha', 'mbgcolor', 'mbgaplha', 'mbcolor', 'mbaplha', 'mhcolor', 'mhalpha'];
        if(menuKeys.includes(key))
            return;

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
   
    
        this.resetStyle(panel, false);//==================
        panel.add_style_class_name('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        let commonStyle, panelStyle, btnStyle, btnContainerStyle, borderStyle, radiusStyle, fontStyle, islandStyle, neonStyle, gradientStyle;      

        // style that applies dynamically to either the panel or the panel buttons as per bar type
        borderStyle = `
            border: ${borderWidth}px ${bordertype} rgba(${bred},${bgreen},${bblue},${balpha});            
        `;
        radiusStyle = ` border-radius: ${borderRadius}px; `;
        // if (bordertype == 'double')
        //     style += ` outline: ${borderWidth}px ${bordertype} rgba(${bred},${bgreen},${bblue},${balpha}); `;

        // common style needed for both panel and buttons (all bar types)
        commonStyle = ` 
            color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}); 
            
        `;
        // panel style for panel only (all bar types)
        panelStyle = ` background-color: rgba(${bgred},${bggreen},${bgblue},${bgalpha}) !important; height: ${height}px; `;
        panelStyle += radiusStyle;

        // button style for buttons only (all bar types)
        btnStyle = ` margin: none; height: ${height-4}px;  `;

        // island style for buttons (only island bar type)
        islandStyle = ` box-shadow: 0px 0px 0px -1px rgba(${isred},${isgreen},${isblue},${isalpha}); `;

        // Add font style to panelstyle (works on all bar types)
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
    
        // Box shadow not working with rectangular box (for smaller radius), why Gnome??
        // Fix: Negative/low spread to try to contain it in that range. Range depends on bar height
        let radThreshold = Math.ceil((height/10.0 - 1)*5) - 1;

        // Add the neon style if enabled
        if (neon) {           
            if (borderRadius < radThreshold) {
                neonStyle = `               
                    box-shadow: 0px 0px 6px -1px rgba(${bred},${bgreen},${bblue},0.55);
                `;
            }
            else {
                neonStyle = `               
                    box-shadow: 0px 0px 7px 3px rgba(${bred},${bgreen},${bblue},0.55);
                `;
            }
        }
        else {
            neonStyle = ` box-shadow: none; `;
        }


        // Add panel shadow if enabled
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
        else {
            panelStyle += `
                    box-shadow: none;
                `;
        }

        // Add gradient to style if enabled
        if (gradient) {
            let startColor, endColor;
            if(bartype == 'Islands') {
                startColor = `rgba(${isred},${isgreen},${isblue},${isalpha})`;
                endColor = `rgba(${bgred2},${bggreen2},${bgblue2},${isalpha})`;
            }
            else {
                startColor = `rgba(${bgred},${bggreen},${bgblue},${bgalpha})`;
                endColor = `rgba(${bgred2},${bggreen2},${bgblue2},${bgalpha})`;
            }
            gradientStyle  = ` 
                background-gradient-start: ${startColor};  
                background-gradient-end: ${endColor}; 
                background-gradient-direction: ${grDirection}; 
            `;

            islandStyle = ``;
        }
        else
            gradientStyle = ``;


        if(bartype == 'Mainland') {
            panelStyle += ` margin: none; `;            
        }
        if(bartype == 'Floating') {
            panelStyle += ` margin: ${margin}px ${3*margin}px; `;
        }
        if(bartype == 'Islands') {
            panelStyle += ` margin: ${margin}px ${1.5*margin}px; `;            
            panel.set_style(commonStyle + panelStyle);  

            btnStyle += radiusStyle;

            btnContainerStyle = ` 
                padding: 0px 0px;
                margin: 0 3px;
            `;
            btnContainerStyle += borderStyle + ` border-radius: ${borderRadius+borderWidth}px; `;

            for(const box of panelBoxes) {
                for(const btn of box) {
                    if(btn.child instanceof PanelMenu.Button) {
                        btn.child.set_style(commonStyle + btnStyle + islandStyle + gradientStyle);
                        // log(btn.child.style);
                        
                        if(btn.child.visible) {
                            // btn.add_style_class_name('openbutton');                     
                            btn.set_style(btnContainerStyle + neonStyle);
                        }

                        // log('btn ===== ', btn.child.style);
                        // log('btnContainer ==== ', btn.style);
                    }
                }
            }
           
        }
        else {

            // Apply the style to the panel
            panel.set_style(commonStyle + panelStyle + borderStyle + gradientStyle + neonStyle);

            btnStyle += ` border-radius: ${Math.max(borderRadius, 5)}px; border-width: 0px; box-shadow: none; `;

            btnContainerStyle = ` 
                padding: 0px 0px;
                margin: 0 1px;
            `;
            btnContainerStyle += ` border: 2px solid transparent; border-radius: ${borderRadius+borderWidth}px; `;
            
            for(const box of panelBoxes) {
                for(const btn of box) {
                    if(btn.child instanceof PanelMenu.Button) { 
                        
                        btn.child.set_style(commonStyle + btnStyle);
          
                        if(btn.child.visible) {
                            // btn.add_style_class_name('openbutton');                     
                            btn.set_style(btnContainerStyle);
                        }
                        // btn.add_style_class_name('openbutton');
                        // btn.set_style(neonStyle);
                    }
                }
            }

        }

        // log(panel.style);
        // log(style);
    }

    // removePanelBtn(btn) {
    //     if(Object.keys(this.eventIds).includes(String(btn))) {
    //         this.eventIds[btn].forEach(event => {
    //             event[0]?.disconnect(event[1]);
    //         });
    //         log('removing events ', this.eventIds[btn]);
    //         this.eventIds[btn] = [];
    //     }
    //     btn.child?.set_style(null);
    // }

    // highlightEvents(event) {
    //     const onEvents = ['enter-event', 'key-focus-in'];
    //     const offEvents = ['leave-event', 'key-focus-out'];

    //     const targetActor = global.stage.get_event_actor(event);
    //     if (targetActor instanceof PanelMenu.Button) {
    //         if(onEvents.includes(event))
    //             targetActor.set_style(` background-color: rgba(255,255,255,0.5);`); //hcolor
    //         else if(offEvents.includes(event))
    //             targetActor.set_style(` background-color: rgba(255,255,255,0);`);
    //         else
    //             targetActor.set_style(` background-color: rgba(255,0,0,0.5);`);
    //     }
        
    // }

    // TODO: 
    // Debug 'length property isn't a number' warning
    // Tally the events being captured with the panel buttons 

    enable() {

        this._settings = ExtensionUtils.getSettings(); 

        // Get the top panel
        let panel = Main.panel;

        // Connect to the settings changes
        this._settings.connect('changed', (settings, key) => {
            this.updatePanelStyle(panel, key);
        });

        this._connections = new ConnectManager([
            [ Main.overview, 'hidden', this.updatePanelStyle.bind(this, panel) ],
            [ Main.overview, 'shown', this.updatePanelStyle.bind(this, panel) ],
            [ Main.sessionMode, 'updated', this.updatePanelStyle.bind(this, panel) ],
            [ global.window_manager, 'switch-workspace', this.updatePanelStyle.bind(this, panel) ],
            [ panel._leftBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
            [ panel._centerBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
            [ panel._rightBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
            // [ panel._leftBox, 'actor-removed', this.removePanelBtn.bind(this) ],
            // [ panel._centerBox, 'actor-removed', this.removePanelBtn.bind(this) ],
            // [ panel._rightBox, 'actor-removed', this.removePanelBtn.bind(this) ],
            // [ panel._leftBox, 'enter-event', this.highlightEvents.bind(this) ],
            // [ panel._leftBox, 'leave-event', this.highlightEvents.bind(this) ],
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
        this.resetStyle(panel, true);

        this._settings = null;

        this._connections.disconnectAll();
        this._connections = null;

        /////////////////////////////////////////////////////////////////////////////////////////////if timeoutid
        if(this.updateTimeoutId)
            clearTimeout(this.updateTimeoutId);
        this.updateTimeoutId = null;

    }
    
}

function init() {
    return new Extension();
}
 
