/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, EventEmitter, Event, Host, State } from '@stencil/core';

@Component({
  tag: 'og-checkbox',
  styleUrl: 'og-checkbox.scss',
  shadow: true
})
export class OgCheckbox {

  /** Controls the 'is-focused' style of the Button */
  @State() isFocused: boolean;

  /**
   * The value of the checkbox
   */
  @Prop({ mutable: true, reflectToAttr: true })
  public checked: boolean;

  /**
   * The label of the checkbox
   */
  @Prop()
  public label: string;

  /**
   * Determines, whether the control is disabled or not
   */
  @Prop()
  public disabled: boolean;

  /** Moves the label to the other side of the checkbox */
  @Prop() opposite: boolean;

  /** Moves the label to the other side of the checkbox */
  @Prop({ mutable: true, reflectToAttr: true })
  @Prop() indeterminate: boolean;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public changed: EventEmitter<MouseEvent>;

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

  private tabFocusHandler(focus: boolean) {
    this.isFocused = focus;
  }

  public handleChange(e) {
    if (!this.disabled) {
      this.checked = e.target.checked;
      this.changed.emit(e.target.checked);
    }
  }

  public render(): HTMLElement {
    return (
      <Host
        class={{
          'is-checked': this.checked,
          'is-focused': this.isFocused,
          'is-indeterminate': this.indeterminate,
          'is-disabled': this.disabled,
        }}
      >
        <label
          class="og-checkbox"
          htmlFor={this.uniqueId}
        >
          <input
            class="og-checkbox__input"
            type="checkbox"
            id={this.uniqueId}
            checked={this.checked}
            disabled={this.disabled}
            onChange={(event) => this.handleChange(event)}
            onFocus={() => this.tabFocusHandler(true)}
            onBlur={() => this.tabFocusHandler(false)}
          />
          {
            !!this.label &&
            !!this.opposite &&
            <span class="og-checkbox__label">
              {this.label}
            </span>
          }
          <span class="og-checkbox__control">
              <span class="og-checkbox__indicator">
                <span class="og-checkbox__icon"></span>
              </span>
          </span>
          {
            !!this.label &&
            !this.opposite &&
            <span class="og-checkbox__label">
              {this.label}
            </span>
          }
        </label>
      </Host>
    )
  }
}
