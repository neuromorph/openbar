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

const { Gio, GObject, Gtk, Gdk, Adw, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {gettext: _, pgettext} = ExtensionUtils;

//-----------------------------------------------

function init() {
    ExtensionUtils.initTranslations();
}

function fillPreferencesWindow(window) {
    let prefs = new OpenbarPrefs();
    prefs.fillOpenbarPrefs(window);
}
//-----------------------------------------------

class OpenbarPrefs {

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

    fillOpenbarPrefs(window) {

        window.set_title(_("Open Bar 🍹"));
        window.default_height = 750;
        window.default_width = 620;

        // Get the settings object
        this.settings = ExtensionUtils.getSettings();

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
            file: Me.path + "/media/openbar.jpg",
            vexpand: false,
            hexpand: false,
            pixel_size: 120,
            margin_bottom: 10,
            halign: Gtk.Align.END,
        });
        prefsWidget.attach(aboutImage, 2, rowNo, 1, 1);

        // Add a title label
        let titleLabel = new Gtk.Label({
            label: `<span><b>Top Bar Customization</b></span>\n\n<span size="small" underline="none">${_('Version:')} ${Me.metadata.version}  |  <a href="${Me.metadata.url}">Home</a>  |  © <a href="https://extensions.gnome.org/accounts/profile/neuromorph">neuromorph</a>  |  <a href="https://www.buymeacoffee.com/neuromorph">☕</a></span>`,
            // halign: Gtk.Align.CENTER,
            use_markup: true,
            // visible: true,
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

        let highlightColorChooser = this.createColorWidget('Highlight Color', 'Background highlight color for hover, focus etc.', 'hcolor');
        bggrid.attach(highlightColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a highlight alpha scale
        let hgAlphaLbl = new Gtk.Label({
            label: 'Highlight Alpha',
            halign: Gtk.Align.START,
        });
        bggrid.attach(hgAlphaLbl, 1, rowbar, 1, 1);

        let hgAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        bggrid.attach(hgAlpha, 2, rowbar, 1, 1);

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

        bprop.set_child(bgrid);
        prefsWidget.attach(bprop, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////////////////
        rowNo += 1

        let separator4 = this.createSeparatorWidget();
        prefsWidget.attach(separator4, 1, rowNo, 2, 1);

        ////////////////////////////////////////////////////////////////////

        rowNo += 1;
        const ubprop = new Gtk.Expander({
            label: `<b>UNDER BAR</b>`,
            expanded: false,
            use_markup: true,
        });
        let ubgrid = this.createGridWidget();

        rowbar = 1;

        // Add a neon switch
        let neonLbl = new Gtk.Label({
            label: 'Neon Glow',
            halign: Gtk.Align.START,
        });
        ubgrid.attach(neonLbl, 1, rowbar, 1, 1);

        let neon = new Gtk.Switch({
            halign: Gtk.Align.END,
            tooltip_text: 'Select bright/neon color for border and dark/opaque background',
        });
        ubgrid.attach(neon, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a shadow switch
        let shadowLabel = new Gtk.Label({
            label: 'Shadow Effect',
            halign: Gtk.Align.START,
        });
        ubgrid.attach(shadowLabel, 1, rowbar, 1, 1);

        let shadowSwitch = new Gtk.Switch({
            halign: Gtk.Align.END,
        });
        ubgrid.attach(shadowSwitch, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu FG color chooser
        let menuFGColorLabel = new Gtk.Label({
            label: 'Menu FG Color ⚗️',
            halign: Gtk.Align.START,
        });
        ubgrid.attach(menuFGColorLabel, 1, rowbar, 1, 1);

        let menuFGColorChooser = this.createColorWidget('Menu Foreground Color', 'Foreground color for the dropdown menus - ⚗️ Experimental', 'mfgcolor');
        ubgrid.attach(menuFGColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu alpha scale
        let mfgAlphaLbl = new Gtk.Label({
            label: 'Menu FG Alpha',
            halign: Gtk.Align.START,
        });
        ubgrid.attach(mfgAlphaLbl, 1, rowbar, 1, 1);

        let mfgAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        ubgrid.attach(mfgAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu BG color chooser
        let menuBGColorLabel = new Gtk.Label({
            label: 'Menu BG Color',
            halign: Gtk.Align.START,
        });
        ubgrid.attach(menuBGColorLabel, 1, rowbar, 1, 1);

        let menuBGColorChooser = this.createColorWidget('Menu Background Color', 'Background color for the dropdown menus', 'mbgcolor');
        ubgrid.attach(menuBGColorChooser, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu alpha scale
        let mbgAlphaLbl = new Gtk.Label({
            label: 'Menu BG Alpha',
            halign: Gtk.Align.START,
        });
        ubgrid.attach(mbgAlphaLbl, 1, rowbar, 1, 1);

        let mbgAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        ubgrid.attach(mbgAlpha, 2, rowbar, 1, 1);

        rowbar += 1;

        // Add a menu Border color chooser
        let menubColorLabel = new Gtk.Label({
            label: 'Menu Border Color',
            halign: Gtk.Align.START,
        });
        ubgrid.attach(menubColorLabel, 1, rowbar, 1, 1);

        let menubColorChooser = this.createColorWidget('Menu Border Color', 'Border color for the dropdown menus', 'mbcolor');
        ubgrid.attach(menubColorChooser, 2, rowbar, 1, 1);


        rowbar += 1;

        // Add a menu alpha scale
        let mbAlphaLbl = new Gtk.Label({
            label: 'Menu Border Alpha',
            halign: Gtk.Align.START,
        });
        ubgrid.attach(mbAlphaLbl, 1, rowbar, 1, 1);

        let mbAlpha = this.createScaleWidget(0, 1, 0.01, 2);
        ubgrid.attach(mbAlpha, 2, rowbar, 1, 1);


        ubprop.set_child(ubgrid);
        prefsWidget.attach(ubprop, 1, rowNo, 2, 1);

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
        
    }

}