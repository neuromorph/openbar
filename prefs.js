
const { Gio, GObject, Gtk, Gdk, Adw, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {gettext: _, pgettext} = ExtensionUtils;

//-----------------------------------------------

function init() {
    ExtensionUtils.initTranslations();
}

//-----------------------------------------------


function buildPrefsWidget() {

    // Get the settings object
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.openbar');

    // Create a preferences widget
    let prefsWidget = new Gtk.Grid({
        margin_top: 14,
        margin_bottom: 14,
        margin_start: 14,
        margin_end: 14,
        column_spacing: 12,
        row_spacing: 16,
        orientation: Gtk.Orientation.VERTICAL,
        // visible: true,
    });

    prefsWidget.connect("realize", ()=>{
        const window = prefsWidget.get_root();
        window.set_title(_("Open Bar"));
        window.default_height = 750;
        window.default_width = 600;
    });

    let rowNo = 1;
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
        label: `<span><b>Top Panel Customization</b></span>\n\n<span size="small">${_('Version:')} ${Me.metadata.version}  |  © neuromorph</span>`,
        // halign: Gtk.Align.CENTER,
        use_markup: true,
        // visible: true,
    });
    prefsWidget.attach(titleLabel, 1, rowNo, 1, 1);

    rowNo += 1;

    const barprop = new Gtk.Expander({
        label: `<b>BAR PROPS</b>`,
        expanded: false,
        use_markup: true,
    });

    let bargrid = new Gtk.Grid({
        margin_top: 14,
        margin_bottom: 14,
        margin_start: 14,
        margin_end: 14,
        column_spacing: 12,
        row_spacing: 12,
        orientation: Gtk.Orientation.VERTICAL,
        // visible: true,
    });

    let rowbar = 1;
    //Type of bar
    let barTypeLbl = new Gtk.Label({
        label: 'Type of Bar',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bargrid.attach(barTypeLbl, 1, rowbar, 1, 1);

    let barType = new Gtk.ComboBoxText({halign: Gtk.Align.END});
    barType.append("Mainland", _("Mainland"));
    barType.append("Floating", _("Floating"));
    barType.append("Islands", _("Islands"));
    bargrid.attach(barType, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a bar height scale
    let heightLabel = new Gtk.Label({
        label: 'Bar Height',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bargrid.attach(heightLabel, 1, rowbar, 1, 1);

    let height = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 100,
            step_increment: 1,
        }),
        digits: 0,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    bargrid.attach(height, 2, rowbar, 1, 1);

    rowbar += 1;
    
    // Add a bar margin scale
    let marginLabel = new Gtk.Label({
        label: 'Bar Margins',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bargrid.attach(marginLabel, 1, rowbar, 1, 1);

    let margin = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 20,
            step_increment: 0.5,
        }),
        digits: 1,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    bargrid.attach(margin, 2, rowbar, 1, 1);

    barprop.set_child(bargrid);
    prefsWidget.attach(barprop, 1, rowNo, 2, 1);

    //////////////////////////////////////////////////////////////////////////////////
    rowNo += 1;
    const fgprop = new Gtk.Expander({
        label: `<b>FRONT BAR</b>`,
        expanded: false,
        use_markup: true,
    });

    let fggrid = new Gtk.Grid({
        margin_top: 14,
        margin_bottom: 14,
        margin_start: 14,
        margin_end: 14,
        column_spacing: 12,
        row_spacing: 12,
        orientation: Gtk.Orientation.VERTICAL,
        // visible: true,
    });

    rowbar = 1;

    // Add a foreground color chooser
    let fgColorLbl = new Gtk.Label({
        label: 'FG color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    fggrid.attach(fgColorLbl, 1, rowbar, 1, 1);

    let fgColor = new Gtk.ColorButton({
        title: 'Foreground color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true
    });
    fggrid.attach(fgColor, 2, rowbar, 1, 1);

    let fgcolorArray = settings.get_strv('fgcolor');
  	let fgrgba = new Gdk.RGBA();
    fgrgba.red = parseFloat(fgcolorArray[0]);
    fgrgba.green = parseFloat(fgcolorArray[1]);
    fgrgba.blue = parseFloat(fgcolorArray[2]);
    fgrgba.alpha = 1.0;
    fgColor.set_rgba(fgrgba);

    fgColor.connect('color-set', (widget) => {
        fgrgba = widget.get_rgba();
        settings.set_strv('fgcolor', [
            fgrgba.red.toString(),
            fgrgba.green.toString(),
            fgrgba.blue.toString(),
        ]);
    });

    rowbar += 1;
    // Add a foreground alpha scale
    let fgAlphaLbl = new Gtk.Label({
        label: 'FG Alpha',
        halign: Gtk.Align.START,
        // visible: true,
    });
    fggrid.attach(fgAlphaLbl, 1, rowbar, 1, 1);

    let fgAlpha = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1,
            step_increment: 0.01,
        }),
        digits: 2,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    fggrid.attach(fgAlpha, 2, rowbar, 1, 1);

    fgprop.set_child(fggrid);
    prefsWidget.attach(fgprop, 1, rowNo, 2, 1);

    ///////////////////////////////////////////////////////////////////
    rowNo += 1;
    const bgprop = new Gtk.Expander({
        label: `<b>BACK BAR</b>`,
        expanded: false,
        use_markup: true,
    });

    let bggrid = new Gtk.Grid({
        margin_top: 14,
        margin_bottom: 14,
        margin_start: 14,
        margin_end: 14,
        column_spacing: 12,
        row_spacing: 12,
        orientation: Gtk.Orientation.VERTICAL,
        // visible: true,
    });

    rowbar = 1;

    // Add a background color chooser
    let bgColorLbl = new Gtk.Label({
        label: 'BG color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(bgColorLbl, 1, rowbar, 1, 1);

    let bgColor = new Gtk.ColorButton({
        title: 'Background color',
        halign: Gtk.Align.END,
        // visible: true,
    });
    bggrid.attach(bgColor, 2, rowbar, 1, 1);

    let bgcolorArray = settings.get_strv('bgcolor');
  	let bgrgba = new Gdk.RGBA();
    bgrgba.red = parseFloat(bgcolorArray[0]);
    bgrgba.green = parseFloat(bgcolorArray[1]);
    bgrgba.blue = parseFloat(bgcolorArray[2]);
    bgrgba.alpha = 1.0;
    bgColor.set_rgba(bgrgba);

    bgColor.connect('color-set', (widget) => {
        bgrgba = widget.get_rgba();
        settings.set_strv('bgcolor', [
            bgrgba.red.toString(),
            bgrgba.green.toString(),
            bgrgba.blue.toString(),
        ]);
    });

    rowbar += 1;

    // Add a background alpha scale
    let bgAlphaLbl = new Gtk.Label({
        label: 'BG Alpha',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(bgAlphaLbl, 1, rowbar, 1, 1);

    let bgAlpha = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1,
            step_increment: 0.01,
        }),
        digits: 2,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    bggrid.attach(bgAlpha, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a gradient switch
    let gradientLbl = new Gtk.Label({
        label: 'Gradient',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(gradientLbl, 1, rowbar, 1, 1);

    let gradient = new Gtk.Switch({
        halign: Gtk.Align.END,
        // visible: true,
    });
    bggrid.attach(gradient, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a gradient color chooser
    let grColorLbl = new Gtk.Label({
        label: 'Gradient color 2',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(grColorLbl, 1, rowbar, 1, 1);

    let grColor = new Gtk.ColorButton({
        title: 'Gradient color 2',
        halign: Gtk.Align.END,
        // visible: true,
    });
    bggrid.attach(grColor, 2, rowbar, 1, 1);

    let grcolorArray = settings.get_strv('bgcolor2');
  	let grrgba = new Gdk.RGBA();
    grrgba.red = parseFloat(grcolorArray[0]);
    grrgba.green = parseFloat(grcolorArray[1]);
    grrgba.blue = parseFloat(grcolorArray[2]);
    grrgba.alpha = 1.0;
    grColor.set_rgba(grrgba);

    grColor.connect('color-set', (widget) => {
        grrgba = widget.get_rgba();
        settings.set_strv('bgcolor2', [
            grrgba.red.toString(),
            grrgba.green.toString(),
            grrgba.blue.toString(),
        ]);
    });

    rowbar += 1;

    //Gradient direction
    let grDirecLbl = new Gtk.Label({
        label: 'Gradient direction',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(grDirecLbl, 1, rowbar, 1, 1);

    let grDirection = new Gtk.ComboBoxText({halign: Gtk.Align.END});
    grDirection.append("horizontal", _("Horizontal"));
    grDirection.append("vertical", _("Vertical"));
    bggrid.attach(grDirection, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a highlight color chooser
    let highlightColorLabel = new Gtk.Label({
        label: 'Highlight color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(highlightColorLabel, 1, rowbar, 1, 1);

    let highlightColorChooser = new Gtk.ColorButton({
        title: 'Highlight color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true,
        tooltip_text: 'Highlight color for hover, focus etc.'
    });
    bggrid.attach(highlightColorChooser, 2, rowbar, 1, 1);

    let hcolorArray = settings.get_strv('hcolor');
  	let hrgba = new Gdk.RGBA();
    hrgba.red = parseFloat(hcolorArray[0]);
    hrgba.green = parseFloat(hcolorArray[1]);
    hrgba.blue = parseFloat(hcolorArray[2]);
    hrgba.alpha = 1.0;
    highlightColorChooser.set_rgba(hrgba);

    highlightColorChooser.connect('color-set', (widget) => {
        hrgba = widget.get_rgba();
        settings.set_strv('hcolor', [
            hrgba.red.toString(),
            hrgba.green.toString(),
            hrgba.blue.toString(),
        ]);
    });

    rowbar += 1;

    // Add a highlight alpha scale
    let hgAlphaLbl = new Gtk.Label({
        label: 'Highlight alpha',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(hgAlphaLbl, 1, rowbar, 1, 1);

    let hgAlpha = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1,
            step_increment: 0.01,
        }),
        digits: 2,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    bggrid.attach(hgAlpha, 2, rowbar, 1, 1);


    rowbar += 1;

    // Add a Islands color chooser
    let islandsColorLabel = new Gtk.Label({
        label: 'Islands color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(islandsColorLabel, 1, rowbar, 1, 1);

    let islandsColorChooser = new Gtk.ColorButton({
        title: 'Islands background color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true,
        tooltip_text: 'Islands background color',
    });
    bggrid.attach(islandsColorChooser, 2, rowbar, 1, 1);

    let iscolorArray = settings.get_strv('iscolor');
  	let isrgba = new Gdk.RGBA();
    isrgba.red = parseFloat(iscolorArray[0]);
    isrgba.green = parseFloat(iscolorArray[1]);
    isrgba.blue = parseFloat(iscolorArray[2]);
    isrgba.alpha = 1.0;
    islandsColorChooser.set_rgba(isrgba);

    islandsColorChooser.connect('color-set', (widget) => {
        isrgba = widget.get_rgba();
        settings.set_strv('iscolor', [
            isrgba.red.toString(),
            isrgba.green.toString(),
            isrgba.blue.toString(),
        ]);
    });

    rowbar += 1;

    // Add a Islands alpha scale
    let isAlphaLbl = new Gtk.Label({
        label: 'Islands alpha',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(isAlphaLbl, 1, rowbar, 1, 1);

    let isAlpha = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1,
            step_increment: 0.01,
        }),
        digits: 2,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    bggrid.attach(isAlpha, 2, rowbar, 1, 1);

    bgprop.set_child(bggrid);
    prefsWidget.attach(bgprop, 1, rowNo, 2, 1);

    ////////////////////////////////////////////////////////////////////////////

    rowNo += 1;

    const bprop = new Gtk.Expander({
        label: `<b>DRAW BORDER</b>`,
        expanded: false,
        use_markup: true,
    });

    let bgrid = new Gtk.Grid({
        margin_top: 14,
        margin_bottom: 14,
        margin_start: 14,
        margin_end: 14,
        column_spacing: 12,
        row_spacing: 12,
        orientation: Gtk.Orientation.VERTICAL,
        // visible: true,
    });

    rowbar = 1;

    // Add a border width scale
    let borderWidthLabel = new Gtk.Label({
        label: 'Width',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bgrid.attach(borderWidthLabel, 1, rowbar, 1, 1);

    let borderWidthScale = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 10,
            step_increment: 0.1,
        }),
        digits: 1,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    bgrid.attach(borderWidthScale, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a border radius scale
    let bRadiuslbl = new Gtk.Label({
        label: 'Radius',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bgrid.attach(bRadiuslbl, 1, rowbar, 1, 1);

    let bRadius = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 50,
            step_increment: 1,
        }),
        digits: 0,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    bgrid.attach(bRadius, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a border color chooser
    let borderColorLabel = new Gtk.Label({
        label: 'Color:',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bgrid.attach(borderColorLabel, 1, rowbar, 1, 1);

    let borderColorChooser = new Gtk.ColorButton({
        title: 'Border color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true
    });
    bgrid.attach(borderColorChooser, 2, rowbar, 1, 1);

    let bcolorArray = settings.get_strv('bcolor');
  	let brgba = new Gdk.RGBA();
    brgba.red = parseFloat(bcolorArray[0]);
    brgba.green = parseFloat(bcolorArray[1]);
    brgba.blue = parseFloat(bcolorArray[2]);
    brgba.alpha = 1.0;
    borderColorChooser.set_rgba(brgba);

    borderColorChooser.connect('color-set', (widget) => {
        brgba = widget.get_rgba();
        settings.set_strv('bcolor', [
            brgba.red.toString(),
            brgba.green.toString(),
            brgba.blue.toString(),
        ]);
    });

    rowbar += 1;

    // Add a Border alpha scale
    let bAlphaLbl = new Gtk.Label({
        label: 'Alpha',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bgrid.attach(bAlphaLbl, 1, rowbar, 1, 1);

    let bAlpha = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1,
            step_increment: 0.01,
        }),
        digits: 2,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
    });
    bgrid.attach(bAlpha, 2, rowbar, 1, 1);

    bprop.set_child(bgrid);
    prefsWidget.attach(bprop, 1, rowNo, 2, 1);

    ////////////////////////////////////////////////////////////////////

    rowNo += 1;
    const mprop = new Gtk.Expander({
        label: `<b>UNDER BAR</b>`,
        expanded: false,
        use_markup: true,
    });

    let mgrid = new Gtk.Grid({
        margin_top: 14,
        margin_bottom: 14,
        margin_start: 14,
        margin_end: 14,
        column_spacing: 12,
        row_spacing: 12,
        orientation: Gtk.Orientation.VERTICAL,
        // visible: true,
    });

    rowbar = 1;

    // Add a neon switch
    let neonLbl = new Gtk.Label({
        label: 'Neon glow',
        halign: Gtk.Align.START,
        // visible: true,
    });
    mgrid.attach(neonLbl, 1, rowbar, 1, 1);

    let neon = new Gtk.Switch({
        halign: Gtk.Align.END,
        // visible: true,
    });
    mgrid.attach(neon, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a shadow switch
    let shadowLabel = new Gtk.Label({
        label: 'Shadow effect',
        halign: Gtk.Align.START,
        // visible: true,
    });
    mgrid.attach(shadowLabel, 1, rowbar, 1, 1);

    let shadowSwitch = new Gtk.Switch({
        halign: Gtk.Align.END,
        // visible: true,
    });
    mgrid.attach(shadowSwitch, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a font button
    let fontLabel = new Gtk.Label({
        label: 'Panel Font',
        halign: Gtk.Align.START,
        // visible: true,
    });
    mgrid.attach(fontLabel, 1, rowbar, 1, 1);

    const fontBtn = new Gtk.FontButton({
        use_font: true,
        tooltip_text: _("Font for Panel text"),
        valign: Gtk.Align.CENTER,
        hexpand: true,
    });
    let font = settings.get_string('font');
    if (font == ""){
        let defaultFont = fontBtn.get_font();
        settings.set_string('default-font', defaultFont);
    }
    fontBtn.connect(
        "font-set",
        function (w) {
            var value = w.get_font();
            settings.set_string('font', value);
        }
    );
    mgrid.attach(fontBtn, 2, rowbar, 1, 1);

    const resetFontBtn = new Gtk.Button({
        label: '↺',
        width_request: 10,
        tooltip_text: _("Reset to default font"),
        valign: Gtk.Align.CENTER, 
        halign: Gtk.Align.END
    }); 
    resetFontBtn.get_style_context().add_class('circular');
    resetFontBtn.connect('clicked', () => {
        settings.reset('font');
        fontBtn.set_font(settings.get_string('default-font'));
    });
    mgrid.attach(resetFontBtn, 3, rowbar, 1, 1);

    mprop.set_child(mgrid);
    prefsWidget.attach(mprop, 1, rowNo, 2, 1);

    rowNo += 1;

    



    // Bind the settings to the widgets
    settings.bind(
        'bartype',
        barType,
        'active-id',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'height',
        height.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'margin',
        margin.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    // settings.bind(
    //     'fgcolor',
    //     fgColor,
    //     'rgba',
    //     Gio.SettingsBindFlags.DEFAULT
    // );
    settings.bind(
        'fgalpha',
        fgAlpha.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'bgalpha',
        bgAlpha.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    // settings.bind(
    //     'bgcolor',
    //     bgColor,
    //     'rgba',
    //     Gio.SettingsBindFlags.DEFAULT
    // );
    // settings.bind(
    //     'bcolor',
    //     borderColorChooser,
    //     'rgba',
    //     Gio.SettingsBindFlags.DEFAULT
    // );
    settings.bind(
        'gradient',
        gradient,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'gradient-direction',
        grDirection,
        'active-id',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'halpha',
        hgAlpha.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'isalpha',
        isAlpha.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'bradius',
        bRadius.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'bwidth',
        borderWidthScale.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'balpha',
        bAlpha.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'neon',
        neon,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'shadow',
        shadowSwitch,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    

    // Return the prefs widget
    return prefsWidget;
}