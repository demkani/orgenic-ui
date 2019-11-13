/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, Element, EventEmitter, Event, Host, Listen } from '@stencil/core';
import moment from 'moment';
import { OgDateDecorator, OgCalendarSelectionType, OgCalendarDate } from '../og-internal-calendar/interfaces/og-calendar-date-decorator';
import { CalendarUtils } from '../og-internal-calendar/utils/utils';
import { loadMomentLocale, getDefaultLocale } from '../../utils/moment-locale-loader';

@Component({
  tag: 'og-calendar',
  styleUrl: 'og-calendar.scss',
  shadow: true
})
export class OgCalendar {

  @Element()
  public hostElement: HTMLElement;

  /**
   * Collection of Internal Calendar DOM elements inside this component.
   */
  public ogInternalCalendar: HTMLOgInternalCalendarElement[] = [];

  /**
  * Collection of "Previous Month" Navigation DOM elements inside this component.
   */
  public navPrevMonth: HTMLElement[] = [];

  /**
  * Collection of "Next Month" Navigation DOM elements inside this component.
   */
  public navNextMonth: HTMLElement[] = [];

  @Prop({ context: 'resourcesUrl' })
  public resourcesUrl!: string;

  @Prop({ reflectToAttr: true, mutable: true })
  public year: number = new Date().getFullYear();

  @Prop({ reflectToAttr: true, mutable: true })
  public month: number = new Date().getMonth();

  @Prop()
  public loc = getDefaultLocale();

  @Prop()
  public showCalendarWeek: boolean = true;

  /**
   * Amount of months that should be displayed.
   */
  @Prop()
  public displayedMonths: number = 1;

  @Prop()
  public dateDecorator: OgDateDecorator;

  @Prop()
  public captureFocus: boolean;

  @Prop()
  public selectionType: OgCalendarSelectionType = 'single';

  /**
   * Collection of selected days
   */
  @Prop({ reflectToAttr: true, mutable: true })
  public selection: OgCalendarDate[] = [];

  /**
   * Emits the currently clicked date when a day is clicked.
   */
  @Event()
  public dateClicked: EventEmitter<OgCalendarDate>;

  /**
   * Emits the current Selection of Dates when it changes.
   */
  @Event()
  public selectionChanged: EventEmitter<OgCalendarDate[]>;

  private internalMoment;

  public async componentWillLoad() {
    await loadMomentLocale(this.loc, moment);
    this.internalMoment = moment();
  }

  public handleViewChanged(event) {
    this.month = event.detail.month;
    this.year = event.detail.year;
  }

  public handleDateClick(event) {
    event.cancelBubble = true;

    const date = CalendarUtils.moment2CalendarDate(event.detail);
    if (this.selectionType !== 'none') {
      if (this.selectionType === 'single' || !this.selection) {
        this.selection = [date];
      } else {
        // multi
        // todo: implement selection types: range + multi-range
        const index = this.selection.findIndex(s => CalendarUtils.compareCalendarDate(s, date));
        if (index >= 0) {
          this.selection.splice(index, 1);
        } else {
          this.selection.push(date);
        }
        this.selection = [...this.selection];
      }
    }
    this.dateClicked.emit(date);
    this.selectionChanged.emit(this.selection);
  }

  public increaseMonth() {
    this.internalMoment.add(1, 'M');
    this.month = this.internalMoment.month();
    this.year = this.internalMoment.year();
  }

  public decreaseMonth() {
    this.internalMoment.subtract(1, 'M');
    this.month = this.internalMoment.month();
    this.year = this.internalMoment.year();
  }

  public handleInternalCalendarKeyDown(e: KeyboardEvent, i: number) {
    /**
     * Prevents focusing the hostelement when Internal Calendar sends
     * a 'Shift Tab' Event. 'Tab Out' 1/2
     */
    if (e.shiftKey) {
      this.hostElement.tabIndex = -1;
    }

    /**
     * - 'Tab' sets focus to the next Internal Calendar if available,
     *   otherwise to 'Previous Month' Button.
     * - 'Shift Tab' sets focus to the previous Internal Calendar if available,
     *   otherwise if in 'Capture Mode', to 'Previous Month' Button.
     */
    if (e.key === 'Tab') {
      if (!e.shiftKey) {
        // Tab
        e.preventDefault();
        if (this.ogInternalCalendar[i + 1]) {
          this.ogInternalCalendar[i + 1].focus();
        } else {
          this.navPrevMonth[0].focus();
        }
      } else {
        // shift + Tab
        if (this.ogInternalCalendar[i - 1]) {
          e.preventDefault();
          this.ogInternalCalendar[i - 1].focus();
          return;
        }
        if (!!this.captureFocus) {
          e.preventDefault();
          this.navNextMonth[this.navNextMonth.length - 1].focus();
        }
      }
    }
  }

  public handleInternalCalendarKeyUp(e: KeyboardEvent) {
    /**
     * Allows focusing the hostelement after Internal Calendar sends
     * a 'Shift Tab' Event. 'Tab Out' 2/2
     */
    if (e.key === 'Shift') {
      this.hostElement.tabIndex = 0;
    }
  }

  @Listen("focus", { target: this.hostElement })
  public async handleHostFocus() {
    this.ogInternalCalendar[0].focus();
  }

  @Listen("blur", { target: this.hostElement })
  public async handleHostBlur() {
    if (!!document.hasFocus) {
      this.hostElement.tabIndex = 0;
    }
  }

  /**
   * Handles KeyUp Events on Navigation Buttons.
   *
   * - 'Space' on 'Prev' decreases Month
   * - 'Space' on 'Next' increases Month
   */
  public handleNavKeyUp(direction: 'next' | 'prev', ev: KeyboardEvent) {
    if (ev.code === 'Space') {
      if (direction === 'prev') {
        this.decreaseMonth();
      }
      if (direction === 'next') {
        this.increaseMonth();
      }
    }
  }

  /**
   * Handles KeyDown Events on Navigation Buttons.
   *
   * - 'Tab' on 'Prev' sets focus to 'Next' Button.
   * - 'Shift Tab' on 'Prev' sets focus to the Internal Calendar.
   * - In 'Capture Mode', 'Tab' on 'Next' sets focus to the Internal Calendar,
   *   otherwise it simply tabs out.
   * - 'Shift Tab' on 'Next' sets focus to 'Prev' Button.
   */
  public handleNavKeyDown(direction: 'prev' | 'next', ev: KeyboardEvent) {

    if (ev.key === 'Tab') {
      if (direction === 'prev') {
        ev.preventDefault();
        if (!ev.shiftKey) {
          this.navNextMonth[this.navNextMonth.length - 1].focus();
        } else {
          this.ogInternalCalendar[0].focus();
        }
      }
      if (direction === 'next') {
        if (!ev.shiftKey) {
          if (!!this.captureFocus) {
            ev.preventDefault();
            this.ogInternalCalendar[0].focus();
          }
        } else {
          ev.preventDefault();
          this.navPrevMonth[0].focus();
        }


      }
    }

    /**
     * Prevents jumping/scrolling when pressing 'Space'
     */
    if (ev.code === "Space") {
      ev.preventDefault();
    }
  }

  public render(): HTMLElement[] {
    this.navNextMonth = [];
    this.internalMoment.locale(this.loc);
    this.internalMoment.year(this.year);
    this.internalMoment.month(this.month);

    const localM = this.internalMoment.clone();
    const result: HTMLElement[] = [];
    for (let i = 0; i < this.displayedMonths; i++) {
      result.push(
        <div class="calendar__container">
          <div class="calendar__header">
            <div class="calender__header__prefix">
              <div
                class={'calendar__nav' + (i > 0 ? ' calendar__nav--hidden' : '')}
                onClick={() => this.decreaseMonth()}
                onKeyDown={(e) => this.handleNavKeyDown('prev', e)}
                onKeyUp={(e) => this.handleNavKeyUp('prev', e)}
                tabindex="-1"
                ref={(el) => this.navPrevMonth[i] = el }
              >
                <svg
                  class={'calendar__nav__icon'}
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 14 24"
                  preserveAspectRatio="none"
                >
                  <polyline
                    class="og-"
                    points="12,2 2,12 12,24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecaps="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div class="calender__header__main">
              <span class="calender__header__month">{localM.format('MMM')}</span><span class="calender__header__year">{localM.year()}</span>
            </div>
            <div class="calender__header__suffix">
              <div
                class={'calendar__nav' + (i < this.displayedMonths - 1 ? ' calendar__nav--hidden' : '')}
                onClick={() => this.increaseMonth()}
                onKeyDown={(e) => this.handleNavKeyDown('next', e)}
                onKeyUp={(e) => this.handleNavKeyUp('next', e)}
                tabindex="-1"
                ref={(el) => this.navNextMonth[i] = el}
              >
                <svg
                  class={'calendar__nav__icon'}
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 14 24"
                  preserveAspectRatio="none"
                >
                  <polyline
                    class="og-"
                    points="2,2 12,12 2,24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecaps="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <og-internal-calendar
            tabindex="-1"
            ref={el => this.ogInternalCalendar[i] = el}
            class="calendar__main"
            month={localM.month()}
            year={localM.year()}
            loc={this.loc}
            showCalendarWeek={this.showCalendarWeek}
            dateDecorator={this.dateDecorator}
            selection={this.selection}
            onDateClicked={e => this.handleDateClick(e)}
            onViewChanged={(e) => this.handleViewChanged(e)}
            onKeyDown={(e) => this.handleInternalCalendarKeyDown(e, i)}
            onKeyUp={(e) => this.handleInternalCalendarKeyUp(e)}
          >
          </og-internal-calendar>
        </div>
      );
      localM.add(1, 'M');
    }
    return (
      <Host
        tabindex="0"
      >
        {result}
      </Host>
    );
  }
}
