/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, Event, EventEmitter, Host, State } from '@stencil/core';

@Component({
  tag: 'og-radio-button',
  styleUrl: 'og-radio-button.scss',
  shadow: true
})
export class OgRadioButton {

  @State() isFocused: boolean;

  /**
   * The name of the radio button. All radio buttons with the same name belong to one group.
   */
  @Prop({ reflectToAttr: true })
  public name: string;

  /**
   * The label of the radio button
   */
  @Prop()
  public label: string;

  /**
   * The value of the radio button that is set to the parent group if radio button is selected
   */
  @Prop()
  public value: string;

  /**
   * Determines, whether the radio button is checked or not
   */
  @Prop({ reflectToAttr: true })
  public checked: boolean;

  /**
   * Determines, whether the control is disabled or not
   */
  @Prop({ reflectToAttr: true })
  public disabled: boolean;

  /** Moves the label to the other side of the radio control */
  @Prop() opposite: boolean;

  /**
   * Determines, whether the control is disabled from the parent group
   */
  @Prop()
  public groupDisabled: boolean;

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

  public handleChange(e) {
    if (!this.disabled) {
      this.checked = e.target.checked;
      this.changed.emit(e.target.checked);
    }
  }

  private handleFocus(focus: boolean) {
    if (!this.disabled) {
      this.isFocused = focus;
    }
  }

  public render(): HTMLElement {
    return (
      <Host
        class={{
          'is-checked': this.checked,
          'is-focused': this.isFocused,
          'is-disabled': this.disabled || this.groupDisabled,
        }}
      >
        <label
          class="og-radio-button"
          htmlFor={this.uniqueId}
        >
          <input
            class="og-radio-button__input"
            type="radio"
            id={this.uniqueId}
            checked={this.checked}
            disabled={this.disabled || this.groupDisabled}
            onChange={(e) => this.handleChange(e)}
            onFocus={() => this.handleFocus(true)}
            onBlur={() => this.handleFocus(false)}
          />
          {
            !!this.label &&
            !!this.opposite &&
            <span class="og-radio-button__label">
              {this.label}
            </span>
          }
          <span class="og-radio-button__control">
              <span class="og-radio-button__box__indicator"></span>
          </span>
          {
            !!this.label &&
            !this.opposite &&
            <span class="og-radio-button__label">
              {this.label}
            </span>
          }
        </label>
      </Host>
    );
  }
}
