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

/* exported Openbar init */

const { St, Pango } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Calendar = imports.ui.calendar;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Config = imports.misc.config;

// Import the required modules
const Gio = imports.gi.Gio;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Quantize = Me.imports.quantize;


// ConnectManager class to manage connections for events to trigger Openbar style updates
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
        this.connections.push({
            id : obj.connect(signal, (actor, event) => {callback(actor, signal)}),
            obj: obj
        })
        obj.connect('destroy', () => {
            this.removeObject(obj)
        });
    }

    // remove an object WITHOUT disconnecting it, use only when you know the object is destroyed
    removeObject(object){
        this.connections = this.connections.filter(({id, obj}) => obj != object);
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
        this._injections = [];
    }

    backgroundPalette() {
        // Get the background image file 
        let bgSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
        let pictureUri = bgSettings.get_string('picture-uri');
        let pictureFile = Gio.File.new_for_uri(pictureUri);
    
        // Load the image into a pixbuf
        let pixbuf = GdkPixbuf.Pixbuf.new_from_file(pictureFile.get_path());
        console.log('CHANNELS ', pixbuf.n_channels);
        let nChannels = pixbuf.n_channels;
    
        // Get the width and height of the image
        let width = pixbuf.get_width();
        let height = pixbuf.get_height();
        let pixelCount = width*height;
        let offset;

        if(pixelCount < 1000000)
            offset = 1;
        else
            offset = parseInt(pixelCount/1000000);

        // Get the pixel data as an array of bytes
        let pixels = pixbuf.get_pixels();
    
        let pixelArray = [];
    
        // Loop through the pixels and get the rgba values
        for (let i = 0, index, r, g, b, a; i < pixelCount; i = i + offset) {
            index = i * nChannels;
    
            // Get the red, green, blue, and alpha values
            r = pixels[index + 0];
            g = pixels[index + 1];
            b = pixels[index + 2];

            a = nChannels==4? pixels[index + 3] : undefined;

            // if (typeof a !== 'undefined' && a < 125)
            //     continue;
            // If pixel is mostly opaque and not white
            if (typeof a === 'undefined' || a >= 125) {
                if (!(r > 250 && g > 250 && b > 250)) {
                    pixelArray.push([r, g, b]);
                }
            }
            // pixelArray.push([r,g,b]);
            // log(`Pixel at (${x}, ${y}) has rgba values: (${r}, ${g}, ${b}, ${a})`);
        }
        log('pixelarray len ', pixelArray.length);
    
        // Generate color palette using Quantize ()
        const cmap = Quantize.quantize(pixelArray, 8);
        const palette = cmap? cmap.palette() : null;
    
        console.log('PALETTE ', palette);
        let i = 1;
        palette.forEach(color => {
            this._settings.set_strv('palette'+i, [String(color[0]), String(color[1]), String(color[2])]);
            i++;
        });
    }
    
    _injectToFunction(parent, name, func) {
        let origin = parent[name];
        parent[name] = function () {
          let ret;
          ret = origin.apply(this, arguments);
          if (ret === undefined) ret = func.apply(this, arguments);
          return ret;
        };
        return origin;
    }
    
    _removeInjection(object, injection, name) {
        if (injection[name] === undefined) delete object[name];
        else object[name] = injection[name];
    }

    resetStyle(panel) {
        panel.set_style(null);
        panel.remove_style_class_name('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        for(const box of panelBoxes) {
            for(const btn of box) {
                    btn.set_style(null);
                    btn.child?.set_style(null);   
                    
                    if(btn.child.constructor.name === 'ActivitiesButton') {
                        let list = btn.child.get_child_at_index(0);
                        for(const indicator of list) { 
                            let dot = indicator.get_child_at_index(0);
                            dot?.set_style(null);
                        }
                    }
            }
        }        
    }

    reloadStylesheet() {
        // Unload stylesheet
        const theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        theme.unload_stylesheet(Me.dir.get_child('stylesheet.css'));
        delete Me.stylesheet;

        // Load stylesheet
        try {
            const stylesheetFile = Me.dir.get_child('stylesheet.css');
            theme.load_stylesheet(stylesheetFile);
            Me.stylesheet = stylesheetFile;
        } catch (e) {
            console.log('Openbar: Error loading stylesheet: ');
            throw e;
        }
        
    }

    applyMenuClass(obj, add) {
        if(!obj)
            return;
        if(add) {
            if(obj.add_style_class_name)
                obj.add_style_class_name('openmenu');
        }
        else {
            if(obj.remove_style_class_name)
                obj.remove_style_class_name('openmenu');
        }
    }
    
    applyPanelStyles(panel, add) {
        this.applyMenuClass(panel, add);

        let menuChildren = panel.get_children();
        menuChildren.forEach(menuItem => {
            this.applyMenuClass(menuItem, add);
            if(menuItem.menu) {
                this.applyMenuClass(menuItem.menu.box, add);
                menuItem.menu.box.get_children().forEach(child => {
                    this.applyMenuClass(child, add);
                });
            }

            let subChildren = menuItem.get_children(); // Required for submenus, at least in Gnome 42 settings menu
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

    applyMenuStyles(panel, add) {
        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        for(const box of panelBoxes) {
            for(const btn of box) { // btn is a bin, parent of indicator button
                if(btn.child instanceof PanelMenu.Button) { // btn.child is the indicator

                    // special case for Quick Settings Audio Panel, because it changes the layout of the Quick Settings menu
                    if(btn.child.menu.constructor.name == "PanelGrid") {
                        for(const panel of btn.child.menu._get_panels()) {
                            this.applyPanelStyles(panel, add);
                        }
                    } else if(btn.child.menu.box) {
                        this.applyPanelStyles(btn.child.menu.box, add);
                    }
                    
                    if(btn.child.constructor.name === 'DateMenuButton') {
                        const bin = btn.child.menu.box.get_child_at_index(0); // CalendarArea
                        const hbox = bin.get_child_at_index(0); // hbox with left and right sections

                        const msgList = hbox.get_child_at_index(0); // left section with notifications etc
                        this.applyMenuClass(msgList, add);
                        const placeholder = msgList.get_child_at_index(0); // placeholder for 'No Notifications'
                        this.applyMenuClass(placeholder, add);
                        const msgbox = msgList.get_child_at_index(1);
                        const msgScroll = msgbox.get_child_at_index(0);
                        const sectionList = msgScroll.child;
                        const mediaSection = sectionList.get_child_at_index(0); // Media notifications (play music/video)
                        this.mediaList = mediaSection?.get_child_at_index(0); 
                        if(add && !this.mediaListId) {
                            this.mediaListId = this.mediaList?.connect('actor-added', (container, actor) => {
                                this.applyMenuClass(actor.child, add);
                            });
                        }
                        else if(!add && this.mediaListId) {
                            this.mediaList?.disconnect(this.mediaListId);
                            this.mediaListId = null;
                        }
                        this.mediaList?.get_children().forEach(media => {
                            this.applyMenuClass(media.child, add);
                        });                      

                        const notifSection = sectionList.get_child_at_index(1); // Message notifications
                        this.notifList = notifSection?.get_child_at_index(0);
                        if(add && !this.notifListId) {
                            this.notifListId = this.notifList?.connect('actor-added', (container, actor) => {
                                this.applyMenuClass(actor.child, add);
                            });
                        }
                        else if(!add && this.notifListId) {
                            this.notifList?.disconnect(this.notifListId);
                            this.notifListId = null;
                        }
                        this.notifList?.get_children().forEach(message => {
                            this.applyMenuClass(message.child, add);
                        })
                        const msgHbox = msgbox.get_child_at_index(1); // hbox at botton for dnd and clear buttons
                        const dndBtn = msgHbox.get_child_at_index(1);
                        this.applyMenuClass(dndBtn, add);
                        const clearBtn = msgHbox.get_child_at_index(2);
                        this.applyMenuClass(clearBtn, add);

                        const vbox = hbox.get_child_at_index(1); // right section vbox for calendar etc
                        vbox.get_children().forEach(item => {
                            this.applyMenuClass(item, add);
                            item.get_children().forEach(child => {
                                this.applyMenuClass(child, add);
                                child.get_children().forEach(subch => {
                                    this.applyMenuClass(subch, add);
                                })
                            });

                            if(item.constructor.name === 'Calendar') {                                    
                                this.applyCalendarGridStyle(item, add);
                                this.calendarTimeoutId = setTimeout(() => {this.applyCalendarGridStyle(item, add);}, 250);
                            }
                        });
                    }
                    
                }
            }
        }
    }

    applyCalendarGridStyle(item, add) { // calendar days grid with week numbers
        for(let i=0; i<8; i++) {
            for(let j=0; j<8; j++) {
                const child = item.layout_manager.get_child_at(i, j);
                this.applyMenuClass(child, add);
             }
        }
    }


    // updatePanelStyle(panel, actor, event) {
    //     this.updateTimeoutId = setTimeout(() => {this.updateStyle(panel, actor, event);}, 0);
    // }

    updatePanelStyle(panel, actor, key) { 
        // log('update called with key ', key);
        if(!this._settings)
            return;

        if(key.startsWith('palette'))
            return;

        if(key == 'bgpalette') { log('calling backgroundPalette()');
            this.backgroundPalette();
            return;
        }

        let overview = this._settings.get_boolean('overview');
        if(key == 'shown') { 
            if(!overview) { // Reset in overview, if overview style disabled
                this.resetStyle(panel);
                this.applyMenuStyles(panel, false);
            }
            return;           
        }
        else if(key == 'hidden') {
            this.updateTimeoutId = setTimeout(() => {
                this.updatePanelStyle(panel, actor, 'post-hidden');
            }, 10);        
        }             

        if(key == 'reloadstyle') { // A toggle key to trigger update for reload stylesheet
            this.reloadStylesheet();
        }
        
        // if('reloadstyle', 'removestyle', 'menustyle')
        let menustyle = this._settings.get_boolean('menustyle');
        this.applyMenuStyles(panel, menustyle);
            
        let menuKeys = ['reloadstyle', 'removestyle', 'menustyle', 'mfgcolor', 'mfgalpha', 'mbgcolor', 'mbgaplha', 'mbcolor', 'mbaplha', 'mhcolor', 'mhalpha', 'mscolor', 'msalpha'];
        if(menuKeys.includes(key)) {
            return;
        }
            

        // Get the settings values
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
   
    
        this.resetStyle(panel);
        panel.add_style_class_name('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        let commonStyle, panelStyle, btnStyle, btnContainerStyle, borderStyle, radiusStyle, fontStyle, islandStyle, dotStyle, neonStyle, gradientStyle, triLeftStyle, triBothStyle, triRightStyle;      

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
        panelStyle = ` background-color: rgba(${bgred},${bggreen},${bgblue},${bgalpha}) !important; height: ${height}px !important; `;
        panelStyle += radiusStyle;

        // button style for buttons only (all bar types)
        btnStyle = ` margin: none; height: ${height}px !important; `;

        // island style for buttons (only island bar type)
        islandStyle = ` background-color: rgba(${isred},${isgreen},${isblue},${isalpha}); `;
        
         // Triland style for left end btn of box (only triland bar type)
        triLeftStyle = ` border-radius: ${borderRadius}px 0px 0px ${borderRadius}px; `;
         // Triland style for single btn box (only triland bar type)
        triBothStyle = radiusStyle;
         // Triland style for right end btn of box (only triland bar type)
        triRightStyle = ` border-radius: 0px ${borderRadius}px ${borderRadius}px 0px; `;

        // Workspace dots style
        dotStyle = ` background-color: rgba(${fgred},${fggreen},${fgblue},${fgalpha}); `;

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
                    box-shadow: 0px 0px 5px -1px rgba(${bred},${bgreen},${bblue},0.55);
                `;
            }
            else { //7 3
                neonStyle = `               
                    box-shadow: 0px 0px 5px 3px rgba(${bred},${bgreen},${bblue},0.55); 
                `;
            }
        }
        else {
            neonStyle = ` `; 
        }


        // Add panel shadow if enabled. Use alpha to decide offset, blur, spread and alpha
        if (shadow) {
            if (borderRadius < radThreshold) {
                panelStyle += `
                    box-shadow: 0px ${shalpha*20}px ${2+shalpha*30}px ${2+shalpha*20}px rgba(${shred},${shgreen},${shblue}, ${shalpha}); 
                `;
            }
            else {
                panelStyle += `
                    box-shadow: 0px ${shalpha*20}px ${2+shalpha*30}px ${2+shalpha*40}px rgba(${shred},${shgreen},${shblue}, ${shalpha});
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
            }
            else {
                startColor = `rgba(${bgred},${bggreen},${bgblue},${bgalpha})`;                
            }
            endColor = `rgba(${bgred2},${bggreen2},${bgblue2},${bgalpha2})`;
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
        if(bartype == 'Islands' || bartype == 'Trilands') {
            panelStyle += ` margin: ${margin}px ${1.5*margin}px; `;            
            panel.set_style(commonStyle + panelStyle);  

            btnStyle += borderStyle + radiusStyle;

            btnContainerStyle = ` 
                padding: 0px 0px;
                margin: 0 3px;
            `;
            btnContainerStyle +=  ` border-radius: ${borderRadius+borderWidth}px; `;

            for(const box of panelBoxes) {
                for(const btn of box) {
                    if(btn.child instanceof PanelMenu.Button) {
                        btn.child.set_style(commonStyle + btnStyle + islandStyle + gradientStyle);
                        
                        if(btn.child.visible) {
                            btn.set_style(btnContainerStyle + neonStyle);
                        }

                        if(btn.child.constructor.name === 'ActivitiesButton') {
                            let list = btn.child.get_child_at_index(0);
                            for(const indicator of list) { 
                                let dot = indicator.get_child_at_index(0);
                                dot?.set_style(dotStyle);
                            }
                            
                        }
                        
                        if(bartype == 'Trilands') {
                            if(btn == box.first_child && btn == box.last_child)
                                btn.child.style += triBothStyle;
                            else if(btn == box.first_child)
                                btn.child.style += triLeftStyle;
                            else if(btn == box.last_child)
                                btn.child.style += triRightStyle;
                            else
                                btn.child.style += ` border-radius: 0px; `;
                        }
                        
                    }
                    
                }
            }
           
        }
        else {

            // Apply the style to the panel
            panel.set_style(commonStyle + panelStyle + borderStyle + gradientStyle + neonStyle);

            btnStyle += ` border-radius: ${Math.max(borderRadius, 5)}px; border-width: 0px;  `;

            btnContainerStyle = ` 
                padding: ${borderWidth}px ${borderWidth}px;
                margin: 0 0px;
            `;
            btnContainerStyle += ` border-radius: ${borderRadius+borderWidth}px; `;
            
            for(const box of panelBoxes) {
                for(const btn of box) {
                    if(btn.child instanceof PanelMenu.Button) { 
                        
                        btn.child.set_style(commonStyle + btnStyle);
          
                        if(btn.child.visible) {
                            btn.set_style(btnContainerStyle);
                        }

                        if(btn.child.constructor.name === 'ActivitiesButton') {
                            let list = btn.child.get_child_at_index(0);
                            for(const indicator of list) { 
                                let dot = indicator.get_child_at_index(0);
                                dot?.set_style(dotStyle);
                            }
                        }

                    }
                }
            }

        }

    }

    // listen for addition of new panels
    // this allow theming QSAP panels when QSAP is enabled after Open Bar
    setupLibpanel(menu, panel) {
        if(menu.constructor.name != 'PanelGrid')
            return;

        for(const panelColumn of menu.box.get_children()) {
            this._connections.connect(panelColumn, 'actor-added', this.updatePanelStyle.bind(this, panel));
        }
        this._connections.connect(menu.box, 'actor-added', (panelColumn) => {
            this._connections.connect(panelColumn, 'actor-added', this.updatePanelStyle.bind(this, panel));
        });
    }
    
    // ToDo: 
    // Debug 'length property isn't a number' warning

    enable() {
        
        const [major, minor] = Config.PACKAGE_VERSION.split('.').map(s => Number(s));
        this.gnomeVersion = major;

        this._settings = ExtensionUtils.getSettings(); 

        // Get the top panel
        let panel = Main.panel;

        // Connect to the settings changes
        this._settings.connect('changed', (settings, key) => {
            this.updatePanelStyle(panel, settings, key);
        });

        let connections = [
            [ Main.overview, 'hidden', this.updatePanelStyle.bind(this, panel) ],
            [ Main.overview, 'shown', this.updatePanelStyle.bind(this, panel) ],
            [ Main.sessionMode, 'updated', this.updatePanelStyle.bind(this, panel) ],
            [ panel._leftBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
            [ panel._centerBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
            [ panel._rightBox, 'actor-added', this.updatePanelStyle.bind(this, panel) ],
        ];
        if(this.gnomeVersion > 42) {
            let qSettings = Main.panel.statusArea.quickSettings;
            connections.push( [qSettings, 'menu-set', this.setupLibpanel.bind(this, qSettings.menu, panel)] );
        }
        this._connections = new ConnectManager(connections);

        const obar = this;
        this._injections["_rebuildCalendar"] = this._injectToFunction(
            Calendar.Calendar.prototype,
            "_rebuildCalendar",
            function () {
                let menustyle = obar._settings.get_boolean('menustyle');
                let overview = obar._settings.get_boolean('overview');
                if(menustyle) {  
                    if(overview || !Main.panel.has_style_pseudo_class('overview'))
                        obar.applyCalendarGridStyle(this, menustyle);            
                }
            }
        );       

        // Setup connections for QSAP extension panels
        if(this.gnomeVersion > 42)
            this.setupLibpanel(Main.panel.statusArea.quickSettings.menu, panel);
        
        // Apply the initial style
        this.updatePanelStyle(panel, null, 'enabled');

        //backgroundPalette();
    }

    disable() {
        // Get the top panel
        let panel = Main.panel;

        // Reset the style and disconnect onEvents and offEvents
        this.resetStyle(panel);
        this.applyMenuStyles(panel, false);

        this._settings = null;

        this._connections.disconnectAll();
        this._connections = null;

        const timeouts = [this.calendarTimeoutId, this.updateTimeoutId];
        timeouts.forEach(timeoutId => {
            if(timeoutId)
                clearTimeout(timeoutId);
            timeoutId = null;
        });

        if(this.mediaListId) {
            this.mediaList?.disconnect(this.mediaListId);
            this.mediaListId = null;
        }
        if(this.notifListId) {
            this.notifList?.disconnect(this.notifListId);
            this.notifListId = null;
        }

        this._removeInjection(Calendar.Calendar.prototype, this._injections, "_rebuildCalendar");
        this._injections = [];

    }
    
}

function init() {
    return new Extension();
}
 

