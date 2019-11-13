/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, Element, Event, EventEmitter, Host, Listen, Watch,  } from '@stencil/core';
import moment, { Moment } from 'moment';
import { OgDateDecorator, OgCalendarDate } from './interfaces/og-calendar-date-decorator';
import { CalendarUtils } from './utils/utils';
import { loadMomentLocale, getDefaultLocale } from '../../utils/moment-locale-loader';

@Component({
  tag: 'og-internal-calendar',
  styleUrl: 'og-internal-calendar.scss',
  shadow: true
})
export class OgInternalCalendar {

  @Element()
  public hostElement: HTMLElement;

  /**
   * DOM Element of the currently focused day
   */
  public dayFocused: HTMLElement;

  /**
   * Collection of all DOM Elements of days in this view.
   */
  public dayGrid: HTMLElement[];

  /**
   * Current Array Position of a Day inside the dayGrid.
   */
  public dayIndex: number;

  /**
   * Indicator of whether a day should be focused for the previous month.
   */
  public focusPrev: boolean;

  /**
   * Indicator of whether a day should be focused for the next month.
   */
  public focusNext: boolean;

  /**
   * Amount of days we want to 'jump' when navigating with a keyboard
   */
  public dayOffset: number;


  @Prop({ context: 'resourcesUrl' })
  public resourcesUrl!: string;

  @Prop()
  public year: number = new Date().getFullYear();

  @Prop()
  public month: number = new Date().getMonth();

  @Prop()
  public loc = getDefaultLocale();

  @Prop()
  public showCalendarWeek: boolean = true;

  @Prop()
  public dateDecorator: OgDateDecorator;

  @Prop()
  public selection: OgCalendarDate[];

  /**
   * Emits 'moment' Object
   */
  @Event()
  public dateClicked: EventEmitter; // emits moment object

  /**
   * Emits an Object with current 'month' and 'year' value
  */
  @Event()
  public viewChanged: EventEmitter<{month: number, year: number}>;


  private internalMoment: Moment;

  public async componentWillLoad() {
    await loadMomentLocale(this.loc, moment);
    this.internalMoment = moment();
  }

  public componentDidUpdate() {
    if (this.focusPrev) {
      this.dayIndex = this.getAmountDaysThisMonth() - 1;
      this.dayFocused = this.findPrevAvailableDay();
      this.dayFocused && (this.dayFocused.focus(), this.dayFocused.tabIndex = 0);
      this.focusPrev = false;
    }
    if (this.focusNext) {
      this.dayIndex = 0;
      this.dayFocused = this.findNextAvailableDay();
      this.dayFocused && (this.dayFocused.focus(), this.dayFocused.tabIndex = 0);
      this.focusNext = false;
    }
  }

  public getFirstDayOfWeek() {
    return this.internalMoment.startOf('week').day();
  }

  public getDayArray() {
    return [0,1,2,3,4,5,6].map(d => {
      return (d + this.getFirstDayOfWeek()) % 7;
    });
  }

  @Watch('year')
  @Watch('month')
  public updateDayGrid() {
    this.viewChanged.emit({month: this.month, year: this.year});
  }

  public getClasses(m: Moment) {
    let result = 'day';

    /**
     * Mark 'today'.
     */
    if (m.isSame(new Date(), "day")) {
      result += ' day--today';
    }

    /**
     * Mark weekend days
     */
    if ([5, 6].includes(m.isoWeekday())) {
      result += ' day--weekend';
    }

    /**
     * Mark all days of the active month.
     * Also mark selected days and add optionally custom decorator classes.
     */
    if (m.year() === this.year && m.month() === this.month) {
      result += ' day--same-month';
      if (this.selection && this.selection.find(s => CalendarUtils.compareCalendarDate2Moment(s, m))) {
        result += ' day--selected';
      }
      if (this.dateDecorator) {
        const dd = this.dateDecorator.getDateDecoration(m.clone());
        if (dd.class) {
          result += ` ${dd.class}`;
        }
      }
    }

    /**
     * Mark all days of the previous month.
     */
    else if (m.month() === (this.month != 0 ? this.month - 1 : 11)) {
      result += ' day--prev-month';
      if (this.dateDecorator) {
        const dd = this.dateDecorator.getDateDecoration(m.clone());
        if (dd.class) {
          result += ` ${dd.class}`;
        }
      }
    }

    /**
     * Mark all days of the next month.
     */
    else if (m.month() === (this.month !=11 ? this.month + 1 : 0)) {
      result += ' day--next-month';
      if (this.dateDecorator) {
        const dd = this.dateDecorator.getDateDecoration(m.clone());
        if (dd.class) {
          result += ` ${dd.class}`;
        }
      }
    }

    /**
     * Any other day is marked as disabled.
     */
    else {
      result += ' day--disabled';
    }
    return result;
  }

  /**
   * Returns an Arrays of HTMLElements of all days of the current Month.
   */
  public getAllDaysThisMonth() {
    const result: HTMLElement[] =
      this.dayGrid.filter(
        (day) => day.classList.contains('day--same-month')
      )
    return result;
  }


  /**
   * Go to previous Month
   */
  public goToPrevMonth() {
    if (this.month !== 0) {
      --this.month;
    } else {
      --this.year;
      this.month = 11;
    }
  }

  /**
   * Go to next Month
   */
  public goToNextMonth() {
    if (this.month !== 11) {
      ++this.month;
    } else {
      ++this.year;
      this.month = 0;
    }
  }

  /**
   * Returns the amount of Days of the active Month.
   */
  public getAmountDaysThisMonth() {
    return this.getAllDaysThisMonth().length;
  }

  public findPrevAvailableDay() {

    /**
     * If the current day is the first day of the month,
     * we switch to the previous month. But if we're already in
     * January we also switch the year.
     */
    if ((this.dayIndex - this.dayOffset) < 0) {
      this.focusPrev = true;
      this.dayOffset = this.dayOffset - this.dayIndex - 1;
      this.goToPrevMonth();
      return;
    }

    let target = this.getAllDaysThisMonth()[this.dayIndex - this.dayOffset];

    while (target.classList.contains('day--disabled')) {
      this.dayOffset++;

      /**
       * If the target day is not inside this month we
       * switch to the previous month and reset the dayOffset counter.
       */
      if ((this.dayIndex - this.dayOffset) < 0) {
        this.focusPrev = true;
        this.dayOffset = this.dayOffset - this.dayIndex - 1;
        this.goToPrevMonth();
      }

      target = this.getAllDaysThisMonth()[this.dayIndex - this.dayOffset];
    }

    return target;
  }

  public findNextAvailableDay() {

    if ((this.dayIndex + this.dayOffset) > (this.getAmountDaysThisMonth() - 1)) {

      this.focusNext = true;
      this.dayOffset = (this.dayIndex + this.dayOffset) - (this.getAmountDaysThisMonth());
      this.goToNextMonth();
      return;
    }

    let target = this.getAllDaysThisMonth()[this.dayIndex + this.dayOffset];

    while (target.classList.contains('day--disabled')) {
      ++this.dayOffset;

      /**
       * If the target day is not inside the current month we
       * switch to the next month and reset the dayOffset counter.
       */
      if ((this.dayIndex + this.dayOffset) > (this.getAmountDaysThisMonth() - 1)) {
        this.focusNext = true;
        this.dayOffset = (this.dayIndex + this.dayOffset) - (this.getAmountDaysThisMonth());
        this.goToNextMonth();
      }

      target = this.getAllDaysThisMonth()[this.dayIndex + this.dayOffset];
    }

    return target;
  }

  public handleSelect(localM: moment.Moment, event: MouseEvent | KeyboardEvent) {
    event.preventDefault();
    this.dayFocused = event.target as HTMLElement;
    this.dayFocused.focus();
    this.dateClicked.emit(localM);
  }

  private setUpInternalMoment() {
    this.internalMoment.locale(this.loc);
    this.internalMoment.year(this.year);
    this.internalMoment.month(this.month);
    this.internalMoment.date(1);

    const firstDayOfWeek = this.getFirstDayOfWeek();

    if (this.internalMoment.day() < firstDayOfWeek) {
      this.internalMoment.day(firstDayOfWeek - 7);
    } else {
      this.internalMoment.day(firstDayOfWeek);
    }
  }

  /**
   * When the Hostelement gets focus, we 'redirect' it.
   * First we look for today's date. Otherwise we search the first available
   * day inside the current month.
   */
  @Listen("focus", {target: this.hostElement})
  public async handleHostFocus() {
    if (!this.dayFocused) {
      this.dayFocused =
        this.hostElement.shadowRoot.querySelector('.day--same-month.day--today:not(.day--disabled)') ||
        this.hostElement.shadowRoot.querySelector('.day--same-month:not(.day--disabled)');
    }
    this.dayFocused && (this.dayFocused.focus(), this.dayFocused.tabIndex = 0);
    this.dayFocused.focus()
  }

  @Listen("blur", { target: this.hostElement })
  public async handleHostBlur() {
    if (this.dayFocused) {
      this.dayFocused.tabIndex = -1;
      this.dayFocused = undefined;
    }
  }

  @Listen("keydown", {target: this.hostElement})
  public async handleHostKeyDown(ev: KeyboardEvent) {

    this.dayIndex = this.getAllDaysThisMonth().indexOf(this.dayFocused) || 0;

    switch (ev.key) {

      case 'ArrowUp':
        ev.preventDefault();
        this.dayOffset = 7;
        this.dayFocused.tabIndex = -1;
        this.dayFocused = this.findPrevAvailableDay();
        this.dayFocused && (this.dayFocused.focus(), this.dayFocused.tabIndex = 0);
        break;

      case 'ArrowDown':
        ev.preventDefault();
        this.dayOffset = 7;
        this.dayFocused.tabIndex = -1;
        this.dayFocused = this.findNextAvailableDay();
        this.dayFocused && (this.dayFocused.focus(), this.dayFocused.tabIndex = 0);
        break;

      case 'ArrowLeft':
        ev.preventDefault();
        this.dayOffset = 1;
        this.dayFocused.tabIndex = -1;
        this.dayFocused = this.findPrevAvailableDay();
        this.dayFocused && (this.dayFocused.focus(), this.dayFocused.tabIndex = 0);
        break;

      case 'ArrowRight':
        ev.preventDefault();
        this.dayOffset = 1;
        this.dayFocused.tabIndex = -1;
        this.dayFocused = this.findNextAvailableDay();
        this.dayFocused && (this.dayFocused.focus(), this.dayFocused.tabIndex = 0);
        break;

      default:
        break;
    }
  }


  public render(): HTMLElement {
    this.setUpInternalMoment();
    this.dayGrid = [];
    return (
      <Host>
        <table>
          <thead>
            <tr>
              { this.showCalendarWeek && <th></th> }
              {
                this.getDayArray().map((d): HTMLElement => {
                  return <th>{ this.internalMoment.day(d).format('dd') }</th>;
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              [0,1,2,3,4,5].map((): HTMLElement => {
                return (<tr>
                  { this.showCalendarWeek && <td class="week">{ this.internalMoment.week() }</td> }
                  {
                    [0,1,2,3,4,5,6].map((): HTMLElement => {
                      const localM = this.internalMoment.clone();
                      this.internalMoment.add(1, 'd');
                      return (
                        <td
                          tabIndex={ -1 }
                          onClick={ (e) => this.handleSelect(localM, e) }
                          ref={(el) => {
                            this.dayGrid = [...this.dayGrid, el];
                          }}
                          onKeyUp={(e) => e.key === ' ' && this.handleSelect(localM, e)}
                          onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                          class={ this.getClasses(localM) }
                          >
                          <div class="day__label">
                            { localM.date() }
                          </div>
                          <div class="day__indicator"></div>
                        </td>
                      );
                    })
                  }
                </tr>)
              })
            }
          </tbody>
        </table>
      </Host>
    );
  }
}
