
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
        window.set_title(_("Open Bar 🍹"));
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
        label: `<span><b>Top Bar Customization</b></span>\n\n<span size="small" underline="none">${_('Version:')} ${Me.metadata.version}  |  <a href="${Me.metadata.url}">Home</a>  |  © <a href="https://extensions.gnome.org/accounts/profile/neuromorph">neuromorph</a>  |  <a href="https://www.buymeacoffee.com/neuromorph">☕</a></span>`,
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
            upper: 50,
            step_increment: 0.5,
        }),
        digits: 1,
        draw_value: true,
        value_pos: Gtk.PositionType.RIGHT,
        // visible: true,
        width_request: 50,
        hexpand: true,
        tooltip_text: 'Not applicable for Mainland',
    });
    bargrid.attach(margin, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a overview switch
    let overviewLabel = new Gtk.Label({
        label: 'Apply in Overview',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bargrid.attach(overviewLabel, 1, rowbar, 1, 1);

    let overviewSwitch = new Gtk.Switch({
        halign: Gtk.Align.END,
        // visible: true,
    });
    bargrid.attach(overviewSwitch, 2, rowbar, 1, 1);

    barprop.set_child(bargrid);
    prefsWidget.attach(barprop, 1, rowNo, 2, 1);

    ////////////////////////////////////////////////////////////////////////////////
    rowNo += 1

    const separator1 = new Gtk.Separator({
        orientation: Gtk.Orientation.HORIZONTAL,
        hexpand: true,
        margin_bottom: 6,
        margin_top: 6,
    });
    prefsWidget.attach(separator1, 1, rowNo, 2, 1);

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
        label: 'FG Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    fggrid.attach(fgColorLbl, 1, rowbar, 1, 1);

    let fgColor = new Gtk.ColorButton({
        title: 'Foreground Color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true,
        tooltip_text: 'Foreground color for the bar',
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

    rowbar += 1;

    // Add a font button
    let fontLabel = new Gtk.Label({
        label: 'Panel Font',
        halign: Gtk.Align.START,
        // visible: true,
    });
    fggrid.attach(fontLabel, 1, rowbar, 1, 1);

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
        settings.reset('font');
        fontBtn.set_font(settings.get_string('default-font'));
    });
    fggrid.attach(resetFontBtn, 3, rowbar, 1, 1);

    fgprop.set_child(fggrid);
    prefsWidget.attach(fgprop, 1, rowNo, 2, 1);

    ////////////////////////////////////////////////////////////////////////////////
    rowNo += 1

    const separator2 = new Gtk.Separator({
        orientation: Gtk.Orientation.HORIZONTAL,
        hexpand: true,
        margin_bottom: 6,
        margin_top: 6,
    });
    prefsWidget.attach(separator2, 1, rowNo, 2, 1);
    
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
        label: 'Bar BG Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(bgColorLbl, 1, rowbar, 1, 1);

    let bgColor = new Gtk.ColorButton({
        title: 'Background Color',
        halign: Gtk.Align.END,
        // visible: true,
        tooltip_text: 'Background or gradient start color for the bar',
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

    // Add a Islands color chooser
    let islandsColorLabel = new Gtk.Label({
        label: 'Islands BG Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(islandsColorLabel, 1, rowbar, 1, 1);

    let islandsColorChooser = new Gtk.ColorButton({
        title: 'Islands Background Color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true,
        tooltip_text: 'Background or gradient start color for Islands',
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
        label: 'Islands Alpha',
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
        label: 'Gradient End Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(grColorLbl, 1, rowbar, 1, 1);

    let grColor = new Gtk.ColorButton({
        title: 'Gradient End Color',
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
        label: 'Gradient Direction',
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
        label: 'Highlight Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bggrid.attach(highlightColorLabel, 1, rowbar, 1, 1);

    let highlightColorChooser = new Gtk.ColorButton({
        title: 'Highlight Color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true,
        tooltip_text: 'Background highlight color for hover, focus etc.'
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
        label: 'Highlight Alpha',
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

    bgprop.set_child(bggrid);
    prefsWidget.attach(bgprop, 1, rowNo, 2, 1);

    ////////////////////////////////////////////////////////////////////////////////
    rowNo += 1

    const separator3 = new Gtk.Separator({
        orientation: Gtk.Orientation.HORIZONTAL,
        hexpand: true,
        margin_bottom: 6,
        margin_top: 6,
    });
    prefsWidget.attach(separator3, 1, rowNo, 2, 1);

    ////////////////////////////////////////////////////////////////////////////

    rowNo += 1;

    const bprop = new Gtk.Expander({
        label: `<b>BORDER</b>`,
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

    // //Type of border
    // let borderTypeLbl = new Gtk.Label({
    //     label: 'Type of Border',
    //     halign: Gtk.Align.START,
    //     // visible: true,
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
        label: 'Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    bgrid.attach(borderColorLabel, 1, rowbar, 1, 1);

    let borderColorChooser = new Gtk.ColorButton({
        title: 'Border Color',
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

    ////////////////////////////////////////////////////////////////////////////////
    rowNo += 1

    const separator4 = new Gtk.Separator({
        orientation: Gtk.Orientation.HORIZONTAL,
        hexpand: true,
        margin_bottom: 6,
        margin_top: 6,
    });
    prefsWidget.attach(separator4, 1, rowNo, 2, 1);

    ////////////////////////////////////////////////////////////////////

    rowNo += 1;
    const ubprop = new Gtk.Expander({
        label: `<b>UNDER BAR</b>`,
        expanded: false,
        use_markup: true,
    });

    let ubgrid = new Gtk.Grid({
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
        label: 'Neon Glow',
        halign: Gtk.Align.START,
        // visible: true,
    });
    ubgrid.attach(neonLbl, 1, rowbar, 1, 1);

    let neon = new Gtk.Switch({
        halign: Gtk.Align.END,
        // visible: true,
        tooltip_text: 'Select bright/neon color for border and dark/opaque background',
    });
    ubgrid.attach(neon, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a shadow switch
    let shadowLabel = new Gtk.Label({
        label: 'Shadow Effect',
        halign: Gtk.Align.START,
        // visible: true,
    });
    ubgrid.attach(shadowLabel, 1, rowbar, 1, 1);

    let shadowSwitch = new Gtk.Switch({
        halign: Gtk.Align.END,
        // visible: true,
    });
    ubgrid.attach(shadowSwitch, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a menu FG color chooser
    let menuFGColorLabel = new Gtk.Label({
        label: 'Menu FG Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    ubgrid.attach(menuFGColorLabel, 1, rowbar, 1, 1);

    let menuFGColorChooser = new Gtk.ColorButton({
        title: 'Menu Foreground Color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true
        tooltip_text: 'Foreground color for the dropdown menus',
    });
    ubgrid.attach(menuFGColorChooser, 2, rowbar, 1, 1);

    let mfgcolorArray = settings.get_strv('mfgcolor');
  	let mfgrgba = new Gdk.RGBA();
    mfgrgba.red = parseFloat(mfgcolorArray[0]);
    mfgrgba.green = parseFloat(mfgcolorArray[1]);
    mfgrgba.blue = parseFloat(mfgcolorArray[2]);
    mfgrgba.alpha = 1.0;
    menuFGColorChooser.set_rgba(mfgrgba);

    menuFGColorChooser.connect('color-set', (widget) => {
        mfgrgba = widget.get_rgba();
        settings.set_strv('mfgcolor', [
            mfgrgba.red.toString(),
            mfgrgba.green.toString(),
            mfgrgba.blue.toString(),
        ]);
    });

    rowbar += 1;

    // Add a menu alpha scale
    let mfgAlphaLbl = new Gtk.Label({
        label: 'Menu FG Alpha',
        halign: Gtk.Align.START,
        // visible: true,
    });
    ubgrid.attach(mfgAlphaLbl, 1, rowbar, 1, 1);

    let mfgAlpha = new Gtk.Scale({
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
    ubgrid.attach(mfgAlpha, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a menu BG color chooser
    let menuBGColorLabel = new Gtk.Label({
        label: 'Menu BG Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    ubgrid.attach(menuBGColorLabel, 1, rowbar, 1, 1);

    let menuBGColorChooser = new Gtk.ColorButton({
        title: 'Menu Background Color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true
        tooltip_text: 'Background color for the dropdown menus',
    });
    ubgrid.attach(menuBGColorChooser, 2, rowbar, 1, 1);

    let mbgcolorArray = settings.get_strv('mbgcolor');
  	let mbgrgba = new Gdk.RGBA();
    mbgrgba.red = parseFloat(mbgcolorArray[0]);
    mbgrgba.green = parseFloat(mbgcolorArray[1]);
    mbgrgba.blue = parseFloat(mbgcolorArray[2]);
    mbgrgba.alpha = 1.0;
    menuBGColorChooser.set_rgba(mbgrgba);

    menuBGColorChooser.connect('color-set', (widget) => {
        mbgrgba = widget.get_rgba();
        settings.set_strv('mbgcolor', [
            mbgrgba.red.toString(),
            mbgrgba.green.toString(),
            mbgrgba.blue.toString(),
        ]);
    });

    rowbar += 1;

    // Add a menu alpha scale
    let mbgAlphaLbl = new Gtk.Label({
        label: 'Menu BG Alpha',
        halign: Gtk.Align.START,
        // visible: true,
    });
    ubgrid.attach(mbgAlphaLbl, 1, rowbar, 1, 1);

    let mbgAlpha = new Gtk.Scale({
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
    ubgrid.attach(mbgAlpha, 2, rowbar, 1, 1);

    rowbar += 1;

    // Add a menu Border color chooser
    let menubColorLabel = new Gtk.Label({
        label: 'Menu Border Color',
        halign: Gtk.Align.START,
        // visible: true,
    });
    ubgrid.attach(menubColorLabel, 1, rowbar, 1, 1);

    let menubColorChooser = new Gtk.ColorButton({
        title: 'Menu Border Color',
        halign: Gtk.Align.END,
        // visible: true,
        // use_alpha: true
        tooltip_text: 'Border color for the dropdown menus',
    });
    ubgrid.attach(menubColorChooser, 2, rowbar, 1, 1);

    let mbcolorArray = settings.get_strv('mbcolor');
  	let mbrgba = new Gdk.RGBA();
    mbrgba.red = parseFloat(mbcolorArray[0]);
    mbrgba.green = parseFloat(mbcolorArray[1]);
    mbrgba.blue = parseFloat(mbcolorArray[2]);
    mbrgba.alpha = 1.0;
    menubColorChooser.set_rgba(mbrgba);

    menubColorChooser.connect('color-set', (widget) => {
        mbrgba = widget.get_rgba();
        settings.set_strv('mbcolor', [
            mbrgba.red.toString(),
            mbrgba.green.toString(),
            mbrgba.blue.toString(),
        ]);
    });

    rowbar += 1;

    // Add a menu alpha scale
    let mbAlphaLbl = new Gtk.Label({
        label: 'Menu Border Alpha',
        halign: Gtk.Align.START,
        // visible: true,
    });
    ubgrid.attach(mbAlphaLbl, 1, rowbar, 1, 1);

    let mbAlpha = new Gtk.Scale({
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
    ubgrid.attach(mbAlpha, 2, rowbar, 1, 1);


    ubprop.set_child(ubgrid);
    prefsWidget.attach(ubprop, 1, rowNo, 2, 1);

    ///////////////////////////////////////////////////////////////////////



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
    // settings.bind(
    //     'bordertype',
    //     borderType,
    //     'active-id',
    //     Gio.SettingsBindFlags.DEFAULT
    // );
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
    settings.bind(
        'overview',
        overviewSwitch,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'mfgalpha',
        mfgAlpha.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'mbgalpha',
        mbgAlpha.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'mbalpha',
        mbAlpha.adjustment,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    

    // Return the prefs widget
    return prefsWidget;
}
