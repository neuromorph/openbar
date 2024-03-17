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

import St from 'gi://St';
import Gio from 'gi://Gio';
import GdkPixbuf from 'gi://GdkPixbuf';
import Meta from 'gi://Meta';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Calendar from 'resource:///org/gnome/shell/ui/calendar.js';
import * as LayoutManager from 'resource:///org/gnome/shell/ui/layout.js';
import * as Config from 'resource:///org/gnome/shell/misc/config.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Quantize from './quantize.js';
import * as AutoThemes from './autothemes.js';
import * as StyleSheets from './stylesheets.js';

// ConnectManager class to manage connections for events to trigger Openbar style updates
// This class is modified from Floating Panel extension (Thanks Aylur!)
class ConnectManager{
    constructor(list = []){
        this.connections = [];

        list.forEach(c => {
            let [obj, signal, callback, callback_param] = c;
            this.connect(obj, signal, callback, callback_param);
        });
    }

    connect(obj, signal, callback, callback_param){
        this.connections.push({
            id : obj.connect(signal, (object, signal_param) => {callback(object, signal, signal_param, callback_param)}),
            obj: obj,
            sig: signal
        });
        // Remove obj on destroy except following that don't have destroy signal
        if(!(obj instanceof Gio.Settings || obj instanceof LayoutManager.LayoutManager || obj instanceof Meta.WorkspaceManager | obj instanceof Meta.Display)) {
            obj.connect('destroy', () => {
                this.removeObject(obj)
            });
        }
    }

    // remove an object WITHOUT disconnecting it, use only when you know the object is destroyed
    removeObject(object){
        this.connections = this.connections.filter(({id, obj, sig}) => obj != object);
    }
    
    disconnect(object, signal){
        let disconnections = this.connections.filter(({id, obj, sig}) => obj == object && sig == signal);
        disconnections.forEach(c => {
            c.obj.disconnect(c.id);
        });
        this.connections = this.connections.filter(({id, obj, sig}) => obj != object || sig != signal);
    }

    disconnectAll(){
        this.connections.forEach(c => {
            c.obj.disconnect(c.id);
        })
    }
}


// Openbar Extension main class
export default class Openbar extends Extension {
    constructor(metadata) {
        super(metadata);
        this._settings = null;
        this._bgSettings = null;
        this._intSettings = null;
        this._connections = null;
        this._injections = [];
    }

    backgroundPalette() {
        // Get the latest background image file (from picture-uri Or picture-uri-dark)
        let pictureUri = this._settings.get_string('bguri');
        let pictureFile = Gio.File.new_for_uri(pictureUri);
    
        // Load the image into a pixbuf
        let pixbuf = GdkPixbuf.Pixbuf.new_from_file(pictureFile.get_path());
        let nChannels = pixbuf.n_channels;
    
        // Get the width, height and pixel count of the image
        let width = pixbuf.get_width();
        let height = pixbuf.get_height();
        let pixelCount = width*height;
        let offset;

        // Sample about a million pixels to quantize
        if(pixelCount <= 1000000)
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
            r = pixels[index];
            g = pixels[index + 1];
            b = pixels[index + 2];

            a = nChannels==4? pixels[index + 3] : undefined;

            // Save pixles that are not transparent and not full white/black
            if (typeof a === 'undefined' || a >= 125) {
                if (!(r > 250 && g > 250 && b > 250) && !(r < 5 && g < 5 && b < 5)) {
                    pixelArray.push([r, g, b]);
                }
            }
        }
        // console.log('pixelCount, pixelarray len ', pixelCount, pixelArray.length);
    
        // Generate color palette of 6 colors using Quantize to get prominant colors
        const cmap6 = Quantize.quantize(pixelArray, 6);
        const palette6 = cmap6? cmap6.palette() : null;

        let i = 1;
        palette6?.forEach(color => {
            this._settings.set_strv('prominent'+i, [String(color[0]), String(color[1]), String(color[2])]);
            i++;
        });

        // Generate color palette of 12 colors using Quantize to possibly get all colors for color-button
        const cmap12 = Quantize.quantize(pixelArray, 12);
        const palette12 = cmap12? cmap12.palette() : null;
    
        i = 1;
        palette12?.forEach(color => {
            this._settings.set_strv('palette'+i, [String(color[0]), String(color[1]), String(color[2])]);
            i++;
        });

        // Toggle setting 'bg-change' to indicate background change
        let bgchange = this._settings.get_boolean('bg-change');
        if(bgchange)
            this._settings.set_boolean('bg-change', false);
        else
            this._settings.set_boolean('bg-change', true);

        // Apply auto theme for new background palette if auto-refresh enabled and theme-variation set
        const theme = this._settings.get_string('autotheme');
        const variation = this._settings.get_string('variation');
        const autoRefresh = this._settings.get_boolean('autotheme-refresh')
        if(autoRefresh && theme != 'Select Theme' && variation != 'Select Variation')
            AutoThemes.autoApplyBGPalette(this);
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
        Main.layoutManager.panelBox.remove_style_class_name('openbar');
        panel.remove_style_class_name('openbar');

        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        for(const box of panelBoxes) {
            for(const btn of box) {
                    btn.set_style(null);
                    btn.remove_style_class_name('openbar');
                    btn.child?.set_style(null);
                    btn.child?.remove_style_class_name('openbar'); 

                    for(let j=1; j<=8; j++)
                        btn.child?.remove_style_class_name('candy'+j);

                    btn.child?.remove_style_class_name('trilands');

                    if(btn.child?.constructor.name === 'ActivitiesButton') {
                        let list = btn.child.get_child_at_index(0);
                        for(const indicator of list) { 
                            let dot = indicator.get_child_at_index(0);
                            dot?.set_style(null);
                            dot?.remove_style_class_name('openbar');
                        }
                    }     
            }
        }        
    }

    reloadStylesheet() {
        // Unload stylesheet
        this.unloadStylesheet();

        // Load stylesheet
        this.loadStylesheet();           
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

    applyBoxStyles(box, add) {
        this.applyMenuClass(box, add);

        let menuChildren = box.get_children();
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
                if(btn.child instanceof PanelMenu.Button || btn.child instanceof PanelMenu.ButtonBox) { // btn.child is the indicator

                    // box pointer case, to update -arrow-rise for bottom panel
                    if(btn.child.menu?._boxPointer) {
                        this.applyMenuClass(btn.child.menu._boxPointer, add);
                    }

                    // special case for Quick Settings Audio Panel, because it changes the layout of the Quick Settings menu
                    if(btn.child.menu?.constructor.name == "PanelGrid") {
                        for(const panel of btn.child.menu._get_panels()) {
                            this.applyBoxStyles(panel, add);
                        }
                    } 
                    // general case
                    else if(btn.child.menu?.box) {
                        this.applyBoxStyles(btn.child.menu.box, add);
                    }

                    // special case for Arc Menu, because it removes default menu and creates its own menu
                    if(btn.child.constructor.name === 'ArcMenuMenuButton') {
                        let menu = btn.child.arcMenu;
                        this.applyMenuClass(menu, add);
                        if(menu.box)
                            this.applyBoxStyles(menu.box, add);

                        let ctxMenu = btn.child.arcMenuContextMenu;
                        this.applyMenuClass(ctxMenu, add);
                        if(ctxMenu.box)
                            this.applyBoxStyles(ctxMenu.box, add);
                    }

                    // DateMenu: Notifications (messages and media), DND and Clear buttons
                    //           Calendar Grid, Events, World Clock, Weather
                    if(btn.child.constructor.name === 'DateMenuButton') {
                        const bin = btn.child.menu.box.get_child_at_index(0); // CalendarArea 
                        const hbox = bin.get_child_at_index(0); // hbox with left and right sections

                        const msgList = hbox.get_child_at_index(0); // Left Pane/Section with notifications etc
                        this.applyMenuClass(msgList, add);
                        const placeholder = msgList.get_child_at_index(0); // placeholder for 'No Notifications'
                        this.applyMenuClass(placeholder, add);
                        const msgbox = msgList.get_child_at_index(1);
                        const msgScroll = msgbox.get_child_at_index(0);
                        const sectionList = msgScroll.child;
                        const mediaSection = sectionList.get_child_at_index(0); // Media notifications (play music/video)
                        this.mediaList = mediaSection?.get_child_at_index(0); 
                        if(add && !this.mediaListId) {
                            this.mediaListId = this.mediaList?.connect(this.addedSignal, (container, actor) => {
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
                            this.notifListId = this.notifList?.connect(this.addedSignal, (container, actor) => {
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
                        const toggleSwitch = dndBtn.get_child_at_index(0);
                        this.applyMenuClass(toggleSwitch, add);
                        const clearBtn = msgHbox.get_child_at_index(2);
                        this.applyMenuClass(clearBtn, add);

                        const vbox = hbox.get_child_at_index(1); // Right Pane/Section vbox for calendar etc
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

    setPanelBoxPosition(position, height, margin, borderWidth, bartype) {
        let pMonitor = Main.layoutManager.primaryMonitor;
        let panelBox = Main.layoutManager.panelBox; 
        if(position == 'Top') {       
            let topX = pMonitor.x;
            let topY = pMonitor.y;
            panelBox.set_position(topX, topY);
            panelBox.set_size(pMonitor.width, -1);        
        }
        else if(position == 'Bottom') {
            margin = (bartype == 'Mainland')? 0: margin;
            borderWidth = (bartype == 'Trilands' || bartype == 'Islands')? 0: borderWidth;
            let bottomX = pMonitor.x;
            let bottomY = pMonitor.y + pMonitor.height - height - 2*borderWidth - 2*margin;
            panelBox.set_position(bottomX, bottomY);
            panelBox.set_size(pMonitor.width, height + 2*borderWidth + 2*margin);
        }
        
    }

    updatePanelStyle(obj, key, sig_param, callbk_param) { 
        // console.log('update called with ', key, sig_param, callbk_param);

        let panel = Main.panel;

        if(!this._settings)
            return;

        if(key.startsWith('palette') || key.startsWith('prominent'))
            return;

        // Generate background color palette
        if(key == 'bgpalette' || key == 'bguri') {
            const importExport = this._settings.get_boolean('import-export');
            if(!importExport) {
                if(key == 'bgpalette')
                    this.updateBguri();
                this.backgroundPalette();
            }
            return;
        }

        if(key == 'wmaxbar') {
            this.onWindowMaxBar();
            return;
        }
        if(key == 'cust-margin-wmax') {
            this.setWindowMaxBar('cust-margin-wmax');
            return;
        }

        if(key == 'trigger-autotheme') {
            AutoThemes.autoApplyBGPalette(this);
            return;
        }

        if(key == 'trigger-reload') {
            StyleSheets.reloadStyle(this, this);
            return;
        }

        let bartype = this._settings.get_string('bartype');
        // Update triland classes if actor (panel button) removed in triland mode else return
        if(key == this.removedSignal && bartype != 'Trilands')
            return;

        let position = this._settings.get_string('position');
        let setOverview = this._settings.get_boolean('set-overview');
        if(key == 'showing') { 
            if(!setOverview) { // Reset in overview, if 'overview' style disabled
                this.resetStyle(panel);
                this.applyMenuStyles(panel, false);
                this.setPanelBoxPosition(position, panel.height, 0, 0, 'Mainland');
            }
            else if(this.isObarReset) { // Overview style is enabled but obar is reset due to Fullscreen
                this.loadStylesheet();
                this.isObarReset = false;
            }
            return;           
        }
        else if(key == 'hiding') {
            this.onFullScreen(null, 'hiding')
            // Continue to update style     
        }            

        if(key == 'reloadstyle') { // A toggle key to trigger update for reload stylesheet
            this.reloadStylesheet();
        }
        
        let menustyle = this._settings.get_boolean('menustyle');
        if(['reloadstyle', 'removestyle', 'menustyle'].includes(key) ||
            key == this.addedSignal && callbk_param != 'message-banner' ||
            key == 'hiding' && !setOverview) {
            this.applyMenuStyles(panel, menustyle);
        }
        
        if(key == 'mscolor')
            this.msSVG = true;
        else if(key == 'mbgcolor' || key == 'smbgcolor' || key == 'smbgoverride')
            this.bgSVG = true;

        let menuKeys = ['trigger-reload', 'reloadstyle', 'removestyle', 'menustyle', 'mfgcolor', 'mfgalpha', 'mbgcolor', 'mbgaplha', 'mbcolor', 'mbaplha', 
        'mhcolor', 'mhalpha', 'mscolor', 'msalpha', 'mshcolor', 'mshalpha', 'smbgoverride', 'smbgcolor', 'qtoggle-radius', 'slider-height', 'mbg-gradient'];
        let barKeys = ['bgcolor', 'gradient', 'gradient-direction', 'bgcolor2', 'bgalpha', 'bgalpha2', 'fgcolor', 'fgalpha', 'bcolor', 'balpha', 'bradius', 
        'bordertype', 'shcolor', 'shalpha', 'iscolor', 'isalpha', 'neon', 'shadow', 'font', 'default-font', 'hcolor', 'halpha', 'heffect', 'bgcolor-wmax', 
        'bgalpha-wmax', 'neon-wmax', 'boxcolor', 'boxalpha', 'autofg-bar', 'autofg-menu', 'width-top', 'width-bottom', 'width-left', 'width-right',
        'radius-topleft', 'radius-topright', 'radius-bottomleft', 'radius-bottomright'];
        let keys = [...barKeys, ...menuKeys, 'autotheme', 'variation', 'autotheme-refresh', 'accent-override', 'accent-color'];
        if(keys.includes(key)) {
            return;
        }    

        // console.log('going ahead update with key: ', key);

        let borderWidth = this._settings.get_double('bwidth');
        let height = this._settings.get_double('height');
        let margin = this._settings.get_double('margin'); 
    
        // this.resetStyle(panel);
        Main.layoutManager.panelBox.add_style_class_name('openbar');
        panel.add_style_class_name('openbar');

        if(position == 'Bottom' || key == 'position' || key == 'monitors-changed') {
            this.setPanelBoxPosition(position, height, margin, borderWidth, bartype);
        }

        if(key == 'monitors-changed')
            this.connectPrimaryBGChanged();

        let setNotifications = this._settings.get_boolean('set-notifications');
        let notifKeys = ['set-notifications', 'position', 'monitors-changed', 'updated', 'enabled'];
        if(notifKeys.includes(key)) {
            if(setNotifications && position == 'Bottom')
                Main.messageTray._bannerBin.y_align = Clutter.ActorAlign.END;
            else
                Main.messageTray._bannerBin.y_align = Clutter.ActorAlign.START;
        }
        if(key == this.addedSignal && callbk_param == 'message-banner' && setNotifications) {
            Main.messageTray._banner?.add_style_class_name('openmenu');
        }

        const candybar = this._settings.get_boolean('candybar');
        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        let i = 0;
        for(const box of panelBoxes) {
            for(const btn of box) {
                // Screen recording/share indicators use ButtonBox instead of Button
                if(btn.child instanceof PanelMenu.Button || btn.child instanceof PanelMenu.ButtonBox) {
                    btn.child.add_style_class_name('openbar');

                    if(btn.child.visible) {
                        btn.add_style_class_name('openbar button-container');

                        // Add candybar classes if enabled else remove them
                        for(let j=1; j<=8; j++)
                            btn.child.remove_style_class_name('candy'+j);
                        i++; i = i%8; i = i==0? 8: i; // Cycle through candybar palette
                        if(candybar) {
                            btn.child.add_style_class_name('candy'+i);
                        }
                    }

                    // Workspace dots
                    if(btn.child.constructor.name === 'ActivitiesButton') {
                        let list = btn.child.get_child_at_index(0);
                        for(const indicator of list) { 
                            let dot = indicator.get_child_at_index(0);
                            dot?.add_style_class_name('openbar');
                        }                        
                    }
                    
                    // Add trilands pseudo/classes if enabled else remove them
                    // if(btn.child.has_style_class_name('trilands'))
                    //     btn.child.remove_style_class_name('trilands');
                    if(bartype == 'Trilands') {
                        btn.child.add_style_class_name('trilands');

                        if(btn == box.first_child && btn == box.last_child)
                            btn.child.add_style_pseudo_class('one-child');
                        else
                            btn.child.remove_style_pseudo_class('one-child');
                        
                        if(btn == box.first_child && btn != box.last_child)
                            btn.child.add_style_pseudo_class('left-child');
                        else
                            btn.child.remove_style_pseudo_class('left-child');
                            
                        if(btn != box.first_child && btn == box.last_child)
                            btn.child.add_style_pseudo_class('right-child');
                        else
                            btn.child.remove_style_pseudo_class('right-child');
                        
                        if(btn != box.first_child && btn != box.last_child)
                            btn.child.add_style_pseudo_class('mid-child');
                        else
                            btn.child.remove_style_pseudo_class('mid-child');
                    }
                    else
                        btn.child.remove_style_class_name('trilands'); 
                }                
            }
        }

    }

    // QSAP: listen for addition of new panels
    // this allows theming QSAP panels when QSAP is enabled after Open Bar
    setupLibpanel(obj, signal, sig_param, menu) {
        if(menu.constructor.name != 'PanelGrid')
            return;

        for(const panelColumn of menu.box.get_children()) {
            this._connections.connect(panelColumn, this.addedSignal, this.updatePanelStyle.bind(this));
        }
        this._connections.connect(menu.box, this.addedSignal, (obj, signal, panelColumn, callbk_param) => {
            this._connections.connect(panelColumn, this.addedSignal, this.updatePanelStyle.bind(this));
        });
    }
    
    setPanelBoxPosWindowMax(wmax, signal) {
        // Need to set panelBox position since bar margins/height can change with WMax
        const position = this._settings.get_string('position');
        if(position == 'Bottom') {
            if(this.position == position && this.wmax == wmax && signal != 'cust-margin-wmax')
                return;
            const bartype = this._settings.get_string('bartype');
            const borderWidth = this._settings.get_double('bwidth');
            const custMarginWmax = this._settings.get_boolean('cust-margin-wmax');
            const marginWMax = this._settings.get_double('margin-wmax');
            let margin = this._settings.get_double('margin');
            let height = this._settings.get_double('height');            
            if(wmax) {
                margin = custMarginWmax? marginWMax: margin;
            }
            this.setPanelBoxPosition(position, height, margin, borderWidth, bartype); 
            this.wmax = wmax;
            this.position = position;
        }
        else if(position == 'Top') {
            if(this.position == position)
                return;
            this.setPanelBoxPosition(position); 
            this.position = position;
        }
    }

    setWindowMaxBar(signal) {
        if(!this._settings)
            return;                 
        const wmaxbar = this._settings.get_boolean('wmaxbar');
        if(!wmaxbar) {
            Main.panel.remove_style_pseudo_class('windowmax');
            return;
        }
        
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows().filter(window =>
            window.get_monitor() == Main.layoutManager.primaryMonitor.index
            && window.showing_on_its_workspace()
            && !window.is_hidden()
            && window.get_window_type() !== Meta.WindowType.DESKTOP
            // exclude Desktop Icons NG
            && window.get_gtk_application_id() !== "com.rastersoft.ding"
            && (window.maximized_horizontally 
                || window.maximized_vertically) 
        );

        if(windows.length) {
            Main.panel.add_style_pseudo_class('windowmax');
            this.setPanelBoxPosWindowMax(true, signal);
        }
        else {
            Main.panel.remove_style_pseudo_class('windowmax');
            this.setPanelBoxPosWindowMax(false, signal);
        }
    }

    onWindowAdded(obj, signal, windowActor){
        if(windowActor) {
            this._windowSignals.set(windowActor, [
                windowActor.connect('notify::visible', () => this.setWindowMaxBar('notify-visible') ),
            ]);
        
            if(windowActor.meta_window) {
                this._windowSignals.set(windowActor.meta_window, [
                    windowActor.meta_window.connect('notify::minimized', () => this.setWindowMaxBar('minimized') ),
                    windowActor.meta_window.connect('size-changed', () => this.setWindowMaxBar('size-changed') ),
                    windowActor.meta_window.connect('shown', () => this.setWindowMaxBar('shown') ),
                ]);
            }
        }
        this.setWindowMaxBar(this.addedSignal);
    }

    onWindowRemoved(obj, signal, windowActor){
        let winSigActors = [windowActor, windowActor.meta_window];
        for(const winSigActor of winSigActors) {
            if(winSigActor) {
                let windowSignals = this._windowSignals.get(winSigActor);
                if(windowSignals) {
                    for (const id of windowSignals){
                            winSigActor.disconnect(id);
                    }
                    this._windowSignals.delete(winSigActor);
                }
            }
        }
        this.setWindowMaxBar(this.removedSignal);
    }

    onWindowMaxBar() {
        let wmaxbar = this._settings.get_boolean('wmaxbar');
        if(wmaxbar) {
            this._windowSignals = new Map();
            for(const window of global.get_window_actors()){
                this.onWindowAdded(null, 'enabled', window);
            }
            this._connections.connect(global.window_group, this.addedSignal, this.onWindowAdded.bind(this));
            this._connections.connect(global.window_group, this.removedSignal, this.onWindowRemoved.bind(this));
        }
        else {
            this._connections.disconnect(global.window_group, this.addedSignal);
            this._connections.disconnect(global.window_group, this.removedSignal);
            this.disconnectWindowSignals();
            Main.panel.remove_style_pseudo_class('windowmax');
            this.setPanelBoxPosWindowMax(false);
        }
    }

    disconnectWindowSignals() {
        if(this._windowSignals) {
            for(const [windowActor, ids] of this._windowSignals) {
                for(const id of ids) {
                    windowActor.disconnect(id);
                }
            }
        }
        this._windowSignals = null;
    }

    unloadStylesheet() {
        const theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        const stylesheetFile = this.dir.get_child('stylesheet.css');
        try { 
            theme.unload_stylesheet(stylesheetFile); 
            delete this.stylesheet;
        } catch (e) {
            console.log('Openbar: Error unloading stylesheet: ');
            throw e;
        }
    }

    loadStylesheet() {
        const theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
        const stylesheetFile = this.dir.get_child('stylesheet.css');
        try {
            theme.load_stylesheet(stylesheetFile);
            this.stylesheet = stylesheetFile;
        } catch (e) {
            console.log('Openbar: Error loading stylesheet: ');
            throw e;
        }
        
    }

    onFullScreen(obj, signal, sig_param) {
        const pMonitorIdx = Main.layoutManager.primaryIndex;        
        if(global.display.get_monitor_in_fullscreen(pMonitorIdx)) {
            this.unloadStylesheet();
            this.isObarReset = true;
        }
        else if(this.isObarReset) {
            this.loadStylesheet();                
            this.isObarReset = false;            
        }
    }

    updateBguri(obj, signal) {
        const colorScheme = this._intSettings.get_string('color-scheme');
        let bguriOld = this._settings.get_string('bguri');
        let bguriNew;
        if(colorScheme == 'prefer-dark')
            bguriNew = this._bgSettings.get_string('picture-uri-dark');
        else
            bguriNew = this._bgSettings.get_string('picture-uri');

        // Gnome45+: if bgnd changed with right click on image file, 
        // filepath (bguri) remains same, so manually call updatePanelStyle
        if(bguriOld == bguriNew)
            this.updatePanelStyle(this._settings, 'bguri');
        else
            this._settings.set_string('bguri', bguriNew);
    }

    connectPrimaryBGChanged() {
        const pMonitorIdx = Main.layoutManager.primaryIndex;
        this._connections.connect(Main.layoutManager._bgManagers[pMonitorIdx], 'changed', this.updateBguri.bind(this));
    }

    enable() {
        // Get Gnome version
        const [major, minor] = Config.PACKAGE_VERSION.split('.').map(s => Number(s));
        this.gnomeVersion = major;

        // Get the top panel
        let panel = Main.panel;

        this.msSVG = false;
        this.bgSVG = false;
        this.position = null;
        this.wmax = null;
        this.isObarReset = false;
        this.addedSignal = this.gnomeVersion > 45? 'child-added': 'actor-added';
        this.removedSignal = this.gnomeVersion > 45? 'child-removed': 'actor-removed';

         // Settings for desktop background image (set bg-uri as per color scheme)
         this._bgSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
         this._intSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });

        this._settings = this.getSettings(); 
        // Connect to the settings changes
        this._settings.connect('changed', (settings, key) => {
            this.updatePanelStyle(settings, key);
        });

        let connections = [
            [ Main.overview, 'hiding', this.updatePanelStyle.bind(this) ],
            [ Main.overview, 'showing', this.updatePanelStyle.bind(this) ],
            [ Main.sessionMode, 'updated', this.updatePanelStyle.bind(this) ],
            [ Main.layoutManager, 'monitors-changed', this.updatePanelStyle.bind(this) ],
            [ Main.messageTray._bannerBin, this.addedSignal, this.updatePanelStyle.bind(this), 'message-banner' ],
            [ global.display, 'in-fullscreen-changed', this.onFullScreen.bind(this)],
        ];
        // Connections for actor-added/removed OR child-added/removed as per Gnome version
        const panelBoxes = [panel._leftBox, panel._centerBox, panel._rightBox];
        for(const panelBox of panelBoxes) {
            connections.push([panelBox, this.addedSignal, this.updatePanelStyle.bind(this)]);
            connections.push([panelBox, this.removedSignal, this.updatePanelStyle.bind(this)]);
        } 
        // Connection specific to QSAP extension (Quick Settings)
        if(this.gnomeVersion > 42) {
            let qSettings = Main.panel.statusArea.quickSettings;
            connections.push( [qSettings, 'menu-set', this.setupLibpanel.bind(this), qSettings.menu] );
        }
        // Connection specific to Workspace indicator dots
        if(this.gnomeVersion > 44) {
            connections.push([global.workspace_manager, 'notify::n-workspaces', this.updatePanelStyle.bind(this)]);
        }

        // Setup all connections
        this._connections = new ConnectManager(connections);
        
        // Setup connections for addition of new QSAP extension panels
        if(this.gnomeVersion > 42)
            this.setupLibpanel(null, 'enabled', null, Main.panel.statusArea.quickSettings.menu);

        // Connect to background manager (give time for it to be available)
        this.bgMgrTimeOutId = setTimeout(() => {
            this.connectPrimaryBGChanged();
        }, 2000);
        // Set initial bguri as per color-scheme
        const bguri = this._settings.get_string('bguri');
        if(bguri == '') this.updateBguri();        

        // Update calendar style on Calendar rebuild through fn injection
        const obar = this;
        this._injections["_rebuildCalendar"] = this._injectToFunction(
            Calendar.Calendar.prototype,
            "_rebuildCalendar",
            function () {
                let menustyle = obar._settings.get_boolean('menustyle');
                let setOverview = obar._settings.get_boolean('set-overview');
                if(menustyle) {  
                    if(setOverview || !Main.panel.has_style_pseudo_class('overview'))
                        obar.applyCalendarGridStyle(this, menustyle);            
                }
            }
        );

        // Apply the initial style
        this.updatePanelStyle(null, 'enabled');
        let menustyle = this._settings.get_boolean('menustyle');
        this.applyMenuStyles(panel, menustyle);

        // Cause stylesheet to save and reload on Enable
        StyleSheets.reloadStyle(this, this);

        // Set initial Window Max Bar
        this.onWindowMaxBar();

        // Set fullscreen mode if in Fullscreen when extension is enabled
        this.onFullScreen(null, 'enabled', null); 
    }

    disable() {
        // Get the top panel
        let panel = Main.panel;

        this._connections.disconnectAll();
        this._connections = null;
        
        this.disconnectWindowSignals();

        if(this.calendarTimeoutId) {
            clearTimeout(this.calendarTimeoutId);
            this.calendarTimeoutId = null;
        }
        if(this.panelPosTimeoutId) {
            clearTimeout(this.panelPosTimeoutId);
            this.panelPosTimeoutId = null;
        }

        if(this.bgMgrTimeOutId) {
            clearTimeout(this.bgMgrTimeOutId);
            this.bgMgrTimeOutId = null;
        }

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

        // Reset the style for Panel and Menus
        this.resetStyle(panel);
        this.applyMenuStyles(panel, false);
        // Reset panel position to Top
        this.setPanelBoxPosition('Top');
        Main.messageTray._bannerBin.y_align = Clutter.ActorAlign.START;

        this._settings = null;
        this._bgSettings = null;
        this._intSettings = null;
    }
    
}

 
