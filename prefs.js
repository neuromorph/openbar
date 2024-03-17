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
// import Pango from 'gi://Pango';
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

    // Trigger creation and application of auto-theme from background
    triggerAutoTheme() {
        // Cause autotheme to apply by toggling 'trigger-autotheme'
        let triggerAutoTheme = this._settings.get_boolean('trigger-autotheme');
        if(triggerAutoTheme)
            this._settings.set_boolean('trigger-autotheme', false);
        else
            this._settings.set_boolean('trigger-autotheme', true);
    }

    // Cause stylesheet to save and reload by toggling 'trigger-reload'
    triggerStyleReload() {        
        let triggerReload = this._settings.get_boolean('trigger-reload');
        if(triggerReload)
            this._settings.set_boolean('trigger-reload', false);
        else
            this._settings.set_boolean('trigger-reload', true);
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

    createToggleButton(label, tooltip_text='') {
        let toggleBtn = new Gtk.ToggleButton({
            label: label,
            sensitive: true,
            tooltip_text: tooltip_text,
            halign: Gtk.Align.END,
            valign: Gtk.Align.CENTER,
        });    
        // toggleBtn.connect('toggled', () => {this.setTimeoutStyleReload();});
        return toggleBtn;
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
        const importExport = this._settings.get_boolean('import-export');
        if(importExport)
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

    fillOpenbarPrefs(window, openbar) {

        window.set_title(_("Open Bar 🍹"));
        window.default_height = 800;
        window.default_width = 700;

        window.paletteButtons = [];
        window.colorButtons = [];

        this.openbar = openbar;
        
        // Get the settings object
        this._settings = openbar.getSettings();
        // Connect settings to update/save/reload stylesheet
        let settEvents = ['bartype', 'position', 'font', 'gradient', 'cust-margin-wmax', 'border-wmax', 'neon-wmax',
        'gradient-direction', 'shadow', 'neon', 'heffect', 'smbgoverride', 'mbg-gradient', 'autofg-bar', 'autofg-menu',
        'width-top', 'width-bottom', 'width-left', 'width-right', 'radius-topleft', 'radius-topright',
        'radius-bottomleft', 'radius-bottomright'];
        settEvents.forEach(event => {
            this._settings.connect('changed::'+event, () => {this.triggerStyleReload();});
        });

        // Update palette on background change
        this._settings.connect('changed::bg-change', () => {
            this.updatePalette(window, false);
        });

        // Refresh auto-theme on accent-override switch change, if auto-theme set
        this._settings.connect('changed::accent-override', () => {
            let theme = this._settings.get_string('autotheme');
            let variation = this._settings.get_string('variation');
            if(theme == 'Select Theme' || variation == 'Select Variation')
                return;
            setTimeout(() => {                
                this.triggerAutoTheme();
            }, 200);
        });

        this.timeoutId = null;

        ////////////////////////////////////////////////////////////
        // PREFERENCES UI                                         //
        ////////////////////////////////////////////////////////////

        // Create the Settings page
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
            file: this.openbar.path + "/media/openbar.png",
            vexpand: false,
            hexpand: false,
            pixel_size: 100,
            margin_bottom: 15,
            halign: Gtk.Align.END,
        });
        prefsWidget.attach(aboutImage, 2, rowNo, 1, 1);

        // Add a title label
        let titleLabel = new Gtk.Label({
            label: `<span size="large"><b>Top Bar Customization</b></span>\n\n<span underline="none" color="#edad40"><b>${_('Version:')} ${this.openbar.metadata.version}  |  <a href="${this.openbar.metadata.url}">Home</a>  |  © <a href="https://extensions.gnome.org/accounts/profile/neuromorph">neuromorph</a>  |  <a href="${this.openbar.metadata.url}">☆ Star</a>  |  <a href="https://www.buymeacoffee.com/neuromorph"> ☕      </a></b></span>`,
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
            this.triggerAutoTheme();
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

        // Add a WMax custom margin enable switch
        let wmaxCustMarginLabel = new Gtk.Label({
            label: 'Customize margins?',
            halign: Gtk.Align.START,
        });
        bargridwmax.attach(wmaxCustMarginLabel, 1, rowbar, 1, 1);

        let wmaxCustMarginSwitch = this.createSwitchWidget();
        bargridwmax.attach(wmaxCustMarginSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a wmax bar margin scale
        let wmaxmarginLabel = new Gtk.Label({
            label: 'Custom Margins (WMax)',
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

        // Add an Auto FG color switch for Bar
        let autofgBarLabel = new Gtk.Label({
            label: 'Auto FG Color',
            halign: Gtk.Align.START,
        });
        fggrid.attach(autofgBarLabel, 1, rowbar, 1, 1);

        let autofgBarSwitch = this.createSwitchWidget('Automatically set white/black FG color as per background color of bar/buttons');
        fggrid.attach(autofgBarSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

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
            // obar.triggerStyleReload();
        });
        fggrid.attach(resetFontBtn, 3, rowbar, 1, 1);

        fgprop.set_child(fggrid);
        prefsWidget.attach(fgprop, 1, rowNo, 2, 1);

        ///////////////////////////////////////////////////////////////////
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

        // Add a Panel Box background color chooser
        let boxColorLbl = new Gtk.Label({
            label: 'Box/Margins Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(boxColorLbl, 1, rowbar, 1, 1);

        let boxColor = this.createColorWidget(window, 'Panel-Box Background Color', 'Background color for the panel box / margins', 'boxcolor');
        bggrid.attach(boxColor, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a background alpha scale
        let boxAlphaLbl = new Gtk.Label({
            label: 'Box/Margins Alpha',
            halign: Gtk.Align.START,
        });
        bggrid.attach(boxAlphaLbl, 1, rowbar, 1, 1);

        let boxAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bggrid.attach(boxAlpha, 2, rowbar, 1, 1);

        rowbar += 1;


        // Add a bar background color chooser
        let bgColorLbl = new Gtk.Label({
            label: 'Bar BG Color',
            halign: Gtk.Align.START,
        });
        bggrid.attach(bgColorLbl, 1, rowbar, 1, 1);

        let bgColor = this.createColorWidget(window, 'Background Color', 'Background or gradient start color for the bar', 'bgcolor');
        bggrid.attach(bgColor, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a bar background alpha scale
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
            tooltip_text: 'Click on the color buttons to edit colors',
        });
        bggrid.attach(candybarLbl, 1, rowbar, 1, 1);

        // Add a candybar switch
        let candybar = this.createSwitchWidget('Click on the color buttons to edit colors');
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

        ////////////////////////////////////////////////////////////////////////////
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

        ////////////////////////////////////////////////////////////////////////////
        
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

        // Add Apply Border-Width label
        let borderWidthApplyLabel = new Gtk.Label({
            label: `Apply Width to`,
            halign: Gtk.Align.START,
        });
        bgrid.attach(borderWidthApplyLabel, 1, rowbar, 1, 1);

        // Width Sides Box
        const widthBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 5,
            // margin_top: 5,
            // margin_bottom: 5,
            halign: Gtk.Align.END,
            homogeneous: false,
        });
        let widthTop = this.createToggleButton('Top', 'Top Side');
        widthBox.append(widthTop);
        let widthBottom = this.createToggleButton('Bottom', 'Bottom Side');
        widthBox.append(widthBottom);
        let widthLeft = this.createToggleButton('Left', 'Left Side');
        widthBox.append(widthLeft);
        let widthRight = this.createToggleButton('Right', 'Right Side');
        widthBox.append(widthRight);
        bgrid.attach(widthBox, 2, rowbar, 1, 1);

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

        // Add Apply Radius to Corner label
        let bRadiusApplyLabel = new Gtk.Label({
            label: `Apply Radius to`,
            halign: Gtk.Align.START,
        });
        bgrid.attach(bRadiusApplyLabel, 1, rowbar, 1, 1);

        // Radius Sides Box
        const radiusBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 5,
            // margin_top: 5,
            // margin_bottom: 5,
            halign: Gtk.Align.END,
            homogeneous: false,
        });
        let radiusTopLeft = this.createToggleButton('Top-L', 'Top-Left Corner');
        radiusBox.append(radiusTopLeft);
        let radiusTopRight = this.createToggleButton('Top-R', 'Top-Right Corner');
        radiusBox.append(radiusTopRight);
        let radiusBottomLeft = this.createToggleButton('Bottom-L', 'Bottom-Left Corner');
        radiusBox.append(radiusBottomLeft);
        let radiusBottomRight = this.createToggleButton('Bottom-R', 'Bottom-Right Corner');
        radiusBox.append(radiusBottomRight);        
        
        bgrid.attach(radiusBox, 2, rowbar, 1, 1);

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

        ////////////////////////////////////////////////////////////////////
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

        // Add a Auto FG color switch for Menu
        let autofgMenuLabel = new Gtk.Label({
            label: 'Auto FG Color',
            halign: Gtk.Align.START,
        });
        menugrid.attach(autofgMenuLabel, 1, rowbar, 1, 1);

        let autofgMenuSwitch = this.createSwitchWidget('Automatically set white/black FG color as per background color of menu widgets');
        menugrid.attach(autofgMenuSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

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

        // Add an SVG menu BG gradient switch
        let mbgGradientLbl = new Gtk.Label({
            label: `Light Gradient`,
            halign: Gtk.Align.START,
        });
        menugrid.attach(mbgGradientLbl, 1, rowbar, 1, 1);

        let mbgGradientSwitch = this.createSwitchWidget('Light gradient effect from top-left on menu background');
        menugrid.attach(mbgGradientSwitch, 2, rowbar, 1, 1);

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

        // Add a Menu Panels radius scale
        let menuRadLbl = new Gtk.Label({
            label: 'Menu Panels Radius',
            halign: Gtk.Align.START,
        });
        menugrid.attach(menuRadLbl, 1, rowbar, 1, 1);

        let menuRad = this.createScaleWidget(0, 50, 1, 0, 'Radius for all the Menu panels');
        menugrid.attach(menuRad, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a Calendar/Notifications Buttons radius scale
        let notifRadLbl = new Gtk.Label({
            label: 'Calendar Subs Radius',
            halign: Gtk.Align.START,
        });
        menugrid.attach(notifRadLbl, 1, rowbar, 1, 1);

        let notifRad = this.createScaleWidget(0, 50, 1, 0, 'Radius for the sub sections of Calendar/Notifications');
        menugrid.attach(notifRad, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a Quick Toggle buttons radius scale
        let qToggleRadLbl = new Gtk.Label({
            label: 'Quick Toggle Radius',
            halign: Gtk.Align.START,
        });
        menugrid.attach(qToggleRadLbl, 1, rowbar, 1, 1);

        let qToggleRad = this.createScaleWidget(0, 50, 1, 0, 'Radius for the Quick Toggle buttons');
        menugrid.attach(qToggleRad, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a slider height scale
        let mSliderHtLbl = new Gtk.Label({
            label: 'Slider Height',
            halign: Gtk.Align.START,
        });
        menugrid.attach(mSliderHtLbl, 1, rowbar, 1, 1);

        let mSliderHt = this.createScaleWidget(1, 30, 1, 0, 'Slider height for Volume/Brightness etc');
        menugrid.attach(mSliderHt, 2, rowbar, 1, 1);
        
        rowbar += 1;

        // Add a slider handle border width scale
        let mSliHandBordLbl = new Gtk.Label({
            label: 'Slider Handle Border',
            halign: Gtk.Align.START,
        });
        menugrid.attach(mSliHandBordLbl, 1, rowbar, 1, 1);

        let mSliHandBord = this.createScaleWidget(0, 20, 1, 0, 'Width of the border of Slider handle');
        menugrid.attach(mSliHandBord, 2, rowbar, 1, 1);

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

        ////////////////////////////////////////////////////////////////////
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

        /////////////////////////////////////////////////////////////////////



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
            'cust-margin-wmax',
            wmaxCustMarginSwitch,
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
            'menu-radius',
            menuRad.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'notif-radius',
            notifRad.adjustment,
            'value',
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
        this._settings.bind(
            'handle-border',
            mSliHandBord.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'boxalpha',
            boxAlpha.adjustment,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'mbg-gradient',
            mbgGradientSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'autofg-bar',
            autofgBarSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'autofg-menu',
            autofgMenuSwitch,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
        this._settings.bind(
            'width-top',
            widthTop,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        )
        this._settings.bind(
            'width-bottom',
            widthBottom,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        )
        this._settings.bind(
            'width-left',
            widthLeft,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        )
        this._settings.bind(
            'width-right',
            widthRight,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        )
        this._settings.bind(
            'radius-topleft',
            radiusTopLeft,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        )
        this._settings.bind(
            'radius-topright',
            radiusTopRight,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        )
        this._settings.bind(
            'radius-bottomleft',
            radiusBottomLeft,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        )
        this._settings.bind(
            'radius-bottomright',
            radiusBottomRight,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        )
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
            this._settings.set_boolean('import-export', true);
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

                setTimeout(() => {
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

                    // Disable import/export pause to enable style reload
                    this._settings.set_boolean('import-export', false);                    
                   
                    // Trigger stylesheet reload to apply new settings
                    this.triggerStyleReload();                  
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
            this._settings.set_boolean('import-export', true);
            let filePath = fileChooser.get_file().get_path();
            const file = Gio.file_new_for_path(filePath);
            const raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
            const out = Gio.BufferedOutputStream.new_sized(raw, 4096);

            // Settings not updated by user (default) aren't caught by dconf, so force update
            let keys = this._settings.list_keys(); 
            keys.forEach(k => { 
                let value = this._settings.get_value(k);
                this._settings.set_value(k, value);
            });

            out.write_all(GLib.spawn_command_line_sync(`dconf dump ${SCHEMA_PATH}`)[1], null);
            out.close(null);
            setTimeout(() => {this._settings.set_boolean('import-export', false)}, 1000);
          }
          fileChooser.destroy();
        });

        fileChooser.show();
    }

}
