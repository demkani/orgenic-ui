/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import {
  h,
  Component,
  Prop,
  EventEmitter,
  Event,
  State,
  Element,
  // Listen,
  Watch,
  Host,
  Listen
} from '@stencil/core';
import { OgCalendarDate, OgDateDecorator } from '../og-internal-calendar/interfaces/og-calendar-date-decorator';
import { CalendarUtils } from '../og-internal-calendar/utils/utils';
import moment from 'moment';
import { loadMomentLocale, getDefaultLocale } from '../../utils/moment-locale-loader';
import { ElementMeasures } from '../og-combobox/og-combobox.interface';

@Component({
  tag: 'og-datepicker',
  styleUrl: 'og-datepicker.scss',
  shadow: true
})
export class OgDatepicker {
  @Element()
  public hostElement: HTMLElement;

  @State() reopen: boolean;
  @State() isFocused: boolean;
  @State() selectMeasures: DOMRect;
  @State() optionsMeasures: ElementMeasures;
  @State()
  private internalValue: OgCalendarDate;

  public optionsElement: HTMLOgDatepickerOptionsElement;
  public selectButtonElement: HTMLElement;

  /**
   * The date decorator can be used to highlight special dates like public holidays or meetings.
   */
  @Prop()
  public dateDecorator: OgDateDecorator;

  /**
   * Determines, whether the control is disabled or not
   */
  @Prop()
  public disabled: boolean;

  /**
   * Defines the date string format. The value will be parsed and emitted using this format.
   */
  @Prop()
  public format: string = 'DD.MM.YYYY';

  @Watch('format')
  public setFormat() {
    this.setValue(this.value);
  }

  /** Alternate Icon */
  @Prop()
  icon?= `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96.15 96.15">
    <path fill="var(--og-combobox__icon-Fill, currentColor)" d="M.56 20.97l45.95 57.6c.76.96 2.37.96 3.13 0l45.96-57.6a2.86 2.86 0 0 0 .22-3.05 2 2 0 0 0-1.76-1.06H2.09a2 2 0 0 0-1.76 1.06 2.87 2.87 0 0 0 .23 3.05z"/>
  </svg>`;

  /** Optional label text */
  @Prop() label?: string;

  /**
   * Locale for this datepicker (country code in ISO 3166 format)
   */
  @Prop()
  public loc = getDefaultLocale();

  /** Controls the open state of the Option List  */
  @Prop({ mutable: true, reflectToAttr: true })
  public optionsOpened: boolean;

  @Watch("optionsOpened")
  public watchOptionsOpened(newValue: boolean) {

    this.repositionOptionsInDom();
    if (newValue === true) {
      this.updateSelectMeasures();
    }

    if (newValue === false) {
      this.selectButtonElement.focus();
    }

  }

  /**
   * Optional placeholder if no value is selected.
   */
  @Prop()
  public placeholder?: string;

  @Prop({ context: 'resourcesUrl' })
  public resourcesUrl!: string;


  /**
   * The selected value of the combobox
   */
  @Prop({ mutable: true, reflectToAttr: true })
  public value?: string;

  @Watch('value')
  public setValue(newValue: string) {
    if (typeof newValue === 'string') {
      moment.locale(this.loc);
      const lmoment = moment(newValue, this.format);
      this.internalValue = CalendarUtils.moment2CalendarDate(lmoment);
    }
  }

  /**
   * Event is being emitted when selected date changes.
   */
  @Event()
  public dateSelected: EventEmitter<any>;

  public async componentWillLoad() {
    await loadMomentLocale(this.loc, moment);
    this.setValue(this.value);
  }

  public componentDidLoad() {
    this.setValue(this.value);
    this.updateSelectMeasures();
  }

  private generateUid() {
    return (
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }

  private handleChange(event) {
    this.value = event.target.value;
    this.dateSelected.emit(this.value);
  }

  public handleDateClicked(event) {
    event.cancelBubble = true;

    if (!this.disabled) {
      const date: OgCalendarDate = event.detail;

      this.internalValue = date;
      this.value = CalendarUtils.calendarDate2Moment(date, this.loc).format(this.format);
      this.dateSelected.emit(CalendarUtils.calendarDate2Moment(date, this.loc).toDate());
    }
  }

  private handleSelectClick() {
    if (!this.disabled) {
      this.optionsOpened = !this.optionsOpened;
    }
  }

  private handleSelectFocus(focus: boolean) {
    if (!this.disabled) {
      this.updateSelectMeasures();
      this.isFocused = focus;
    }
  }

  @Listen('keydown', { target: 'window' })
  public async handleHostKeyDown(event: KeyboardEvent) {
    /**
     * Pressing 'Escape' closes the opened Options.
     */
    if (event.code === "Escape" && this.optionsOpened) {
      this.optionsOpened = false;
    }
  }

  private handleSelectKeyUp(event: KeyboardEvent) {
    /**
     * Pressing 'Space' toggles the Options visibility and applies focus
     * when visbile.
     */
    if (event.code === "Space") {
      this.optionsOpened = !this.optionsOpened;
      if (this.optionsOpened) {
        this.optionsElement.focus();
      }
    }
  }

  private handleSelectKeyDown(event: KeyboardEvent) {
    /**
     * Prevents jumping/scrolling when pressing 'Space'
     */
    if (event.code === "Space") {
      event.preventDefault();
    }

    /**
     * Clicking on the Select Button opens the Options but keeps focus on
     * the Button. Using the Tab key now closes the options.
     */
    if (event.code === "Tab") {
      this.optionsOpened = false;
      this.reopen = false;
    }

  }

  /**
   * Attach the Option List to <body> so it can't be cut off by
   * overflow:hidden settings in any parent element. And put it back again
   * afterwards so we don't leave a mess.
   */
  private repositionOptionsInDom() {
    const optionsInside = this.hostElement.shadowRoot.querySelector(`[og-data-options="${this.uniqueId}"]`);
    if (optionsInside) {
      document.body.appendChild(optionsInside);
      return;
    }
    const optionsOutside = document.querySelector(`[og-data-options="${this.uniqueId}"]`);
    if (optionsOutside) {
      this.hostElement.shadowRoot.appendChild(optionsOutside);
    }
  }

  private updateOptionsVisibility() {
    /**
     * If the Select Button is out of view, we hide the opened Options.
     */
    if (!!this.optionsOpened) {
      if (
        this.selectMeasures.top <= -16 ||
        this.selectMeasures.top >= window.innerHeight
      ) {
        this.optionsOpened = false;
        this.reopen = true;
      }
    }

    /**
     * If the 'reopen' Property is set we show the Options when the Select Button
     * returns into the view.
     */
    if (!!this.reopen) {
      if (
        this.selectMeasures.top > 0 &&
        this.selectMeasures.top < window.innerHeight
      ) {
        this.optionsOpened = true;
        this.reopen = false;
      }
    }
  }

  private updateSelectMeasures() {
    this.selectMeasures = this.selectButtonElement.getBoundingClientRect() as DOMRect;
  }

  private uniqueId = this.generateUid();

  @Listen("resize", { target: "window" })
  @Listen("scroll", { target: "window" })
  listenToWindowScroll() {
    if (!!this.optionsOpened || !!this.reopen) {
      this.updateSelectMeasures();
      this.updateOptionsVisibility();
    }
  }

  public render(): HTMLElement {
    return (
      <Host
        class={{
          "is-focused": this.isFocused,
          "is-disabled": this.disabled,
          "is-opened": this.optionsOpened,
          "has-content": !!this.value
        }}
        og-data-select={this.uniqueId}
      >
        <div class="og-combobox">
          <div class="og-combobox__main">
            <div
              role="button"
              tabindex={this.disabled ? "-1" : "0"}
              id="og-datepicker-select"
              class="og-combobox__box"
              onFocus={() => this.handleSelectFocus(true)}
              onBlur={() => this.handleSelectFocus(false)}
              onClick={() => this.handleSelectClick()}
              onKeyUp={event => this.handleSelectKeyUp(event)}
              onKeyDown={event => this.handleSelectKeyDown(event)}
              ref={el => this.selectButtonElement = el}
            >
              {this.label && (
                <span class="og-combobox__label">{this.label}</span>
              )}
              <input
                type="text"
                id={this.uniqueId}
                class="og-combobox__input"
                value={this.value}
                disabled={this.disabled}
                onInput={event => this.handleChange(event)}
                placeholder={this.placeholder}
                tabindex="-1"
                readonly
              />
              <div class="og-combobox__indicator"></div>
              <div class="og-combobox__icon" innerHTML={this.icon}></div>
            </div>
          </div>
        </div>
        <og-datepicker-options
          id="og-datepicker-options"
          og-data-options={this.uniqueId}
          loc={this.loc}
          positionSource={this.selectMeasures}
          dateDecorator={this.dateDecorator}
          internalValue={this.internalValue}
          optionsOpened={this.optionsOpened}
          onDateSelected={(e) => this.handleDateClicked(e)}
          onOptionsClosed={() => {
            this.optionsOpened = false;
            this.reopen = false;

          }}
          reopen={this.reopen}
          tabindex="-1"
          ref={el => this.optionsElement = el}
        >
        </og-datepicker-options>
      </Host>
    );
  }
}
