/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/
import {
  h,
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  State,
  Listen,
} from "@stencil/core";
import { ElementMeasures } from '../og-combobox/og-combobox.interface';
import { calculateOptions } from '../og-combobox/calculateOptions';

@Component({
  tag: 'og-combobox-list',
  styleUrl: 'og-combobox-list.scss',
  shadow: true
})
export class OgComboboxList {
  @Element() hostElement: HTMLElement;

  @State() optionsMeasures: ElementMeasures;


  /** Controls the open state of the options  */
  @Prop({ mutable: true, reflectToAttr: true }) optionsOpened: boolean;

  /** Placeholder when input is empty */
  @Prop() items: any[];

  /** The initial value. Can be updated at runtime */
  @Prop({ mutable: true, reflectToAttr: true }) value: string;

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

  @Prop()
  public positionSource: DOMRect;

  /** Maximum Height of the Options List */
  @Prop() maxHeight?: number;

  /** … */
  @Prop() reopen?: boolean;

  /**
 * Event is being emitted when value changes.
 */
  @Event() itemSelected: EventEmitter<string>;

  /**
   * Event emitted when the Options are being closed.
   */
  @Event() optionsClosed: EventEmitter<boolean>;

  public componentDidLoad() {
    this.updateOptionsMeasures();
  }

  @Watch("optionsOpened")
  watchOptionsOpened(value: boolean) {

    this.updateOptionsMeasures();
    if (value === true) {
      this.handleOptionFocus();
      return
    }
    this.optionsClosed.emit(true);
  }

  @Listen("scroll", { target: "window" })
  listenToWindowScroll() {
    if (!!this.optionsOpened || !!this.reopen) {
      this.updateOptionsMeasures();
    }
  }

  @Listen("resize", { target: "window" })
  listenToWindowResize() {
    if (!!this.optionsOpened || !!this.reopen) {
      this.updateOptionsMeasures();
    }
  }

  @Listen("click", { target: "window" })
  listenToWindowClick(event) {
    if (!!this.optionsOpened && event.target !== this.hostElement) {
      this.optionsOpened = false;
      this.reopen = false;
    }
  }

  private get optionsListElement(): HTMLUListElement {
    return this.hostElement.shadowRoot.querySelector("#options-list");
  }

  private handleOptionClick(value: string) {
    this.value = value;
    this.itemSelected.emit(this.value);
    this.optionsOpened = false;
  }

  private handleOptionKeyDown(
    event: KeyboardEvent,
    value: string,
    itemIndex: number
  ) {
    const first = this.optionsListElement.children[0] as HTMLLIElement;

    if (event.code === "Escape") {
      this.optionsOpened = false;
    }

    if (event.code === "ArrowDown") {
      event.preventDefault();
      if (itemIndex === this.items.length - 1) {
        event.preventDefault();
        first.focus();
        return;
      }
      (this.optionsListElement.children[
        itemIndex + 1
      ] as HTMLLIElement).focus();
    }

    if (event.code === "ArrowUp") {
      event.preventDefault();
      if (itemIndex === 0) {
        event.preventDefault();
        (this.optionsListElement.children[
          this.items.length - 1
        ] as HTMLLIElement).focus();
        return;
      }
      (this.optionsListElement.children[
        itemIndex - 1
      ] as HTMLLIElement).focus();
    }

    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      this.handleOptionClick(value);
    }
    if (event.code === "Tab") {
      if (itemIndex === 0 && event.shiftKey) {
        event.preventDefault();
        (this.optionsListElement.children[
          this.items.length - 1
        ] as HTMLLIElement).focus();
        return;
      }
      if (itemIndex === this.items.length - 1 && !event.shiftKey) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  private handleOptionFocus() {
    const activeItem: HTMLLIElement = this.optionsListElement.querySelector(
      ".is-selected"
    );

    if (activeItem) {
      activeItem.focus({ preventScroll: true });
    } else {
      const first = this.optionsListElement.firstElementChild as HTMLLIElement;
      first.focus({ preventScroll: true });
    }
  }

  private updateOptionsMeasures() {
    const optionsListMeasures = this.optionsListElement.getBoundingClientRect() as DOMRect;
    const source = this.positionSource || optionsListMeasures;
    const optCalcs = calculateOptions(
      optionsListMeasures.height,
      this.maxHeight,
      source.bottom
    );
    this.optionsMeasures = {};
    this.optionsMeasures.width = source.width;

    this.optionsMeasures = {
      height: optCalcs.height,
      left: source.left,
      top: optCalcs.top,
      width: source.width
    };
  }

  render() {

    return (
      <Host
        class={{
          "og-combobox-options": true,
          "is-open": this.optionsOpened,
        }}
        style={{
          height: this.optionsOpened && this.optionsMeasures
            ? this.optionsMeasures.height + "px"
            : "0",
          left: this.optionsOpened && this.optionsMeasures ? this.optionsMeasures.left + "px" : "0",
          top: this.optionsOpened && this.optionsMeasures ? this.optionsMeasures.top + "px" : "0",
          width: this.optionsOpened && this.optionsMeasures
            ? this.optionsMeasures.width + "px"
            : "100%",
          // as long as we don't have a width this div shouldn't be fixed,
          // so we can get the propper width and calculate the correct height.
          // just in case there're long strings that would cause incorrect
          // linebreaks and so a wrong height.
          position: this.optionsOpened || this.optionsMeasures ? 'fixed' : 'static'
        }}
        tabindex="-1"
      >
        <ul id="options-list" class="og-combobox-options__list">
          {this.items.map((item, index) => {
            return (
              <li
                id={"option_" + index.toString()}
                role="option"
                tabindex={this.optionsOpened ? "1" : "-1"}
                onClick={() => this.handleOptionClick(item[this.itemValueProperty])}
                onKeyDown={event =>
                  this.handleOptionKeyDown(event, item[this.itemValueProperty], index)
                }
                class={{
                  "og-combobox-options__list__item": true,
                  "is-selected": item[this.itemValueProperty] === this.value
                }}
              >
                <span class="item__text">{item[this.itemLabelProperty]}</span>
              </li>
            );
          })}
        </ul>
      </Host>
    );
  }
}
