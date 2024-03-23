
import Clutter      from 'gi://Clutter'
import GObject      from 'gi://GObject'
import GLib         from 'gi://GLib'
import GnomeDesktop from 'gi://GnomeDesktop'
import St           from 'gi://St'

import * as Main          from 'resource:///org/gnome/shell/ui/main.js'
import * as MessageList   from 'resource:///org/gnome/shell/ui/messageList.js'
import {EventSourceBase}  from 'resource:///org/gnome/shell/ui/calendar.js'

import {Extension}        from 'resource:///org/gnome/shell/extensions/extension.js'
import {InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js'

import tl           from './lang.js'
import LunarDate    from './backend-selector.js'

const _make_new_with_args = (my_class, args) => new (Function.prototype.bind.apply(
  my_class, [null].concat(Array.prototype.slice.call(args))))()

const LunarCalendarMessage = GObject.registerClass({
  Signals: {
    'close': {},
  },
}, class LunarCalendarMessage extends St.Button {

  constructor (title, body) {
    super({
      style_class: 'events-button',
      can_focus: true,
      x_expand: true,
      y_expand: false,
    })

    const contentBox = new St.BoxLayout({
      style_class: 'events-box',
      vertical: true,
      x_expand: true,
    })

    this.titleLabel = new St.Label({
      style_class: 'events-title',
      y_align: Clutter.ActorAlign.END,
      text: title,
    })
    contentBox.add_child(this.titleLabel)

    this.bodyLabel = new St.Label({
      style_class: 'events-list',
      text: body,
    })
    contentBox.add_child(this.bodyLabel)

    this.set_child(contentBox)
  }

  canClear () { return false }

  canClose () { return false }
})

const LunarCalendarSection = GObject.registerClass(
class LunarCalendarSection extends MessageList.MessageListSection {

  _init (settings, ld) {
    super._init('Lunar Calendar')

    this._settings = settings
    this._ld = ld

    this._title = new St.Button({ style_class: 'events-section-title',
                                  label: '',
                                  x_align: Clutter.ActorAlign.START,
                                  can_focus: true })
    this.insert_child_below(this._title, null)
  }

  _tl (str) {
    return tl(this._ld._lang, str)
  }

  get allowed () { return true }

  _reloadEvents () {
    this._reloading = true

    let ba_zi = false, gen_zhi = false, jieri = false;
    let bzTitle = this._tl("八字"), bzBody =  this._ld.strftime("%(Y8)年%(M8)月%(D8)日"),
          gzTitle = this._tl("干支"), gzBody =  this._ld.strftime("%(Y60)年%(M60)月%(D60)日"),
          jiTitle = this._tl("节日"), jiBody = this._ld.get_jieri("\n"),
          bzItem, gzItem, jiItem;
    
    let listItems = this._list.get_children();
    for (const item of listItems) { 
        let msg = item.child; 
        
        if (msg.titleLabel.text == bzTitle) {
            msg.bodyLabel.text = bzBody
            ba_zi = true
            bzItem = item
        }                
        if (msg.titleLabel.text == gzTitle) {
            msg.bodyLabel.text = gzBody
            gen_zhi = true
            gzItem = item
        }        
        if (msg.titleLabel.text == jiTitle) {
            msg.bodyLabel.text = jiBody
            jieri = true
            jiItem = item
        }        
    }
    
    if (this._settings.get_boolean('ba-zi') && LunarDate.backend != 'ytliu0') {
      if (!ba_zi) 
        this.addMessage(new LunarCalendarMessage(bzTitle, bzBody), false)
    }
    else if (ba_zi)
      bzItem.destroy()
            
    if (this._settings.get_boolean('gen-zhi')) {
      if(!gen_zhi)
        this.addMessage(new LunarCalendarMessage(gzTitle, gzBody), false)
    }
    else if (gen_zhi)
      gzItem.destroy()
        
    const jr = this._settings.get_boolean('jieri') ? this._ld.getHoliday() : ""
    if(jr != "" ) {
      if(!jieri)    
        this.addMessage(new LunarCalendarMessage(jiTitle, jiBody), false)
    }
    else if (jieri)
      jiItem.destroy()

    this._reloading = false
    this._sync()
  }

  setDate (date) {
    this._ld.setDateNoon(date)
    let cny = this._ld.strftime("%(shengxiao)")
    this._title.label = this._ld.strftimex("%(NIAN)年%(YUE)月%(RI)日")
    this._reloadEvents()
  }

  _shouldShow () { return true }

  _sync () {
    if (this._reloading)
      return

    super._sync()
  }
})

const LunarEventSource = GObject.registerClass(
class LunarEventSource extends EventSourceBase {

  constructor (settings, ld, wrapped) {
    super()

    this._settings = settings
    this._ld = ld
    this._wrapped = wrapped
  }

  get isLoading () {
    return this._wrapped.isLoading
  }

  get hasCalendars () {
    return true
  }

  requestRange (begin, end) {
    this._wrapped.requestRange(begin, end)
  }

  getEvents (begin, end) {
    return this._wrapped.getEvents(begin, end)
  }

  hasEvents (day) {
    this._ld.setDateNoon(day)
    const jr = this._settings.get_boolean('jieri') ? this._ld.getHoliday() : ""
    return this._wrapped.hasEvents(day) || jr != ""
  }
})

export default class LunarCalendarExtension extends Extension {

  constructor (metadata) {
    super(metadata)

    this._settingsChanged = {}
    this._replacementFunc = {}
  }

  _tl (str) {
    return tl(this._ld._lang, str)
  }

  _getLunarClockDisplay () {
    const show_date = this._settings.get_boolean('show-date')
    const show_time = this._settings.get_boolean('show-time')
    let shi_tl = show_time ? this._tl("%(SHI)时").replace("%(SHI)", `${this._ld.getShi()}`) : ""
    return ((show_date ? "\u2001" + this._ld.strftimex("%(YUE)月%(RI)日") : "") +
            (show_time ? (show_date && this._ld._lang > 0 ? "" : "\u2000") + shi_tl : ""))
  }

  enable () {
    this._ld = new LunarDate()
    console.log(`lunarcal: using backend ${LunarDate.backend}`)
    this._settings = this.getSettings()
    this._injectionManager = new InjectionManager()

    const self = this

    this._settings.connect('changed', () => {
      for (let x in self._settingsChanged) {
        self._settingsChanged[x]()
      }
    })

    const sysLang = GLib.get_language_names()
    const prefLang = sysLang[0].replace(/[.@].*$/, '')
    this._settingsChanged.switchLang = () => {
      const yy = this._settings.get_int('yuyan')
      let holiday = prefLang

      let lang = 0
      if (prefLang === 'zh_CN')
        lang = 2
      else if (prefLang.startsWith('zh_'))
        lang = 1
      else if (prefLang.startsWith('de_'))
        lang = -3
      else if (prefLang.startsWith('en_'))
        lang = -1

      if (yy === 0) {
        lang = 2
        holiday = 'zh_CN'
      } else if (yy === 1) {
        lang = 1
        holiday = 'zh_HK'
      } else if (yy === 2) {
        lang = 1
        holiday = 'zh_TW'
      } else if (yy === 4) {
        if (lang < 0)
          lang += 1
        else
          lang = 0
      } else if (yy === 5) {
        if (lang >= 0)
          lang = -1
      }

      this._ld.setLang(lang)
      this._ld.setHoliday(holiday)
    }
    this._settingsChanged.switchLang()

    const dm = Main.panel.statusArea.dateMenu

    const cal = dm._calendar
    const ml = dm._messageList

    this._replacementFunc.originalMonthHeader = cal._headerFormat
    let rebuild_in_progress = false
    let update_in_progress = false

    // look up headerFormat translation in global gettext
    let fixupHeader = globalThis._("%OB %Y").match(/%Y[^%]+%/)
    if (fixupHeader)
      cal._headerFormat = cal._headerFormat.replace(/%Y.%/, fixupHeader)

    // avoid replacing WallClock with a custom Object inheriting from
    // GObject due to bgo#734071

    dm._clock = new GnomeDesktop.WallClock()
    this._settingsChanged.refreshClock = () => {
      self._ld.setDate(new Date())
      dm._clockDisplay.text = dm._clock.clock + this._getLunarClockDisplay()
    }

    this._replacementFunc.clockId = dm._clock.connect('notify::clock', this._settingsChanged.refreshClock)
    this._settingsChanged.refreshClock()

    const lunarButton = (orig_button, iter_date, oargs) => {
      if (+oargs[0].label == +iter_date.getDate().toString()) {
        iter_date._lunar_iter_found = true
        self._ld.setDateNoon(iter_date)
        const yd = self._settings.get_boolean('show-calendar') ? self._ld.strftime("%(ri)") : ""
        const dx = self._settings.get_string('zti-dx')
        let l = oargs[0].label
        if (yd != "") l += "\n<small>" +
          self._ld.strftimex(yd == "1" ? "%(YUE)月" : "%(RI)") +
          "</small>"
        if (dx != "none") l = `<span size='${dx}'>${l}</span>`
        oargs[0].label = l
      }
      let new_button = _make_new_with_args(orig_button, oargs)
      new_button.child.use_markup = true

      return new_button
    }

    const updateYear = (that) => {
      self._ld.setDate(new Date())
      const cny_now = self._ld.strftime("%(shengxiao)")
      self._ld.setDateNoon(that._selectedDate)
      const cny = self._ld.strftime("%(shengxiao)")
      if (cny != cny_now)
        that._monthLabel.text = that._monthLabel.text + " / " + cny
    }

    this._injectionManager.overrideMethod(
      cal, '_rebuildCalendar', originalMethod => function () {
        if (rebuild_in_progress) {
          console.log("lunarcal: stopped nested calendar._rebuildCalendar")
          return
        }
        rebuild_in_progress = true

        const orig_button = St.Button
        const orig_date = Date
        let iter_date = new orig_date()

        Date = function () {
          let new_date = _make_new_with_args(orig_date, arguments)
          if (!iter_date._lunar_iter_found &&
              arguments.length > 0 && arguments[0] instanceof orig_date) {
            iter_date = new_date
          }
          return new_date
        }

        St.Button = function () {
          return lunarButton(orig_button, iter_date, arguments)
        }

        const orig_source = this._eventSource
        if (!(orig_source instanceof LunarEventSource))
          this._eventSource = new LunarEventSource(self._settings, self._ld, orig_source)

        originalMethod.apply(this, arguments)

        this._eventSource = orig_source
        St.Button = orig_button
        Date = orig_date
        let cal_style_class = cal.style_class.split(' ')
            .filter(e => e.length && e != 'lunar-calendar' && !e.startsWith('lunar-calendar-'))
        if (self._settings.get_boolean('show-calendar')) {
          cal_style_class.push('lunar-calendar')
          const dx = self._settings.get_string('zti-dx')
          cal_style_class.push('lunar-calendar-' + dx)
        }
        cal.style_class = cal_style_class.join(' ')

        rebuild_in_progress = false
      })

    this._injectionManager.overrideMethod(
      cal, '_update', originalMethod => function () {
        if (update_in_progress) {
          console.log("lunarcal: stopped nested calendar._update")
          return
        }
        update_in_progress = true

        originalMethod.apply(this, arguments)
        updateYear(cal)
        if (ml._lunarCalendarSection && cal._selectedDate)
          ml._lunarCalendarSection.setDate(cal._selectedDate)

        update_in_progress = false
      })

    this._settingsChanged.rebuildCal = () => {
      cal._rebuildCalendar()
      if (ml._lunarCalendarSection && cal._selectedDate)
        cal._update()
    }

    ml._lunarCalendarSection = new LunarCalendarSection(this._settings, this._ld)
    ml._addSection(ml._lunarCalendarSection)
    ml._sectionList.set_child_at_index(ml._lunarCalendarSection, 3)
    ml._lunarCalendarSection._sync()
    ml._sync()

    const updateDate = () => {
      self._ld.setDate(new Date())
      const cny_now = self._ld.strftime("%(shengxiao)")
      let date_label = dm._date._dateLabel
      date_label.text = date_label.text + (date_label.text.match(/[.,]/) ? ", " : "\u2001") + cny_now
    }

    this._replacementFunc.openMenuId = dm.menu.connect('open-state-changed', (menu, isOpen) => {
      if (isOpen)
        updateDate()
    })

    this._settingsChanged.rebuildCal()
    this._ld._notifyHoliday = this._settingsChanged.rebuildCal
  }

  disable() {
    const dm = Main.panel.statusArea.dateMenu

    let restore_style = dm._calendar.style_class.split(' ')
        .filter(e => e.length && e != 'lunar-calendar' && !e.startsWith('lunar-calendar-'))
        .join(' ')
    dm._calendar.style_class = restore_style

    this._injectionManager.clear()
    this._injectionManager = null

    dm._calendar._headerFormat = this._replacementFunc.originalMonthHeader
    delete this._replacementFunc.originalMonthHeader

    dm._messageList._lunarCalendarSection.destroy()
    delete dm._messageList._lunarCalendarSection

    dm._clock.disconnect(this._replacementFunc.clockId)
    delete this._replacementFunc.clockId
    dm._clock = new GnomeDesktop.WallClock()

    dm.menu.disconnect(this._replacementFunc.openMenuId)
    delete this._replacementFunc.openMenuId

    dm._clock.bind_property('clock', dm._clockDisplay, 'text', GObject.BindingFlags.SYNC_CREATE)
    this._ld._notifyHoliday = null
    this._settingsChanged.rebuildCal()

    this._settingsChanged = {}
    this._settings = null

    this._ld = null
  }
}
