/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/
import {
  Component,
  h,
  Element,
  Event,
  Host,
  State,
  Prop,
  EventEmitter,
  Listen,
  Watch
} from "@stencil/core";
import { ElementMeasures } from "./og-combobox.interface";

@Component({
  tag: 'og-combobox',
  styleUrl: 'og-combobox.scss',
  shadow: true
})
export class OgCombobox {
  @Element() hostElement: HTMLElement;

  @State() isFocused: boolean;
  @State() reopen: boolean;
  @State() selectMeasures: DOMRect;
  @State() optionsMeasures: ElementMeasures;

  /** Controls the open state of the Option List  */
  @Prop({ mutable: true, reflectToAttr: true }) optionsOpened: boolean;

  /** An array of items to choose from */
  @Prop() items: any[];

  /** Placeholder when input is empty */
  @Prop() placeholder?: string;

  /** Optional label text */
  @Prop() label?: string;

  /** Maximum Height of the Options List */
  @Prop() maxHeight?: number;

  /** Optional message text */
  @Prop() message?: string;

  /** Alternate Icon */
  @Prop()
  icon?= `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96.15 96.15">
    <path fill="var(--og-combobox__icon-Fill, currentColor)" d="M.56 20.97l45.95 57.6c.76.96 2.37.96 3.13 0l45.96-57.6a2.86 2.86 0 0 0 .22-3.05 2 2 0 0 0-1.76-1.06H2.09a2 2 0 0 0-1.76 1.06 2.87 2.87 0 0 0 .23 3.05z"/>
  </svg>`;

  /** The initial value. Can be updated at runtime */
  @Prop({ mutable: true, reflectToAttr: true }) value: string;

  /** Controls the disabled state. */
  @Prop() disabled: boolean;

  /**
   * Set the property for the items to define as label. Default: "label"
   */
  @Prop()
  public itemLabelProperty: string = 'label';

  /**
   * Set the property for the items to define as value. Default: "value"
   */
  @Prop()
  public itemValueProperty: string = 'value';

  /**
   * Event is being emitted when value changes.
   */
  @Event() itemSelected: EventEmitter<string>;

  @Watch("optionsOpened")
  watchOptionsOpened(value: boolean) {

    if (value === true) {
      this.updateSelectMeasures();
    }
    if (value === false) {
      this.selectButtonElement.focus();
    }
    this.repositionOptionsInDom();
  }

  @Listen("scroll", { target: "window" })
  listenToWindowScroll() {
    if (!!this.optionsOpened || !!this.reopen) {
      this.updateSelectMeasures();
    }
  }

  @Listen("resize", { target: "window" })
  listenToWindowResize() {
    if (!!this.optionsOpened || !!this.reopen) {
      this.updateSelectMeasures();
    }
  }


  public componentDidLoad() {
    this.updateSelectMeasures();
  }

  private get selectButtonElement(): HTMLElement {
    return this.hostElement.shadowRoot.querySelector("#select");
  }

  private updateSelectMeasures() {
    this.selectMeasures = this.selectButtonElement.getBoundingClientRect() as DOMRect;

    /**
     * If the Select Button is out of view, we hide the opened List.
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
     * If the 'reopen' Option is set we show the List when the Select Button
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

  private uniqueId = this.generateUid();

  private handleSelectKeyDown(event: KeyboardEvent) {
    if ((event.code === "Space") && !this.disabled) {
      event.preventDefault();
      this.optionsOpened = !this.optionsOpened;
    }
  }

  private handleSelectFocus(focus: boolean) {
    if (!this.disabled) {
      this.updateSelectMeasures();
      this.isFocused = focus;
    }
  }

  private handleSelectClick() {
    if (!this.disabled) {
        this.optionsOpened = !this.optionsOpened;
    }
  }

  private handleChange(event) {
    this.value = event.target.value;
    this.itemSelected.emit(this.value);
  }

  private getSelectedItemLabel(): string {
    if (!this.hasValidItems()) {
      return '';
    }
    const item = this.items.find(
      item => item[this.itemValueProperty] === this.value
    );
    if (!item) {
      return '';
    }
    return item[this.itemLabelProperty];
  }

  private hasValidItems(): boolean {
    return Array.isArray(this.items);
  }

  /**
   * Attach the Option List to <body> so it can't be cut off by
   * overflow:hidden settings in any parent element.
   */
  private repositionOptionsInDom() {
    const listInside = this.hostElement.shadowRoot.querySelector('#options');
    if (listInside) {
      document.body.appendChild(listInside);
      return
    }
  }

  render() {

    return (
      <Host
        class={{
          "is-focused": this.isFocused,
          "is-disabled": this.disabled,
          "is-opened": this.optionsOpened,
          "has-content": !!this.value
        }}
      >
        <div class="og-combobox">
          <div class="og-combobox__main">
            <div
              role="button"
              tabindex={this.disabled ? "-1" : "0"}
              id="select"
              class="og-combobox__box"
              onFocus={() => this.handleSelectFocus(true)}
              onBlur={() => this.handleSelectFocus(false)}
              onClick={() => this.handleSelectClick()}
              onKeyDown={event => this.handleSelectKeyDown(event)}
            >
              {this.label && (
                <span class="og-combobox__label">{this.label}</span>
              )}
              <input
                type="text"
                id={this.uniqueId}
                class="og-combobox__input"
                value={this.getSelectedItemLabel()}
                disabled={this.disabled}
                onInput={event => this.handleChange(event)}
                placeholder={this.placeholder}
                tabindex="-1"
                readonly
              />
              <div class="og-combobox__indicator"></div>
              <div class="og-combobox__icon" innerHTML={this.icon}></div>
            </div>
            {this.message && (
              <span class="og-combobox__message">{this.message}</span>
            )}
          </div>
        </div>
        <og-combobox-list
          id="options"
          items={this.items}
          maxHeight={this.maxHeight}
          optionsOpened={this.optionsOpened}
          itemValueProperty={this.itemValueProperty}
          itemLabelProperty={this.itemLabelProperty}
          positionSource={this.selectMeasures}
          reopen={this.reopen}
          value={this.value}
          onItemSelected={(event) => this.value = event.detail}
          onOptionsClosed={() => this.optionsOpened = false}
        >
        </og-combobox-list>
      </Host>
    );
  }
}
