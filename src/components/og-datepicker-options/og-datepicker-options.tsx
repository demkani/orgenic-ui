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
  Watch,
  Host,
  Listen
} from '@stencil/core';
import { OgCalendarDate, OgDateDecorator } from '../og-internal-calendar/interfaces/og-calendar-date-decorator';
import { CalendarUtils } from '../og-internal-calendar/utils/utils';
import moment from 'moment';
import { loadMomentLocale, getDefaultLocale } from '../../utils/moment-locale-loader';
import { ElementMeasures } from '../og-combobox/og-combobox.interface';
import { positionSelectOptions } from '../../utils/positionSelectOptions';
// import { positionSelectOptions } from '../../utils/positionSelectOptions';

@Component({
  tag: 'og-datepicker-options',
  styleUrl: 'og-datepicker-options.scss',
  shadow: true
})
export class OgDatepickerOptions {

  @Element()
  public hostElement: HTMLElement;

  public ogCalendarElement: HTMLOgCalendarElement;

  /**
   * Current Dimensions of the Options.
   */
  @State() optionsMeasures: ElementMeasures;

  /**
   * The date decorator can be used to highlight special dates like public
   * holidays or meetings.
   */
  @Prop()
  public dateDecorator: OgDateDecorator;

  /**
   * Determines, whether the Options are disabled or not.
   */
  @Prop()
  public disabled: boolean;

  /**
   * Defines the date string format. The value will be parsed and emitted
   * using this format.
   */
  @Prop()
  public format: string = 'DD.MM.YYYY';

  @Watch('format') public setFormat() {
    this.setValue(this.value);
  }

  /**
   * Date Information for internal handling.
   */
  @Prop()
  public internalValue: OgCalendarDate;

  /**
   * Locale for this datepicker (country code in ISO 3166 format).
   */
  @Prop()
  public loc = getDefaultLocale();

  /**
   * Determines, whether the Options are opened or not.
   */
  @Prop({ mutable: true, reflectToAttr: true })
  public optionsOpened: boolean;

  @Watch('optionsOpened')
  watchOptionsOpened(newValue: boolean) {
    if (!!newValue) {
      this.updateOptionsMeasures();
    }
  }

  /**
   * Dimensions of the Select Button.
   */
  @Prop()
  public positionSource: DOMRect;

  @Watch('positionSource')
  private updateOptionsMeasures() {
    const currentOptions = this.hostElement.getBoundingClientRect() as DOMRect;

    /**
     * DOMRect can't get the correct width and height because the element is
     * 'hidden'. So we use scrollWidth and scrollHeight here.
     */
    currentOptions.height = this.hostElement.scrollHeight;
    currentOptions.width = this.hostElement.scrollWidth;

    /**
     * Calculate new dimensions for the Options
     */
    const newDimensions = positionSelectOptions(
      this.positionSource,
      currentOptions
    )

    this.optionsMeasures = newDimensions;
  }

  @Prop()
  public reopen: boolean;

  @Prop({ context: 'resourcesUrl' })
  public resourcesUrl!: string;

  /**
   * The selected value of the calendar options.
   */
  @Prop({ mutable: true, reflectToAttr: true })
  public value: string;

  @Watch('value')
  public setValue(newValue: string) {
    if (typeof newValue === 'string') {
      moment.locale(this.loc);
      const lmoment = moment(newValue, this.format);
      this.internalValue = CalendarUtils.moment2CalendarDate(lmoment);
    }
  }

  /**
   * Event emitted when selected date is being changed.
   */
  @Event()
  public dateSelected: EventEmitter<OgCalendarDate>;

  /**
   * Event emitted when the Options are being closed.
   */
  @Event() optionsClosed: EventEmitter<boolean>;


  public async componentWillLoad() {
    await loadMomentLocale(this.loc, moment);
    this.setValue(this.value);
  }

  public componentDidLoad() {
    this.setValue(this.value);
  }

  @Listen('click', { target: 'window' })
  listenToWindowClick(event) {
    if ((!!this.optionsOpened || !!this.reopen) && event.target !== this.hostElement) {
      this.optionsClosed.emit(false)
    }
  }

  @Listen('focus', { target: this.hostElement })
  public async handleHostFocus() {
    this.ogCalendarElement.focus();
  }

  public handleDateClicked(event) {
    event.cancelBubble = true;

    if (!this.disabled) {
      const date: OgCalendarDate = event.detail;
      this.internalValue = date;
      this.value = CalendarUtils.calendarDate2Moment(date, this.loc).format(this.format);
      this.dateSelected.emit(date);
      // this.optionsOpened = false;
      this.optionsClosed.emit(false)
    }
  }

  // private handleHostFocus() {
  //   console.log('DATEPICKER HOST FOCUS', this.ogCalendarElement);
  // }

  public render(): HTMLElement {
    return (
      <Host
        class={{
          "is-open": this.optionsOpened,
        }}
        style={{
          height: this.optionsOpened && this.optionsMeasures ? this.optionsMeasures.height + "px" : "0",
          left: this.optionsOpened && this.optionsMeasures ? this.optionsMeasures.left + "px" : "0",
          top: this.optionsOpened && this.optionsMeasures ? this.optionsMeasures.top + "px" : "0",
          width: this.optionsOpened && this.optionsMeasures ? this.optionsMeasures.width + "px" : "auto",
        }}
        tabindex="-1"
      >
        <div class="og-datepicker-options">
          <og-calendar
            year={!this.internalValue ? undefined : this.internalValue.year}
            month={!this.internalValue ? undefined : this.internalValue.month}
            loc={this.loc}
            dateDecorator={this.dateDecorator}
            selection={!this.internalValue ? [] : [this.internalValue]}
            selectionType="single"
            onDateClicked={(e) => this.handleDateClicked(e)}
            ref={el => this.ogCalendarElement = el}
            tabindex={this.optionsOpened ? "0" : "-1"}
            captureFocus
          >
          </og-calendar>
        </div>
      </Host>
    );
  }
}
